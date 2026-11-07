'use client';

/**
 * useOsAudio — Synthesized soothing OS sound system.
 * All sounds built purely from Web Audio API. No files, no latency.
 * Warm sine + triangle wave tones matched to the pastel OS aesthetic.
 */

let sharedAudioCtx: AudioContext | null = null;
let masterSfxGain: GainNode | null = null;

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
        masterSfxGain = sharedAudioCtx.createGain();
        masterSfxGain.gain.setValueAtTime(0.95, sharedAudioCtx.currentTime);
        masterSfxGain.connect(sharedAudioCtx.destination);
      }
    } catch {
      return null;
    }
  }
  return sharedAudioCtx;
}

/** Explicitly unlock and resume audio on user gesture */
export function unlockAudio(): AudioContext | null {
  const ctx = getSharedAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().then(() => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('multiverse-audio-unlocked'));
      }
    }).catch(() => {});
  } else if (ctx && ctx.state === 'running') {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('multiverse-audio-unlocked'));
    }
  }
  return ctx;
}

function getCtx(): AudioContext | null {
  return unlockAudio();
}

/** Play a single warm tone */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
  delay = 0
) {
  const ctx = getCtx();
  if (!ctx || ctx.state !== 'running') return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    if (masterSfxGain) {
      gainNode.connect(masterSfxGain);
    } else {
      gainNode.connect(ctx.destination);
    }

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    // Crisp soft attack + smooth release for great audibility
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + delay + duration
    );

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);

    osc.onended = () => {
      try {
        osc.disconnect();
        gainNode.disconnect();
      } catch {
        // Disconnected
      }
    };
  } catch {
    // Audio context busy
  }
}

/** Chord of two notes */
function chord(f1: number, f2: number, duration: number, gain = 0.07) {
  tone(f1, duration, 'sine', gain);
  tone(f2, duration, 'triangle', gain * 0.6, 0.01);
}

// -------------------------------------------------------------------
// Public sound library — each action has its own distinct character
// -------------------------------------------------------------------

/** Soft two-note ascending chime — dock / app launch */
export function playOpenSound() {
  tone(523.25, 0.22, 'sine', 0.1); // C5
  tone(659.25, 0.26, 'sine', 0.085, 0.08); // E5
}

/** Gentle descending pair — window close */
export function playCloseSound() {
  tone(659.25, 0.18, 'sine', 0.09); // E5
  tone(440, 0.24, 'sine', 0.075, 0.07); // A4 (descend)
}

/** Single soft low click — minimize */
export function playMinimizeSound() {
  tone(392, 0.18, 'triangle', 0.08); // G4 — muted felt click
}

/** Quick bright tap — maximize */
export function playMaximizeSound() {
  chord(523.25, 783.99, 0.22, 0.08); // C5 + G5 perfect fifth
}

/** Very subtle tick — any general button press */
export function playClickSound() {
  tone(784.0, 0.1, 'sine', 0.07); // G5 — clear tap
}

/** Short warm pluck — sending a message / submitting */
export function playSendSound() {
  tone(880, 0.14, 'sine', 0.08); // A5
  tone(1046.5, 0.18, 'sine', 0.05, 0.05); // C6 — light sparkle
}

/** Three-note ripple — notification arrives */
export function playNotifySound() {
  tone(523.25, 0.16, 'sine', 0.08); // C5
  tone(659.25, 0.16, 'sine', 0.07, 0.07); // E5
  tone(783.99, 0.22, 'sine', 0.065, 0.14); // G5
}
