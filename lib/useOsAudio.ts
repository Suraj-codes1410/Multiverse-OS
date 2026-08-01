'use client';

/**
 * useOsAudio — Synthesized soothing OS sound system.
 * All sounds built purely from Web Audio API. No files, no latency.
 * Warm sine + triangle wave tones matched to the pastel OS aesthetic.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Play a single warm tone */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.06,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

  // Soft attack + long tail release
  gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + delay + duration
  );

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.05);
}

/** Chord of two notes */
function chord(f1: number, f2: number, duration: number, gain = 0.05) {
  tone(f1, duration, 'sine', gain);
  tone(f2, duration, 'triangle', gain * 0.5, 0.01);
}

// -------------------------------------------------------------------
// Public sound library — each action has its own distinct character
// -------------------------------------------------------------------

/** Soft two-note ascending chime — dock / app launch */
export function playOpenSound() {
  tone(523.25, 0.18, 'sine', 0.055); // C5
  tone(659.25, 0.22, 'sine', 0.045, 0.09); // E5
}

/** Gentle descending pair — window close */
export function playCloseSound() {
  tone(659.25, 0.16, 'sine', 0.05); // E5
  tone(440, 0.22, 'sine', 0.04, 0.08); // A4 (descend)
}

/** Single soft low click — minimize */
export function playMinimizeSound() {
  tone(392, 0.18, 'triangle', 0.045); // G4 — muted felt click
}

/** Quick bright tap — maximize */
export function playMaximizeSound() {
  chord(523.25, 783.99, 0.2, 0.04); // C5 + G5 perfect fifth
}

/** Very subtle tick — any general button press */
export function playClickSound() {
  tone(698.46, 0.1, 'sine', 0.035); // F5 — feather-light tap
}

/** Short warm pluck — sending a message / submitting */
export function playSendSound() {
  tone(880, 0.12, 'sine', 0.04); // A5
  tone(1046.5, 0.16, 'sine', 0.025, 0.06); // C6 — light sparkle
}

/** Three-note ripple — notification arrives */
export function playNotifySound() {
  tone(523.25, 0.14, 'sine', 0.04); // C5
  tone(659.25, 0.14, 'sine', 0.035, 0.08); // E5
  tone(783.99, 0.2, 'sine', 0.03, 0.16); // G5
}
