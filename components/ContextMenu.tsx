'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, Volume2, RefreshCw, Trash2 } from 'lucide-react';
import { useShell } from './ShellProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export function ContextMenu() {
  const { toggleCli, toggleAudio, isAudioMuted, addNotification } = useShell();
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // Find if we clicked on the desktop background element or a container marked for context menu
      const target = e.target as HTMLElement;
      const isDesktopContext = target.closest('[data-context-menu="desktop"]');
      
      if (!isDesktopContext) {
        // If not desktop, let default context menu slide through or close our custom one
        setVisible(false);
        return;
      }

      e.preventDefault();
      setCoords({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action: () => void, label: string) => {
    action();
    setVisible(false);
    addNotification(`Executed action: ${label}`, 'success');
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Spotlight Search',
      icon: Search,
      shortcut: '⌘K',
      action: () => {
        // Dispatch keydown event for Cmd + K to trigger Spotlight Search
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      }
    },
    {
      label: 'Open CLI Terminal',
      icon: Terminal,
      shortcut: 'Ctrl+`',
      action: toggleCli
    },
    {
      label: isAudioMuted ? 'Unmute System Sound' : 'Mute System Sound',
      icon: Volume2,
      shortcut: 'Toggle',
      action: toggleAudio
    },
    {
      label: 'Refresh Desktop Workspace',
      icon: RefreshCw,
      action: () => {
        window.dispatchEvent(new CustomEvent('launchApp', { detail: 'home' }));
      }
    },
    {
      label: 'Clear Session Logs',
      icon: Trash2,
      action: () => {
        sessionStorage.clear();
        addNotification('Session completed logs flushed from workspace.', 'warning');
      }
    }
  ];

  if (!visible) return null;

  // Safeguard coordinates from overflow viewport boundaries
  const menuWidth = 190;
  const menuHeight = 220;
  const adjustedX = typeof window !== 'undefined' && coords.x + menuWidth > window.innerWidth ? coords.x - menuWidth : coords.x;
  const adjustedY = typeof window !== 'undefined' && coords.y + menuHeight > window.innerHeight ? coords.y - menuHeight : coords.y;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'fixed',
          left: adjustedX,
          top: adjustedY,
          zIndex: 9996,
        }}
        className="w-48 bg-window-bg border border-window-border rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 pointer-events-auto select-none"
      >
        <div className="text-[7px] font-mono text-text-secondary/50 uppercase tracking-widest px-2.5 py-1 select-none border-b border-border-subtle/20 mb-1">
          Suraj.OS Options
        </div>

        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleAction(item.action, item.label)}
              className="w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all cursor-pointer font-sans text-xs active:scale-95"
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-[8px] font-mono opacity-50 px-1 py-0.5 rounded bg-bg-panel flex-shrink-0">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

export default ContextMenu;
