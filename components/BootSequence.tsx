'use client';

/**
 * BootSequence — Multiverse OS Phase 6.5
 *
 * An authentic OS startup experience that reveals the desktop rather than
 * loading a separate screen. The wallpaper is already rendered underneath;
 * this overlay blurs/darkens it initially and gradually lifts those filters
 * as the boot progresses so the desktop naturally materialises.
 *
 * Design language: PastelOS — warm cream, terracotta, editorial typography.
 * NOT cyberpunk, NOT neon, NOT cinematic.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useReducedMotion } from '@/animations';
import {
  setBootPhase,
  markBootCompleted,
  isReturningVisitor,
} from '@/lib/bootPhase';

// ─────────────────────────────────────────────────────────────────
// Messages
// ─────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type Phase = 'mounting' | 'logo' | 'progress' | 'messages' | 'reveal' | 'dissolve' | 'done';

// ─────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────

function useBootTimeline(
  reducedMotion: boolean,
  returning: boolean
): {
  phase: Phase;
  msgIndex: number;
  msgVisible: boolean;
  progressPct: number;
  skip: () => void;
} {
  const [phase, setPhase] = useState<Phase>('mounting');
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
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

  useEffect(() => {
    // Skip immediately for reduced-motion users
    if (reducedMotion) {
      setPhase('done');
      setBootPhase('done');
      markBootCompleted();
      return;
    }

    // ── Shortened path for returning visitors ──────────────────
    if (returning) {
      advance(() => { setPhase('logo'); setBootPhase('logo'); }, 100);
      advance(() => { setPhase('progress'); setBootPhase('progress'); setProgressPct(20); }, 400);
      advance(() => { setPhase('messages'); setBootPhase('messages'); setMsgVisible(true); }, 600);
      advance(() => { setMsgIndex(1); setProgressPct(100); }, 900);
      advance(triggerDissolve, 1200);
      return cleanup;
    }

    // ── Full boot sequence ─────────────────────────────────────
    // 0.0 – mounting (wallpaper already blurred underneath)
    // 0.3 – logo fades in
    advance(() => { setPhase('logo'); setBootPhase('logo'); }, 300);

    // 0.7 – progress line appears
    advance(() => { setPhase('progress'); setBootPhase('progress'); }, 700);

    // 1.0 – first message
    advance(() => {
      setPhase('messages');
      setBootPhase('messages');
      setMsgVisible(true);
    }, 1000);

    // Cycle messages at ~400ms each with a 100ms crossfade
    let msgTimer = 1000;
    messages.forEach((_, i) => {
      const MSG_DUR = 400;
      const FADE_DUR = 100;

      if (i === 0) return; // already set above
      msgTimer += MSG_DUR;

      // Fade out current
      advance(() => setMsgVisible(false), msgTimer - FADE_DUR);
      // Swap + fade in
      advance(() => {
        setMsgIndex(i);
        setMsgVisible(true);
      }, msgTimer);
    });

    // Animate progress bar over the message duration
    const msgDuration = messages.length * 400;
    const startTime = Date.now();

    const animateProgress = () => {
      const elapsed = Date.now() - (startTime + 1000);
      const raw = Math.min(elapsed / msgDuration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgressPct(Math.round(eased * 90)); // cap at 90 until reveal
      if (raw < 1) animFrame.current = requestAnimationFrame(animateProgress);
    };
    advance(() => { animFrame.current = requestAnimationFrame(animateProgress); }, 1000);

    // 2.5 – trigger desktop reveal (MenuBar, Dock, Widgets, Robot start animating)
    advance(() => setBootPhase('reveal'), 2500);

    // 3.8 – progress snaps to 100%
    advance(() => setProgressPct(100), 3800);

    // 4.2 – overlay dissolves
    advance(triggerDissolve, 4200);

    return cleanup;

    function cleanup() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      cancelAnimationFrame(animFrame.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(animFrame.current);
    setProgressPct(100);
    triggerDissolve();
  }, [triggerDissolve]);

  return { phase, msgIndex, msgVisible, progressPct, skip };
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export default function BootSequence() {
  const reducedMotion = useReducedMotion();
  const returning = isReturningVisitor();

  const { phase, msgIndex, msgVisible, progressPct, skip } = useBootTimeline(
    reducedMotion,
    returning
  );

  // Skip on any key / click
  useEffect(() => {
    if (phase === 'done') return;
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
    };
  }, [phase, skip]);

  if (phase === 'done') return null;

  const messages = returning ? SHORT_MESSAGES : FULL_MESSAGES;
  const isDissolving = phase === 'dissolve';
  const showLogo = phase !== 'mounting';
  const showProgress = phase === 'progress' || phase === 'messages' || phase === 'reveal' || phase === 'dissolve';

  // Wallpaper filter — gradually reveals during 'reveal' phase
  const wallpaperFilter = isDissolving
    ? 'blur(0px) brightness(1) saturate(1)'
    : phase === 'reveal'
    ? 'blur(4px) brightness(0.88) saturate(0.75)'
    : 'blur(20px) brightness(0.72) saturate(0.35)';

  return (
    <>
      {/*
       * Paper grain SVG texture for wallpaper overlay.
       * Defined once, referenced by CSS in the overlay.
       */}
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
        onClick={skip}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // Transition mirrors the wallpaper shift
          opacity: isDissolving ? 0 : 1,
          transition: isDissolving
            ? 'opacity 700ms cubic-bezier(0.16,1,0.3,1)'
            : 'opacity 500ms cubic-bezier(0.16,1,0.3,1)',
          cursor: 'default',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        {/* ── Wallpaper layer ─────────────────────────────────── */}
        {/*
         * We reproduce the desktop background (bg-bg-primary = #DCEBE8 for
         * the default PastelOS theme). A CSS filter blurs / desaturates it
         * during boot and gradually lifts. The real wallpaper underneath
         * naturally becomes the desktop wallpaper.
         */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--bg-primary, #DCEBE8)',
            filter: wallpaperFilter,
            transition: reducedMotion
              ? 'none'
              : 'filter 1400ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Soft radial mesh — mirrors Wallpaper.tsx default blobs */}
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

          {/* Paper grain texture overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            opacity: 0.045,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* ── Center content ──────────────────────────────────── */}
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
            transition: reducedMotion
              ? 'none'
              : 'opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* ── Logo ─────────────────────────────────────────── */}
          <div style={{ textAlign: 'center' }}>
            {/* Primary wordmark */}
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

            {/* Subtitle */}
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

          {/* ── Thin divider ─────────────────────────────────── */}
          <div
            aria-hidden="true"
            style={{
              width: '2.5rem',
              height: '1px',
              background: 'rgba(43, 45, 47, 0.3)',
            }}
          />

          {/* ── Initialization message ───────────────────────── */}
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
        </div>

        {/* ── Progress line ───────────────────────────────────── */}
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
              transition: reducedMotion
                ? 'none'
                : 'width 300ms cubic-bezier(0.16,1,0.3,1)',
            }}
          />
        </div>

        {/* ── Skip hint ───────────────────────────────────────── */}
        {showProgress && (
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
