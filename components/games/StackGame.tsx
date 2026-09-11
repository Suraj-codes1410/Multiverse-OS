'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, Trophy, RotateCcw, Play } from 'lucide-react';

const HIGH_SCORE_KEY = 'hs_stack';
const BLOCK_HEIGHT = 26;
const PALETTE = ['#c84b31', '#f0b429', '#40916c', '#5b8af0'];

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isFlash?: boolean;
}

interface Debris {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  vx: number;
  vy: number;
  opacity: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  opacity: number;
  vy: number;
  color: string;
}

export function StackGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>(
    'idle'
  );
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);

  // Mutable Game State Reference for 60fps Loop
  const stateRef = useRef({
    width: 400,
    height: 600,
    gameState: 'idle' as 'idle' | 'playing' | 'gameover',
    score: 0,
    level: 0,
    stack: [] as Block[],
    debris: [] as Debris[],
    floatingTexts: [] as FloatingText[],
    movingBlock: {
      x: 0,
      y: 0,
      width: 180,
      height: BLOCK_HEIGHT,
      color: PALETTE[0],
      vx: 3.5,
      direction: 1,
    },
    cameraY: 0,
    targetCameraY: 0,
    flashUntil: 0,
    textCounter: 0,
  });

  // Load High Score on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        setHighScore(parseInt(stored, 10) || 0);
      }
    }
  }, []);

  const saveHighScore = (newScore: number) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
        }
        return newScore;
      }
      return prev;
    });
  };

  // ResizeObserver for canvas dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);
      if (w > 0 && h > 0) {
        stateRef.current.width = w;
        stateRef.current.height = h;
        if (canvasRef.current) {
          canvasRef.current.width = w;
          canvasRef.current.height = h;
        }
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Initialize and start new game
  const startGame = useCallback(() => {
    const w = stateRef.current.width || 400;
    const h = stateRef.current.height || 600;

    const baseWidth = Math.min(200, Math.floor(w * 0.6));
    const baseX = Math.floor((w - baseWidth) / 2);
    const baseY = h - 120;

    const initialStack: Block[] = [
      {
        x: baseX,
        y: baseY,
        width: baseWidth,
        height: BLOCK_HEIGHT,
        color: PALETTE[0],
      },
    ];

    stateRef.current.stack = initialStack;
    stateRef.current.debris = [];
    stateRef.current.floatingTexts = [];
    stateRef.current.score = 0;
    stateRef.current.level = 1;
    stateRef.current.cameraY = 0;
    stateRef.current.targetCameraY = 0;
    stateRef.current.flashUntil = 0;

    const nextColor = PALETTE[1 % PALETTE.length];
    stateRef.current.movingBlock = {
      x: 0,
      y: baseY - BLOCK_HEIGHT,
      width: baseWidth,
      height: BLOCK_HEIGHT,
      color: nextColor,
      vx: 3.5,
      direction: 1,
    };

    stateRef.current.gameState = 'playing';
    setScore(0);
    setGameState('playing');
  }, []);

  // Action: Drop Block
  const handleDrop = useCallback(() => {
    const state = stateRef.current;
    if (state.gameState !== 'playing') {
      if (state.gameState === 'idle' || state.gameState === 'gameover') {
        startGame();
      }
      return;
    }

    const { movingBlock, stack, level } = state;
    const prevBlock = stack[stack.length - 1];

    const diff = movingBlock.x - prevBlock.x;
    const tolerance = 2.5;

    // 1. PERFECT STACK
    if (Math.abs(diff) <= tolerance) {
      // Snap exactly to previous block
      const placedBlock: Block = {
        x: prevBlock.x,
        y: movingBlock.y,
        width: prevBlock.width,
        height: BLOCK_HEIGHT,
        color: movingBlock.color,
      };
      stack.push(placedBlock);

      state.score += 300; // 100 base + 200 bonus
      setScore(state.score);
      saveHighScore(state.score);

      // Trigger white flash on placed block
      state.flashUntil = Date.now() + 180;

      // Add floating "PERFECT" text
      state.textCounter += 1;
      state.floatingTexts.push({
        id: state.textCounter,
        text: 'PERFECT +200',
        x: state.width / 2,
        y: movingBlock.y - 15,
        opacity: 1,
        vy: -1.2,
        color: '#f0b429',
      });
    }
    // 2. OVERHANG SLICE OR MISS
    else {
      let overlapWidth = 0;
      let placedX = 0;
      let debrisX = 0;
      let debrisWidth = 0;
      let debrisDirection = 1;

      if (diff > 0) {
        // Moving block is to the right
        overlapWidth = prevBlock.width - diff;
        placedX = movingBlock.x;
        debrisX = movingBlock.x + overlapWidth;
        debrisWidth = diff;
        debrisDirection = 1;
      } else {
        // Moving block is to the left
        overlapWidth = movingBlock.width + diff;
        placedX = prevBlock.x;
        debrisX = movingBlock.x;
        debrisWidth = -diff;
        debrisDirection = -1;
      }

      // COLLAPSE / GAME OVER
      if (overlapWidth <= 0) {
        // Entire block falls as debris
        state.debris.push({
          x: movingBlock.x,
          y: movingBlock.y,
          width: movingBlock.width,
          height: BLOCK_HEIGHT,
          color: movingBlock.color,
          vx: movingBlock.direction * 3,
          vy: 0,
          opacity: 1,
        });

        state.gameState = 'gameover';
        setGameState('gameover');
        saveHighScore(state.score);
        return;
      }

      // Successful slice
      const placedBlock: Block = {
        x: placedX,
        y: movingBlock.y,
        width: overlapWidth,
        height: BLOCK_HEIGHT,
        color: movingBlock.color,
      };
      stack.push(placedBlock);

      // Add falling debris piece
      state.debris.push({
        x: debrisX,
        y: movingBlock.y,
        width: debrisWidth,
        height: BLOCK_HEIGHT,
        color: movingBlock.color,
        vx: debrisDirection * 2,
        vy: 0,
        opacity: 1,
      });

      state.score += 100;
      setScore(state.score);
      saveHighScore(state.score);
    }

    // Advance level and prepare next moving block
    const nextLevel = level + 1;
    state.level = nextLevel;

    const nextColor = PALETTE[nextLevel % PALETTE.length];
    const topBlock = stack[stack.length - 1];
    const nextY = topBlock.y - BLOCK_HEIGHT;

    // Adjust camera target to keep the top of the tower visible
    const idealScreenY = state.height * 0.55;
    if (nextY - state.targetCameraY < idealScreenY) {
      state.targetCameraY = nextY - idealScreenY;
    }

    const nextSpeed = Math.min(9.5, 3.5 + nextLevel * 0.16);
    const startFromLeft = nextLevel % 2 === 0;

    state.movingBlock = {
      x: startFromLeft ? 0 : state.width - topBlock.width,
      y: nextY,
      width: topBlock.width,
      height: BLOCK_HEIGHT,
      color: nextColor,
      vx: nextSpeed,
      direction: startFromLeft ? 1 : -1,
    };
  }, [startGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        e.preventDefault();
        handleDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDrop]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      const state = stateRef.current;
      const { width, height } = state;
      const now = Date.now();

      // 1. UPDATE PHYSICS
      // Smooth camera pan
      state.cameraY += (state.targetCameraY - state.cameraY) * 0.1;

      // Update moving block
      if (state.gameState === 'playing') {
        const mb = state.movingBlock;
        mb.x += mb.vx * mb.direction;

        if (mb.x <= 0) {
          mb.x = 0;
          mb.direction = 1;
        } else if (mb.x + mb.width >= width) {
          mb.x = width - mb.width;
          mb.direction = -1;
        }
      }

      // Update falling debris pieces
      for (let i = state.debris.length - 1; i >= 0; i--) {
        const d = state.debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.35; // Gravity
        d.opacity -= 0.025; // Fade out

        if (d.opacity <= 0 || d.y - state.cameraY > height + 100) {
          state.debris.splice(i, 1);
        }
      }

      // Update floating texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy;
        ft.opacity -= 0.02;

        if (ft.opacity <= 0) {
          state.floatingTexts.splice(i, 1);
        }
      }

      // 2. RENDER SCENE
      ctx.clearRect(0, 0, width, height);

      // Deep dark background
      ctx.fillStyle = '#07090f';
      ctx.fillRect(0, 0, width, height);

      // Background subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSpacing = 30;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.save();
      // Apply camera vertical translation
      ctx.translate(0, -state.cameraY);

      // Draw Placed Tower Stack
      for (let i = 0; i < state.stack.length; i++) {
        const b = state.stack[i];
        const isTop = i === state.stack.length - 1;
        const isFlashing = isTop && state.flashUntil > now;

        ctx.fillStyle = isFlashing ? '#ffffff' : b.color;
        ctx.shadowColor = isFlashing ? '#ffffff' : b.color;
        ctx.shadowBlur = isFlashing ? 16 : 6;

        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height - 2, 3);
        ctx.fill();

        // Subtle block highlight top-border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(b.x, b.y, b.width, 2);
      }

      // Draw Active Moving Block
      if (state.gameState === 'playing') {
        const mb = state.movingBlock;
        ctx.fillStyle = mb.color;
        ctx.shadowColor = mb.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.roundRect(mb.x, mb.y, mb.width, mb.height - 2, 3);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(mb.x, mb.y, mb.width, 2);
      }

      // Draw Falling Debris
      for (const d of state.debris) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, d.opacity);
        ctx.fillStyle = d.color;
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.roundRect(d.x, d.y, d.width, d.height - 2, 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Floating "PERFECT" Text
      for (const ft of state.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();

      // Reset shadow blur
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={handleDrop}
      className="w-full h-full relative overflow-hidden bg-[#07090f] select-none cursor-pointer flex flex-col items-center justify-center font-mono"
    >
      {/* Canvas Element */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top HUD Overlay */}
      <div className="absolute top-3 inset-x-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 text-accent-cyan bg-bg-panel/60 backdrop-blur-sm border border-border-subtle/50 px-2.5 py-1 rounded-lg">
          <Layers className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-text-secondary">
            STACK
          </span>
        </div>

        {/* Current Score Top-Center */}
        <div className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-[#f0ece6] drop-shadow-md">
            {score}
          </span>
        </div>

        {/* High Score Top-Right */}
        <div className="flex items-center gap-1.5 bg-bg-panel/60 backdrop-blur-sm border border-border-subtle/50 px-2.5 py-1 rounded-lg">
          <Trophy className="w-3 h-3 text-warning-amber" />
          <span className="text-[10px] text-text-secondary">BEST:</span>
          <span className="text-xs font-bold text-warning-amber">
            {highScore}
          </span>
        </div>
      </div>

      {/* Idle / Start Game Overlay */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 bg-[#07090f]/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in">
          <div className="p-3.5 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan mb-3 shadow-lg">
            <Layers className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="font-bold text-lg md:text-xl text-[#f0ece6] mb-1 tracking-wider">
            STACK TOWER
          </h2>
          <p className="text-xs text-text-secondary mb-5 font-sans max-w-[220px] leading-relaxed">
            Build the tallest tower. Overhanging blocks get sliced off!
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startGame();
            }}
            className="flex items-center gap-2 font-mono text-xs font-bold px-5 py-2.5 rounded-xl bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>TAP TO START</span>
          </button>
          <span className="text-[10px] text-text-secondary/70 mt-3 font-sans">
            Press Spacebar or Tap anywhere to drop
          </span>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-[#07090f]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-in zoom-in-95">
          <h3 className="font-bold text-lg md:text-xl text-red-500 mb-1 tracking-wide">
            TOWER COLLAPSED
          </h3>
          <p className="text-xs text-text-secondary mb-1">Final Score</p>
          <p className="font-bold text-3xl text-accent-cyan mb-4 drop-shadow">
            {score}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startGame();
            }}
            className="flex items-center gap-2 font-mono text-xs font-bold px-5 py-2.5 rounded-xl bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95 mb-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>TAP TO RESTART</span>
          </button>
          <span className="text-[10px] text-text-secondary/70 font-sans">
            or press Spacebar
          </span>
        </div>
      )}
    </div>
  );
}

export default StackGame;
