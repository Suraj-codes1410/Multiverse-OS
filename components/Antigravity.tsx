'use client';

import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  angle: number;
  color: string;
  speed: number;
}

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: 'circle' | 'capsule';
  fieldStrength?: number;
}

export function Antigravity({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = '#FF9FFC', // Neon Pink
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = 'capsule',
  fieldStrength = 10,
}: AntigravityProps) {
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
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const particles: Particle[] = [];

    // Muted/cyberpunk alternative colors that blend nicely with the primary pink color
    const secondaryColor = '#00F2FE'; // Neon Cyan

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        // Distribute particles in grid/circles or randomized base positions
        const angle = Math.random() * Math.PI * 2;
        const radius =
          ringRadius * 15 + Math.random() * (Math.min(width, height) * 0.45);

        const baseX = width / 2 + Math.cos(angle) * radius;
        const baseY = height / 2 + Math.sin(angle) * radius;

        particles.push({
          x: baseX + (Math.random() - 0.5) * 100,
          y: baseY + (Math.random() - 0.5) * 100,
          baseX,
          baseY,
          vx: 0,
          vy: 0,
          size: particleSize + (Math.random() - 0.5) * particleVariance,
          alpha: 0.15 + Math.random() * 0.7,
          angle: Math.random() * Math.PI * 2,
          // Blend primary color and secondary cyan color to fit the Cyberpunk theme
          color: Math.random() > 0.4 ? color : secondaryColor,
          speed: 0.01 + Math.random() * 0.03,
        });
      }
    };

    initParticles();

    let time = 0;

    const draw = () => {
      // Solid black background for Cyberpunk theme
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Pulse multiplier for breathing animation
      const pulse = Math.sin(time * pulseSpeed) * 0.25 * waveAmplitude + 0.85;

      particles.forEach((p) => {
        let targetX = p.baseX;
        let targetY = p.baseY;

        // 1. Orbital rotation (if rotationSpeed > 0)
        if (rotationSpeed > 0) {
          const dx = p.baseX - width / 2;
          const dy = p.baseY - height / 2;
          const currentAngle = Math.atan2(dy, dx);
          const currentRadius = Math.sqrt(dx * dx + dy * dy);

          const nextAngle = currentAngle + rotationSpeed * 0.001;
          p.baseX = width / 2 + Math.cos(nextAngle) * currentRadius;
          p.baseY = height / 2 + Math.sin(nextAngle) * currentRadius;
          targetX = p.baseX;
          targetY = p.baseY;
        }

        // 2. Wave displacement
        const wave =
          Math.sin(p.baseX * 0.004 + time * waveSpeed * 10) *
          waveAmplitude *
          20;
        targetY += wave;

        // 3. Magnetic Field Interaction (Magnet attraction/repulsion)
        if (mouse.x !== -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = magnetRadius * 18;
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            // fieldStrength pulls particles toward or pushes away from cursor
            const pull = force * fieldStrength * 1.5;
            targetX += (dx / dist) * pull * 8;
            targetY += (dy / dist) * pull * 8;
          }
        }

        // 4. Auto animation float logic (adds organic ambient drift)
        if (autoAnimate) {
          targetX += Math.sin(time + p.baseY * 0.01) * 15;
          targetY += Math.cos(time + p.baseX * 0.01) * 15;
        }

        // Lerp positions
        p.x += (targetX - p.x) * lerpSpeed;
        p.y += (targetY - p.y) * lerpSpeed;

        // Update angle oriented toward its target velocity/direction
        p.angle = Math.atan2(targetY - p.y, targetX - p.x) + Math.PI / 2;

        ctx.globalAlpha = p.alpha * pulse;

        // Render shapes (Circle or Capsule)
        if (particleShape === 'capsule') {
          const length = p.size * 5 * depthFactor * pulse;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);

          // Draw Capsule pill shape
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, -length / 2);
          ctx.lineTo(0, length / 2);
          ctx.stroke();

          ctx.restore();
        } else {
          // Draw Circle shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [
    count,
    magnetRadius,
    ringRadius,
    waveSpeed,
    waveAmplitude,
    particleSize,
    lerpSpeed,
    color,
    autoAnimate,
    particleVariance,
    rotationSpeed,
    depthFactor,
    pulseSpeed,
    particleShape,
    fieldStrength,
  ]);

  return (
    <div className="absolute inset-0 z-0 bg-[#000000] overflow-hidden pointer-events-none w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
export default Antigravity;
