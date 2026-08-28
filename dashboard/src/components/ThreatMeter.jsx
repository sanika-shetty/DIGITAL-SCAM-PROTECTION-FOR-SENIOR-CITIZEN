import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame, Activity } from 'lucide-react';

export const ThreatMeter = () => {
  const { activeThreat, liveCallData, selectedSenior } = useAlerts();

  const currentScore = liveCallData.isActive 
    ? liveCallData.riskScore 
    : (activeThreat?.riskScore || 0);

  const getThreatColor = (score) => {
    if (score >= 75) return { stroke: '#ef4444', text: 'text-red-500', bg: 'bg-red-950/40', border: 'border-red-600', label: 'CRITICAL THREAT', glow: 'shadow-red-900/50' };
    if (score >= 50) return { stroke: '#f97316', text: 'text-orange-500', bg: 'bg-orange-950/40', border: 'border-orange-600', label: 'HIGH DANGER', glow: 'shadow-orange-900/50' };
    if (score >= 25) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-600', label: 'MEDIUM CAUTION', glow: 'shadow-amber-900/50' };
    return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-700', label: 'SAFE & PROTECTED', glow: 'shadow-emerald-900/30' };
  };

  const theme = getThreatColor(currentScore);

  // SVG Gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div className={`glass-panel p-6 rounded-2xl border ${theme.border} relative overflow-hidden transition-all duration-500`}>
      {/* Background ambient glow */}
      <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
        currentScore >= 75 ? 'bg-red-600' : currentScore >= 50 ? 'bg-orange-600' : 'bg-cyan-600'
      }`} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Live AI Risk Assessment</span>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Threat Meter
          </h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${theme.bg} ${theme.text} ${theme.border}`}>
          {theme.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Circular Gauge */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={theme.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Centered Risk Score readout */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-4xl font-black tracking-tighter ${theme.text}`}>
                {currentScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                / 100 RISK
              </span>
            </div>
          </div>
        </div>

        {/* Threat Context Breakdown */}
        <div className="md:col-span-7 space-y-3">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Primary Threat Diagnosis:</span>
            <p className="text-sm font-bold text-slate-100 mt-0.5">
              {liveCallData.isActive 
                ? (liveCallData.matchedCategories[0]?.name || "Active Call Scanning in Progress...")
                : (activeThreat?.category || "No active threats detected. All channels secure.")}
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Recommended Family Action:</span>
            <p className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg mt-1 font-medium">
              {liveCallData.isActive && liveCallData.riskScore >= 50
                ? "🚨 Live call exceeds danger threshold. Intervene immediately via direct phone call."
                : (activeThreat?.recommendedAction || "Monitor daily status. Senior shield is online.")}
            </p>
          </div>

          {/* Categorical Breakdown Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {liveCallData.matchedCategories.length > 0 ? (
              liveCallData.matchedCategories.map((cat, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-[11px] font-bold">
                  ⚠️ {cat.name}
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-medium">
                Shield Active (Phone &bull; SMS &bull; Hardware SOS)
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
