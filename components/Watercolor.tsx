'use client';

import React, { useRef, useEffect } from 'react';

interface FluidBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export function Watercolor() {
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

    const mouse = { x: width / 2, y: height / 2 };

    // Smooth cursor-following glow coordinate trackers
    let glowX = width / 2;
    let glowY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const blobs: FluidBlob[] = [];

    // Restore the EXACT original PastelOS color scheme palette
    const colors = [
      'rgba(198, 222, 217, 0.42)', // Original Sage Green
      'rgba(239, 233, 222, 0.42)', // Original Warm Beige
      'rgba(216, 229, 226, 0.45)', // Original Soft Blue-Green
      'rgba(232, 223, 211, 0.42)', // Original Warm Sand
    ];

    // Initialize the 4 large original drifting blobs
    blobs.push({
      x: width * 0.25,
      y: height * 0.25,
      vx: 0.06,
      vy: 0.04,
      radius: Math.min(width, height) * 0.55,
      color: colors[0],
    });
    blobs.push({
      x: width * 0.75,
      y: height * 0.3,
      vx: -0.05,
      vy: 0.05,
      radius: Math.min(width, height) * 0.6,
      color: colors[1],
    });
    blobs.push({
      x: width * 0.3,
      y: height * 0.75,
      vx: 0.04,
      vy: -0.06,
      radius: Math.min(width, height) * 0.5,
      color: colors[2],
    });
    blobs.push({
      x: width * 0.8,
      y: height * 0.8,
      vx: -0.04,
      vy: -0.04,
      radius: Math.min(width, height) * 0.52,
      color: colors[3],
    });

    let time = 0;

    const draw = () => {
      // Base background - exact matching PastelOS light sage background
      ctx.fillStyle = '#DCEBE8';
      ctx.fillRect(0, 0, width, height);

      time += 0.0035;

      // 1. Draw large background watercolor washes (drifting + cursor parallax shift)
      blobs.forEach((b, idx) => {
        b.x += b.vx;
        b.y += b.vy;

        // Subtle mouse parallax shift
        const dx = mouse.x - width / 2;
        const dy = mouse.y - height / 2;
        const px = dx * (0.015 + idx * 0.008);
        const py = dy * (0.015 + idx * 0.008);

        const renderX = b.x + px;
        const renderY = b.y + py;

        // Bounce off boundary safely
        if (b.x - b.radius < -180 || b.x + b.radius > width + 180) b.vx *= -1;
        if (b.y - b.radius < -180 || b.y + b.radius > height + 180) b.vy *= -1;

        const grad = ctx.createRadialGradient(
          renderX,
          renderY,
          0,
          renderX,
          renderY,
          b.radius
        );
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'rgba(220, 235, 232, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();

        // Very subtle morphing wave function to make the shapes organic (like paint bleeding)
        const numPoints = 8;
        for (let j = 0; j < numPoints; j++) {
          const angle = (j / numPoints) * Math.PI * 2;
          const waveOffset =
            Math.sin(time + j * 1.5) * 15 * Math.cos(time * 0.4 + j * 0.9);
          const r = b.radius + waveOffset;
          const pxCoord = renderX + Math.cos(angle) * r;
          const pyCoord = renderY + Math.sin(angle) * r;
          if (j === 0) ctx.moveTo(pxCoord, pyCoord);
          else ctx.lineTo(pxCoord, pyCoord);
        }

        ctx.closePath();
        ctx.fill();
      });

      // 2. Draw a very soft, minimal, pure white cursor ambient glow (no color clash)
      glowX += (mouse.x - glowX) * 0.035;
      glowY += (mouse.y - glowY) * 0.035;

      const cursorRadius = 280;
      const cursorGrad = ctx.createRadialGradient(
        glowX,
        glowY,
        0,
        glowX,
        glowY,
        cursorRadius
      );
      cursorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      cursorGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
      cursorGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = cursorGrad;
      ctx.beginPath();
      ctx.arc(glowX, glowY, cursorRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Faint paper texture overlay (tactile feeling)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.008)';
      const grainDensity = 1200;
      for (let i = 0; i < grainDensity; i++) {
        const gx = Math.random() * width;
        const gy = Math.random() * height;
        ctx.fillRect(gx, gy, 1, 1);
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
export default Watercolor;
