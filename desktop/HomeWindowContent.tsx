'use client';

import React from 'react';
import { ArrowRight, ShieldAlert, FileText, Mail } from 'lucide-react';
import { getPortfolio } from '@/lib/data';
import Button from '@/components/Button';
import HomeConsoleWidgets from '@/components/HomeConsoleWidgets';

export function HomeWindowContent() {
  const portfolio = getPortfolio();

  return (
    <div className="flex-grow overflow-y-auto px-4 py-8 font-sans select-text scrollbar-thin">
      <div className="max-w-3xl mx-auto text-center">
        {/* Warm Premium OS Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/25 bg-amber-500/5 text-amber-500 text-[10px] font-mono mb-6 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          System Operational // Core Node Online
        </div>

        {/* Developer Name */}
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-text-primary mb-3">
          {portfolio.name}
        </h1>

        {/* Developer Titles */}
        <p className="text-xs sm:text-sm font-mono text-accent-cyan tracking-widest mb-6">
          BACKEND DEVELOPER <span className="text-text-secondary/35">|</span> AI ENGINEER <span className="text-text-secondary/35">|</span> SYSTEMS ARCHITECT
        </p>

        {/* Value Proposition */}
        <h2 className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed mb-8 font-light">
          Architecting high-performance distributed systems, low-latency concurrent APIs, and intelligent multi-agent prompting pipelines.
        </h2>

        {/* Primary CTA Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button href="/recruiter" variant="primary" size="sm" className="w-full sm:w-auto">
            <ShieldAlert className="w-3.5 h-3.5 mr-2" />
            Recruiter Mode
          </Button>
          
          <Button href="/projects" variant="outline" size="sm" className="w-full sm:w-auto">
            View Projects
            <ArrowRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>

        {/* Centerpiece Onboarding Console Widgets for Terminal & Oracle */}
        <HomeConsoleWidgets />

        {/* Secondary Document Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-[10px] font-mono text-text-secondary select-none">
          <a 
            href={portfolio.resume} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> DOWNLOAD_RESUME
          </a>
          <span className="text-border-subtle/40">/</span>
          <a 
            href="/contact" 
            className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> CONTACT_DIRECT
          </a>
        </div>
      </div>
    </div>
  );
}
export default HomeWindowContent;
