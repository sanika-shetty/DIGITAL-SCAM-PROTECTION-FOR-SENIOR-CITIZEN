import React from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  PhoneCall, 
  Radio, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

export const StatsSummary = () => {
  const { alerts } = useAlerts();

  const totalThreats = alerts.length;
  const criticalThreats = alerts.filter(a => a.severity === 'CRITICAL').length;
  const resolvedThreats = alerts.filter(a => a.status === 'RESOLVED').length;

  const stats = [
    {
      title: "Calls & SMS Protected",
      value: "148",
      subtext: "Continuous on-device scan",
      icon: PhoneCall,
      color: "text-cyan-400",
      bg: "bg-cyan-950/40",
      border: "border-cyan-900/50"
    },
    {
      title: "Scam Threats Blocked",
      value: totalThreats.toString(),
      subtext: `${criticalThreats} High-priority interceptions`,
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-950/40",
      border: "border-rose-900/50"
    },
    {
      title: "Incidents Resolved",
      value: `${resolvedThreats} / ${totalThreats}`,
      subtext: "Family safety confirmed",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-950/40",
      border: "border-emerald-900/50"
    },
    {
      title: "Shield Uptime",
      value: "99.9%",
      subtext: "ESP32 & Mobile Online",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-950/40",
      border: "border-amber-900/50"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`glass-panel p-4 rounded-2xl border ${item.border} ${item.bg} flex items-center gap-3.5 transition-all`}
          >
            <div className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {item.title}
              </span>
              <span className="text-xl font-black text-white tracking-tight">
                {item.value}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
