'use client';

import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '@/animations';
import { Strands } from './Strands';

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
  durationMs?: number;
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
    setTimeout(() => {
      setIsDismissed(true);
    }, 700);
  };

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsDismissed(true);
      return;
    }

    if (typeof window !== 'undefined') {
      const isCompletedSession = sessionStorage.getItem('multiverse_boot_completed') === 'true';
      if (isCompletedSession) {
        setIsDismissed(true);
        return;
      }
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= messages.length - 1) clearInterval(interval);
        return prev + 1;
      });
    }, stepDuration);

    const handleSkip = () => triggerFadeOut();
    window.addEventListener('keydown', handleSkip);
    window.addEventListener('click', handleSkip);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleSkip);
      window.removeEventListener('click', handleSkip);
    };
  }, [messages.length, stepDuration, shouldReduceMotion]);

  useEffect(() => {
    if (currentStep >= messages.length) triggerFadeOut();
  }, [currentStep, messages.length]);

  if (isDismissed || shouldReduceMotion) return null;

  const progressPercent = Math.min(100, Math.round((currentStep / messages.length) * 100));

  return (
    <div
      id="boot-overlay"
      suppressHydrationWarning={true}
      className={`fixed inset-0 z-[9999] bg-[#030407] transition-opacity duration-700 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Full-screen Strands — Obsidian dark palette: electric cyan + violet + deep blue */}
      <div className="absolute inset-0 z-0">
        <Strands
          colors={['#00f2fe', '#a855f7', '#4F46E5', '#06B6D4']}
          count={4}
          speed={0.2}
          amplitude={1.0}
          waviness={0.8}
          thickness={0.55}
          glow={2.0}
          taper={3}
          spread={1.4}
          intensity={0.55}
          saturation={1.3}
          opacity={0.7}
          scale={1.15}
        />
      </div>

      {/* Deep vignette for depth */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(3,4,7,0.75) 100%)',
        }}
      />

      {/* Centered brand identity */}
      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-5 pointer-events-none">
        {/* Monogram / wordmark */}
        <div
          className="flex flex-col items-center gap-1"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {/* Top label */}
          <p
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(0,242,254,0.55)',
              fontWeight: 500,
              margin: 0,
            }}
          >
            PORTFOLIO
          </p>

          {/* Main title */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#F7F2EB',
              margin: 0,
              lineHeight: 1,
              textShadow: '0 0 40px rgba(224,106,63,0.25)',
            }}
          >
            MULTIVERSE
          </h1>

          {/* Accent word on its own line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2rem',
                height: '1px',
                background: 'rgba(0,242,254,0.35)',
              }}
            />
            <span
              style={{
                fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
                fontWeight: 600,
                letterSpacing: '0.55em',
                textTransform: 'uppercase',
                color: '#00f2fe',
              }}
            >
              OS
            </span>
            <div
              style={{
                width: '2rem',
                height: '1px',
                background: 'rgba(0,242,254,0.35)',
              }}
            />
          </div>
        </div>

        {/* Current boot message */}
        <p
          style={{
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(247,242,235,0.3)',
            fontFamily: 'monospace',
            margin: 0,
            marginTop: '0.5rem',
          }}
        >
          {messages[Math.min(currentStep, messages.length - 1)]}
        </p>
      </div>

      {/* Thin cyan progress line at the bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[3]"
        style={{ height: '2px', background: 'rgba(0,242,254,0.1)' }}
      >
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: '#00f2fe',
            transition: 'width 0.3s ease-out',
            boxShadow: '0 0 16px rgba(0,242,254,0.7)',
          }}
        />
      </div>
    </div>
  );
}
