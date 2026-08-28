/**
 * Guardian Bot - Hardware SOS & IoT Device Controller
 * Handles incoming webhooks & signals from ESP32 Panic Buttons (Wokwi & Physical Hardware).
 */

import { db } from "../config/firebase.js";
import { broadcastEvent } from "../utils/broadcaster.js";

export const handleHardwareSOS = async (req, res) => {
  try {
    const {
      deviceId = "ESP32-SOS-01",
      seniorId = "senior_01",
      location = "Living Room Alarm Hub",
      battery = 98,
      buttonState = "PRESSED"
    } = req.body;

    console.log(`🚨 [HARDWARE SOS] Received Panic Signal from Device: ${deviceId} | Senior: ${seniorId} | Location: ${location}`);

    // Retrieve senior details
    let seniorName = "Savitri Patel";
    try {
      const seniorDoc = await db.collection("seniors").doc(seniorId).get();
      if (seniorDoc.exists) {
        seniorName = seniorDoc.data().name || seniorName;
      }
    } catch (e) {
      // Fallback default
    }

    // 1. Log hardware trigger telemetry
    const triggerRecord = {
      deviceId,
      seniorId,
      seniorName,
      location,
      battery,
      buttonState,
      timestamp: new Date().toISOString()
    };
    await db.collection("hardware_triggers").add(triggerRecord);

    // 2. Create high-priority critical alert in Firestore
    const alertData = {
      seniorId,
      seniorName,
      type: "HARDWARE_PANIC",
      severity: "CRITICAL",
      riskScore: 100,
      category: "Physical SOS Panic Button Triggered",
      snippet: `URGENT SOS: ${seniorName} pressed the physical emergency button at ${location}. Immediate intervention required!`,
      highlightedKeywords: ["emergency sos", "physical button", "immediate help", "living room alarm"],
      status: "ACTIVE",
      location,
      deviceId,
      battery,
      channel: "HARDWARE_DEVICE",
      ttsWarning: "EMERGENCY ALERT: Hardware SOS Button Triggered. Family has been alerted and emergency dispatch is on standby.",
      recommendedAction: "CALL SENIOR IMMEDIATELY OR DISPATCH LOCAL EMERGENCY CONTACT.",
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection("alerts").add(alertData);
    const alertObject = { id: docRef.id, ...alertData };

    // 3. Broadcast instantaneous WebSocket event to Dashboard (lights up the panic modal)
    broadcastEvent("HARDWARE_PANIC_TRIGGERED", alertObject);
    broadcastEvent("NEW_ALERT", alertObject);

    // 4. Return response to ESP32 firmware
    return res.status(200).json({
      status: "SUCCESS",
      message: "Emergency SOS registered and family alerted.",
      alertId: alertObject.id,
      timestamp: alertObject.timestamp,
      deviceCommand: {
        ledState: "FLASH_RED",
        buzzerPattern: "SIREN_3X",
        keepAwakeSeconds: 60
      }
    });
  } catch (error) {
    console.error("Hardware SOS handling failed:", error);
    return res.status(500).json({ error: "Failed to process hardware SOS trigger", details: error.message });
  }
};
