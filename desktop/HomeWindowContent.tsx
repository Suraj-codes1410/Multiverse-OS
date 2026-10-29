'use client';

import React from 'react';
import { ArrowRight, ShieldAlert, FileText, Mail } from 'lucide-react';
import { getPortfolio } from '@/lib/data';
import Button from '@/components/Button';
import HomeConsoleWidgets from '@/components/HomeConsoleWidgets';

export function HomeWindowContent() {
  const portfolio = getPortfolio();

  return (
    <div className="flex-grow overflow-y-auto px-6 py-10 font-sans select-text scrollbar-thin">
      <div className="max-w-3xl mx-auto text-center">
        {/* Warm Premium OS Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-success-green/25 bg-success-green/10 text-success-green text-xs sm:text-sm font-mono mb-6 uppercase tracking-wider font-medium select-none">
          <span className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
          System Operational // Core Node Online
        </div>

        {/* Developer Name */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary mb-4">
          {portfolio.name}
        </h1>

        {/* Developer Titles */}
        <p className="text-sm sm:text-base font-mono font-medium text-accent-cyan tracking-widest mb-6">
          BACKEND DEVELOPER <span className="text-text-secondary/40">|</span> AI
          ENGINEER <span className="text-text-secondary/40">|</span> SYSTEMS
          ARCHITECT
        </p>

        {/* Value Proposition */}
        <h2 className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          Architecting high-performance distributed systems, low-latency
          concurrent APIs, and intelligent multi-agent prompting pipelines.
        </h2>

        {/* Primary CTA Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            href="/recruiter"
            variant="primary"
            size="md"
            className="w-full sm:w-auto"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Recruiter Mode
          </Button>

          <Button
            href="/projects"
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
          >
            View Projects
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Centerpiece Onboarding Console Widgets for Terminal & Oracle */}
        <HomeConsoleWidgets />

        {/* Secondary Document Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs sm:text-sm font-mono font-medium text-text-secondary select-none">
          <a
            href={portfolio.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-accent-cyan transition-colors"
          >
            <FileText className="w-4 h-4" /> DOWNLOAD_RESUME
          </a>
          <span className="text-border-subtle/50">/</span>
          <a
            href="/contact"
            className="flex items-center gap-2 hover:text-accent-cyan transition-colors"
          >
            <Mail className="w-4 h-4" /> CONTACT_DIRECT
          </a>
        </div>
      </div>
    </div>
  );
}
export default HomeWindowContent;
