'use client';

import React, { useRef, useEffect } from 'react';

interface LaserLine {
  x: number;
  y: number;
  length: number;
  width: number;
  speed: number;
  alpha: number;
  color: string;
  glow: boolean;
}

interface Spark {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  color: string;
}

export function RisingLines() {
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

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const lines: LaserLine[] = [];
    const sparks: Spark[] = [];
    const maxLines = 45;
    const maxSparks = 80;

    const colors = [
      'rgba(99, 102, 241, 1)', // indigo
      'rgba(168, 85, 247, 1)', // purple
      'rgba(0, 242, 254, 1)', // cyan/neon blue
    ];

    // Helper to spawn a single line
    const spawnLine = (xPos?: number, bottom = true): LaserLine => {
      const isLaser = Math.random() > 0.85;
      return {
        x: xPos !== undefined ? xPos : Math.random() * width,
        y: bottom ? height + 10 + Math.random() * 100 : Math.random() * height,
        length: isLaser ? 80 + Math.random() * 150 : 25 + Math.random() * 55,
        width: isLaser ? 1.5 + Math.random() * 1.5 : 0.4 + Math.random() * 0.6,
        speed: isLaser ? 2.5 + Math.random() * 3.5 : 0.6 + Math.random() * 1.2,
        alpha: isLaser
          ? 0.45 + Math.random() * 0.4
          : 0.08 + Math.random() * 0.22,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: isLaser,
      };
    };

    // Helper to spawn a particle spark
    const spawnSpark = (line?: LaserLine): Spark => {
      return {
        x: line ? line.x + (Math.random() - 0.5) * 8 : Math.random() * width,
        y: line ? line.y + line.length : height + Math.random() * 50,
        size: 0.6 + Math.random() * 1.6,
        speedY: -(0.5 + Math.random() * 1.2),
        speedX: (Math.random() - 0.5) * 0.3,
        alpha: 0.15 + Math.random() * 0.6,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    // Populate initial lines and sparks
    for (let i = 0; i < maxLines; i++) {
      lines.push(spawnLine(undefined, false));
    }
    for (let i = 0; i < maxSparks; i++) {
      sparks.push(spawnSpark());
      sparks[i].y = Math.random() * height;
    }

    const draw = () => {
      // Deep obsidian space color
      ctx.fillStyle = '#06070a';
      ctx.fillRect(0, 0, width, height);

      // Draw background vertical scanlines (grid structure)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.003)';
      ctx.lineWidth = 0.5;
      const scanlineStep = 60;
      ctx.beginPath();
      for (let x = 0; x < width; x += scanlineStep) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      // Mouse interactive laser trigger
      if (
        mouse.x !== -1000 &&
        Math.random() > 0.94 &&
        lines.length < maxLines + 10
      ) {
        // Spawn a temporary laser line under the mouse cursor!
        lines.push(spawnLine(mouse.x + (Math.random() - 0.5) * 60, true));
      }

      // Render lines
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        l.y -= l.speed;

        // Interaction: mouse deflection shift
        if (
          mouse.x !== -1000 &&
          Math.abs(l.x - mouse.x) < 80 &&
          l.y < mouse.y + 100 &&
          l.y + l.length > mouse.y - 100
        ) {
          const shift = (l.x - mouse.x) * 0.06;
          l.x += shift;
        }

        // Draw line
        if (l.glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = l.color;
        }

        ctx.strokeStyle = l.color;
        ctx.globalAlpha = l.alpha;
        ctx.lineWidth = l.width;

        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.length);
        ctx.stroke();

        if (l.glow) {
          ctx.shadowBlur = 0; // reset shadow glow
        }

        // Respawn if moved past screen top
        if (l.y + l.length < -10) {
          if (lines.length > maxLines) {
            // remove temporary interactive lines
            lines.splice(i, 1);
            i--;
          } else {
            lines[i] = spawnLine();
          }
        }
      }

      // Render sparks
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.y += s.speedY;
        s.x += s.speedX;

        // Mouse displacement
        if (mouse.x !== -1000) {
          const dx = s.x - mouse.x;
          const dy = s.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const push = (100 - dist) * 0.015;
            s.x += (dx / dist) * push;
            s.y += (dy / dist) * push * 0.5; // push up faster
          }
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Respawn spark if moved past screen top
        if (s.y < -10) {
          sparks[i] = spawnSpark();
        }
      }

      ctx.globalAlpha = 1.0;
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
    <div className="absolute inset-0 z-0 bg-[#06070a] overflow-hidden pointer-events-none w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
export default RisingLines;
