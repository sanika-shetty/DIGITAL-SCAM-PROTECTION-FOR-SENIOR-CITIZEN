import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Radio, 
  SlidersHorizontal,
  Bell,
  Users
} from 'lucide-react';

export const Navbar = () => {
  const { 
    seniors, 
    selectedSenior, 
    setSelectedSenior, 
    activeThreat, 
    isSirenEnabled, 
    setIsSirenEnabled, 
    setCallActionModalOpen,
    simulatorOpen,
    setSimulatorOpen,
    wsConnected
  } = useAlerts();

  const isThreatActive = !!activeThreat;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shadow-lg transition-all ${
              isThreatActive 
                ? 'bg-red-600 text-white animate-pulse-glow shadow-red-900/50' 
                : 'bg-gradient-to-tr from-cyan-600 to-sky-500 text-white shadow-cyan-900/30'
            }`}>
              {isThreatActive ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">GUARDIAN<span className="text-cyan-400">BOT</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Family Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Real-Time Senior Scam Defense Network</p>
            </div>
          </div>

          {/* Real-time Connection Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-300 font-medium">{wsConnected ? 'Live Cloud Feed' : 'Connecting Feed...'}</span>
          </div>
        </div>

        {/* Center: Senior Profile Selector */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl">
          <span className="text-xs text-slate-400 px-2 font-medium hidden sm:inline flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Protected Senior:
          </span>
          <div className="flex gap-1">
            {seniors.map((senior) => {
              const isSelected = selectedSenior.id === senior.id;
              return (
                <button
                  key={senior.id}
                  onClick={() => setSelectedSenior(senior)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span>{senior.avatar || '👤'}</span>
                  <span>{senior.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-3">
          
          {/* Siren Mute Toggle */}
          <button
            onClick={() => setIsSirenEnabled(!isSirenEnabled)}
            title={isSirenEnabled ? "Audio Alarms Enabled" : "Audio Alarms Muted"}
            className={`p-2.5 rounded-xl border transition-all ${
              isSirenEnabled 
                ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:border-cyan-500' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {isSirenEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Simulator Toggle */}
          <button
            onClick={() => setSimulatorOpen(!simulatorOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              simulatorOpen 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/50' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Scam Simulator</span>
          </button>

          {/* Prominent Emergency Action Button */}
          <button
            onClick={() => setCallActionModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg ${
              isThreatActive
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white animate-bounce shadow-red-900/60 hover:from-red-500 hover:to-rose-500'
                : 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-rose-950/50'
            }`}
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>CALL {selectedSenior.name.split(' ')[0].toUpperCase()} NOW</span>
          </button>
        </div>

      </div>
    </header>
  );
};
