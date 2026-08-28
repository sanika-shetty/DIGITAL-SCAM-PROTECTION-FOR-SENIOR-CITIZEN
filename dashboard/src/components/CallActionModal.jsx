import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  PhoneCall, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  HelpCircle, 
  HeartHandshake 
} from 'lucide-react';

export const CallActionModal = () => {
  const { callActionModalOpen, setCallActionModalOpen, selectedSenior } = useAlerts();

  if (!callActionModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/30 rounded-xl">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Emergency Senior Direct Call</h3>
              <p className="text-xs text-rose-100">Direct audio connection to {selectedSenior.name}</p>
            </div>
          </div>

          <button
            onClick={() => setCallActionModalOpen(false)}
            className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Quick Dial Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${selectedSenior.phone.replace(/\s+/g, '')}`}
              className="p-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all text-center"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Direct Phone Call</span>
            </a>

            <a
              href={`https://wa.me/${selectedSenior.phone.replace(/[^0-9]/g, '')}?text=Mom%2C%20please%20hang%20up%20your%20phone%20right%20now.%20I%20am%20calling%20you.`}
              target="_blank"
              rel="noreferrer"
              className="p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all text-center"
            >
              <MessageSquare className="w-5 h-5" />
              <span>WhatsApp Emergency Ping</span>
            </a>
          </div>

          {/* Calming De-escalation Script for Family Member */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" /> Recommended Family De-Escalation Script:
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>1. Reassure them:</strong> "You are safe. I am right here on the line with you."</li>
              <li><strong>2. Order immediate disconnect:</strong> "Hang up the other call immediately."</li>
              <li><strong>3. Clarify truth:</strong> "CBI, Police, and Banks NEVER arrest people over Skype or ask for money verification."</li>
              <li><strong>4. Check phone:</strong> "Make sure you have not installed AnyDesk or shared any OTP."</li>
            </ul>
          </div>

          {/* National Helplines */}
          <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-300 block">National Cyber Crime Helpline (India)</span>
              <span className="text-[11px] text-slate-400">Toll-Free Government Fraud Reporting</span>
            </div>
            <a
              href="tel:1930"
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono font-bold text-cyan-400 border border-slate-700"
            >
              Dial 1930
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
