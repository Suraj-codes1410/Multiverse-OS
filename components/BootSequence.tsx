'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from '@/animations';
import { Strands } from './Strands';

// Default boot messages configurable array as required
const DEFAULT_BOOT_MESSAGES = [
  'Initializing cognitive OS kernel...',
  'Loading system appearance themes...',
  'Verifying offline resume directories...',
  'Mounting projects explorer metrics...',
  'Grounding Oracle conversational model...',
  'Initializing telemetry helper companion...',
  'OS Startup Nominal.',
];

interface BootSequenceProps {
  messages?: string[];
  durationMs?: number; // Configurable duration (default 3000ms, which is between 2-4 seconds)
}

export default function BootSequence({
  messages = DEFAULT_BOOT_MESSAGES,
  durationMs = 3000,
}: BootSequenceProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const stepDuration = durationMs / messages.length;

  const triggerFadeOut = () => {
    setIsFadingOut(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('multiverse_boot_completed', 'true');
    }
    // Allow animation to complete before unmounting
    setTimeout(() => {
      setIsDismissed(true);
    }, 500);
  };

  useEffect(() => {
    // Accessibility bypass for reduced motion
    if (shouldReduceMotion) {
      setIsDismissed(true);
      return;
    }

    // Check storage on mount
    if (typeof window !== 'undefined') {
      const isCompletedSession = sessionStorage.getItem('multiverse_boot_completed') === 'true';
      if (isCompletedSession) {
        setIsDismissed(true);
        return;
      }
    }

    // Run the boot sequence steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= messages.length - 1) {
          clearInterval(interval);
        }
        return prev + 1;
      });
    }, stepDuration);

    // Skip handler: skip on any keydown or click
    const handleSkip = () => {
      triggerFadeOut();
    };

    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [messages.length, stepDuration, shouldReduceMotion]);

  // Clean side-effect handler when step reaches the end
  useEffect(() => {
    if (currentStep >= messages.length) {
      triggerFadeOut();
    }
  }, [currentStep, messages.length]);



  if (isDismissed || shouldReduceMotion) {
    return null;
  }

  // Calculate remaining seconds
  const remainingSeconds = Math.max(
    0,
    Math.ceil((durationMs - currentStep * stepDuration) / 1000)
  );

  // Calculate percentage
  const progressPercent = Math.min(
    100,
    Math.round((currentStep / messages.length) * 100)
  );

  return (
    <div
      id="boot-overlay"
      suppressHydrationWarning={true}
      className={`fixed inset-0 z-[9999] flex flex-col justify-between p-6 sm:p-12 md:p-16 bg-[#020306] font-mono text-xs sm:text-sm text-accent-cyan transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle organic Strands loader background animation */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <Strands
          colors={['#06B6D4', '#7C3AED', '#06B6D4']}
          count={3}
          speed={0.3}
          amplitude={0.8}
          waviness={0.9}
          thickness={0.5}
          glow={1.8}
          taper={4}
          spread={1.2}
          intensity={0.4}
          saturation={1.2}
          opacity={0.35}
          scale={1.2}
        />
      </div>

      {/* Cyberpunk Scanline / CRT / Ambient Glow overlays */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.06)_0%,transparent_65%)]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px]" />

      {/* Header Info */}
      <div className="relative z-10 w-full max-w-5xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:justify-between border-b border-accent-cyan/20 pb-4 mb-6">
          <div>
            <span className="text-text-primary font-bold tracking-wider">PORTFOLIO.OS // MULTIVERSE</span>{' '}
            <span className="text-accent-purple font-semibold animate-pulse">[ONLINE]</span>
            <div className="text-text-secondary text-[10px] mt-1 font-mono tracking-wider">
              SYSTEM INITIALIZATION PROTOCOL ACTIVED
            </div>
          </div>
          <div className="text-left sm:text-right mt-2 sm:mt-0 text-[10px] text-text-secondary font-mono">
            <div>NODE: MULTIVERSE-NODE-01</div>
            <div>SECTOR: MAIN_WORKSPACE</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] sm:text-xs text-text-secondary/60 font-mono">
          <div>
            <div>&gt; KERNEL: COGNITIVE SYSTEM CORE [v2.2.0]</div>
            <div>&gt; HOST_ADDR: SURAJ-PORTFOLIO-RUNTIME</div>
            <div>&gt; SECURITY: ENCRYPTED SHIELD ACTIVE</div>
          </div>
          <div>
            <div>&gt; GUI: PASTEL WORKSPACE WORKSTATION</div>
            <div>&gt; RENDERING ENGINE: TURBOPACK CLIENT</div>
            <div>&gt; AUDIO_CHIPS: SYNTHESIZED WEB_AUDIO_API</div>
          </div>
        </div>
      </div>

      {/* Terminal Loading Log Container */}
      <div className="relative z-10 flex-grow flex flex-col justify-center max-w-xl mx-auto w-full my-8">
        <div className="border border-accent-cyan/20 rounded bg-bg-panel/40 p-6 backdrop-blur-md shadow-[0_0_24px_rgba(224,106,63,0.03)]">
          <div className="space-y-3 min-h-[160px] flex flex-col justify-center font-mono">
            {messages.map((msg, idx) => {
              let statusPrefix = (
                <span className="text-text-secondary/30">[ WAIT ]</span>
              );
              let textClass = 'text-text-secondary/40';

              if (currentStep > idx) {
                statusPrefix = <span className="text-success-green">[  OK  ]</span>;
                textClass = 'text-text-primary';
              } else if (currentStep === idx) {
                statusPrefix = (
                  <span className="text-accent-cyan animate-pulse">[ LOAD ]</span>
                );
                textClass = 'text-accent-cyan font-bold';
              }

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 transition-all duration-300 ${textClass}`}
                >
                  <span className="font-mono flex-shrink-0">{statusPrefix}</span>
                  <span className="flex-grow font-mono">{msg}</span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between text-[10px] text-text-secondary mb-1 font-mono">
              <span>BOOT_PROGRESS</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-border-subtle h-2 rounded border border-border-subtle overflow-hidden">
              <div
                className="bg-accent-cyan h-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(224,106,63,0.3)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info / Skip Instructions */}
      <div className="relative z-10 text-center pt-4 border-t border-accent-cyan/10 w-full max-w-5xl mx-auto">
        <div className="text-[10px] text-text-secondary/60 animate-pulse tracking-widest uppercase font-mono">
          Press any key or click anywhere to skip boot sequence
        </div>
        <div className="text-[9px] text-text-secondary/40 mt-1 font-mono">
          (SYSTEM WILL AUTOMATICALLY INITIALIZE IN {remainingSeconds}s)
        </div>
      </div>
    </div>
  );
}
