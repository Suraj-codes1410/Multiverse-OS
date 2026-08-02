'use client';

import React, { useEffect, useRef } from 'react';
import { useShell } from '@/components/ShellProvider';
import { useTheme } from '@/providers';

export function ThemeSoundtrack() {
  const { isAudioMuted } = useShell();
  const { themeName } = useTheme();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<number>(0);

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAllActiveNodes = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        if ('stop' in node) {
          (node as any).stop();
        }
      } catch (e) {
        // Already stopped or gain node
      }
    });
    activeNodesRef.current = [];
  };

  // Safe synthesizer tone scheduler
  const playTone = (
    ctx: AudioContext,
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainVal = 0.005,
    attackTime = 0.1,
    delay = 0
  ) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    // Fade-in envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
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

    activeNodesRef.current.push(osc);
    activeNodesRef.current.push(gainNode);
  };

  useEffect(() => {
    if (isAudioMuted) {
      stopAllActiveNodes();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    stopAllActiveNodes();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    stepRef.current = 0;

    const playThemeSoundtrack = () => {
      const step = stepRef.current;

      // 1. DEFAULT/LIGHT: Soothing Ambient (Warm, relaxing major chords with soft sine waves)
      if (themeName === 'default') {
        const chords = [
          [130.81, 195.99, 261.63, 329.63, 493.88], // Cmaj9
          [174.61, 261.63, 349.23, 440.0, 523.25], // Fmaj7
          [146.83, 220.0, 293.66, 349.23, 440.0], // Dmin7
        ];
        const activeChord = chords[step % chords.length];

        activeChord.forEach((freq, idx) => {
          // Play with very slow, soothing attack and long decay
          playTone(ctx, freq, 5.2, 'sine', 0.006, 0.4, idx * 0.22);
        });

        stepRef.current++;
      }

      // 2. OBSIDIAN/DARK: Space Drone (Deep triangle bass pad playing dark, slow minor steps)
      else if (themeName === 'dark') {
        const droneFreqs = [164.81, 196.0, 246.94]; // E3, G3, B3 audible space frequencies
        const freq = droneFreqs[step % droneFreqs.length];

        // Low deep pad with very slow attack and long 6-second sustain
        playTone(ctx, freq, 6.2, 'triangle', 0.01, 0.6, 0);
        // Play perfect fifth upper harmonic softly
        playTone(ctx, freq * 1.5, 6.0, 'sine', 0.0035, 0.8, 0.3);

        stepRef.current++;
      }

      // 3. CYBERPUNK: Game Focused (Active, rhythmic 8-bit synthwave arpeggiator)
      else if (themeName === 'cyberpunk') {
        // Schedule a rapid, energetic arpeggiation cycle
        const arpeggios = [
          [110.0, 220.0, 164.81, 220.0], // A2 -> A3 -> E3 -> A3 (Rhythmic bass)
          [130.81, 261.63, 195.99, 261.63], // C3 -> C4 -> G3 -> C4
          [116.54, 233.08, 174.61, 233.08], // Bb2 -> Bb3 -> F3 -> Bb3
        ];
        const currentPattern = arpeggios[step % arpeggios.length];

        // Schedule 4 fast consecutive plucky notes (synthwave tempo rhythm)
        currentPattern.forEach((freq, idx) => {
          // Use triangle wave with zero attack time for sharp, punchy game-focused bass plucks
          playTone(ctx, freq, 0.45, 'triangle', 0.009, 0.01, idx * 0.25);
        });

        stepRef.current++;
      }

      // 4. MATRIX: Hacking Theme (Sharp, erratic square-wave code plucks)
      else if (themeName === 'matrix') {
        // Pentatonic hacking scales
        const scales = [
          587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66, 1396.91,
        ]; // D5, F5, G5, A5, C6, D6, F6

        // Play 4 quick, robotic, glitchy square wave plucks with short decay
        for (let r = 0; r < 4; r++) {
          const randFreq = scales[Math.floor(Math.random() * scales.length)];
          // Square wave sounds like digital chip / retro command data transmission
          playTone(ctx, randFreq, 0.18, 'square', 0.0018, 0.002, r * 0.16);
        }
      }

      // 5. HIGH CONTRAST: Industrial Clock (Rhythmic gravity clicks and mechanical pulses)
      else if (themeName === 'high-contrast') {
        // Sub-bass heavy heartbeat pulse
        playTone(ctx, 55.0, 0.4, 'sine', 0.015, 0.02, 0); // Bass beat

        // Slow mechanical clockwork tick on the beat
        playTone(ctx, 3500, 0.05, 'sine', 0.004, 0.002, 0); // Tick
        // Tock offset
        playTone(ctx, 3000, 0.05, 'sine', 0.0035, 0.002, 0.5); // Tock
      }
    };

    // Initial play trigger
    playThemeSoundtrack();

    // Determine scheduler timing lengths (Cyberpunk arpeggios loop faster than ambient pads)
    const getIntervalTime = () => {
      if (themeName === 'cyberpunk') return 1000; // Pumping 120BPM arpeggiator cycle
      if (themeName === 'matrix') return 700; // Rapid digital hacking drops
      if (themeName === 'high-contrast') return 1000; // Constant tick-tock rhythm
      if (themeName === 'dark') return 7000; // Long, slow space pads
      return 6000; // Soothing light theme ambient chords
    };

    intervalRef.current = setInterval(playThemeSoundtrack, getIntervalTime());

    return () => {
      stopAllActiveNodes();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [themeName, isAudioMuted]);

  return null;
}
export default ThemeSoundtrack;
