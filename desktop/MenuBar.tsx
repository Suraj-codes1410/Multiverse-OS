'use client';

import React, { useState, useEffect, useContext } from 'react';
import { Wifi, Battery, Sun, Moon, Cpu, ShieldAlert } from 'lucide-react';
import { useTheme } from '@/providers';
import { DesktopContext } from './DesktopContext';
import { onBootPhase, getBootPhase, isReturningVisitor } from '@/lib/bootPhase';

export function MenuBar() {
  const [time, setTime] = useState<string>('');
  const { themeName, setThemeName } = useTheme();
  const desktopContext = useContext(DesktopContext);
  // Boot reveal state — starts hidden, fades in when 'reveal' phase fires
  const [revealed, setRevealed] = useState(() => getBootPhase() === 'done');

  useEffect(() => {
    if (revealed) return;
    return onBootPhase((phase) => {
      if (phase === 'reveal' || phase === 'done') {
        // Small delay so MenuBar leads the reveal sequence
        const delay = isReturningVisitor() ? 0 : 100;
        setTimeout(() => setRevealed(true), delay);
      }
    });
  }, [revealed]);

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
    if (themeName === 'default') setThemeName('dark');
    else if (themeName === 'dark') setThemeName('cyberpunk');
    else if (themeName === 'cyberpunk') setThemeName('matrix');
    else if (themeName === 'matrix') setThemeName('high-contrast');
    else setThemeName('default');
  };

  return (
    <header
      role="menubar"
      aria-label="Desktop System Menu Bar"
      className="fixed top-0 left-0 right-0 h-11 bg-bg-panel/85 border-b border-border-subtle/50 backdrop-blur-md z-50 flex items-center justify-between px-4 select-none font-mono text-sm text-text-primary"
      style={{
        opacity: revealed ? 1 : 0,
        transition: 'opacity 500ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* LEFT: Branding & Logo */}
      <div className="flex items-center gap-4">
        {/* Branding Logo wrapper */}
        <div
          onClick={() => desktopContext?.openWindow('home')}
          className="flex items-center gap-2.5 group cursor-pointer"
          tabIndex={0}
          aria-label="System Menu Branding"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-cyan" />
          </span>
          <span className="font-bold tracking-wider text-sm md:text-base text-accent-cyan group-hover:text-text-primary transition-colors">
            MULTIVERSE // OS
          </span>
        </div>

        {/* Future menu item anchors placeholders */}
        <nav
          className="hidden md:flex items-center gap-1.5"
          aria-label="Desktop Submenus"
        >
          <button
            onClick={() => desktopContext?.openWindow('settings')}
            className="px-3 py-1 rounded text-sm hover:bg-bg-panel-hover/50 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            System
          </button>
          <button
            onClick={() => desktopContext?.openWindow('explorer')}
            className="px-3 py-1 rounded text-sm hover:bg-bg-panel-hover/50 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            View
          </button>
          <button
            onClick={() => desktopContext?.openWindow('terminal')}
            className="px-3 py-1 rounded text-sm hover:bg-bg-panel-hover/50 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            Terminal
          </button>
        </nav>
      </div>

      {/* CENTER: System Status */}
      <div className="hidden sm:flex items-center gap-2.5 text-xs text-text-secondary bg-bg-primary/55 px-3.5 py-1.5 rounded-full border border-border-subtle/50">
        <Cpu className="w-4 h-4 text-accent-purple" />
        <span className="tracking-widest uppercase font-medium">
          System Status:
        </span>
        <span className="text-success-green font-bold uppercase tracking-wider animate-pulse">
          Nominal
        </span>
      </div>

      {/* RIGHT: Clock, Theme Toggle & Controls Placeholders */}
      <div className="flex items-center gap-4">
        {/* Network status placeholder */}
        <div
          className="h-8 flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-help select-none"
          title="Network Connected: LTE/Gigabit"
        >
          <Wifi className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs hidden lg:inline font-mono">100 ms</span>
        </div>

        {/* Battery status placeholder */}
        <div
          className="h-8 flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-help select-none"
          title="Power Source: Battery (Charging)"
        >
          <Battery className="w-4 h-4 text-success-green" />
          <span className="text-xs hidden lg:inline font-mono">99%</span>
        </div>

        {/* Theme toggler */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-bg-panel-hover/60 text-text-secondary hover:text-text-primary transition-all focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer p-0"
          aria-label={`Current Theme: ${themeName}. Click to change theme`}
        >
          {themeName === 'high-contrast' ? (
            <ShieldAlert className="w-4 h-4 text-warning-amber" />
          ) : themeName === 'matrix' ? (
            <Cpu className="w-4 h-4 text-success-green" />
          ) : themeName === 'cyberpunk' ? (
            <Moon className="w-4 h-4 text-accent-purple" />
          ) : themeName === 'dark' ? (
            <Moon className="w-4 h-4 text-text-secondary" />
          ) : (
            <Sun className="w-4 h-4 text-accent-cyan" />
          )}
        </button>

        {/* Live system clock */}
        <div
          className="h-8 px-3 flex items-center justify-center text-text-primary font-bold rounded bg-bg-primary/60 border border-border-subtle/40 font-mono text-xs sm:text-sm"
          aria-live="polite"
        >
          {time}
        </div>
      </div>
    </header>
  );
}
export default MenuBar;
