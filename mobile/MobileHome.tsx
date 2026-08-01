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
} from 'lucide-react';
import { useNavigation } from './NavigationProvider';
import Card from '@/components/Card';

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

  const apps = [
    {
      id: 'about',
      label: 'About Me',
      icon: User,
      color: 'text-accent-cyan bg-accent-cyan/8',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: Briefcase,
      color: 'text-accent-purple bg-accent-purple/8',
    },
    {
      id: 'skills',
      label: 'Skills Map',
      icon: Compass,
      color: 'text-success-green bg-success-green/8',
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Calendar,
      color: 'text-warning-amber bg-warning-amber/8',
    },
    {
      id: 'resume',
      label: 'CV Resume',
      icon: FileText,
      color: 'text-accent-cyan bg-accent-cyan/8',
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Mail,
      color: 'text-accent-purple bg-accent-purple/8',
    },
    {
      id: 'recruiter',
      label: 'Recruiter',
      icon: ShieldAlert,
      color: 'text-success-green bg-success-green/8',
    },
    {
      id: 'explorer',
      label: 'GitHub Files',
      icon: Folder,
      color: 'text-warning-amber bg-warning-amber/8',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-text-secondary bg-bg-panel-hover/40',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 scrollbar-none">
      {/* 1. CLOCK & GREETING */}
      <header className="flex flex-col select-none text-center sm:text-left mt-2">
        <span className="font-sans text-5xl font-light tracking-tight text-text-primary">
          {time}
        </span>
        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-xs font-mono text-text-secondary">
          <span className="uppercase tracking-widest">{dateStr}</span>
          <span className="text-border-subtle">|</span>
          <span className="text-accent-cyan animate-pulse">● ONLINE</span>
        </div>
      </header>

      {/* 2. COMPANION ROBOT WIDGET */}
      <Card
        hoverable={false}
        className="p-4 bg-bg-panel/40 border-border-subtle/35 rounded-2xl shadow-sm flex items-center gap-4.5 select-none relative overflow-hidden"
      >
        {/* SVG Robot Companion */}
        <div className="relative flex-shrink-0 flex items-center justify-center p-1 bg-white border border-window-border rounded-xl shadow-sm">
          <svg
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            className="w-10 h-10 animate-bounce-slow"
          >
            {/* Ears / Antennas */}
            <path
              d="M6 8L4 5.5M18 8L20 5.5"
              stroke="#6A6D70"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="4" cy="5.5" r="1" fill="#E06A3F" />
            <circle cx="20" cy="5.5" r="1" fill="#E06A3F" />

            {/* Head */}
            <rect
              x="5"
              y="7"
              width="14"
              height="11"
              rx="4"
              fill="#FFFFFF"
              stroke="#6A6D70"
              strokeWidth="1.5"
            />

            {/* Eyes Display Screen */}
            <rect x="8" y="10" width="8" height="4" rx="1.5" fill="#2B2D2F" />
            <circle
              cx="10"
              cy="12"
              r="0.75"
              fill="#E06A3F"
              className="animate-pulse"
            />
            <circle
              cx="14"
              cy="12"
              r="0.75"
              fill="#E06A3F"
              className="animate-pulse"
            />

            {/* Smile Mouth */}
            <path
              d="M10 15C10.5 15.5 11.2 15.7 12 15.7C12.8 15.7 13.5 15.5 14 15"
              stroke="#6A6D70"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Neck */}
            <rect
              x="11"
              y="18"
              width="2"
              height="1.5"
              fill="#E06A3F"
              stroke="#6A6D70"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Message bubble */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider font-bold">
            OS Companion
          </span>
          <span className="text-text-primary font-semibold text-xs mt-0.5 leading-snug">
            {greeting}, Operator.
          </span>
          <p className="text-[10px] text-text-secondary leading-normal mt-0.5 font-light">
            Need details about Suraj's skill matrix? Tap the Oracle shortcut to
            begin a dialogue.
          </p>
        </div>
      </Card>

      {/* 3. APPLICATION GRID LAUNCHER */}
      <section className="flex flex-col gap-3">
        <h3 className="font-mono text-[9px] uppercase tracking-wider text-text-secondary/70">
          System Applications
        </h3>
        <div className="grid grid-cols-3 gap-x-4 gap-y-5">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                onClick={() => openApp(app.id)}
                className="flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer group active:scale-95 transition-transform"
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-sm border border-border-subtle/20 transition-all group-hover:shadow-md ${app.color}`}
                >
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <span className="text-[10px] font-sans font-medium text-text-primary tracking-tight text-center leading-tight truncate w-full px-0.5">
                  {app.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. QUICK CONTEXT ACTIONS */}
      <section className="flex flex-col gap-3 mb-4 select-none">
        <h3 className="font-mono text-[9px] uppercase tracking-wider text-text-secondary/70">
          Quick Assistant Queries
        </h3>
        <div className="flex flex-col gap-2">
          {[
            "Explain Suraj's experience with microservices.",
            'What database optimizations does he perform?',
          ].map((query, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveTab('oracle');
                // We'll write a dispatcher or global event to send this query!
                if (typeof window !== 'undefined') {
                  const event = new CustomEvent('oracleQuery', {
                    detail: query,
                  });
                  window.dispatchEvent(event);
                }
              }}
              className="w-full p-3 rounded-xl bg-bg-panel/20 border border-border-subtle/30 text-left font-sans text-xs text-text-secondary hover:text-text-primary hover:bg-bg-panel/40 flex items-center justify-between cursor-pointer transition-colors active:scale-99"
            >
              <span className="truncate pr-4 leading-normal font-light">
                {query}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default MobileHome;
