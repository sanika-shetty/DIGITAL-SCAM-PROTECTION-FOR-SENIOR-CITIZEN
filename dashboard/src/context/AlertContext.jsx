import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { playEmergencySiren, playChime } from '../utils/audioAlert';

const AlertContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

const INITIAL_SENIORS = [
  {
    id: "senior_01",
    name: "Savitri Patel",
    age: 72,
    phone: "+91 98201 54321",
    location: "Bandra West, Mumbai (Home Safe Zone)",
    batteryLevel: 88,
    status: "PROTECTED",
    emergencyContact: {
      name: "Aarav Patel (Son)",
      phone: "+91 98190 12345",
      relation: "Son"
    },
    avatar: "👵",
    lastActive: new Date().toISOString()
  },
  {
    id: "senior_02",
    name: "Ramesh Sharma",
    age: 78,
    phone: "+91 98450 67890",
    location: "Indiranagar, Bangalore (Home Safe Zone)",
    batteryLevel: 64,
    status: "PROTECTED",
    emergencyContact: {
      name: "Pooja Sharma (Daughter)",
      phone: "+91 98451 98765",
      relation: "Daughter"
    },
    avatar: "👴",
    lastActive: new Date().toISOString()
  }
];

const INITIAL_ALERTS = [
  {
    id: "alert_demo_01",
    seniorId: "senior_01",
    seniorName: "Savitri Patel",
    type: "CALL_SCAM",
    severity: "CRITICAL",
    riskScore: 92,
    category: "Digital Arrest & Law Enforcement Impersonation",
    snippet: "This is CBI Officer Sharma. A warrant has been issued in your name for illegal narcotics FedEx parcel. Stay on video call and transfer Rs 50,000 to RBI verification account.",
    highlightedKeywords: ["cbi", "arrest warrant", "illegal narcotics", "fedex parcel", "stay on video call", "transfer rs 50,000", "rbi verification account"],
    status: "ACKNOWLEDGED",
    callerNumber: "+91 99887 76655",
    channel: "PHONE_CALL",
    ttsWarning: "WARNING: Law enforcement never demands money or arrests over video call. Hang up now.",
    recommendedAction: "CRITICAL: Call Savitri immediately and reassure her.",
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString()
  },
  {
    id: "alert_demo_02",
    seniorId: "senior_01",
    seniorName: "Savitri Patel",
    type: "SMS_PHISHING",
    severity: "HIGH",
    riskScore: 78,
    category: "Electricity Bill Cutoff Phishing",
    snippet: "Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM. Call bill manager at 9876543210 or install AnyDesk to verify.",
    highlightedKeywords: ["disconnected tonight", "electricity bill", "anydesk"],
    status: "ACTIVE",
    callerNumber: "+91 98765 43210",
    channel: "SMS",
    ttsWarning: "Caution: Fake utility disconnection message. Do not install AnyDesk.",
    recommendedAction: "Remind senior that electricity bills are paid via official portal.",
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString()
  }
];

export const AlertProvider = ({ children }) => {
  const [seniors, setSeniors] = useState(INITIAL_SENIORS);
  const [selectedSenior, setSelectedSenior] = useState(INITIAL_SENIORS[0]);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [panicAlert, setPanicAlert] = useState(null);
  const [callActionModalOpen, setCallActionModalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [isSirenEnabled, setIsSirenEnabled] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Live Call Audio / Stream State
  const [liveCallData, setLiveCallData] = useState({
    isActive: false,
    callerNumber: "",
    callerName: "",
    channel: "PHONE_CALL",
    transcript: "",
    highlightedTranscript: "",
    riskScore: 0,
    threatLevel: "SAFE",
    matchedCategories: [],
    ttsWarning: null,
    startedAt: null
  });

  // Calculate live active threat for selected senior
  const activeThreat = alerts.find(
    a => a.seniorId === selectedSenior.id && a.status === "ACTIVE" && (a.severity === "CRITICAL" || a.severity === "HIGH")
  ) || (liveCallData.isActive && liveCallData.riskScore >= 50 ? liveCallData : null);

  // Handle incoming alert
  const handleIncomingAlert = useCallback((newAlert) => {
    setAlerts(prev => {
      if (prev.some(a => a.id === newAlert.id)) return prev;
      return [newAlert, ...prev];
    });

    // If alert is Critical or Hardware Panic, pop up the Emergency Modal and trigger siren
    if (newAlert.severity === "CRITICAL" || newAlert.type === "HARDWARE_PANIC" || newAlert.riskScore >= 75) {
      setPanicAlert(newAlert);
      if (isSirenEnabled) {
        playEmergencySiren(8);
      }
    } else {
      playChime();
    }
  }, [isSirenEnabled]);

  // Connect to WebSocket for real-time live events
  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;

    const connectWS = () => {
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setWsConnected(true);
          console.log("🛡️ [AlertContext] Connected to Backend WebSocket Feed");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { event: eventType, payload } = data;

            if (eventType === "NEW_ALERT" || eventType === "HARDWARE_PANIC_TRIGGERED") {
              handleIncomingAlert(payload);
            } else if (eventType === "ALERT_UPDATED") {
              setAlerts(prev => prev.map(a => a.id === payload.id ? { ...a, ...payload } : a));
            } else if (eventType === "CALL_STARTED") {
              setLiveCallData({
                isActive: true,
                callerNumber: payload.callerNumber || "+91 99887 76655",
                callerName: payload.callerName || "Unknown Caller",
                channel: payload.channel || "PHONE_CALL",
                transcript: "Call connected. Listening for voice patterns...",
                highlightedTranscript: "Call connected. Listening for voice patterns...",
                riskScore: 0,
                threatLevel: "SAFE",
                matchedCategories: [],
                ttsWarning: null,
                startedAt: new Date().toISOString()
              });
            } else if (eventType === "LIVE_SPEECH_CHUNK") {
              setLiveCallData(prev => ({
                ...prev,
                isActive: true,
                callerNumber: payload.callerNumber || prev.callerNumber,
                transcript: payload.accumulatedText || payload.rawText || prev.transcript,
                highlightedTranscript: payload.highlightedTranscript || payload.rawText,
                riskScore: payload.riskScore ?? prev.riskScore,
                threatLevel: payload.threatLevel || prev.threatLevel,
                matchedCategories: payload.matchedCategories || prev.matchedCategories,
                ttsWarning: payload.ttsWarning || prev.ttsWarning
              }));

              if (payload.riskScore >= 75 && isSirenEnabled) {
                playChime();
              }
            }
          } catch (e) {
            console.error("Failed to parse WS message:", e);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [handleIncomingAlert, isSirenEnabled]);

  // Also fetch initial data from backend REST API if available
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/alerts`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.alerts && data.alerts.length > 0) {
          setAlerts(prev => {
            const map = new Map();
            [...data.alerts, ...prev].forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    fetch(`${BACKEND_URL}/api/seniors`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.seniors && data.seniors.length > 0) {
          setSeniors(data.seniors);
          setSelectedSenior(data.seniors[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Update alert status (ACKNOWLEDGE or RESOLVE)
  const updateAlertStatus = async (alertId, newStatus, notes = "") => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: newStatus, notes } : a));

    if (panicAlert && panicAlert.id === alertId && newStatus === "RESOLVED") {
      setPanicAlert(null);
    }

    try {
      await fetch(`${BACKEND_URL}/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, notes, resolvedBy: "Family Dashboard User" })
      });
    } catch (e) {
      console.warn("Backend update failed, kept optimistic state");
    }
  };

  // Trigger Simulation Scenario
  const triggerSimulation = async (scenarioKey) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/simulate/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioKey,
          seniorId: selectedSenior.id,
          seniorName: selectedSenior.name,
          chunkDelayMs: 2200
        })
      });
      return await response.json();
    } catch (e) {
      console.error("Simulation trigger failed:", e);
    }
  };

  // Trigger Hardware SOS via REST
  const triggerHardwareSos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/hardware/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "ESP32-SOS-01",
          seniorId: selectedSenior.id,
          location: "Living Room Alarm Station",
          battery: 98,
          buttonState: "PRESSED"
        })
      });
      return await response.json();
    } catch (e) {
      console.error("Hardware SOS trigger failed:", e);
    }
  };

  // End active live call stream
  const endLiveCall = () => {
    setLiveCallData(prev => ({
      ...prev,
      isActive: false,
      transcript: "Call completed. Threat neutralized.",
      highlightedTranscript: "Call completed. Threat neutralized.",
      riskScore: 0,
      threatLevel: "SAFE"
    }));
  };

  return (
    <AlertContext.Provider
      value={{
        seniors,
        selectedSenior,
        setSelectedSenior,
        alerts,
        activeThreat,
        liveCallData,
        panicAlert,
        setPanicAlert,
        callActionModalOpen,
        setCallActionModalOpen,
        simulatorOpen,
        setSimulatorOpen,
        isSirenEnabled,
        setIsSirenEnabled,
        wsConnected,
        updateAlertStatus,
        triggerSimulation,
        triggerHardwareSos,
        endLiveCall
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlerts must be used within an AlertProvider");
  return context;
};
