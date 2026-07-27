'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/providers';
import { useReducedMotion } from '@/animations';

export function Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { themeName } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reset canvas completely if high contrast or reduced motion is active
    if (themeName === 'high-contrast' || shouldReduceMotion) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

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

    // Define particle models
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particlesCount = themeName === 'matrix' ? 80 : 45;
    const particles: Particle[] = [];

    // Matrix characters
    const matrixChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@%&'.split('');
    const matrixStreams: { x: number; y: number; speed: number; chars: string[] }[] = [];
    
    if (themeName === 'matrix') {
      const columns = Math.floor(width / 20);
      for (let i = 0; i < columns; i++) {
        matrixStreams.push({
          x: i * 20,
          y: Math.random() * -height,
          speed: 1.5 + Math.random() * 3,
          chars: Array.from({ length: 15 }, () => matrixChars[Math.floor(Math.random() * matrixChars.length)]),
        });
      }
    } else {
      // Default & Cyberpunk particles
      for (let i = 0; i < particlesCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 1 + Math.random() * 2.5,
          alpha: 0.15 + Math.random() * 0.4,
        });
      }
    }

    // Colors mapping
    const getThemeColors = () => {
      if (themeName === 'cyberpunk') {
        return { primary: '#ff007f', secondary: '#00f2fe' };
      }
      // default / obsidian dark
      return { primary: '#00f2fe', secondary: '#a855f7' };
    };

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (themeName === 'matrix') {
        ctx.font = '14px monospace';
        matrixStreams.forEach((stream) => {
          stream.chars.forEach((char, index) => {
            const charY = stream.y + index * 16;
            if (charY > 0 && charY < height) {
              const alpha = index / stream.chars.length;
              ctx.fillStyle = `rgba(57, 255, 20, ${alpha * 0.8})`;
              ctx.fillText(char, stream.x, charY);
            }
          });
          stream.y += stream.speed;
          if (stream.y > height) {
            stream.y = Math.random() * -200;
            stream.speed = 1.5 + Math.random() * 3;
          }
          if (Math.random() < 0.02) {
            stream.chars.shift();
            stream.chars.push(matrixChars[Math.floor(Math.random() * matrixChars.length)]);
          }
        });
      } else {
        const { primary, secondary } = getThemeColors();

        // Draw network grid links for default theme
        if (themeName === 'default') {
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.15)';
          ctx.lineWidth = 0.5;
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }

        // Draw particles
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;

          // Mouse push
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }

          // Bounds check
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.fillStyle = p.x % 2 === 0 ? primary : secondary;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [themeName, shouldReduceMotion]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-bg-primary">
      {/* Background glow meshes using central CSS properties */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--wallpaper-glow-primary),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--wallpaper-grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--wallpaper-grid-color)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-20" />
      
      {/* Animated Wallpaper Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}
export default Wallpaper;
