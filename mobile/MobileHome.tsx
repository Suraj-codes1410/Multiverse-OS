'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  Compass,
  Calendar,
  FileText,
  Mail,
  ShieldAlert,
  Settings,
  Folder,
  ArrowRight,
  Gamepad2,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { useNavigation } from './NavigationProvider';
import { haptic } from '@/lib/haptics';
import { playClickSound, playOpenSound } from '@/lib/useOsAudio';

export function MobileHome() {
  const { openApp, setActiveTab } = useNavigation();

  const [time, setTime] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('Welcome, Operator');

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

      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );

      const hrs = now.getHours();
      if (hrs < 12) setGreeting('Good Morning');
      else if (hrs < 18) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Curated 12-app grid (3 rows x 4 columns = perfectly balanced layout)
  const apps = [
    // Row 1: Core Profile
    {
      id: 'about',
      label: 'About Me',
      icon: User,
      color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
      action: () => openApp('about'),
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Briefcase,
      color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
      action: () => openApp('projects'),
    },
    {
      id: 'skills',
      label: 'Skills Matrix',
      icon: Compass,
      color: 'text-success-green bg-success-green/10 border-success-green/20',
      action: () => openApp('skills'),
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Calendar,
      color: 'text-warning-amber bg-warning-amber/10 border-warning-amber/20',
      action: () => openApp('timeline'),
    },

    // Row 2: Professional & Artifacts
    {
      id: 'resume',
      label: 'CV Resume',
      icon: FileText,
      color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
      action: () => openApp('resume'),
    },
    {
      id: 'recruiter',
      label: 'Recruiter',
      icon: ShieldAlert,
      color: 'text-success-green bg-success-green/10 border-success-green/20',
      action: () => openApp('recruiter'),
    },
    {
      id: 'explorer',
      label: 'GitHub Files',
      icon: Folder,
      color: 'text-warning-amber bg-warning-amber/10 border-warning-amber/20',
      action: () => openApp('explorer'),
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Mail,
      color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
      action: () => openApp('contact'),
    },

    // Row 3: Tools & Interactive
    {
      id: 'arcade',
      label: 'Arcade Hub',
      icon: Gamepad2,
      color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
      action: () => openApp('arcade'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-text-secondary bg-bg-panel/40 border-border-subtle/40',
      action: () => openApp('settings'),
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: Terminal,
      color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
      action: () => setActiveTab('terminal'),
    },
    {
      id: 'oracle',
      label: 'Oracle AI',
      icon: Sparkles,
      color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
      action: () => setActiveTab('oracle'),
    },
  ];

  const quickQueries = [
    "Explain Suraj's microservice experience",
    'What database optimizations does he perform?',
    'Compare SAHAI and ORBITAIR architectures',
    'Summarize strengths for backend roles',
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4.5 scrollbar-none">
      {/* 1. CLOCK & GREETING */}
      <header className="flex items-baseline justify-between select-none px-1 pt-1">
        <div className="flex flex-col">
          <span className="font-sans text-4xl font-light tracking-tight text-text-primary leading-none">
            {time}
          </span>
          <span className="font-mono text-xs text-text-secondary uppercase tracking-widest mt-1">
            {dateStr}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-panel/50 border border-border-subtle/40 text-[10px] font-mono text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
          <span>{greeting}</span>
        </div>
      </header>

      {/* 2. DYNAMIC ISLAND ORACLE PROMPT CAPSULE (Slim, interactive, high-value) */}
      <button
        onClick={() => {
          playOpenSound();
          haptic.launch();
          setActiveTab('oracle');
        }}
        className="w-full p-3 rounded-2xl bg-bg-panel/60 border border-border-subtle/50 backdrop-blur-md shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-accent-cyan/40 hover:bg-bg-panel/80 active:scale-97 transition-all select-none text-left"
        aria-label="Open Oracle AI conversation"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-sans font-semibold text-text-primary truncate">
              Ask Oracle AI Assistant
            </span>
            <span className="text-[11px] font-mono text-text-secondary/80 truncate">
              Query skills, projects & architecture
            </span>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-lg bg-bg-primary/70 border border-border-subtle/40 text-[11px] font-mono text-accent-cyan font-semibold flex items-center gap-1 flex-shrink-0">
          <span>Prompt</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </button>

      {/* 3. BALANCED 4-COLUMN APPLICATION GRID LAUNCHER */}
      <section className="flex flex-col gap-2.5 select-none">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-secondary/70 font-medium">
            Applications
          </h3>
          <span className="font-mono text-[10px] text-text-secondary/50">
            12 modules
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-2.5 gap-y-3.5">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => {
                  playOpenSound();
                  haptic.launch();
                  app.action();
                }}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group active:scale-90 active:rotate-[-1deg] transition-all duration-150 p-1 rounded-xl"
                aria-label={`Launch ${app.label}`}
              >
                <div
                  className={`w-13.5 h-13.5 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xs border transition-all group-hover:scale-105 group-hover:shadow-sm ${app.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-sans font-medium text-text-primary tracking-tight text-center leading-tight truncate w-full px-0.5">
                  {app.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. QUICK CONTEXT ACTIONS (Horizontal Swipeable Chips) */}
      <section className="flex flex-col gap-2 select-none mt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-text-secondary/70 font-medium">
            Quick Topics
          </h3>
          <span className="text-[10px] font-mono text-text-secondary/50">
            Swipe →
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none -mx-4 px-4">
          {quickQueries.map((query, i) => (
            <button
              key={i}
              onClick={() => {
                playClickSound();
                haptic.tap();
                setActiveTab('oracle');
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('oracleQuery', {
                    detail: query,
                  });
                  window.dispatchEvent(event);
                }
              }}
              className="px-3 py-2 rounded-xl bg-bg-panel/40 border border-border-subtle/40 text-left font-sans text-xs text-text-secondary hover:text-text-primary hover:bg-bg-panel/70 flex items-center gap-2 cursor-pointer transition-colors active:scale-95 flex-shrink-0 shadow-xs"
            >
              <span className="whitespace-nowrap leading-none">{query}</span>
              <ArrowRight className="w-3 h-3 text-accent-cyan flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MobileHome;
