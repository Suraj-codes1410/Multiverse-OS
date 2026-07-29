'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '@/providers';
import { useReducedMotion } from '@/animations';
import { Ferrofluid } from '@/components/Ferrofluid';
import { LetterGlitch } from '@/components/LetterGlitch';

export function Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { themeName } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Skip canvas for themes that use their own WebGL/canvas renderer
    if (themeName === 'high-contrast' || themeName === 'matrix' || shouldReduceMotion) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    // Define fluid gradient blob model
    interface FluidBlob {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }

    const particlesCount = 45;
    const particles: Particle[] = [];
    const blobs: FluidBlob[] = [];

    if (themeName === 'default') {
      // 4 large soft pastel colored blobs drifting slowly
      blobs.push({ 
        x: width * 0.25, 
        y: height * 0.25, 
        vx: 0.08, 
        vy: 0.05, 
        radius: Math.min(width, height) * 0.55, 
        color: 'rgba(198, 222, 217, 0.45)' 
      });
      blobs.push({ 
        x: width * 0.75, 
        y: height * 0.3, 
        vx: -0.06, 
        vy: 0.07, 
        radius: Math.min(width, height) * 0.6, 
        color: 'rgba(239, 233, 222, 0.45)' 
      });
      blobs.push({ 
        x: width * 0.3, 
        y: height * 0.75, 
        vx: 0.05, 
        vy: -0.08, 
        radius: Math.min(width, height) * 0.5, 
        color: 'rgba(216, 229, 226, 0.5)' 
      });
      blobs.push({ 
        x: width * 0.8, 
        y: height * 0.8, 
        vx: -0.05, 
        vy: -0.05, 
        radius: Math.min(width, height) * 0.52, 
        color: 'rgba(232, 223, 211, 0.45)' 
      });
    } else {
      // Cyberpunk & Dark particles
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

      if (themeName === 'default') {
        // Draw fluid mesh gradient for PastelOS with mouse parallax arpeggiations
        blobs.forEach((b, idx) => {
          b.x += b.vx;
          b.y += b.vy;

          // Mouse parallax shift
          const dx = mouse.x === -1000 ? 0 : mouse.x - (width / 2);
          const dy = mouse.y === -1000 ? 0 : mouse.y - (height / 2);
          const px = dx * (0.015 + idx * 0.01);
          const py = dy * (0.015 + idx * 0.01);

          const renderX = b.x + px;
          const renderY = b.y + py;

          // Bounce off boundary safely
          if (b.x - b.radius < -150 || b.x + b.radius > width + 150) b.vx *= -1;
          if (b.y - b.radius < -150 || b.y + b.radius > height + 150) b.vy *= -1;

          const grad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, b.radius);
          grad.addColorStop(0, b.color);
          grad.addColorStop(1, 'rgba(220, 235, 232, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(renderX, renderY, b.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        const { primary, secondary } = getThemeColors();

        // Draw network grid links for dark theme
        if (themeName === 'dark') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
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
      
      {/* Subdued paper-noise texture overlay for PastelOS */}
      {themeName === 'default' && (
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      )}

      {/* Animated Wallpaper Canvas / WebGL theme renderers */}
      {themeName === 'high-contrast' ? (
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <Ferrofluid
            colors={["#ffffff", "#ffffff", "#ffffff"]}
            speed={0.12}
            scale={1.8}
            turbulence={0.35}
            fluidity={0.15}
            rimWidth={0.18}
            sharpness={2.0}
            shimmer={0.0}
            glow={1.1}
            flowDirection="down"
            opacity={0.18}
            mouseInteraction={true}
            mouseStrength={0.8}
            mouseRadius={0.2}
          />
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
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
      )}
    </div>
  );
}
export default Wallpaper;
