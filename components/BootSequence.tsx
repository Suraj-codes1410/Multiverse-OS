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
  'Preparing Developer Environment...',
  'Workspace Ready.',
];

const SHORT_MESSAGES = ['Initializing...', 'Workspace Ready.'];

type Phase =
  | 'mounting'
  | 'logo'
  | 'progress'
  | 'messages'
  | 'reveal'
  | 'dissolve'
  | 'done';

export default function BootSequence() {
  const reducedMotion = useReducedMotion();

  const [isMounted, setIsMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('mounting');
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgOpacity, setMsgOpacity] = useState(1);
  const [progressPct, setProgressPct] = useState(0);
  const [showChoice, setShowChoice] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const animFrame = useRef<number>(0);

  const returning = isMounted ? isReturningVisitor() : false;
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

  useEffect(() => {
    setIsMounted(true);

    if (reducedMotion) {
      setLandingChoice('home');
      setPhase('done');
      setBootPhase('done');
      markBootCompleted();
      return;
    }

    if (returning) {
      // Returning Visit: rapid sequence (800ms - 1000ms)
      setPhase('logo');
      setBootPhase('logo');

      // Animate progress smoothly over ~700ms
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
        }
        setProgressPct(currentProgress);
      }, 35);

      // Simple message transition
      advance(() => {
        setMsgOpacity(0);
      }, 350);
      advance(() => {
        setMsgIndex(1); // 'Workspace Ready.'
        setMsgOpacity(1);
      }, 450);

      advance(() => {
        setPhase('reveal');
      }, 750);

      advance(() => {
        setShowChoice(true);
      }, 800);

      return () => {
        clearInterval(interval);
        cleanup();
      };
    } else {
      // First Visit: complete boot sequence (~4000ms)
      setPhase('logo');
      setBootPhase('logo');

      // Animate progress bar from 0 to 100% over ~3600ms
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 1.5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
        }
        setProgressPct(Math.round(currentProgress));
      }, 54);

      // Messages fading loop (each stays for ~400ms)
      const MSG_COUNT = FULL_MESSAGES.length;
      for (let i = 0; i < MSG_COUNT - 1; i++) {
        const timeOffset = 400 * (i + 1);
        advance(() => {
          setMsgOpacity(0);
        }, timeOffset - 80);
        advance(() => {
          setMsgIndex(i + 1);
          setMsgOpacity(1);
        }, timeOffset + 20);
      }

      advance(() => {
        setPhase('reveal');
      }, 3700);

      advance(() => {
        setShowChoice(true);
      }, 3850);

      return () => {
        clearInterval(interval);
        cleanup();
      };
    }

    function cleanup() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      cancelAnimationFrame(animFrame.current);
    }
  }, [reducedMotion, triggerDissolve, advance, returning]);

  if (phase === 'done') return null;

  const isDissolving = phase === 'dissolve';
  const showLogo = phase !== 'mounting';

  // Backdrop filter transitions from blurred/darkened/desaturated to fully sharp/clear
  const getFilterStyles = () => {
    if (reducedMotion) {
      return {
        blur: 0,
        brightness: 100,
        saturation: 100,
        opacity: 0,
      };
    }
    if (phase === 'dissolve') {
      return {
        blur: 0,
        brightness: 100,
        saturation: 100,
        opacity: 0,
      };
    }
    return {
      blur: 10,
      brightness: 75,
      saturation: 85,
      opacity: 0.2, // 20% overlay
    };
  };

  const { blur, brightness, saturation, opacity } = getFilterStyles();

  return (
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
        pointerEvents: isDissolving ? 'none' : 'auto',
      }}
    >
      {/* Backdrop overlay dynamically transforming the desktop wallpaper rendering beneath */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(0, 0, 0, ${opacity})`,
          backdropFilter: `blur(${blur}px) brightness(${brightness}%) saturate(${saturation}%)`,
          WebkitBackdropFilter: `blur(${blur}px) brightness(${brightness}%) saturate(${saturation}%)`,
          transition: reducedMotion
            ? 'none'
            : 'backdrop-filter 1200ms cubic-bezier(0.16,1,0.3,1), background 1200ms cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      {/* Floating subtle texture grain overlay for Nothing OS tactile look */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Centered Editorial Layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '2rem',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '480px',
          opacity: showLogo ? 1 : 0,
          transform: reducedMotion
            ? 'none'
            : showLogo
              ? 'scale(1)'
              : 'scale(0.98)',
          filter: reducedMotion ? 'none' : showLogo ? 'blur(0px)' : 'blur(4px)',
          transition: reducedMotion
            ? 'opacity 800ms ease'
            : 'opacity 1200ms cubic-bezier(0.16,1,0.3,1), transform 1200ms cubic-bezier(0.16,1,0.3,1), filter 1200ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Top Section: Logo & Subtitles */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
              fontWeight: 300,
              letterSpacing: '0.22em',
              color: '#111213',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            MULTIVERSE
            <span
              style={{
                fontWeight: 600,
                color: 'var(--accent-orange, #E06A3F)',
                marginLeft: '0.4rem',
              }}
            >
              {"// OS"}
            </span>
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: 'clamp(0.55rem, 1.1vw, 0.68rem)',
              fontWeight: 400,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#4A4D50',
              margin: '0.5rem 0 0',
            }}
          >
            Personal Operating System
          </p>

          {/* Desktop/PC Recommendation notice immediately below */}
          <div
            style={{
              marginTop: '1.2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              maxWidth: '320px',
              marginRight: 'auto',
              marginLeft: 'auto',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '0.52rem',
                fontWeight: 650,
                letterSpacing: '0.12em',
                color: '#4A4D50',
              }}
            >
              BEST EXPERIENCED ON DESKTOP
            </span>
            <span
              style={{
                fontFamily: 'var(--font-inter), system-ui, sans-serif',
                fontSize: '0.48rem',
                fontWeight: 400,
                letterSpacing: '0.06em',
                color: '#6A6D70',
                lineHeight: 1.25,
              }}
            >
              For the full operating system experience, use a desktop or laptop.
            </span>
          </div>
        </div>

        {/* Middle Section: Divider, Msg, Progress bar OR Editorial Choice Link Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '1.2rem',
            minHeight: '4.5rem',
            justifyContent: 'center',
          }}
        >
          {showChoice ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                opacity: 1,
                transition: 'opacity 300ms ease',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#4A4D50',
                  margin: 0,
                }}
              >
                Select Interface
              </p>
              <div
                style={{ display: 'flex', gap: '1.8rem', marginTop: '0.4rem' }}
              >
                <button
                  onClick={() => handleSelect('home')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '0.62rem',
                    fontWeight: 650,
                    letterSpacing: '0.14em',
                    color: '#111213',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    padding: '0.4rem 0.8rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#111213';
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor =
                      'rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Windows User
                </button>
                <button
                  onClick={() => handleSelect('terminal')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-inter), system-ui, sans-serif',
                    fontSize: '0.62rem',
                    fontWeight: 650,
                    letterSpacing: '0.14em',
                    color: '#111213',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    padding: '0.4rem 0.8rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.15)',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderBottomColor = '#111213';
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderBottomColor =
                      'rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Terminal User
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Thin Editorial Divider */}
              <div
                style={{
                  width: '2.5rem',
                  height: '1px',
                  background: 'rgba(0, 0, 0, 0.08)',
                }}
              />

              {/* Initialization Status Message */}
              <p
                aria-live="polite"
                aria-atomic="true"
                style={{
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                  fontSize: '0.62rem',
                  fontWeight: 400,
                  letterSpacing: '0.1em',
                  color: '#3A3D40',
                  margin: 0,
                  height: '1.1em',
                  opacity: msgOpacity,
                  transition: reducedMotion ? 'none' : 'opacity 180ms ease',
                }}
              >
                {messages[msgIndex]}
              </p>

              {/* Premium Thin Progress Line */}
              <div
                style={{
                  width: '160px',
                  height: '2px',
                  background: 'rgba(0, 0, 0, 0.06)',
                  borderRadius: '1px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: 'var(--accent-orange, #E06A3F)',
                    borderRadius: '1px',
                    transition: 'width 100ms linear',
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Section: Small Editorial System Info */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          fontSize: '0.5rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#5A5D60',
          opacity: 0.55,
          zIndex: 2,
        }}
      >
        <span>Version 2.0</span>
        <span>
          {phase === 'reveal' || phase === 'dissolve'
            ? 'Workspace Ready'
            : 'Boot Sequence Active'}
        </span>
      </div>
    </div>
  );
}
