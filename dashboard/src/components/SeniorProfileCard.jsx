import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  User, 
  Phone, 
  MapPin, 
  Battery, 
  Shield, 
  Radio, 
  Heart, 
  ExternalLink,
  PhoneCall,
  Clock
} from 'lucide-react';

export const SeniorProfileCard = () => {
  const { selectedSenior, setCallActionModalOpen } = useAlerts();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      
      {/* Header & Avatar */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-3xl shadow-inner">
            {selectedSenior.avatar || '👵'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">{selectedSenior.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 border border-emerald-700 text-emerald-400">
                ACTIVE SHIELD
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedSenior.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setCallActionModalOpen(true)}
          className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/60 transition-all"
          title="Direct Call Senior"
        >
          <PhoneCall className="w-4 h-4" />
        </button>
      </div>

      {/* Telemetry Pills */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
          <Battery className={`w-4 h-4 ${selectedSenior.batteryLevel > 30 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Phone Battery</span>
            <span className="font-bold text-slate-200">{selectedSenior.batteryLevel || 88}% Charged</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold block uppercase">IoT Panic Hub</span>
            <span className="font-bold text-slate-200">ESP32 Online</span>
          </div>
        </div>
      </div>

      {/* Safe Zone Geofence Location */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs">
        <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
        <div>
          <span className="text-[10px] text-slate-500 font-bold block uppercase">Safe Zone Location</span>
          <span className="font-semibold text-slate-300">{selectedSenior.location}</span>
        </div>
      </div>

      {/* Emergency Family Circle */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400" /> Emergency Family Circle
        </span>

        {selectedSenior.emergencyContact && (
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">{selectedSenior.emergencyContact.name}</span>
              <span className="text-[11px] text-slate-400 font-mono">{selectedSenior.emergencyContact.phone}</span>
            </div>
            <a
              href={`tel:${selectedSenior.emergencyContact.phone}`}
              className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-bold transition-all border border-cyan-800/60"
            >
              Call Contact
            </a>
          </div>
        )}
      </div>

    </div>
  );
};
