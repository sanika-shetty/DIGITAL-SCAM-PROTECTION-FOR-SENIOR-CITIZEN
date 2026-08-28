import React, { useState, useEffect } from 'react';
import { useAlerts } from '../context/AlertContext';
import { 
  PhoneCall, 
  Mic, 
  AlertCircle, 
  PhoneOff, 
  Volume2, 
  Radio, 
  Sparkles, 
  ShieldAlert 
} from 'lucide-react';

export const LiveCallMonitor = () => {
  const { 
    liveCallData, 
    selectedSenior, 
    setCallActionModalOpen, 
    endLiveCall 
  } = useAlerts();

  const [callDuration, setCallDuration] = useState(0);

  // Call duration counter
  useEffect(() => {
    let interval = null;
    if (liveCallData.isActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [liveCallData.isActive]);

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!liveCallData.isActive) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-slate-500" />
            <h3 className="text-base font-bold text-slate-200">Live Call &amp; Audio Stream</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-400">
            Standby &bull; Monitoring Active
          </span>
        </div>

        <div className="py-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
            <Mic className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-300">No active incoming phone calls</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            When {selectedSenior.name} receives or dials a call, real-time Whisper speech transcription and AI scam scanning will stream here live.
          </p>
        </div>
      </div>
    );
  }

  const isCritical = liveCallData.riskScore >= 75;
  const isHigh = liveCallData.riskScore >= 50 && liveCallData.riskScore < 75;

  return (
    <div className={`glass-panel p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
      isCritical 
        ? 'border-red-600 shadow-xl shadow-red-950/60 bg-red-950/20' 
        : isHigh 
          ? 'border-amber-600 shadow-xl shadow-amber-950/50 bg-amber-950/20' 
          : 'border-cyan-600 bg-cyan-950/10'
    }`}>
      
      {/* Header: Call Details & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              isCritical ? 'bg-red-600 animate-pulse' : 'bg-cyan-600 animate-pulse'
            }`}>
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">ACTIVE CALL IN PROGRESS</span>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                {formatSeconds(callDuration)}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Caller: <strong className="text-white">{liveCallData.callerNumber || "+91 99887 76655"}</strong> &bull; Senior: <strong className="text-white">{selectedSenior.name}</strong>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCallActionModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Interrupt &amp; Call Senior</span>
          </button>

          <button
            onClick={endLiveCall}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Dismiss Stream</span>
          </button>
        </div>
      </div>

      {/* Audio Waveform Visualizer */}
      <div className="py-3 flex items-center justify-between px-4 my-3 bg-slate-900/90 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">Whisper Audio Stream</span>
        </div>

        {/* Animated Sound Wave Bars */}
        <div className="flex items-center gap-1 h-8">
          {[18, 28, 12, 34, 22, 14, 30, 24, 16, 32, 20, 26, 15, 29, 21].map((height, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isCritical 
                  ? 'bg-red-500 animate-pulse' 
                  : isHigh 
                    ? 'bg-amber-400 animate-pulse' 
                    : 'bg-cyan-400 animate-pulse'
              }`}
              style={{
                height: `${Math.max(6, (height * (liveCallData.riskScore > 0 ? (liveCallData.riskScore / 60) : 0.5)))}px`,
                animationDelay: `${i * 80}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Live Speech Transcription Box with Highlighted Scam Keywords */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Live Transcription &amp; Keyword Highlighter
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Real-time STT engine</span>
        </div>

        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl max-h-36 overflow-y-auto font-mono text-sm leading-relaxed text-slate-200">
          <div
            dangerouslySetInnerHTML={{
              __html: liveCallData.highlightedTranscript || liveCallData.transcript || "Listening to speech audio..."
            }}
          />
        </div>
      </div>

      {/* Senior Voice TTS Intervention Banner */}
      {liveCallData.ttsWarning && (
        <div className="mt-3 p-3 bg-red-950/50 border border-red-800 rounded-xl flex items-start gap-2.5">
          <Volume2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <strong className="text-red-300 block mb-0.5">Automated Senior Voice Warning Delivered:</strong>
            <p className="text-slate-300 italic">"{liveCallData.ttsWarning}"</p>
          </div>
        </div>
      )}

    </div>
  );
};
