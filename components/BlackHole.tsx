'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hueOffset: number;
}

export function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const maxParticles = 200;

    // Gravitational center (singularity)
    const center = { x: width / 2, y: height / 2 };
    const G = 0.15; // Gravity constant
    const M = 2500; // Mass of black hole
    const coreRadius = 40; // Event horizon radius

    // Track mouse to shift singularity slightly (subtle interactive gravity)
    const targetCenter = { x: width / 2, y: height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      targetCenter.x = e.clientX;
      targetCenter.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Helper to spawn a particle at a random distance
    const spawnParticle = (p?: Particle): Particle => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.max(width, height) * (0.4 + Math.random() * 0.6);

      const x = center.x + Math.cos(angle) * distance;
      const y = center.y + Math.sin(angle) * distance;

      // Calculate perpendicular tangent velocity for orbital motion
      const tangentX = -Math.sin(angle);
      const tangentY = Math.cos(angle);
      const orbitalSpeed = 1.2 + Math.random() * 2.0;

      return {
        x,
        y,
        vx: tangentX * orbitalSpeed + (Math.random() - 0.5) * 0.5,
        vy: tangentY * orbitalSpeed + (Math.random() - 0.5) * 0.5,
        size: 0.8 + Math.random() * 1.8,
        alpha: 0.1 + Math.random() * 0.8,
        hueOffset: Math.random() * 60, // slight hue variations
      };
    };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(spawnParticle());
      // distribute them at different initial orbital stages
      const p = particles[i];
      const randDist = 50 + Math.random() * (Math.min(width, height) * 0.5);
      const angle = Math.random() * Math.PI * 2;
      p.x = center.x + Math.cos(angle) * randDist;
      p.y = center.y + Math.sin(angle) * randDist;
    }

    let globalHue = 0;

    const draw = () => {
      // Create a trailing trail effect (event horizon accretion disk)
      ctx.fillStyle = 'rgba(3, 4, 7, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Smoothly drift target center toward mouse
      center.x += (targetCenter.x - center.x) * 0.05;
      center.y += (targetCenter.y - center.y) * 0.05;

      globalHue = (globalHue + 0.15) % 360;

      // Draw gravity field lines (subtle grid warp)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 0.5;
      const step = 80;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 20) {
          const dx = center.x - x;
          const dy = center.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const warpForce = Math.min(60, 4000 / (dist + 50));
          const warpX = x - (dx / dist) * warpForce;
          const warpY = y - (dy / dist) * warpForce;
          if (y === 0) ctx.moveTo(warpX, warpY);
          else ctx.lineTo(warpX, warpY);
        }
        ctx.stroke();
      }

      // Draw core event horizon (the actual black hole)
      ctx.shadowBlur = 40;
      ctx.shadowColor = `hsla(${(globalHue + 180) % 360}, 85%, 60%, 0.35)`;

      const coreGrad = ctx.createRadialGradient(
        center.x,
        center.y,
        0,
        center.x,
        center.y,
        coreRadius * 1.5
      );
      coreGrad.addColorStop(0, '#000000');
      coreGrad.addColorStop(0.65, '#050508');
      coreGrad.addColorStop(0.85, 'rgba(10, 10, 15, 0.9)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(center.x, center.y, coreRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow mapping for performance
      ctx.shadowBlur = 0;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Vector to black hole core
        const dx = center.x - p.x;
        const dy = center.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < coreRadius) {
          // Swallow particle and respawn it at the boundary
          particles[i] = spawnParticle();
          continue;
        }

        // Apply gravitational pull (acceleration towards core)
        const force = (G * M) / (dist * dist + 1000);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;

        // Apply slight drag to prevent infinite acceleration
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Color cycling: shift colors as particles get closer to the core (blue-shifted/violet accretion)
        const localHue = (globalHue + p.hueOffset + 5000 / (dist + 50)) % 360;
        ctx.fillStyle = `hsla(${localHue}, 80%, 65%, ${p.alpha})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#030407] overflow-hidden pointer-events-none w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
export default BlackHole;
