'use client';

import React from 'react';
import { useTheme } from '@/providers';
import { useReducedMotion } from '@/animations';
import { LetterGlitch } from '@/components/LetterGlitch';
import { BlackHole } from '@/components/BlackHole';
import { Antigravity } from '@/components/Antigravity';
import { ChromaWaves } from '@/components/ChromaWaves';
import { RisingLines } from '@/components/RisingLines';

export function Wallpaper() {
  const { themeName } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-bg-primary">
      {/* Background glow meshes using central CSS properties */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--wallpaper-glow-primary),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--wallpaper-grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--wallpaper-grid-color)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-20" />

      {/* Subdued paper-noise texture overlay for PastelOS */}
      {themeName === 'default' && (
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Animated Wallpaper Canvas / WebGL theme renderers */}
      {shouldReduceMotion ? (
        <div className="absolute inset-0 bg-bg-primary" />
      ) : themeName === 'high-contrast' ? (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <BlackHole />
        </div>
      ) : themeName === 'matrix' ? (
        <div className="absolute inset-0 w-full h-full">
          <LetterGlitch
            glitchColors={['#003310', '#39ff14', '#00ff66', '#1aff6e']}
            glitchSpeed={60}
            outerVignette={true}
            centerVignette={false}
            smooth={true}
          />
        </div>
      ) : themeName === 'cyberpunk' ? (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <Antigravity
            count={300}
            magnetRadius={10}
            ringRadius={10}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={2}
            lerpSpeed={0.1}
            color="#FF9FFC"
            autoAnimate={false}
            particleVariance={1}
            rotationSpeed={0}
            depthFactor={1}
            pulseSpeed={3}
            particleShape="capsule"
            fieldStrength={10}
          />
        </div>
      ) : themeName === 'dark' ? (
        <div className="absolute inset-0 w-full h-full">
          <RisingLines />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <ChromaWaves />
        </div>
      )}
    </div>
  );
}
export default Wallpaper;
