'use client';

import React, { useState } from 'react';
import { User, Briefcase, Calendar, FileText, Sparkles, Terminal, Mail, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DockApp {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DockProps {
  activeAppId?: string | null;
  onAppClick?: (appId: string) => void;
}

export function Dock({ activeAppId = null, onAppClick }: DockProps) {
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);

  const apps: DockApp[] = [
    { id: 'hero', label: 'Profile Home', icon: User },
    { id: 'projects', label: 'Projects Explorer', icon: Briefcase },
    { id: 'timeline', label: 'Career Timeline', icon: Calendar },
    { id: 'resume', label: 'Resume Analyzer', icon: FileText },
    { id: 'oracle', label: 'Oracle AI Chat', icon: Sparkles },
    { id: 'terminal', label: 'CLI Terminal', icon: Terminal },
    { id: 'contact', label: 'Get in Touch', icon: Mail },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <nav
      role="toolbar"
      aria-label="Desktop Applications Dock"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 h-16 bg-bg-panel/40 border border-border-subtle/50 backdrop-blur-md rounded-2xl flex items-end gap-3 px-4 pb-2 z-50 transition-all duration-300 hover:bg-bg-panel/60 hover:border-border-bright/60 select-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      {apps.map((app) => {
        const IconComponent = app.icon;
        const isActive = activeAppId === app.id;
        const isHovered = hoveredAppId === app.id;

        return (
          <div
            key={app.id}
            className="relative flex flex-col items-center justify-end h-full pb-1"
            onMouseEnter={() => setHoveredAppId(app.id)}
            onMouseLeave={() => setHoveredAppId(null)}
          >
            {/* Tooltip Popup */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: -45, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute z-50 px-2.5 py-1 rounded bg-bg-panel border border-border-subtle text-[10px] text-text-primary font-mono whitespace-nowrap shadow-lg pointer-events-none"
                >
                  {app.label}
                  <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-panel" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dock Item Button */}
            <button
              onClick={() => onAppClick?.(app.id)}
              onFocus={() => setHoveredAppId(app.id)}
              onBlur={() => setHoveredAppId(null)}
              className="relative p-2.5 rounded-xl bg-bg-primary/20 hover:bg-bg-panel-hover/60 border border-transparent hover:border-border-subtle/30 text-text-secondary hover:text-accent-cyan transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-cyan cursor-pointer group"
              aria-label={`Open ${app.label}`}
              tabIndex={0}
            >
              {/* Icon component wrapping with hover scaling */}
              <div className="transition-transform duration-200 group-hover:scale-120 group-active:scale-95">
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Active Application Indicator dot */}
              {isActive && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_var(--accent-cyan)]" />
              )}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
export default Dock;
