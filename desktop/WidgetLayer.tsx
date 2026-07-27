'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Monitor, Sparkles, Activity, Cpu, Sun, HardDrive, Compass } from 'lucide-react';
import { useDesktop } from './DesktopContext';
import { motion } from 'framer-motion';

interface DesktopIconMetadata {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * WidgetLayer renders the desktop background layer.
 * Includes desktop icons on the left and glassmorphic system widgets on the right.
 */
export function WidgetLayer() {
  const { openWindow } = useDesktop();
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  
  // Stateful telemetry variables
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [cpuUsage, setCpuUsage] = useState<number>(12);
  const [ramUsage, setRamUsage] = useState<string>('4.18');

  // Time & date clock loop
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // CPU Fluctuations loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(8 + Math.random() * 9)); // Fluctuates between 8% and 17%
      setRamUsage((4.1 + Math.random() * 0.2).toFixed(2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Desktop shortcuts registry
  const desktopIcons: DesktopIconMetadata[] = [
    { id: 'terminal', label: 'CLI Terminal', icon: Terminal },
    { id: 'dashboard', label: 'Dashboard', icon: Monitor },
    { id: 'oracle', label: 'Oracle Chat', icon: Sparkles },
    { id: 'sample-1', label: 'Node Monitor', icon: Activity },
    { id: 'sample-2', label: 'System Info', icon: Cpu },
  ];

  // De-select icons if background is clicked
  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.desktop-icon-btn') || target.closest('.system-widget-card')) return;
    setSelectedIconId(null);
  };

  return (
    <div
      onClick={handleBackgroundClick}
      className="absolute inset-0 z-10 pointer-events-none flex select-none box-border"
    >
      {/* 1. LEFT SIDE: Desktop Icons Grid */}
      <div 
        className="absolute left-6 top-16 bottom-24 w-28 flex flex-col gap-4 pointer-events-auto"
        role="grid"
        aria-label="Desktop Shortcuts Grid"
      >
        {desktopIcons.map((icon) => {
          const IconComponent = icon.icon;
          const isSelected = selectedIconId === icon.id;

          return (
            <div
              key={icon.id}
              role="row"
              className="flex justify-center"
            >
              <button
                role="gridcell"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIconId(icon.id);
                }}
                onDoubleClick={() => openWindow(icon.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (selectedIconId === icon.id) openWindow(icon.id);
                    else setSelectedIconId(icon.id);
                  }
                }}
                className={`desktop-icon-btn flex flex-col items-center gap-1.5 p-2 w-20 rounded-xl transition-all duration-200 border outline-none cursor-pointer text-center group ${
                  isSelected
                    ? 'bg-bg-panel/40 border-accent-cyan/40 shadow-[0_0_15px_rgba(0,242,254,0.15)] text-accent-cyan'
                    : 'bg-transparent border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-panel/10'
                }`}
                aria-label={`${icon.label} shortcut. Double click to launch application`}
              >
                {/* Icon wrapper with hover physics */}
                <div className="w-10 h-10 rounded-xl bg-bg-panel/45 border border-border-subtle/50 flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-md">
                  <IconComponent className={`w-5 h-5 ${isSelected ? 'text-accent-cyan' : 'text-text-secondary group-hover:text-accent-cyan transition-colors'}`} />
                </div>
                
                {/* Icon label */}
                <span className="text-[10px] font-mono leading-tight truncate w-full px-0.5">
                  {icon.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 2. RIGHT SIDE: System Dashboard Widgets */}
      <aside 
        className="absolute right-6 top-16 bottom-24 w-80 flex flex-col gap-4 pointer-events-auto overflow-y-auto pr-2 scrollbar-none hidden xl:flex"
        aria-label="System Dashboard Widgets"
      >
        {/* Widget 1: Stateful Clock */}
        <div className="system-widget-card p-4 rounded-2xl bg-bg-panel/30 border border-border-subtle/30 backdrop-blur-md flex flex-col shadow-lg">
          <span className="font-mono text-3xl font-bold tracking-wider text-text-primary select-text">
            {time}
          </span>
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest mt-1">
            {date}
          </span>
        </div>

        {/* Widget 2: Weather Placeholder */}
        <div className="system-widget-card p-4 rounded-2xl bg-bg-panel/30 border border-border-subtle/30 backdrop-blur-md flex items-center gap-4 shadow-lg">
          <div className="p-3 rounded-xl bg-warning-amber/10 border border-warning-amber/20 flex items-center justify-center">
            <Sun className="w-6 h-6 text-warning-amber animate-spin-slow" />
          </div>
          <div className="flex flex-col font-mono">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Orbit Base // Clear</span>
            <span className="text-sm font-bold text-text-primary mt-0.5">21°C</span>
            <span className="text-[8px] text-text-secondary/70 mt-0.5">WIND: NW 3.2m/s // HUMIDITY: 45%</span>
          </div>
        </div>

        {/* Widget 3: Live System Stats */}
        <div className="system-widget-card p-4 rounded-2xl bg-bg-panel/30 border border-border-subtle/30 backdrop-blur-md flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between font-mono text-[9px] text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
              <span>CPU UTILIZATION</span>
            </div>
            <span className="text-accent-cyan font-bold">{cpuUsage}%</span>
          </div>
          {/* Telemetry percentage bar indicator */}
          <div className="h-1.5 w-full bg-bg-primary/55 rounded-full overflow-hidden border border-border-subtle/30">
            <motion.div 
              animate={{ width: `${cpuUsage}%` }} 
              transition={{ type: 'spring', stiffness: 80 }} 
              className="h-full bg-accent-cyan shadow-[0_0_8px_var(--accent-cyan)]" 
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[9px] text-text-secondary mt-1">
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-accent-purple" />
              <span>RAM ALLOCATION</span>
            </div>
            <span className="text-accent-purple font-bold">{ramUsage} GB / 16.0 GB</span>
          </div>
          <div className="h-1.5 w-full bg-bg-primary/55 rounded-full overflow-hidden border border-border-subtle/30">
            <div 
              style={{ width: `${(parseFloat(ramUsage) / 16) * 100}%` }} 
              className="h-full bg-accent-purple" 
            />
          </div>
        </div>

        {/* Widget 4: Oracle AI Chat Trigger Link */}
        <div className="system-widget-card p-4 rounded-2xl bg-bg-panel/30 border border-border-subtle/30 backdrop-blur-md flex flex-col gap-3 shadow-lg hover:border-accent-cyan/30 transition-colors">
          <div className="flex items-center gap-2 font-mono text-[10px] text-text-primary">
            <Compass className="w-4 h-4 text-accent-cyan animate-pulse" />
            <span className="font-bold uppercase tracking-wider">Narrative Core Router</span>
          </div>
          <p className="font-sans text-[11px] text-text-secondary leading-relaxed">
            Need details about Suraj's skill matrix? Query the smart Narrative engine directly:
          </p>
          <button
            onClick={() => openWindow('oracle')}
            className="w-full py-2 rounded-xl bg-bg-primary/45 border border-border-subtle/50 hover:bg-bg-panel-hover/60 hover:text-accent-cyan font-mono text-[10px] text-text-secondary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer text-center"
          >
            Launch Oracle Dialogue //
          </button>
        </div>
      </aside>
    </div>
  );
}
export default WidgetLayer;
