import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  MessageSquare, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame
} from 'lucide-react';

export const ActiveThreatLog = () => {
  const { alerts, selectedSenior, updateAlertStatus, setCallActionModalOpen } = useAlerts();
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, CRITICAL, RESOLVED
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAlertId, setExpandedAlertId] = useState(null);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSenior = !selectedSenior || alert.seniorId === selectedSenior.id || !alert.seniorId;
    if (!matchesSenior) return false;

    if (filter === 'ACTIVE') return alert.status === 'ACTIVE';
    if (filter === 'CRITICAL') return alert.severity === 'CRITICAL';
    if (filter === 'RESOLVED') return alert.status === 'RESOLVED';

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        alert.category?.toLowerCase().includes(q) ||
        alert.snippet?.toLowerCase().includes(q) ||
        alert.callerNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (severity, score) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-950/80 border border-red-600 text-red-400">CRITICAL ({score})</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-950/80 border border-orange-600 text-orange-400">HIGH ({score})</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-600 text-amber-300">MEDIUM ({score})</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">LOW</span>;
    }
  };

  const getChannelIcon = (type, channel) => {
    if (type === 'HARDWARE_PANIC' || channel === 'HARDWARE_DEVICE') {
      return <Radio className="w-4 h-4 text-red-400" />;
    }
    if (type === 'SMS_PHISHING' || channel === 'SMS') {
      return <MessageSquare className="w-4 h-4 text-amber-400" />;
    }
    return <PhoneCall className="w-4 h-4 text-cyan-400" />;
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Threat &amp; Scam Event Log
          </h3>
          <p className="text-xs text-slate-400">Audit trail of intercepted scam calls, phishing SMS, and physical panic triggers</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
          {['ALL', 'ACTIVE', 'CRITICAL', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Search by threat category, keyword, or caller number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-500"
        />
      </div>

      {/* Alert List Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-slate-600 mb-2" />
            No threats matching your current filter. Senior shield is all clear.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            const isCritical = alert.severity === 'CRITICAL';

            return (
              <div
                key={alert.id}
                className={`rounded-xl border transition-all ${
                  alert.status === 'ACTIVE'
                    ? isCritical
                      ? 'bg-red-950/20 border-red-900/80 shadow-md shadow-red-950/30'
                      : 'bg-amber-950/20 border-amber-900/80'
                    : 'bg-slate-900/60 border-slate-800 opacity-80'
                }`}
              >
                {/* Main Card Header */}
                <div 
                  className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
                      {getChannelIcon(alert.type, alert.channel)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{alert.category}</h4>
                        {getSeverityBadge(alert.severity, alert.riskScore)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="font-mono">{alert.callerNumber || 'Unknown Source'}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Toggle */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                      alert.status === 'ACTIVE'
                        ? 'bg-red-900/80 text-red-300 border border-red-700 animate-pulse'
                        : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {alert.status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">INTERCEPTED CONTENT / SNIPPET:</span>
                      <p className="p-3 bg-slate-950 rounded-lg text-slate-200 font-mono leading-relaxed border border-slate-800">
                        {alert.snippet}
                      </p>
                    </div>

                    {alert.highlightedKeywords && alert.highlightedKeywords.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">SUSPICIOUS KEYWORDS TRIGGERED:</span>
                        <div className="flex flex-wrap gap-1">
                          {alert.highlightedKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-red-900/40 border border-red-800 text-red-300 font-bold font-mono">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {alert.recommendedAction && (
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                        <strong className="text-cyan-400 block mb-0.5">Family Action Plan:</strong>
                        {alert.recommendedAction}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCallActionModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Senior Immediately</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAlertStatus(alert.id, 'ACKNOWLEDGED');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white font-semibold text-xs transition-all"
                          >
                            Acknowledge
                          </button>
                        )}
                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAlertStatus(alert.id, 'RESOLVED', 'Resolved by family');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold text-xs transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Safe &amp; Resolved</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
