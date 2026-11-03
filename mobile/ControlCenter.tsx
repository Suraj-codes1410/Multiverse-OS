'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Vibrate,
  Terminal,
  Activity,
  X,
  Sparkles,
  Wifi,
  Battery,
  ShieldCheck,
} from 'lucide-react';
import { useNavigation } from './NavigationProvider';
import { useShell } from '@/components/ShellProvider';
import { haptic } from '@/lib/haptics';
import { playCloseSound } from '@/lib/useOsAudio';

export function ControlCenter() {
  const { isControlCenterOpen, setControlCenterOpen } = useNavigation();
  const { isAudioMuted, toggleAudio } = useShell();

  const [hapticsActive, setHapticsActive] = useState<boolean>(true);
  const [matrixFxActive, setMatrixFxActive] = useState<boolean>(false);
  const [activeTheme, setActiveTheme] = useState<'neon' | 'midnight' | 'solar'>(
    'neon'
  );
  const [volume, setVolume] = useState<number>(75);

  // Equalizer visualizer bars (16 frequency bands)
  const [eqHeights, setEqHeights] = useState<number[]>([
    40, 65, 30, 85, 55, 95, 70, 45, 60, 90, 75, 50, 80, 65, 40, 85,
  ]);

  useEffect(() => {
    if (!isControlCenterOpen || isAudioMuted) return;

    const interval = setInterval(() => {
      setEqHeights((prev) =>
        prev.map(() => Math.floor(25 + Math.random() * 70))
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isControlCenterOpen, isAudioMuted]);

  const handleClose = () => {
    playCloseSound();
    haptic.dismiss();
    setControlCenterOpen(false);
  };

  const handleAudioToggle = () => {
    haptic.toggle();
    toggleAudio();
  };

  const handleHapticToggle = () => {
    const nextState = !hapticsActive;
    setHapticsActive(nextState);
    haptic.setEnabled(nextState);
    if (nextState) {
      haptic.launch();
    }
  };

  const handleMatrixToggle = () => {
    haptic.toggle();
    setMatrixFxActive((prev) => !prev);
  };

  const cycleTheme = () => {
    haptic.tap();
    const themes: Array<'neon' | 'midnight' | 'solar'> = [
      'neon',
      'midnight',
      'solar',
    ];
    const next = themes[(themes.indexOf(activeTheme) + 1) % themes.length];
    setActiveTheme(next);
  };

  return (
    <AnimatePresence>
      {isControlCenterOpen && (
        <>
          {/* Backdrop Blur Dismiss Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[290] bg-black/60 backdrop-blur-xs select-none"
          />

          {/* Sliding Cyber Control Center Sheet */}
          <motion.div
            initial={{ y: '-100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed top-0 inset-x-0 z-[300] bg-bg-panel/95 backdrop-blur-2xl border-b border-accent-cyan/30 shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col pt-3 pb-5 px-4 select-none max-h-[88vh] overflow-y-auto scrollbar-none rounded-b-3xl"
          >
            {/* Top Bar with Title & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_rgba(0,242,254,0.8)]" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-text-primary">
                  Cyber Control Center
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  HUD v2.4
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-border-subtle/30 hover:bg-border-subtle/60 text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors active:scale-90"
                aria-label="Close Control Center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Matrix Digital Rain Animation Preview Banner (when enabled) */}
            {matrixFxActive && (
              <div className="mt-3 p-2 rounded-xl bg-[#031508]/80 border border-emerald-500/30 font-mono text-[10px] text-emerald-400 flex items-center justify-between overflow-hidden">
                <span className="animate-pulse flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> MATRIX_RAIN_STREAM //
                  ACTIVE
                </span>
                <span className="text-[9px] text-emerald-500/80">
                  OVERLAY_ENGAGED
                </span>
              </div>
            )}

            {/* Audio Visualizer & Player Deck */}
            <div className="mt-3 p-3.5 rounded-2xl bg-bg-panel/70 border border-border-subtle/50 flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-sans font-semibold text-text-primary leading-tight">
                      Multiverse Soundscape
                    </span>
                    <span className="text-[10px] font-mono text-text-secondary">
                      {isAudioMuted
                        ? 'Audio Suspended'
                        : 'Synthesizer Active • 432Hz'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAudioToggle}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono font-semibold flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                    isAudioMuted
                      ? 'bg-border-subtle/30 text-text-secondary border-border-subtle/50'
                      : 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  }`}
                >
                  {isAudioMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Playing</span>
                    </>
                  )}
                </button>
              </div>

              {/* 16-Band Real-Time Waveform Equalizer */}
              <div className="h-10 px-2 py-1 bg-bg-primary/60 border border-border-subtle/30 rounded-xl flex items-end justify-between gap-1">
                {eqHeights.map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: isAudioMuted ? '8%' : `${h}%` }}
                    transition={{ duration: 0.12 }}
                    className={`flex-1 rounded-full ${
                      isAudioMuted
                        ? 'bg-text-secondary/20'
                        : i % 2 === 0
                          ? 'bg-gradient-to-t from-accent-cyan to-accent-cyan/40 shadow-[0_0_4px_rgba(0,242,254,0.3)]'
                          : 'bg-gradient-to-t from-accent-purple to-accent-purple/40 shadow-[0_0_4px_rgba(168,85,247,0.3)]'
                    }`}
                  />
                ))}
              </div>

              {/* Volume Slider Bar */}
              <div className="flex items-center gap-2 pt-0.5">
                <VolumeX className="w-3 h-3 text-text-secondary/70 flex-shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setVolume(val);
                    if (val === 0 && !isAudioMuted) {
                      toggleAudio();
                    } else if (val > 0 && isAudioMuted) {
                      toggleAudio();
                    }
                  }}
                  className="w-full h-1.5 bg-border-subtle/40 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                  aria-label="Master audio volume"
                />
                <Volume2 className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
                <span className="font-mono text-[9px] text-text-secondary w-6 text-right">
                  {volume}%
                </span>
              </div>
            </div>

            {/* 2x2 Cyber Quick Action Tiles Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {/* Tile 1: Haptic Tactility */}
              <button
                onClick={handleHapticToggle}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all active:scale-95 shadow-xs ${
                  hapticsActive
                    ? 'bg-accent-cyan/10 border-accent-cyan/30 text-text-primary'
                    : 'bg-bg-panel/40 border-border-subtle/40 text-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Vibrate
                    className={`w-4 h-4 ${hapticsActive ? 'text-accent-cyan' : 'text-text-secondary'}`}
                  />
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      hapticsActive
                        ? 'bg-accent-cyan/20 text-accent-cyan'
                        : 'bg-border-subtle/30 text-text-secondary'
                    }`}
                  >
                    {hapticsActive ? 'ENABLED' : 'OFF'}
                  </span>
                </div>
                <div className="mt-2 flex flex-col">
                  <span className="text-xs font-sans font-semibold">
                    Haptic Engine
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">
                    Tactile Vibration Pulse
                  </span>
                </div>
              </button>

              {/* Tile 2: Theme Atmosphere */}
              <button
                onClick={cycleTheme}
                className="p-3 rounded-2xl border bg-bg-panel/40 border-border-subtle/40 hover:border-accent-cyan/30 text-left flex flex-col justify-between cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-4 h-4 text-accent-purple" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-purple/15 text-accent-purple font-semibold uppercase">
                    {activeTheme}
                  </span>
                </div>
                <div className="mt-2 flex flex-col">
                  <span className="text-xs font-sans font-semibold text-text-primary">
                    Aura Palette
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">
                    Tap to cycle themes
                  </span>
                </div>
              </button>

              {/* Tile 3: Matrix Rain FX */}
              <button
                onClick={handleMatrixToggle}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all active:scale-95 shadow-xs ${
                  matrixFxActive
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-text-primary'
                    : 'bg-bg-panel/40 border-border-subtle/40 text-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Terminal
                    className={`w-4 h-4 ${matrixFxActive ? 'text-emerald-400' : 'text-text-secondary'}`}
                  />
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      matrixFxActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-border-subtle/30 text-text-secondary'
                    }`}
                  >
                    {matrixFxActive ? 'ACTIVE' : 'OFF'}
                  </span>
                </div>
                <div className="mt-2 flex flex-col">
                  <span className="text-xs font-sans font-semibold">
                    Matrix Rain
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary">
                    Digital Stream FX
                  </span>
                </div>
              </button>

              {/* Tile 4: System Diagnostic Telemetry */}
              <div className="p-3 rounded-2xl border bg-bg-panel/40 border-border-subtle/40 text-left flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-success-green" />
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-success-green/15 text-success-green font-semibold">
                    NOMINAL
                  </span>
                </div>
                <div className="mt-2 flex flex-col">
                  <span className="text-xs font-sans font-semibold text-text-primary">
                    Telemetrics
                  </span>
                  <span className="text-[10px] font-mono text-text-secondary flex items-center gap-1.5">
                    <span>24ms ping</span>
                    <span>•</span>
                    <span>60 FPS</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Hardware Diagnostics Ribbon */}
            <div className="mt-3 p-2.5 rounded-xl bg-bg-panel/30 border border-border-subtle/30 flex items-center justify-between text-[10px] font-mono text-text-secondary">
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-accent-cyan" />
                <span>MULTIVERSE-5G // CONNECTED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-success-green" />
                <span className="text-text-primary font-semibold">98%</span>
              </div>
            </div>

            {/* Bottom Dismiss Handle Bar */}
            <div
              onClick={handleClose}
              className="mt-3.5 pt-1 pb-0.5 flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-12 h-1 rounded-full bg-border-subtle/60 group-hover:bg-accent-cyan/80 transition-colors" />
              <span className="text-[8px] font-mono text-text-secondary/50 uppercase tracking-widest mt-1">
                Tap to Dismiss
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ControlCenter;
