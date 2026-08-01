'use client';

import React, { useRef, useEffect } from 'react';

interface GridCell {
  x: number;
  y: number;
  alpha: number;
  targetAlpha: number;
  speed: number;
  color: string;
  size: number;
}

export function BlinkingSquares() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const cells: GridCell[] = [];
    const size = 7; // size of each square
    const gap = 3; // gap between squares
    const cellSize = size + gap; // grid cell step size (10px)

    // Cyberpunk color palette matching the theme: shades of purple, pink, and cyan
    const colors = [
      'rgba(142, 92, 247, 0.9)', // Muted Violet Purple (dominant)
      'rgba(0, 242, 254, 0.9)', // Electric Cyan
      'rgba(255, 0, 127, 0.9)', // Neon Magenta/Pink
      'rgba(99, 102, 241, 0.9)', // Indigo Purple
    ];

    const initGrid = () => {
      cells.length = 0;
      for (let x = cellSize / 2; x < width + cellSize; x += cellSize) {
        // Density Gradient: probability is higher on the right side of the screen, fading off on the left.
        const densityFactor = Math.pow(x / width, 1.85);

        for (let y = cellSize / 2; y < height + cellSize; y += cellSize) {
          // If probability check passes, spawn a cell; otherwise, leave it black/empty
          if (Math.random() < densityFactor) {
            cells.push({
              x,
              y,
              alpha: Math.random() * 0.12,
              targetAlpha:
                Math.random() > 0.94
                  ? 0.35 + Math.random() * 0.5
                  : 0.01 + Math.random() * 0.08,
              speed: 0.005 + Math.random() * 0.012,
              // Cyberpunk colors: purple is highly dominant like the reference image, with rare cyan/pink highlights
              color:
                Math.random() > 0.82
                  ? colors[Math.floor(Math.random() * colors.length)]
                  : colors[0],
              size,
            });
          }
        }
      }
    };

    initGrid();

    const handleResizeGrid = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    window.removeEventListener('resize', handleResizeGrid);
    window.addEventListener('resize', handleResizeGrid);

    const draw = () => {
      // Solid black cyberpunk background matching the reference image
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Render the twinkling squares
      cells.forEach((cell) => {
        // Quietly animate alpha (twinkle)
        cell.alpha += (cell.targetAlpha - cell.alpha) * cell.speed;

        if (Math.abs(cell.alpha - cell.targetAlpha) < 0.01) {
          cell.targetAlpha =
            Math.random() > 0.94
              ? 0.35 + Math.random() * 0.45 // Twinkle bright
              : 0.01 + Math.random() * 0.08; // Twinkle out
          cell.speed = 0.004 + Math.random() * 0.01;
        }

        // Minimal mouse proximity effect: boost opacity slightly as cursor gets closer
        const dx = cell.x - mouse.x;
        const dy = cell.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let renderAlpha = cell.alpha;

        const maxDist = 130;
        if (dist < maxDist) {
          const factor = (maxDist - dist) / maxDist;
          renderAlpha = Math.max(cell.alpha, factor * 0.55); // subtle max highlight
        }

        ctx.fillStyle = cell.color;
        ctx.globalAlpha = renderAlpha;

        // Draw square dot matching the exact shape in reference image
        ctx.fillRect(
          cell.x - cell.size / 2,
          cell.y - cell.size / 2,
          cell.size,
          cell.size
        );
      });

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResizeGrid);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-[#000000] overflow-hidden pointer-events-none w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
export default BlinkingSquares;
