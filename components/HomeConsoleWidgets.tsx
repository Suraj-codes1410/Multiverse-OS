'use client';

import React from 'react';
import { Terminal, Sparkles, ShieldAlert, Cpu } from 'lucide-react';
import { useShell } from './ShellProvider';
import Card from './Card';
import Button from './Button';

export default function HomeConsoleWidgets() {
  const { toggleOracle, toggleCli } = useShell();

  return (
    <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
      {/* Oracle Card */}
      <Card
        hoverable={true}
        className="relative group border border-accent-purple/20 bg-bg-panel/40 p-6 flex flex-col items-start text-left shadow-[0_0_30px_rgba(168,85,247,0.05)] hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:border-accent-purple/50 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer"
        onClick={toggleOracle}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-3xl group-hover:bg-accent-purple/10 transition-all duration-300" />
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-accent-purple/30 bg-accent-purple/5 text-accent-purple font-mono text-[9px] uppercase tracking-wider mb-4">
          <Sparkles className="w-2.5 h-2.5 animate-pulse" />
          AI Intelligence
        </div>

        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-purple transition-colors mb-2">
          Oracle AI Assistant
        </h3>
        
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          Query Suraj's qualifications, compare projects (SAHAI & ORBITAIR), and run recruiter evaluations via local smart routing.
        </p>

        <div className="mt-auto flex items-center justify-between w-full font-mono text-[10px]">
          <span className="text-text-secondary">Shortcut: Alt + O</span>
          <span className="text-accent-purple group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
            Launch Oracle ➔
          </span>
        </div>
      </Card>

      {/* CLI Card */}
      <Card
        hoverable={true}
        className="relative group border border-accent-cyan/20 bg-bg-panel/40 p-6 flex flex-col items-start text-left shadow-[0_0_30px_rgba(0,242,254,0.05)] hover:shadow-[0_0_40px_rgba(0,242,254,0.15)] hover:border-accent-cyan/50 transition-all duration-300 rounded-xl overflow-hidden cursor-pointer"
        onClick={toggleCli}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-3xl group-hover:bg-accent-cyan/10 transition-all duration-300" />
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan font-mono text-[9px] uppercase tracking-wider mb-4">
          <Terminal className="w-2.5 h-2.5" />
          Terminal Shell
        </div>

        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-cyan transition-colors mb-2">
          Interactive CLI Terminal
        </h3>
        
        <p className="text-sm text-text-secondary leading-relaxed mb-6">
          Navigate and query the portfolio using terminal commands. Built for developers and technical recruiters who appreciate the terminal.
        </p>

        <div className="mt-auto flex items-center justify-between w-full font-mono text-[10px]">
          <span className="text-text-secondary">Shortcut: Ctrl + `</span>
          <span className="text-accent-cyan group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
            Open Terminal ➔
          </span>
        </div>
      </Card>
    </div>
  );
}
