'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { commandHandler } from '@/lib/commands';

interface HistoryLine {
  type: 'input' | 'output';
  text: string;
}

interface CliTerminalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CliTerminal({ isOpen, onClose }: CliTerminalProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<HistoryLine[]>([
    { type: 'output', text: 'Multiverse OS [Version 2.1.0-GENESIS]' },
    { type: 'output', text: 'Establishing telemetry links... [OK]' },
    { type: 'output', text: 'Secure Enclave: Connected via quantum tunnel.' },
    { type: 'output', text: 'Type commands below to view them in session history.' },
    { type: 'output', text: '--------------------------------------------------' },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus the input when terminal opens or when the body is clicked
  useEffect(() => {
    if (isOpen) {
      // Small timeout to ensure overlay is rendered before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom when history changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Handle escape key to close terminal (as localized handler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputValue.trim();
    if (!command) return;

    // Append command to history
    setHistory((prev) => [
      ...prev,
      { type: 'input', text: command },
    ]);

    setInputValue('');

    try {
      const result = await commandHandler.handle(command, {
        clearTerminal: () => {
          setHistory([]);
        },
        navigate: (path: string) => {
          router.push(path);
          onClose();
        }
      });

      const output = result.output;
      if (output) {
        if (Array.isArray(output)) {
          setHistory((prev) => [
            ...prev,
            ...output.map((text: string) => ({ type: 'output' as const, text })),
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { type: 'output', text: output },
          ]);
        }
      }
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { type: 'output', text: `SYSTEM ERROR: ${err instanceof Error ? err.message : String(err)}` },
      ]);
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Focus input if user clicks inside terminal content area
    if (e.target !== inputRef.current) {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="absolute inset-0 bg-[#030407]/75 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-0 sm:p-4 md:p-6 z-[9990]">
      {/* Terminal Window */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="w-full h-full sm:h-[80vh] sm:max-w-4xl sm:rounded-lg border-y sm:border border-accent-cyan/20 bg-bg-panel/95 flex flex-col shadow-[0_0_40px_rgba(0,242,254,0.1)] overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-primary/80 select-none">
          {/* OS Windows Dots (Mac style) */}
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

        {/* Scrollable Output Logs */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-2.5 font-mono text-xs sm:text-sm text-text-primary scrollbar-thin select-text">
          {history.map((line, idx) => {
            if (line.type === 'input') {
              return (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-accent-cyan select-none">ORACLE@MULTIVERSE:~$</span>
                  <span className="text-text-primary font-bold break-all">{line.text}</span>
                </div>
              );
            } else {
              return (
                <div key={idx} className="text-text-secondary leading-relaxed break-all pl-1 border-l border-accent-cyan/10">
                  {line.text}
                </div>
              );
            }
          })}
          <div ref={bottomRef} />
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border-subtle bg-bg-primary/50 px-4 py-3 flex items-center gap-2 select-none"
        >
          <span className="text-accent-cyan font-mono text-xs sm:text-sm shrink-0">
            ORACLE@MULTIVERSE:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-accent-cyan focus:ring-0 p-0"
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
