'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Grid,
  Trophy,
  RotateCcw,
  Play,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  ArrowDownToLine,
} from 'lucide-react';

const HIGH_SCORE_KEY = 'hs_neon-tetris';
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;
const CANVAS_WIDTH = COLS * BLOCK_SIZE; // 200px
const CANVAS_HEIGHT = ROWS * BLOCK_SIZE; // 400px

const TETROMINOES: Record<string, { shape: number[][]; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f2fe' },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: '#3b82f6',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: '#f97316',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#eab308',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: '#22c55e',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: '#a855f7',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: '#ef4444',
  },
};

const TETROMINO_KEYS = Object.keys(TETROMINOES);

function createEmptyGrid(): string[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(''));
}

function getRandomPiece() {
  const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  const proto = TETROMINOES[key];
  return {
    shape: proto.shape.map((row) => [...row]),
    color: proto.color,
    x: Math.floor((COLS - proto.shape[0].length) / 2),
    y: 0,
  };
}

function checkCollision(
  grid: string[][],
  shape: number[][],
  offsetX: number,
  offsetY: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const newX = offsetX + c;
        const newY = offsetY + r;

        if (newX < 0 || newX >= COLS || newY >= ROWS) {
          return true;
        }
        if (newY >= 0 && grid[newY][newX] !== '') {
          return true;
        }
      }
    }
  }
  return false;
}

function rotateMatrix(matrix: number[][]): number[][] {
  return matrix[0].map((_, colIdx) =>
    matrix.map((row) => row[colIdx]).reverse()
  );
}

export function NeonTetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>(
    'idle'
  );

  // Game internal state ref
  const stateRef = useRef({
    grid: createEmptyGrid(),
    currentPiece: getRandomPiece(),
    score: 0,
    lines: 0,
    level: 1,
    dropInterval: 700,
    lastDropTime: 0,
    isRunning: false,
  });

  // Load high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem(HIGH_SCORE_KEY) ||
        localStorage.getItem('hs_tetris');
      if (stored) {
        setHighScore(parseInt(stored, 10) || 0);
      }
    }
  }, []);

  const saveHighScore = (currentScore: number) => {
    setHighScore((prev) => {
      if (currentScore > prev) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
          localStorage.setItem('hs_tetris', currentScore.toString());
        }
        return currentScore;
      }
      return prev;
    });
  };

  const spawnNewPiece = () => {
    const piece = getRandomPiece();
    stateRef.current.currentPiece = piece;

    if (checkCollision(stateRef.current.grid, piece.shape, piece.x, piece.y)) {
      stateRef.current.isRunning = false;
      setGameState('gameover');
    }
  };

  const lockPieceAndClear = () => {
    const state = stateRef.current;
    const { shape, color, x, y } = state.currentPiece;
    const newGrid = state.grid.map((row) => [...row]);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (
          shape[r][c] !== 0 &&
          y + r >= 0 &&
          y + r < ROWS &&
          x + c >= 0 &&
          x + c < COLS
        ) {
          newGrid[y + r][x + c] = color;
        }
      }
    }

    // Check line clears
    let cleared = 0;
    const remainingRows = newGrid.filter((row) => {
      const isFull = row.every((cell) => cell !== '');
      if (isFull) cleared++;
      return !isFull;
    });

    while (remainingRows.length < ROWS) {
      remainingRows.unshift(Array(COLS).fill(''));
    }

    state.grid = remainingRows;

    if (cleared > 0) {
      const pointValues = [0, 100, 300, 500, 800];
      const gained = (pointValues[cleared] || 100) * state.level;
      state.score += gained;
      state.lines += cleared;
      state.level = Math.floor(state.lines / 8) + 1;
      state.dropInterval = Math.max(120, 700 - (state.level - 1) * 65);

      setScore(state.score);
      setLines(state.lines);
      setLevel(state.level);
      saveHighScore(state.score);
    }

    spawnNewPiece();
  };

  const moveLeft = () => {
    const state = stateRef.current;
    if (!state.isRunning) return;
    if (
      !checkCollision(
        state.grid,
        state.currentPiece.shape,
        state.currentPiece.x - 1,
        state.currentPiece.y
      )
    ) {
      state.currentPiece.x -= 1;
    }
  };

  const moveRight = () => {
    const state = stateRef.current;
    if (!state.isRunning) return;
    if (
      !checkCollision(
        state.grid,
        state.currentPiece.shape,
        state.currentPiece.x + 1,
        state.currentPiece.y
      )
    ) {
      state.currentPiece.x += 1;
    }
  };

  const moveDown = () => {
    const state = stateRef.current;
    if (!state.isRunning) return;
    if (
      !checkCollision(
        state.grid,
        state.currentPiece.shape,
        state.currentPiece.x,
        state.currentPiece.y + 1
      )
    ) {
      state.currentPiece.y += 1;
    } else {
      lockPieceAndClear();
    }
  };

  const rotate = () => {
    const state = stateRef.current;
    if (!state.isRunning) return;
    const rotated = rotateMatrix(state.currentPiece.shape);
    if (
      !checkCollision(
        state.grid,
        rotated,
        state.currentPiece.x,
        state.currentPiece.y
      )
    ) {
      state.currentPiece.shape = rotated;
    } else if (
      !checkCollision(
        state.grid,
        rotated,
        state.currentPiece.x - 1,
        state.currentPiece.y
      )
    ) {
      state.currentPiece.x -= 1;
      state.currentPiece.shape = rotated;
    } else if (
      !checkCollision(
        state.grid,
        rotated,
        state.currentPiece.x + 1,
        state.currentPiece.y
      )
    ) {
      state.currentPiece.x += 1;
      state.currentPiece.shape = rotated;
    }
  };

  const dropHard = () => {
    const state = stateRef.current;
    if (!state.isRunning) return;
    while (
      !checkCollision(
        state.grid,
        state.currentPiece.shape,
        state.currentPiece.x,
        state.currentPiece.y + 1
      )
    ) {
      state.currentPiece.y += 1;
    }
    lockPieceAndClear();
  };

  const startGame = useCallback(() => {
    stateRef.current.grid = createEmptyGrid();
    stateRef.current.score = 0;
    stateRef.current.lines = 0;
    stateRef.current.level = 1;
    stateRef.current.dropInterval = 700;
    stateRef.current.lastDropTime = Date.now();
    stateRef.current.currentPiece = getRandomPiece();
    stateRef.current.isRunning = true;

    setScore(0);
    setLines(0);
    setLevel(1);
    setGameState('playing');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          dropHard();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 60FPS Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = stateRef.current;
      const now = Date.now();

      // Auto drop timer
      if (state.isRunning && now - state.lastDropTime > state.dropInterval) {
        if (
          !checkCollision(
            state.grid,
            state.currentPiece.shape,
            state.currentPiece.x,
            state.currentPiece.y + 1
          )
        ) {
          state.currentPiece.y += 1;
        } else {
          lockPieceAndClear();
        }
        state.lastDropTime = now;
      }

      // --- RENDERING ---
      ctx.fillStyle = '#060810';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grid Matrix background lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * BLOCK_SIZE, 0);
        ctx.lineTo(c * BLOCK_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * BLOCK_SIZE);
        ctx.lineTo(CANVAS_WIDTH, r * BLOCK_SIZE);
        ctx.stroke();
      }

      // Draw Locked Grid Cells
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = state.grid[r][c];
          if (color) {
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.fillRect(
              c * BLOCK_SIZE + 1,
              r * BLOCK_SIZE + 1,
              BLOCK_SIZE - 2,
              BLOCK_SIZE - 2
            );
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Ghost Piece Projection (Landing preview)
      if (state.isRunning && state.currentPiece) {
        let ghostY = state.currentPiece.y;
        while (
          !checkCollision(
            state.grid,
            state.currentPiece.shape,
            state.currentPiece.x,
            ghostY + 1
          )
        ) {
          ghostY += 1;
        }

        ctx.strokeStyle = state.currentPiece.color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        for (let r = 0; r < state.currentPiece.shape.length; r++) {
          for (let c = 0; c < state.currentPiece.shape[r].length; c++) {
            if (state.currentPiece.shape[r][c] !== 0) {
              ctx.strokeRect(
                (state.currentPiece.x + c) * BLOCK_SIZE + 2,
                (ghostY + r) * BLOCK_SIZE + 2,
                BLOCK_SIZE - 4,
                BLOCK_SIZE - 4
              );
            }
          }
        }
        ctx.setLineDash([]);
      }

      // Draw Current Active Piece
      if (state.isRunning && state.currentPiece) {
        const { shape, color, x, y } = state.currentPiece;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              ctx.fillRect(
                (x + c) * BLOCK_SIZE + 1,
                (y + r) * BLOCK_SIZE + 1,
                BLOCK_SIZE - 2,
                BLOCK_SIZE - 2
              );
            }
          }
        }
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-between select-none overflow-y-auto scrollbar-thin bg-bg-panel text-text-primary font-mono">
      {/* Top Header & Telemetry */}
      <div className="w-full max-w-xs flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-accent-cyan animate-pulse" />
          <div>
            <h2 className="font-bold text-xs md:text-sm tracking-wider text-accent-cyan">
              NEON_TETRIS // MATRIX
            </h2>
            <span className="text-[9px] text-text-secondary">
              LVL: {level} | LINES: {lines}
            </span>
          </div>
        </div>

        {/* High Score / Best */}
        <div className="flex items-center gap-1 bg-bg-primary/40 border border-border-subtle px-2 py-0.5 rounded-lg">
          <Trophy className="w-3 h-3 text-warning-amber" />
          <span className="text-[10px] text-text-secondary">BEST:</span>
          <span className="text-xs font-bold text-warning-amber">
            {highScore}
          </span>
        </div>
      </div>

      {/* Main Tetris Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-border-subtle shadow-lg flex items-center justify-center my-auto">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-[#060810]"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-bg-panel/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10 animate-in fade-in">
            <Grid className="w-10 h-10 text-accent-cyan mb-2 animate-bounce" />
            <h3 className="font-bold text-sm md:text-base text-accent-cyan mb-1">
              NEON TETRIS
            </h3>
            <p className="text-[10px] text-text-secondary mb-3 font-sans max-w-[180px]">
              Classic block matrix. Use Arrow Keys or WASD. Space for Hard Drop.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-1.5 font-mono text-xs font-bold px-4 py-2 rounded-xl bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START GAME</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-bg-panel/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-10 animate-in zoom-in-95">
            <h3 className="font-bold text-sm md:text-base text-red-500 mb-1">
              MATRIX OVERFLOW
            </h3>
            <p className="text-[10px] text-text-secondary mb-1">Final Score</p>
            <p className="font-bold text-lg text-accent-cyan mb-3">{score}</p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-1 font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3 h-3" />
              <span>RESTART</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Virtual Buttons */}
      <div className="w-full max-w-xs mt-2 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={moveLeft}
          className="p-2 rounded-lg bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
          aria-label="Left"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={rotate}
          className="p-2 rounded-lg bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
          aria-label="Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={moveDown}
          className="p-2 rounded-lg bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
          aria-label="Soft Drop"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={moveRight}
          className="p-2 rounded-lg bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
          aria-label="Right"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={dropHard}
          className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-accent-cyan/15 border border-accent-cyan text-accent-cyan font-bold text-[10px] hover:bg-accent-cyan hover:text-white transition-colors"
          aria-label="Hard Drop"
        >
          <ArrowDownToLine className="w-3 h-3" />
          <span>DROP</span>
        </button>
      </div>
    </div>
  );
}

export default NeonTetrisGame;
