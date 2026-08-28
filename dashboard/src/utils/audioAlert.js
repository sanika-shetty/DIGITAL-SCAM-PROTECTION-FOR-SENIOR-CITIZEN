/**
 * Guardian Bot - Web Audio Emergency Siren Synthesizer
 * Plays high-priority audible alarms on incoming critical threats or hardware SOS.
 */

let audioCtx = null;
let sirenOscillator = null;
let sirenGain = null;
let isSirenPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencySiren(durationSeconds = 6) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (isSirenPlaying) stopEmergencySiren();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(650, ctx.currentTime);

    // Modulate pitch up and down like an emergency siren
    const now = ctx.currentTime;
    for (let i = 0; i < durationSeconds; i++) {
      osc.frequency.exponentialRampToValueAtTime(950, now + i + 0.5);
      osc.frequency.exponentialRampToValueAtTime(650, now + i + 1.0);
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + durationSeconds);

    sirenOscillator = osc;
    sirenGain = gain;
    isSirenPlaying = true;

    setTimeout(() => {
      isSirenPlaying = false;
    }, durationSeconds * 1000);
  } catch (err) {
    console.warn("Audio siren synthesis not permitted without user gesture:", err.message);
  }
}

export function stopEmergencySiren() {
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
    isSirenPlaying = false;
  }
}

export function playChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}
