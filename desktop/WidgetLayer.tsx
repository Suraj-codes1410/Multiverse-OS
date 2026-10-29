'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Sun, HardDrive, Compass } from 'lucide-react';
import { useDesktop } from './DesktopContext';
import { motion } from 'framer-motion';
import { onBootPhase, getBootPhase, isReturningVisitor } from '@/lib/bootPhase';
import { usePathname } from 'next/navigation';

/**
 * WidgetLayer renders the desktop background layer.
 * Includes glassmorphic system widgets on the right and ambient UI.
 */
export function WidgetLayer() {
  const pathname = usePathname();
  const { openWindow } = useDesktop();
  // Boot reveal — fades in with widgets at ~3.0s
  const [revealed, setRevealed] = useState(() => getBootPhase() === 'done');

  useEffect(() => {
    if (revealed) return;
    return onBootPhase((phase) => {
      if (phase === 'reveal' || phase === 'done') {
        const delay = isReturningVisitor() ? 0 : 500;
        setTimeout(() => setRevealed(true), delay);
      }
    });
  }, [revealed]);

  // Stateful telemetry variables
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [cpuUsage, setCpuUsage] = useState<number>(12);
  const [ramUsage, setRamUsage] = useState<string>('4.18');

  // Time & date clock loop
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // CPU Fluctuations loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(8 + Math.random() * 9));
      setRamUsage((4.1 + Math.random() * 0.2).toFixed(2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Hide widgets on all routes except the root desktop workspace page
  if (pathname !== '/') {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none flex select-none box-border"
      style={{
        opacity: revealed ? 1 : 0,
        transition: 'opacity 600ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* 2. RIGHT SIDE: System Dashboard Widgets */}
      <aside
        className="absolute right-8 top-20 bottom-24 w-84 flex flex-col gap-4.5 pointer-events-auto overflow-y-auto pr-2 scrollbar-none hidden xl:flex"
        aria-label="System Dashboard Widgets"
      >
        {/* Widget 1: Stateful Clock */}
        <div className="system-widget-card p-5 rounded-2xl bg-bg-panel/25 border border-border-subtle/40 backdrop-blur-md flex flex-col shadow-md">
          <span className="font-sans text-4xl font-semibold tracking-tight text-text-primary select-text">
            {time}
          </span>
          <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-widest mt-1.5">
            {date}
          </span>
        </div>

        {/* Widget 2: Weather Placeholder */}
        <div className="system-widget-card p-5 rounded-2xl bg-bg-panel/25 border border-border-subtle/40 backdrop-blur-md flex items-center gap-4 shadow-md">
          <div className="p-3 rounded-xl bg-warning-amber/10 border border-warning-amber/25 flex items-center justify-center">
            <Sun className="w-6 h-6 text-warning-amber animate-spin-slow" />
          </div>
          <div className="flex flex-col font-sans">
            <span className="text-xs font-mono font-medium text-text-secondary uppercase tracking-wider">
              Orbit Base // Clear
            </span>
            <span className="text-base font-bold text-text-primary mt-0.5">
              21°C
            </span>
            <span className="text-xs font-mono text-text-secondary/80 mt-0.5">
              WIND: NW 3.2m/s // HUMIDITY: 45%
            </span>
          </div>
        </div>

        {/* Widget 3: Live System Stats */}
        <div className="system-widget-card p-5 rounded-2xl bg-bg-panel/25 border border-border-subtle/40 backdrop-blur-md flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between font-mono text-xs font-medium text-text-secondary">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-cyan" />
              <span>CPU UTILIZATION</span>
            </div>
            <span className="text-accent-cyan font-bold">{cpuUsage}%</span>
          </div>
          {/* Telemetry percentage bar indicator */}
          <div className="h-2 w-full bg-bg-primary/40 rounded-full overflow-hidden border border-border-subtle/30">
            <motion.div
              animate={{ width: `${cpuUsage}%` }}
              transition={{ type: 'spring', stiffness: 80 }}
              className="h-full bg-accent-cyan"
            />
          </div>

          <div className="flex items-center justify-between font-mono text-xs font-medium text-text-secondary mt-1">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-accent-purple" />
              <span>RAM ALLOCATION</span>
            </div>
            <span className="text-accent-purple font-bold">
              {ramUsage} GB / 16.0 GB
            </span>
          </div>
          <div className="h-2 w-full bg-bg-primary/40 rounded-full overflow-hidden border border-border-subtle/30">
            <div
              style={{ width: `${(parseFloat(ramUsage) / 16) * 100}%` }}
              className="h-full bg-accent-purple"
            />
          </div>
        </div>

        {/* Widget 4: Oracle AI Chat Trigger Link */}
        <div className="system-widget-card p-5 rounded-2xl bg-bg-panel/25 border border-border-subtle/40 backdrop-blur-md flex flex-col gap-3.5 shadow-md hover:border-accent-cyan/30 transition-colors">
          <div className="flex items-center gap-2.5 font-mono text-sm text-text-primary">
            <Compass className="w-4.5 h-4.5 text-accent-cyan animate-pulse" />
            <span className="font-bold uppercase tracking-wider">
              Narrative Core Router
            </span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
            Need details about Suraj's skill matrix? Query the smart Narrative
            engine directly:
          </p>
          <button
            onClick={() => openWindow('oracle')}
            className="w-full py-2.5 rounded-xl bg-bg-primary/40 border border-border-subtle/50 hover:bg-bg-panel-hover/70 hover:text-accent-cyan font-mono text-xs font-semibold text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer text-center"
          >
            Launch Oracle Dialogue //
          </button>
        </div>
      </aside>
    </div>
  );
}
export default WidgetLayer;
