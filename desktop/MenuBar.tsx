'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Wifi, Battery, Sun, Moon, Cpu, ShieldAlert } from 'lucide-react';
import { useTheme } from '@/providers';
import { DesktopContext } from './DesktopContext';

export function MenuBar() {
  const [time, setTime] = useState<string>('');
  const { themeName, setThemeName } = useTheme();
  const desktopContext = useContext(DesktopContext);

  // Clock Update Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Theme Toggler
  const toggleTheme = () => {
    if (themeName === 'default') setThemeName('cyberpunk');
    else if (themeName === 'cyberpunk') setThemeName('matrix');
    else if (themeName === 'matrix') setThemeName('high-contrast');
    else setThemeName('default');
  };

  return (
    <header
      role="menubar"
      aria-label="Desktop System Menu Bar"
      className="fixed top-0 left-0 right-0 h-10 bg-bg-panel/75 border-b border-border-subtle/50 backdrop-blur-md z-50 flex items-center justify-between px-4 select-none font-mono text-xs text-text-primary"
    >
      {/* LEFT: Branding & Logo */}
      <div className="flex items-center gap-4">
        {/* Branding Logo wrapper */}
        <div 
          onClick={() => desktopContext?.openWindow('home')} 
          className="flex items-center gap-2 group cursor-pointer" 
          tabIndex={0} 
          aria-label="System Menu Branding"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
          </span>
          <span className="font-bold tracking-wider text-accent-cyan group-hover:text-text-primary transition-colors">
            MULTIVERSE // OS
          </span>
        </div>

        {/* Future menu item anchors placeholders */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Desktop Submenus">
          <button 
            onClick={() => desktopContext?.openWindow('settings')} 
            className="px-2.5 py-1 rounded hover:bg-bg-panel-hover/50 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            System
          </button>
          <button 
            onClick={() => desktopContext?.openWindow('explorer')} 
            className="px-2.5 py-1 rounded hover:bg-bg-panel-hover/50 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            View
          </button>
          <button 
            onClick={() => desktopContext?.openWindow('terminal')} 
            className="px-2.5 py-1 rounded hover:bg-bg-panel-hover/50 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            Terminal
          </button>
        </nav>
      </div>

      {/* CENTER: System Status */}
      <div className="hidden sm:flex items-center gap-2 text-[10px] text-text-secondary bg-bg-primary/45 px-3 py-1 rounded-full border border-border-subtle/40">
        <Cpu className="w-3.5 h-3.5 text-accent-purple" />
        <span className="tracking-widest uppercase">System Status:</span>
        <span className="text-success-green font-bold uppercase tracking-wider animate-pulse">Nominal</span>
      </div>

      {/* RIGHT: Clock, Theme Toggle & Controls Placeholders */}
      <div className="flex items-center gap-3.5">
        {/* Network status placeholder */}
        <div className="h-7 flex items-center gap-1.5 text-text-secondary hover:text-text-primary cursor-help select-none" title="Network Connected: LTE/Gigabit">
          <Wifi className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="text-[10px] hidden lg:inline font-mono">100 ms</span>
        </div>

        {/* Battery status placeholder */}
        <div className="h-7 flex items-center gap-1.5 text-text-secondary hover:text-text-primary cursor-help select-none" title="Power Source: Battery (Charging)">
          <Battery className="w-3.5 h-3.5 text-success-green" />
          <span className="text-[10px] hidden lg:inline font-mono">99%</span>
        </div>

        {/* Theme toggler */}
        <button
          onClick={toggleTheme}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-bg-panel-hover/60 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer p-0"
          aria-label={`Current Theme: ${themeName}. Click to change theme`}
        >
          {themeName === 'high-contrast' ? (
            <ShieldAlert className="w-3.5 h-3.5 text-warning-amber" />
          ) : themeName === 'matrix' ? (
            <Cpu className="w-3.5 h-3.5 text-success-green" />
          ) : themeName === 'cyberpunk' ? (
            <Moon className="w-3.5 h-3.5 text-accent-purple" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-accent-cyan" />
          )}
        </button>

        {/* Live system clock */}
        <div 
          className="h-7 px-2.5 flex items-center justify-center text-text-primary font-bold rounded bg-bg-primary/50 border border-border-subtle/30 font-mono text-[11px]"
          aria-live="polite"
        >
          {time}
        </div>
      </div>
    </header>
  );
}
export default MenuBar;
