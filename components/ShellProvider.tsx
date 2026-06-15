'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Shell System status types
export type SystemStatus = 'nominal' | 'booting' | 'warning' | 'critical';

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

  // System Status State (Extension Point)
  systemStatus: SystemStatus;
  setSystemStatus: (status: SystemStatus) => void;
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
  const [isAudioMuted, setAudioMuted] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('nominal');

  const toggleCli = () => setCliOpen((prev) => !prev);
  const toggleOracle = () => setOracleOpen((prev) => !prev);
  const toggleAudio = () => setAudioMuted((prev) => !prev);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if the user is typing in form controls or rich editors
      const activeElement = document.activeElement;
      const isInput =
        activeElement &&
        (['INPUT', 'TEXTAREA'].includes(activeElement.tagName) ||
          activeElement.hasAttribute('contenteditable') ||
          (activeElement as HTMLElement).isContentEditable);

      if (isInput) {
        return;
      }

      // Check if boot sequence is still running
      const isBooting = sessionStorage.getItem('multiverse_boot_completed') !== 'true';
      if (isBooting) {
        return;
      }

      // Shortcut: Backtick / Tilde (`) to toggle CLI overlay
      if (e.key === '`') {
        e.preventDefault();
        toggleCli();
      }

      // Shortcut: Alt + O to toggle ORACLE overlay
      if (e.altKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        toggleOracle();
      }

      // Shortcut: Escape to close any active overlay
      if (e.key === 'Escape') {
        if (isCliOpen || isOracleOpen) {
          setCliOpen(false);
          setOracleOpen(false);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCliOpen, isOracleOpen]);

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
        systemStatus,
        setSystemStatus,
      }}
    >
      {/* Underlying app pages */}
      {children}

      {/* Overlay Region Slot: z-index higher than normal layout, lower than boot overlay.
          Used for full-screen CLI, ORACLE, or other overlays. */}
      <div
        id="shell-overlay-region"
        className="fixed inset-0 pointer-events-none z-[9990] font-mono text-xs"
      >
        {isCliOpen && (
          <div className="absolute inset-0 bg-[#030407]/90 pointer-events-auto flex items-center justify-center p-4">
            <div className="border border-accent-cyan bg-bg-panel/95 rounded p-6 max-w-md w-full shadow-[0_0_30px_rgba(0,242,254,0.15)]">
              <div className="text-accent-cyan font-bold mb-2">&gt; MULTIVERSE CLI [OFFLINE]</div>
              <div className="text-text-secondary leading-relaxed mb-4">
                The terminal interface is not active in this phase. Run shell commands in future updates.
              </div>
              <button
                onClick={() => setCliOpen(false)}
                className="px-3 py-1 border border-accent-cyan/35 text-accent-cyan hover:bg-accent-cyan/10 transition-colors rounded"
              >
                Close CLI
              </button>
            </div>
          </div>
        )}

        {isOracleOpen && (
          <div className="absolute inset-0 bg-[#030407]/90 pointer-events-auto flex items-center justify-center p-4">
            <div className="border border-accent-purple bg-bg-panel/95 rounded p-6 max-w-md w-full shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <div className="text-accent-purple font-bold mb-2">&gt; ORACLE BINDINGS [STANDBY]</div>
              <div className="text-text-secondary leading-relaxed mb-4">
                The cognitive prompt and AI router system is offline. Connect Oracle in future phases.
              </div>
              <button
                onClick={() => setOracleOpen(false)}
                className="px-3 py-1 border border-accent-purple/35 text-accent-purple hover:bg-accent-purple/10 transition-colors rounded"
              >
                Disconnect Oracle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Utility Region Slot: bottom-right status and audio controls widgets. */}
      <div
        id="shell-utility-region"
        className="fixed bottom-4 right-4 pointer-events-none z-[9980] flex flex-col items-end gap-2 font-mono text-[10px]"
      >
        <div className="pointer-events-auto bg-bg-panel/85 border border-border-subtle hover:border-accent-cyan/25 px-3 py-1.5 rounded-md text-text-secondary flex items-center gap-3 shadow-md backdrop-blur-sm transition-all duration-300">
          <span className="flex h-1.5 w-1.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                systemStatus === 'nominal' ? 'bg-success-green' : 'bg-warning-amber'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                systemStatus === 'nominal' ? 'bg-success-green' : 'bg-warning-amber'
              }`}
            />
          </span>
          <span>SYS_STATUS: {systemStatus.toUpperCase()}</span>
          <span className="text-border-subtle">|</span>
          <button
            onClick={toggleAudio}
            className="hover:text-accent-cyan transition-colors"
            title="Toggle Audio settings"
          >
            {isAudioMuted ? 'AUDIO: MUTED' : 'AUDIO: ACTIVE'}
          </button>
        </div>
      </div>
    </ShellContext.Provider>
  );
}
