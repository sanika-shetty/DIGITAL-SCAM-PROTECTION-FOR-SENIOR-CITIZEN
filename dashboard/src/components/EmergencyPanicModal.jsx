import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  Battery, 
  VolumeX, 
  CheckCircle, 
  ShieldAlert, 
  Radio, 
  UserCheck 
} from 'lucide-react';
import { stopEmergencySiren } from '../utils/audioAlert';

export const EmergencyPanicModal = () => {
  const { panicAlert, setPanicAlert, updateAlertStatus, selectedSenior, setCallActionModalOpen } = useAlerts();

  if (!panicAlert) return null;

  const isHardwarePanic = panicAlert.type === 'HARDWARE_PANIC';

  const handleDismissAndResolve = () => {
    stopEmergencySiren();
    if (panicAlert.id) {
      updateAlertStatus(panicAlert.id, 'RESOLVED', 'Family intervened and confirmed senior safety');
    }
    setPanicAlert(null);
  };

  const handleAcknowledgeOnly = () => {
    stopEmergencySiren();
    if (panicAlert.id) {
      updateAlertStatus(panicAlert.id, 'ACKNOWLEDGED');
    }
    setPanicAlert(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      {/* Flashing Emergency Modal Card */}
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-red-600 rounded-3xl shadow-2xl shadow-red-950/80 overflow-hidden relative animate-bounce-short">
        
        {/* Pulsing Alert Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black/30 rounded-2xl animate-pulse">
              {isHardwarePanic ? <Radio className="w-8 h-8" /> : <AlertOctagon className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded-full border border-white/20">
                CRITICAL INTERVENTION REQUIRED
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-1">
                {isHardwarePanic ? "EMERGENCY SOS BUTTON TRIGGERED!" : "CRITICAL SCAM THREAT IN PROGRESS!"}
              </h2>
            </div>
          </div>

          <button
            onClick={stopEmergencySiren}
            title="Silence Audio Alarm"
            className="p-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white transition-all"
          >
            <VolumeX className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Senior Info & Location Quick Tile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl font-bold">
                {selectedSenior.avatar || '👵'}
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Target Senior</span>
                <h4 className="text-base font-black text-white">{panicAlert.seniorName || selectedSenior.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{selectedSenior.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
              <MapPin className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase">Location / Station</span>
                <p className="text-xs font-semibold text-slate-200">{panicAlert.location || selectedSenior.location}</p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono mt-0.5">
                  <Battery className="w-3.5 h-3.5" /> Battery: {panicAlert.battery || selectedSenior.batteryLevel}%
                </span>
              </div>
            </div>
          </div>

          {/* Incident Description */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Live Threat Briefing:
            </span>
            <div className="p-4 bg-red-950/30 border border-red-800/80 rounded-xl text-slate-200 text-sm font-medium leading-relaxed">
              {panicAlert.snippet || "Senior citizen pressed physical panic alarm. Incoming audio suggests high coercion attempt."}
            </div>
          </div>

          {/* Recommended Protocol */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">
              Step 1: Immediate Safety Protocol
            </span>
            <p className="text-xs text-slate-300">
              Call {panicAlert.seniorName || selectedSenior.name} immediately to break the scammer's psychological pressure. Inform them you are on the line and that Indian law enforcement / banks NEVER demand emergency funds.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                stopEmergencySiren();
                setCallActionModalOpen(true);
              }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/80 transition-all"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>CALL {selectedSenior.name.split(' ')[0].toUpperCase()} DIRECTLY</span>
            </button>

            <button
              onClick={handleDismissAndResolve}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Mark Senior Safe &amp; Dismiss</span>
            </button>
          </div>

          {/* Secondary Dismiss */}
          <div className="text-center pt-1">
            <button
              onClick={handleAcknowledgeOnly}
              className="text-xs text-slate-400 hover:text-slate-200 transition-all font-semibold underline underline-offset-4"
            >
              Keep alert in Active Log but close modal
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
