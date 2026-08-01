'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { commandHandler } from '@/lib/commands';
import { useShell } from './ShellProvider';

interface HistoryLine {
  type: 'input' | 'output';
  text: string;
}

interface CliTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  isFullscreen?: boolean;
}

export default function CliTerminal({
  isOpen,
  onClose,
  isFullscreen = false,
}: CliTerminalProps) {
  const router = useRouter();
  const { setOracleOpen } = useShell();
  const [inputValue, setInputValue] = useState('');

  // Custom initial history text based on fullscreen or windowed mode
  const [history, setHistory] = useState<HistoryLine[]>(() => {
    const list: HistoryLine[] = [
      { type: 'output', text: 'Multiverse OS [Version 2.1.0-GENESIS]' },
      { type: 'output', text: 'Establishing telemetry links... [OK]' },
      { type: 'output', text: 'Secure Enclave: Connected via quantum tunnel.' },
      {
        type: 'output',
        text: '--------------------------------------------------',
      },
      { type: 'output', text: 'AVAILABLE COMMANDS:' },
      {
        type: 'output',
        text: '  portfolio    - View professional overview profile.',
      },
      {
        type: 'output',
        text: '  projects     - View featured engineering projects.',
      },
      {
        type: 'output',
        text: '  skills       - View technical skills and competencies.',
      },
      {
        type: 'output',
        text: '  experience   - View career history and milestones.',
      },
      {
        type: 'output',
        text: "  resume       - Download Suraj's latest resume.",
      },
      { type: 'output', text: '  contact      - View direct contact details.' },
      {
        type: 'output',
        text: '  oracle       - Launch AI Portfolio Intelligence.',
      },
      {
        type: 'output',
        text: '  help         - Display all available commands.',
      },
      {
        type: 'output',
        text: '  repos        - View full GitHub synced repositories.',
      },
      {
        type: 'output',
        text: "  github       - Link to Suraj's GitHub profile.",
      },
      {
        type: 'output',
        text: '  career       - Request recruiter recommendations.',
      },
    ];

    if (isFullscreen) {
      list.push({
        type: 'output',
        text: '  exit         - Close terminal and launch GUI desktop workspace.',
      });
    }

    list.push({
      type: 'output',
      text: '--------------------------------------------------',
    });
    list.push({
      type: 'output',
      text: 'Click any suggested command below or type command and press Enter.',
    });

    return list;
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom when history updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleExecuteCommand = async (command: string) => {
    const trimmedCommand = command.trim();
    if (!trimmedCommand) return;

    setHistory((prev) => [...prev, { type: 'input', text: trimmedCommand }]);

    try {
      const result = await commandHandler.handle(trimmedCommand, {
        clearTerminal: () => {
          setHistory([]);
        },
        navigate: (path: string) => {
          router.push(path);
          onClose();
        },
        openOracle: () => {
          onClose();
          setOracleOpen(true);
        },
        exit: () => {
          onClose();
        },
      } as any);

      const output = result.output;
      if (output) {
        if (Array.isArray(output)) {
          setHistory((prev) => [
            ...prev,
            ...output.map((text: string) => ({
              type: 'output' as const,
              text,
            })),
          ]);
        } else {
          setHistory((prev) => [...prev, { type: 'output', text: output }]);
        }
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          type: 'output',
          text: `SYSTEM ERROR: ${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputValue.trim();
    if (!command) return;

    setInputValue('');
    await handleExecuteCommand(command);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target !== inputRef.current) {
      inputRef.current?.focus();
    }
  };

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 bg-[#030407] pointer-events-auto flex flex-col z-[9990]'
    : 'absolute inset-0 bg-[#030407]/75 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-0 sm:p-4 md:p-6 z-[9990]';

  const containerClass = isFullscreen
    ? 'w-full h-full flex flex-col overflow-hidden'
    : 'w-full h-full sm:h-[80vh] sm:max-w-4xl sm:rounded-lg border-y sm:border border-accent-cyan/20 bg-bg-panel/95 flex flex-col shadow-[0_0_40px_rgba(0,242,254,0.1)] overflow-hidden';

  return (
    <div className={wrapperClass}>
      {/* Terminal Window container */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={containerClass}
      >
        {/* Terminal Header — hidden if fullscreen */}
        {!isFullscreen && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-primary/80 select-none">
            {/* Window Dots */}
            <div className="flex items-center gap-1.5 sm:w-1/3">
              <span
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500 flex items-center justify-center text-[8px] text-red-950 font-bold transition-all"
              >
                x
              </span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-not-allowed" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 cursor-not-allowed" />
            </div>

            {/* Title */}
            <div className="font-mono text-xs sm:text-sm text-accent-cyan tracking-wider font-bold text-center sm:w-1/3">
              ORACLE@MULTIVERSE: shell
            </div>

            {/* Close button icon */}
            <div className="flex justify-end sm:w-1/3">
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-accent-cyan transition-colors"
                aria-label="Close terminal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen Header back to GUI */}
        {isFullscreen && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-[#030407] select-none text-[#F7F2EB]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E06A3F] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E06A3F]" />
              </span>
              <span className="font-mono text-xs font-bold tracking-widest text-[#E06A3F]">
                MULTIVERSE // OS TERMINAL SHELL
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 border border-border-bright hover:border-[#E06A3F] hover:text-[#E06A3F] rounded text-[10px] font-mono transition-all uppercase cursor-pointer"
            >
              Exit to GUI Desktop //
            </button>
          </div>
        )}

        {/* Scrollable Output Logs */}
        <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-2 font-mono text-xs sm:text-sm text-text-primary scrollbar-thin select-text bg-[#030407]">
          {history.map((line, idx) => {
            if (line.type === 'input') {
              return (
                <div key={idx} className="flex items-center gap-1.5 h-6">
                  <span className="text-accent-cyan select-none shrink-0 font-bold">
                    ORACLE@MULTIVERSE:~$
                  </span>
                  <span className="text-text-primary font-bold break-all self-center">
                    {line.text}
                  </span>
                </div>
              );
            } else {
              return (
                <div
                  key={idx}
                  className="text-text-secondary leading-relaxed break-all pl-2.5 border-l border-accent-cyan/15 py-0.5"
                >
                  {line.text}
                </div>
              );
            }
          })}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Starter Commands Suggestions */}
        <div className="px-5 py-2.5 bg-[#030407] border-t border-border-subtle/50 flex flex-wrap items-center gap-2 select-none">
          <span className="text-[10px] text-text-secondary uppercase font-mono mr-1">
            Suggested:
          </span>
          {[
            'projects',
            'skills',
            'experience',
            'resume',
            'repos',
            'oracle',
            'help',
            'career',
            ...(isFullscreen ? ['exit'] : []),
          ].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleExecuteCommand(cmd)}
              type="button"
              className="px-2.5 py-1 rounded border border-accent-cyan/20 bg-accent-cyan/5 hover:bg-accent-cyan/15 hover:border-accent-cyan/40 font-mono text-[10px] text-accent-cyan transition-all cursor-pointer"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Prompt Input Form (Aligned vertically) */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border-subtle bg-[#030407] px-5 py-3.5 flex items-center gap-2 select-none h-12"
        >
          <span className="text-accent-cyan font-mono text-xs sm:text-sm shrink-0 select-none font-bold self-center leading-none">
            ORACLE@MULTIVERSE:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-accent-cyan focus:ring-0 p-0 h-full self-center leading-none"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
}
