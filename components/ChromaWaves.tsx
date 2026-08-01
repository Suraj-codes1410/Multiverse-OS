'use client';

import React, { useRef, useEffect } from 'react';

export function ChromaWaves() {
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

    // Track mouse to gently skew the wave flow (subtle interactive breeze)
    const mouse = { x: width / 2, y: height / 2 };
    let flowX = width / 2;
    let flowY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;

    // PastelOS theme colors
    const colors = [
      '#c6ded9', // Sage Green
      '#efe9de', // Warm Cream
      '#d8e5e2', // Soft Blue-Green
      '#e8dfd3', // Warm Sand
      '#faf8f5', // Clean Paper White
    ];

    const draw = () => {
      // Clear with base PastelOS light theme color
      ctx.fillStyle = '#DCEBE8';
      ctx.fillRect(0, 0, width, height);

      time += 0.0028;

      // Lerp flow center
      flowX += (mouse.x - flowX) * 0.02;
      flowY += (mouse.y - flowY) * 0.02;

      // Draw 5 thick overlapping wavy ribbons that blend together under the blur filter
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = Math.min(width, height) * (0.35 + i * 0.08);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        // Wave path calculation across the screen
        const startX = -100;
        const startY =
          height * (0.2 + i * 0.15) + Math.sin(time + i * 1.5) * 80;
        ctx.moveTo(startX, startY);

        const steps = 4;
        for (let j = 1; j <= steps; j++) {
          const x = (width / steps) * j + 50;

          // Add sine wave oscillation and mouse drag offset
          const waveOffsetY =
            Math.sin(time * 1.2 + j * 0.8 + i) * 110 * Math.cos(time * 0.6 + i);
          const mouseOffsetY =
            (flowY - height / 2) * (0.12 + i * 0.04) * Math.sin(j * 0.5);

          const y = height * (0.2 + i * 0.15) + waveOffsetY + mouseOffsetY;

          // Control points for smooth bezier curves
          const cpX = (width / steps) * (j - 0.5) + (flowX - width / 2) * 0.05;
          const cpY =
            height * (0.2 + i * 0.15) +
            Math.sin(time * 1.2 + (j - 0.5) * 0.8 + i) *
              110 *
              Math.cos(time * 0.6 + i) +
            mouseOffsetY;

          ctx.quadraticCurveTo(cpX, cpY, x, y);
        }

        ctx.stroke();
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
    <div className="absolute inset-0 z-0 bg-[#DCEBE8] overflow-hidden pointer-events-none w-full h-full">
      {/* Heavy CSS blur blends the drawn ribbons into gorgeous silk waves */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'blur(85px) saturate(1.15) contrast(1.05)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Tactile paper noise texture overlay matching the reference image's grain */}
      <div
        className="absolute inset-0 opacity-[0.045] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
export default ChromaWaves;
