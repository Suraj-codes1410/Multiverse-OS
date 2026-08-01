'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Terminal,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import CliTerminal from '@/components/CliTerminal';
import OracleWindow from '@/components/OracleWindow';
import { motion, AnimatePresence } from 'framer-motion';

// Shell System status types
export type SystemStatus = 'nominal' | 'booting' | 'warning' | 'critical';

export interface NotificationInstance {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

// Shell Context structure defining state and toggle operations for future systems
interface ShellContextType {
  // CLI State (Extension Point)
  isCliOpen: boolean;
  setCliOpen: (open: boolean) => void;
  toggleCli: () => void;

  // ORACLE State (Extension Point)
  isOracleOpen: boolean;
  setOracleOpen: (open: boolean) => void;
  toggleOracle: () => void;

  // Audio State (Extension Point)
  isAudioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  toggleAudio: () => void;
  playSound: (soundType: 'startup' | 'notification' | 'click') => void;

  // System Status State (Extension Point)
  systemStatus: SystemStatus;
  setSystemStatus: (status: SystemStatus) => void;

  // Notification State
  notifications: NotificationInstance[];
  addNotification: (
    message: string,
    type?: NotificationInstance['type']
  ) => void;
  dismissNotification: (id: string) => void;
}

const ShellContext = createContext<ShellContextType | undefined>(undefined);

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within a ShellProvider');
  }
  return context;
}

interface ShellProviderProps {
  children: React.ReactNode;
}

export default function ShellProvider({ children }: ShellProviderProps) {
  const [isCliOpen, setCliOpen] = useState(false);
  const [isOracleOpen, setOracleOpen] = useState(false);
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('nominal');
  const [notifications, setNotifications] = useState<NotificationInstance[]>(
    []
  );

  // HTML5 Web Audio API Synthesizer (Zero asset dependencies arpeggiator)
  const playSound = useCallback(
    (soundType: 'startup' | 'notification' | 'click') => {
      if (isAudioMuted) return;
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (soundType === 'startup') {
          osc.type = 'sine';
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

          osc.frequency.setValueAtTime(261.63, now); // C4
          osc.frequency.setValueAtTime(329.63, now + 0.15); // E4
          osc.frequency.setValueAtTime(392.0, now + 0.3); // G4
          osc.frequency.setValueAtTime(523.25, now + 0.45); // C5

          osc.start(now);
          osc.stop(now + 1.3);
        } else if (soundType === 'notification') {
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.08); // E5

          osc.start(now);
          osc.stop(now + 0.7);
        } else if (soundType === 'click') {
          osc.type = 'sine';
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.03, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

          osc.frequency.setValueAtTime(800, now);

          osc.start(now);
          osc.stop(now + 0.12);
        }
      } catch (e) {
        console.warn('Audio arpeggiator failed:', e);
      }
    },
    [isAudioMuted]
  );

  // Notifications push arpeggiator
  const addNotification = useCallback(
    (message: string, type: NotificationInstance['type'] = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, message, type }]);
      playSound('notification');

      // Auto dismiss
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4500);
    },
    [playSound]
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleCli = () => setCliOpen((prev) => !prev);
  const toggleOracle = () => setOracleOpen((prev) => !prev);

  const toggleAudio = () => {
    setAudioMuted((prev) => {
      const nextMute = !prev;
      if (!nextMute) {
        // Trigger startup chime test on unmute
        setTimeout(() => playSound('startup'), 100);
      }
      return nextMute;
    });
  };

  // Play startup sound on first boot once complete
  useEffect(() => {
    const checkBoot = setInterval(() => {
      if (sessionStorage.getItem('multiverse_boot_completed') === 'true') {
        clearInterval(checkBoot);
        if (!isAudioMuted) {
          playSound('startup');
        }
        // Emit startup notification welcome arpeggio
        setTimeout(() => {
          addNotification(
            'Welcome to Suraj.OS! Terminal modules loaded successfully.',
            'success'
          );
        }, 1000);
      }
    }, 500);
    return () => clearInterval(checkBoot);
  }, [playSound, isAudioMuted, addNotification]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (['INPUT', 'TEXTAREA'].includes(activeElement.tagName) ||
          activeElement.hasAttribute('contenteditable') ||
          (activeElement as HTMLElement).isContentEditable);

      if (isInput) return;

      const isBooting =
        sessionStorage.getItem('multiverse_boot_completed') !== 'true';
      if (isBooting) return;

      // Ctrl/Cmd + O arpeggio to toggle assistant
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        toggleOracle();
      }

      // Shortcut: Ctrl + Backtick (`) arpeggio
      if (e.ctrlKey && (e.key === '`' || e.code === 'Backquote')) {
        e.preventDefault();
        toggleCli();
      }

      // Escape key arpeggio
      if (e.key === 'Escape') {
        if (isCliOpen || isOracleOpen) {
          setCliOpen(false);
          setOracleOpen(false);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCliOpen, isOracleOpen]);

  // Decoupled App Launch Event listener
  useEffect(() => {
    const handleLaunch = (e: Event) => {
      const appId = (e as CustomEvent).detail;
      if (appId) {
        playSound('click');
        addNotification(
          `Initializing application package: ${appId}...`,
          'info'
        );
      }
    };
    window.addEventListener('launchApp', handleLaunch);
    return () => window.removeEventListener('launchApp', handleLaunch);
  }, [addNotification, playSound]);

  return (
    <ShellContext.Provider
      value={{
        isCliOpen,
        setCliOpen,
        toggleCli,
        isOracleOpen,
        setOracleOpen,
        toggleOracle,
        isAudioMuted,
        setAudioMuted,
        toggleAudio,
        playSound,
        systemStatus,
        setSystemStatus,
        notifications,
        addNotification,
        dismissNotification,
      }}
    >
      {/* Underlying app pages */}
      {children}

      {/* Overlay Region Slot */}
      <div
        id="shell-overlay-region"
        className="fixed inset-0 pointer-events-none z-[9990] font-mono text-xs"
      >
        {isCliOpen && (
          <CliTerminal isOpen={isCliOpen} onClose={() => setCliOpen(false)} />
        )}
        {isOracleOpen && (
          <OracleWindow
            isOpen={isOracleOpen}
            onClose={() => setOracleOpen(false)}
          />
        )}
      </div>

      {/* Reusable Notification Overlay Layer */}
      <div
        id="shell-notification-container"
        className="fixed top-12 left-4 right-4 md:left-auto md:right-8 md:top-14 z-[9997] flex flex-col gap-2.5 max-w-sm w-auto pointer-events-none"
      >
        <AnimatePresence>
          {notifications.map((n) => {
            let Icon = Info;
            let themeClass =
              'border-accent-purple/35 bg-bg-panel/90 text-text-primary shadow-lg';
            let iconClass = 'text-accent-purple';

            if (n.type === 'success') {
              Icon = CheckCircle;
              themeClass =
                'border-success-green/20 bg-[#F2F7F2]/95 text-text-primary shadow-lg';
              iconClass = 'text-success-green';
            } else if (n.type === 'error') {
              Icon = AlertCircle;
              themeClass =
                'border-red-500/20 bg-[#FAF2F2]/95 text-text-primary shadow-lg';
              iconClass = 'text-red-500';
            } else if (n.type === 'warning') {
              Icon = AlertCircle;
              themeClass =
                'border-warning-amber/25 bg-[#FAF6F2]/95 text-text-primary shadow-lg';
              iconClass = 'text-warning-amber';
            }

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`p-3.5 rounded-xl border backdrop-blur-md flex gap-3 items-start pointer-events-auto select-none shadow-md ${themeClass}`}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconClass}`} />
                <div className="flex-grow flex flex-col leading-tight pr-4">
                  <span className="text-[10px] font-sans font-medium">
                    {n.message}
                  </span>
                </div>
                <button
                  onClick={() => dismissNotification(n.id)}
                  className="text-[9px] font-mono text-text-secondary hover:text-text-primary opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                  aria-label="Dismiss Alert"
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Utility Region Slot */}
      <div
        id="shell-utility-region"
        className="fixed bottom-4 right-4 pointer-events-none z-[9980] flex flex-col items-end gap-2 font-mono text-[10px]"
      >
        {/* Floating Oracle Action Button */}
        <button
          onClick={toggleOracle}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full border border-accent-purple/35 bg-[#0a0c16]/90 text-accent-purple hover:bg-accent-purple/15 hover:border-accent-purple hover:shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all duration-300 cursor-pointer animate-bounce-slow"
          title="Toggle Oracle (Alt + O)"
          aria-label="Toggle Oracle"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Floating Terminal Action Button */}
        <button
          onClick={toggleCli}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full border border-accent-cyan/35 bg-[#0a0c16]/90 text-accent-cyan hover:bg-accent-cyan/15 hover:border-accent-cyan hover:shadow-[0_0_12px_rgba(0,242,254,0.35)] transition-all duration-300 cursor-pointer"
          title="Toggle Terminal CLI (Ctrl + `)"
          aria-label="Toggle Terminal CLI"
        >
          <Terminal className="w-4 h-4" />
        </button>

        <div className="pointer-events-auto bg-bg-panel/85 border border-border-subtle hover:border-accent-cyan/25 px-3 py-1.5 rounded-md text-text-secondary flex items-center gap-3 shadow-md backdrop-blur-sm transition-all duration-300">
          <span className="flex h-1.5 w-1.5 relative">
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
          <span>SYS_STATUS: {systemStatus.toUpperCase()}</span>
          <span className="text-border-subtle">|</span>
          <button
            onClick={toggleAudio}
            className="hover:text-accent-cyan transition-colors cursor-pointer"
            title="Toggle Audio settings"
          >
            {isAudioMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE'}
          </button>
        </div>
      </div>
    </ShellContext.Provider>
  );
}
