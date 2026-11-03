'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, VolumeX } from 'lucide-react';
import { useShell } from '@/components/ShellProvider';

/**
 * StatusBar simulates phone status indicators with interactive audio controls & telemetry.
 */
export function StatusBar() {
  const [time, setTime] = useState<string>('');
  const { isAudioMuted, toggleAudio, systemStatus } = useShell();

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
    <div className="w-full bg-bg-panel/90 border-b border-border-subtle/30 backdrop-blur-md px-4 flex justify-between items-center text-xs font-sans font-medium text-text-secondary select-none z-[100] h-9">
      {/* Left: Clock + Live System Status */}
      <div className="flex items-center gap-2.5">
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
      </div>

      {/* Center: System Branding */}
      <span className="text-[10px] uppercase tracking-wider font-mono text-text-secondary/60 hidden xs:inline">
        Suraj.OS
      </span>

      {/* Right: Audio Toggle & Hardware Telemetry */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleAudio}
          className="p-1 -my-1 rounded-md hover:bg-bg-panel-hover/50 text-text-secondary hover:text-accent-cyan transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
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
