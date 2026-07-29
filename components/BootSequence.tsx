'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/animations';
import {
  setBootPhase,
  markBootCompleted,
  isReturningVisitor,
  setLandingChoice,
} from '@/lib/bootPhase';

const FULL_MESSAGES = [
  'Initializing Window Manager...',
  'Loading Desktop Environment...',
  'Initializing Oracle Runtime...',
  'Preparing Workspace...',
  'Loading Applications...',
  'Synchronizing Projects...',
  'Loading Recruiter Dashboard...',
  'Initializing AI Services...',
  'Preparing Developer Environment...',
  'Workspace Ready.',
];

const SHORT_MESSAGES = ['Initializing...', 'Workspace Ready.'];

type Phase = 'mounting' | 'logo' | 'progress' | 'messages' | 'reveal' | 'dissolve' | 'done';

export default function BootSequence() {
  const reducedMotion = useReducedMotion();
  const returning = isReturningVisitor();

  const [phase, setPhase] = useState<Phase>('mounting');
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [showChoice, setShowChoice] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animFrame = useRef<number>(0);

  const messages = returning ? SHORT_MESSAGES : FULL_MESSAGES;

  const advance = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
    return id;
  }, []);

  const triggerDissolve = useCallback(() => {
    setPhase('dissolve');
    setBootPhase('reveal');
    advance(() => {
      setPhase('done');
      setBootPhase('done');
      markBootCompleted();
    }, 700);
  }, [advance]);

  const handleSelect = (choice: 'home' | 'terminal') => {
    setLandingChoice(choice);
    triggerDissolve();
  };

  const skip = useCallback(() => {
    if (showChoice || phase === 'dissolve' || phase === 'done') return;
    
    // Clear timelines
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(animFrame.current);

    // Skip directly to prompt selection
    setProgressPct(100);
    setMsgIndex(messages.length - 1);
    setMsgVisible(true);
    setPhase('messages');
    setBootPhase('messages');
    setShowChoice(true);
  }, [showChoice, phase, messages.length]);

  useEffect(() => {
    if (reducedMotion) {
      // By default open windows user landing on reduced motion skip
      setLandingChoice('home');
      setPhase('done');
      setBootPhase('done');
      markBootCompleted();
      return;
    }

    if (returning) {
      advance(() => { setPhase('logo'); setBootPhase('logo'); }, 100);
      advance(() => { setPhase('progress'); setBootPhase('progress'); setProgressPct(20); }, 400);
      advance(() => { setPhase('messages'); setBootPhase('messages'); setMsgVisible(true); }, 600);
      advance(() => {
        setMsgIndex(1);
        setProgressPct(100);
        setShowChoice(true);
      }, 950);
      return cleanup;
    }

    // Full boot sequence
    advance(() => { setPhase('logo'); setBootPhase('logo'); }, 300);
    advance(() => { setPhase('progress'); setBootPhase('progress'); }, 700);
    advance(() => {
      setPhase('messages');
      setBootPhase('messages');
      setMsgVisible(true);
    }, 1000);

    // Messages cycle
    let msgTimer = 1000;
    messages.forEach((_, i) => {
      const MSG_DUR = 400;
      const FADE_DUR = 100;
      if (i === 0) return;
      msgTimer += MSG_DUR;
      advance(() => setMsgVisible(false), msgTimer - FADE_DUR);
      advance(() => {
        setMsgIndex(i);
        setMsgVisible(true);
      }, msgTimer);
    });

    const msgDuration = messages.length * 400;
    const startTime = Date.now();
    const animateProgress = () => {
      const elapsed = Date.now() - (startTime + 1000);
      const raw = Math.min(elapsed / msgDuration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgressPct(Math.round(eased * 95));
      if (raw < 1) animFrame.current = requestAnimationFrame(animateProgress);
    };
    advance(() => { animFrame.current = requestAnimationFrame(animateProgress); }, 1000);

    advance(() => setBootPhase('reveal'), 2500);

    // Show choice dialogue at 3900ms (just before progress completely ends, and snap it to 100%)
    advance(() => {
      setProgressPct(100);
      setShowChoice(true);
    }, 3900);

    return cleanup;

    function cleanup() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      cancelAnimationFrame(animFrame.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up global skip listeners
  useEffect(() => {
    if (phase === 'done' || showChoice) return;
    const handleKey = (e: KeyboardEvent) => skip();
    const handleClick = (e: MouseEvent) => skip();
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [phase, showChoice, skip]);

  if (phase === 'done') return null;

  const isDissolving = phase === 'dissolve';
  const showLogo = phase !== 'mounting';
  const showProgress = phase === 'progress' || phase === 'messages' || phase === 'reveal' || phase === 'dissolve';

  const wallpaperFilter = isDissolving
    ? 'blur(0px) brightness(1) saturate(1)'
    : phase === 'reveal'
    ? 'blur(4px) brightness(0.88) saturate(0.75)'
    : 'blur(20px) brightness(0.72) saturate(0.35)';

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="boot-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
      </svg>

      <div
        role="status"
        aria-label="Multiverse OS starting up"
        aria-live="polite"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDissolving ? 0 : 1,
          transition: isDissolving
            ? 'opacity 700ms cubic-bezier(0.16,1,0.3,1)'
            : 'opacity 500ms cubic-bezier(0.16,1,0.3,1)',
          cursor: 'default',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-primary, #DCEBE8)',
            filter: wallpaperFilter,
            transition: reducedMotion ? 'none' : 'filter 1400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 25% 25%, rgba(198,222,217,0.5) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 55% at 75% 30%, rgba(239,233,222,0.5) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 65% 60% at 30% 75%, rgba(216,229,226,0.45) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            opacity: 0.045,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
        </div>

        <div
          aria-hidden="false"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            opacity: showLogo ? 1 : 0,
            transform: showLogo ? 'translateY(0)' : 'translateY(8px)',
            transition: reducedMotion ? 'none' : 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                fontWeight: 300,
                letterSpacing: '0.18em',
                color: '#111213',
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              MULTIVERSE
              <span style={{
                fontWeight: 600,
                color: 'var(--accent-cyan, #E06A3F)',
                marginLeft: '0.5rem',
              }}>
                // OS
              </span>
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: 'clamp(0.6rem, 1.2vw, 0.75rem)',
                fontWeight: 400,
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#3A3D40',
                margin: '0.6rem 0 0',
              }}
            >
              Personal Operating System
            </p>
          </div>

          <div
            aria-hidden="true"
            style={{
              width: '2.5rem',
              height: '1px',
              background: 'rgba(43, 45, 47, 0.3)',
            }}
          />

          {showChoice ? (
            <div
              className="flex flex-col items-center gap-3 animate-fade-in"
              style={{ pointerEvents: 'auto' }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: '#111213',
                  margin: '0 0 0.5rem 0',
                }}
              >
                Select Landing Environment
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSelect('home')}
                  className="px-5 py-2 border border-accent-cyan/60 rounded-lg text-[#111213] text-xs font-mono tracking-wider uppercase hover:bg-[#E06A3F]/10 hover:border-[#E06A3F] transition-all cursor-pointer pointer-events-auto shadow-sm"
                >
                  Windows User
                </button>
                <button
                  onClick={() => handleSelect('terminal')}
                  className="px-5 py-2 border border-border-bright rounded-lg text-[#111213] text-xs font-mono tracking-wider uppercase hover:bg-border-bright/20 hover:border-text-primary transition-all cursor-pointer pointer-events-auto shadow-sm"
                >
                  Terminal User
                </button>
              </div>
            </div>
          ) : (
            <p
              aria-live="polite"
              aria-atomic="true"
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '0.65rem',
                fontWeight: 400,
                letterSpacing: '0.12em',
                color: '#3A3D40',
                margin: 0,
                height: '1.1em',
                opacity: msgVisible ? 0.95 : 0,
                transition: reducedMotion ? 'none' : 'opacity 180ms ease',
              }}
            >
              {messages[msgIndex]}
            </p>
          )}
        </div>

        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(240px, 40vw)',
            height: '1px',
            background: 'rgba(43, 45, 47, 0.15)',
            borderRadius: '1px',
            overflow: 'hidden',
            opacity: showProgress ? 1 : 0,
            transition: reducedMotion ? 'none' : 'opacity 400ms ease',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--accent-cyan, #E06A3F)',
              borderRadius: '1px',
              transition: reducedMotion ? 'none' : 'width 300ms cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>

        {showProgress && !showChoice && (
          <p
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '0.55rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#5A5D60',
              opacity: 0.5,
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Press any key to skip
          </p>
        )}
      </div>
    </>
  );
}
