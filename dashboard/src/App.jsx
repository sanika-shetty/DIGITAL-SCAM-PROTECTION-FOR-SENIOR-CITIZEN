import React from 'react';
import { AlertProvider } from './context/AlertContext';
import { Navbar } from './components/Navbar';
import { ThreatMeter } from './components/ThreatMeter';
import { LiveCallMonitor } from './components/LiveCallMonitor';
import { ActiveThreatLog } from './components/ActiveThreatLog';
import { SeniorProfileCard } from './components/SeniorProfileCard';
import { StatsSummary } from './components/StatsSummary';
import { ScamSimulator } from './components/ScamSimulator';
import { EmergencyPanicModal } from './components/EmergencyPanicModal';
import { CallActionModal } from './components/CallActionModal';
import { 
  Shield, 
  HelpCircle, 
  Lock, 
  Smartphone, 
  Radio, 
  HeartHandshake,
  CheckCircle2 
} from 'lucide-react';

function DashboardContent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Modals */}
      <EmergencyPanicModal />
      <CallActionModal />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Interactive Simulator (Collapsible) */}
        <ScamSimulator />

        {/* Quick Stats Summary */}
        <StatsSummary />

        {/* Dashboard Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center: Real-Time Radar & Threat Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Live Risk Meter */}
            <ThreatMeter />

            {/* Live Call Speech Stream & Audio Visualizer */}
            <LiveCallMonitor />

            {/* Threat & Alert History Log */}
            <ActiveThreatLog />

          </div>

          {/* Right Column: Senior Health, Hardware Station & Family Hub (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Senior Citizen Profile & Quick Connect */}
            <SeniorProfileCard />

            {/* Scam Defense Rulebook & Knowledge Cards */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Shield className="w-5 h-5" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  Active Protection Shield Rules
                </h4>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Digital Arrest Trap:</strong> Law enforcement never conducts video arrests or takes money.</span>
                </div>

                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>AnyDesk / TeamViewer:</strong> Remote access software requests trigger automatic voice alarms.</span>
                </div>

                <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Bank OTP Blocking:</strong> Banks never ask for OTP, CVV, or passwords over the phone.</span>
                </div>
              </div>
            </div>

            {/* System Status Telemetry */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block uppercase tracking-wider">
                System Telemetry Status
              </span>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>AI Scam Classifier:</span>
                <span className="text-emerald-400 font-mono font-bold">ONLINE (v1.0.0)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Wokwi ESP32 IoT Station:</span>
                <span className="text-cyan-400 font-mono font-bold">GPIO 4 LISTENING</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Whisper STT Pipeline:</span>
                <span className="text-emerald-400 font-mono font-bold">READY</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>On-Device TTS Warning:</span>
                <span className="text-emerald-400 font-mono font-bold">ENABLED</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🛡️ Guardian Bot &bull; Production Senior Scam Defense System</span>
          <span className="font-mono text-slate-400">Protecting vulnerable loved ones with AI &amp; IoT</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AlertProvider>
      <DashboardContent />
    </AlertProvider>
  );
}
