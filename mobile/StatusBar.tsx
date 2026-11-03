'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Battery,
  Volume2,
  VolumeX,
  SlidersHorizontal,
} from 'lucide-react';
import { useShell } from '@/components/ShellProvider';
import { useNavigation } from './NavigationProvider';
import { haptic } from '@/lib/haptics';
import { playClickSound } from '@/lib/useOsAudio';

/**
 * StatusBar simulates phone status indicators with interactive audio controls & telemetry.
 */
export function StatusBar() {
  const [time, setTime] = useState<string>('');
  const { isAudioMuted, toggleAudio, systemStatus } = useShell();
  const { toggleControlCenter } = useNavigation();

  const handleOpenControlCenter = () => {
    playClickSound();
    haptic.impact();
    toggleControlCenter();
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-bg-panel/90 border-b border-border-subtle/30 backdrop-blur-md px-3.5 flex justify-between items-center text-xs font-sans font-medium text-text-secondary select-none z-[100] h-9">
      {/* Left: Clock + Live System Status (Tap to Open Control Center) */}
      <button
        onClick={handleOpenControlCenter}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 active:scale-95 transition-all text-left"
        title="Tap to open Cyber Control Center"
        aria-label="Open Cyber Control Center"
      >
        <span className="font-semibold text-text-primary tracking-tight">
          {time}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-text-secondary/80">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                systemStatus === 'nominal'
                  ? 'bg-success-green'
                  : 'bg-warning-amber'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                systemStatus === 'nominal'
                  ? 'bg-success-green'
                  : 'bg-warning-amber'
              }`}
            />
          </span>
          <span className="uppercase tracking-wider">
            {systemStatus === 'nominal' ? 'ONLINE' : systemStatus}
          </span>
        </span>
      </button>

      {/* Center: System Branding & Quick Pull Pill */}
      <button
        onClick={handleOpenControlCenter}
        className="px-2.5 py-0.5 rounded-full bg-bg-panel/60 border border-border-subtle/40 hover:border-accent-cyan/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 group shadow-2xs"
        title="Open Cyber Control Center"
        aria-label="Open Cyber Control Center"
      >
        <span className="text-[10px] uppercase tracking-wider font-mono text-text-secondary group-hover:text-accent-cyan transition-colors">
          Suraj.OS
        </span>
        <SlidersHorizontal className="w-2.5 h-2.5 text-accent-cyan/70 group-hover:text-accent-cyan transition-colors" />
      </button>

      {/* Right: Audio Toggle & Hardware Telemetry */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            haptic.toggle();
            toggleAudio();
          }}
          className="p-1 -my-1 rounded-md hover:bg-bg-panel-hover/50 text-text-secondary hover:text-accent-cyan transition-colors cursor-pointer flex items-center justify-center focus:outline-none active:scale-90"
          title={
            isAudioMuted
              ? 'Audio Muted — Tap to Unmute'
              : 'Audio Active — Tap to Mute'
          }
          aria-label={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-text-secondary/70" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-accent-cyan" />
          )}
        </button>

        <span className="text-border-subtle/50">|</span>

        <div className="flex items-center gap-1 font-sans font-semibold text-[10px]">
          <Wifi className="w-3 h-3 text-text-secondary" />
          <span className="tracking-tight text-text-secondary">5G</span>
          <span className="tracking-tight text-text-secondary ml-0.5">98%</span>
          <Battery className="w-3.5 h-3.5 text-text-secondary -ml-0.5" />
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
