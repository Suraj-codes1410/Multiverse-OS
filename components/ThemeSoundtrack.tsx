'use client';

import { useEffect, useRef } from 'react';
import { useShell } from '@/components/ShellProvider';
import { useTheme } from '@/providers';

export function ThemeSoundtrack() {
  const { isAudioMuted } = useShell();
  const { themeName } = useTheme();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<number>(0);
  const isStartedRef = useRef<boolean>(false);

  // Lazy safe AudioContext constructor
  const getOrCreateAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
        masterGain.connect(ctx.destination);
        audioCtxRef.current = ctx;
        masterGainRef.current = masterGain;
      }
    }
    return audioCtxRef.current;
  };

  const stopAllActiveNodes = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        if ('stop' in node) {
          (node as any).stop();
        }
      } catch {
        // Node already stopped
      }
    });
    activeNodesRef.current = [];
  };

  // Synthesizer tone scheduler with warm acoustic envelope
  const playTone = (
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.07,
    attackTime = 0.25,
    delay = 0
  ) => {
    if (ctx.state !== 'running' || !masterGainRef.current) return;

    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(masterGainRef.current);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      // Smooth attack & exponential decay envelope
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(
        gainVal,
        ctx.currentTime + delay + attackTime
      );
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
          // Already disconnected
        }
        activeNodesRef.current = activeNodesRef.current.filter(
          (n) => n !== osc && n !== gainNode
        );
      };

      activeNodesRef.current.push(osc);
      activeNodesRef.current.push(gainNode);
    } catch {
      // Audio context closing or inactive
    }
  };

  useEffect(() => {
    // If audio is muted by user, silence active nodes and pause scheduler
    if (isAudioMuted) {
      stopAllActiveNodes();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isStartedRef.current = false;
      return;
    }

    const startPlayback = () => {
      const ctx = getOrCreateAudioContext();
      if (!ctx) return;

      const runSchedule = () => {
        stopAllActiveNodes();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        stepRef.current = 0;
        playThemeSoundtrack();

        const getIntervalTime = () => {
          if (themeName === 'cyberpunk') return 1200;
          if (themeName === 'matrix') return 800;
          if (themeName === 'high-contrast') return 1200;
          if (themeName === 'dark') return 6500;
          return 5500; // Warm Rhodes progression interval
        };

        intervalRef.current = setInterval(playThemeSoundtrack, getIntervalTime());
        isStartedRef.current = true;
      };

      if (ctx.state === 'suspended') {
        ctx
          .resume()
          .then(() => {
            if (ctx.state === 'running') {
              runSchedule();
            }
          })
          .catch(() => {});
      } else if (ctx.state === 'running') {
        runSchedule();
      }
    };

    const playThemeSoundtrack = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state !== 'running' || isAudioMuted) return;

      const step = stepRef.current;

      // 1. DEFAULT/LIGHT: Soothing Rhodes Ambient (Cmaj7 / Fmaj7 / Gmaj9)
      if (themeName === 'default') {
        const chords = [
          [261.63, 329.63, 392.0, 493.88, 523.25], // Cmaj7/9 (C4, E4, G4, B4, C5)
          [220.0, 261.63, 349.23, 440.0, 523.25], // Fmaj7 (A3, C4, F4, A4, C5)
          [196.0, 246.94, 293.66, 392.0, 493.88], // Gmaj9 (G3, B3, D4, G4, B4)
        ];
        const activeChord = chords[step % chords.length];

        activeChord.forEach((freq, idx) => {
          playTone(
            ctx,
            freq,
            5.0,
            idx === 0 ? 'triangle' : 'sine',
            0.075,
            0.35,
            idx * 0.2
          );
        });

        stepRef.current++;
      }

      // 2. OBSIDIAN/DARK: Cinematic Space Drone (Minor 5th Ambient Pad)
      else if (themeName === 'dark') {
        const droneFreqs = [196.0, 220.0, 246.94]; // G3, A3, B3
        const freq = droneFreqs[step % droneFreqs.length];

        // Deep pad with slow attack and 6-second sustain
        playTone(ctx, freq, 6.0, 'triangle', 0.08, 0.6, 0);
        // Soft fifth harmonic
        playTone(ctx, freq * 1.5, 5.8, 'sine', 0.045, 0.8, 0.3);

        stepRef.current++;
      }

      // 3. CYBERPUNK: Synthwave Arpeggiator (Plucky rhythmic lead)
      else if (themeName === 'cyberpunk') {
        const arpeggios = [
          [220.0, 261.63, 329.63, 440.0], // Am (A3, C4, E4, A4)
          [174.61, 220.0, 261.63, 349.23], // F (F3, A3, C4, F4)
          [196.0, 246.94, 293.66, 392.0], // G (G3, B3, D4, G4)
        ];
        const currentPattern = arpeggios[step % arpeggios.length];

        currentPattern.forEach((freq, idx) => {
          playTone(ctx, freq, 0.45, 'triangle', 0.065, 0.015, idx * 0.25);
        });

        stepRef.current++;
      }

      // 4. MATRIX: Algorithmic Pluck Sequences
      else if (themeName === 'matrix') {
        const scales = [
          587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66,
        ]; // D5, F5, G5, A5, C6, D6
        for (let r = 0; r < 4; r++) {
          const randFreq = scales[Math.floor(Math.random() * scales.length)];
          playTone(ctx, randFreq, 0.2, 'square', 0.045, 0.005, r * 0.16);
        }
      }

      // 5. HIGH CONTRAST: Industrial Heartbeat & Mechanical Pulse
      else if (themeName === 'high-contrast') {
        playTone(ctx, 110.0, 0.4, 'sine', 0.08, 0.02, 0);
        playTone(ctx, 3200, 0.05, 'sine', 0.04, 0.002, 0);
        playTone(ctx, 2800, 0.05, 'sine', 0.03, 0.002, 0.5);
      }
    };

    // Global interaction listener for browser Web Audio autoplay policy
    const handleUserInteraction = () => {
      if (!isStartedRef.current && !isAudioMuted) {
        startPlayback();
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('pointerdown', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    // If context is already running and unlocked, start playback immediately
    if (audioCtxRef.current?.state === 'running') {
      startPlayback();
    }

    return () => {
      stopAllActiveNodes();
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [themeName, isAudioMuted]);

  return null;
}
export default ThemeSoundtrack;