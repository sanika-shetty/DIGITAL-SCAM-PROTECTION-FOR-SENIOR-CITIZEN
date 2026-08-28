import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  SlidersHorizontal, 
  Play, 
  Radio, 
  Send, 
  RotateCcw, 
  ShieldAlert, 
  Zap, 
  Flame, 
  X,
  CheckCircle2 
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const ScamSimulator = () => {
  const { 
    simulatorOpen, 
    setSimulatorOpen, 
    triggerSimulation, 
    triggerHardwareSos, 
    selectedSenior 
  } = useAlerts();

  const [customText, setCustomText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!simulatorOpen) return null;

  const handleRunPreset = async (scenarioKey, title) => {
    setIsSimulating(true);
    setStatusMessage(`🚀 Streaming scenario: "${title}" for ${selectedSenior.name}...`);

    try {
      await triggerSimulation(scenarioKey);
      setStatusMessage(`✅ Simulation active! Watch Live Threat Meter and Speech Stream.`);
    } catch (e) {
      setStatusMessage(`⚠️ Simulation trigger error.`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleHardwareSosTrigger = async () => {
    setIsSimulating(true);
    setStatusMessage(`🚨 Simulating ESP32 GPIO 4 Physical Button Press...`);

    try {
      await triggerHardwareSos();
      setStatusMessage(`✅ Hardware SOS registered. Critical alert dispatched!`);
    } catch (e) {
      setStatusMessage(`⚠️ Hardware SOS trigger error.`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCustomAnalyze = async (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsSimulating(true);
    setStatusMessage(`🔍 Analyzing custom speech text chunk...`);

    try {
      const res = await fetch(`${BACKEND_URL}/api/scam/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: customText,
          seniorId: selectedSenior.id,
          seniorName: selectedSenior.name,
          channel: "PHONE_CALL"
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ Analysis complete: Risk Score ${data.analysis.riskScore}/100 (${data.analysis.threatLevel})`);
      }
    } catch (e) {
      setStatusMessage(`⚠️ Analysis error.`);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border-2 border-amber-500/50 bg-slate-950/90 shadow-2xl relative mb-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              Interactive Scam &amp; Hardware Test Studio
            </h3>
            <p className="text-xs text-slate-400">Trigger live attack simulations to evaluate real-time dashboard reactions</p>
          </div>
        </div>

        <button
          onClick={() => setSimulatorOpen(false)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Preset Scenario Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-5">
        
        {/* Preset 1: Digital Arrest */}
        <button
          onClick={() => handleRunPreset("DIGITAL_ARREST", "CBI Digital Arrest")}
          disabled={isSimulating}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-red-500 text-left transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-red-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> DIGITAL ARREST
            </span>
            <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded font-bold border border-red-800">
              HIGH RISK
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-red-300">CBI Officer Drug Parcel Scam</h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            "Warrant issued for illegal FedEx consignment. Transfer Rs 50,000 security deposit immediately."
          </p>
        </button>

        {/* Preset 2: Remote Access */}
        <button
          onClick={() => handleRunPreset("REMOTE_ANYDESK", "AnyDesk Electricity Scam")}
          disabled={isSimulating}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 text-left transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> REMOTE ACCESS
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-800">
              HIGH RISK
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-amber-300">Electricity Bill AnyDesk Takeover</h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            "Power disconnected tonight at 9:30 PM. Download AnyDesk app to verify bill payment."
          </p>
        </button>

        {/* Preset 3: Banking OTP Phishing */}
        <button
          onClick={() => handleRunPreset("BANK_OTP_FRAUD", "Bank OTP & KYC Fraud")}
          disabled={isSimulating}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500 text-left transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> OTP PHISHING
            </span>
            <span className="text-[10px] bg-orange-950 text-orange-300 px-2 py-0.5 rounded font-bold border border-orange-800">
              CRITICAL
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-orange-300">Bank Account Freeze &amp; OTP</h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            "Your bank account will be suspended. Share the 6-digit verification code immediately."
          </p>
        </button>

        {/* Preset 4: Grandson Distress */}
        <button
          onClick={() => handleRunPreset("GRANDSON_EMERGENCY", "Grandson Distress Scam")}
          disabled={isSimulating}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500 text-left transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> RELATIVE IN DANGER
            </span>
            <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded font-bold border border-rose-800">
              HIGH RISK
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-rose-300">Fake Grandchild Hospital Emergency</h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            "Grandma please help! Severe car accident, doctor needs surgery deposit via Google Pay right now."
          </p>
        </button>

        {/* Preset 5: Wokwi Hardware SOS Panic Button */}
        <button
          onClick={handleHardwareSosTrigger}
          disabled={isSimulating}
          className="p-4 rounded-xl bg-gradient-to-br from-red-950 to-slate-900 border border-red-700 hover:border-red-500 text-left transition-all group col-span-1 sm:col-span-2 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-red-300 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-red-400" /> WOKWI HARDWARE SIMULATION
            </span>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black animate-pulse">
              SOS BUTTON PRESS
            </span>
          </div>
          <h4 className="text-sm font-bold text-white group-hover:text-red-200">ESP32 GPIO 4 Physical Panic Trigger</h4>
          <p className="text-xs text-slate-300 mt-1">
            Simulates the physical hardware button pressed on the living room safety station. Triggers buzzer siren, red LED, and fullscreen panic modal.
          </p>
        </button>

      </div>

      {/* Custom Speech Tester */}
      <form onSubmit={handleCustomAnalyze} className="space-y-2 pt-2 border-t border-slate-800">
        <label className="text-xs font-bold text-slate-300 block">
          Custom Speech / SMS Text Scanner
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type custom text (e.g. 'This is CBI police, share your OTP to unblock account')..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={isSimulating || !customText.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Scan Text</span>
          </button>
        </div>
      </form>

      {/* Status Feedback Pill */}
      {statusMessage && (
        <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-300 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

    </div>
  );
};
