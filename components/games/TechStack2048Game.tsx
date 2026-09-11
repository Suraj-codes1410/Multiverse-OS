'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  RotateCcw,
  Trophy,
  Award,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface TileConfig {
  label: string;
  sub: string;
  bg: string;
  textColor: string;
}

const TILE_MAP: Record<number, TileConfig> = {
  2: { label: 'HTML5', sub: '2', bg: '#e34c26', textColor: '#ffffff' },
  4: { label: 'TypeScript', sub: '4', bg: '#3178c6', textColor: '#ffffff' },
  8: { label: 'Tailwind', sub: '8', bg: '#06b6d4', textColor: '#ffffff' },
  16: { label: 'React', sub: '16', bg: '#61dafb', textColor: '#0a0c16' },
  32: { label: 'Next.js', sub: '32', bg: '#000000', textColor: '#ffffff' },
  64: { label: 'FastAPI', sub: '64', bg: '#009688', textColor: '#ffffff' },
  128: { label: 'Django', sub: '128', bg: '#092e20', textColor: '#ffffff' },
  256: {
    label: 'Spring Boot',
    sub: '256',
    bg: '#6db33f',
    textColor: '#ffffff',
  },
  512: { label: 'Kafka', sub: '512', bg: '#231f20', textColor: '#ffffff' },
  1024: {
    label: 'Kubernetes',
    sub: '1024',
    bg: '#326ce5',
    textColor: '#ffffff',
  },
  2048: {
    label: 'Multiverse-OS',
    sub: '2048',
    bg: '#c84b31',
    textColor: '#ffffff',
  },
};

const HIGH_SCORE_KEY = 'hs_stack-2048';

function getEmptyBoard(): number[][] {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

function spawnRandomTile(board: number[][]): number[][] {
  const emptyCoords: { r: number; c: number }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) {
        emptyCoords.push({ r, c });
      }
    }
  }

  if (emptyCoords.length === 0) return board;

  const randomCoord =
    emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const val = Math.random() < 0.9 ? 2 : 4;

  const newBoard = board.map((row) => [...row]);
  newBoard[randomCoord.r][randomCoord.c] = val;
  return newBoard;
}

function slideRow(row: number[]): { newRow: number[]; gainedScore: number } {
  const nonZero = row.filter((val) => val !== 0);
  const result: number[] = [];
  let gainedScore = 0;
  let i = 0;

  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const merged = nonZero[i] * 2;
      result.push(merged);
      gainedScore += merged;
      i += 2;
    } else {
      result.push(nonZero[i]);
      i += 1;
    }
  }

  while (result.length < 4) {
    result.push(0);
  }

  return { newRow: result, gainedScore };
}

function canMove(board: number[][]): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < 4 && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < 4 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export function TechStack2048Game() {
  const [board, setBoard] = useState<number[][]>(() => {
    let b = getEmptyBoard();
    b = spawnRandomTile(b);
    b = spawnRandomTile(b);
    return b;
  });

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [hasDismissedWin, setHasDismissedWin] = useState<boolean>(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize and load high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        setHighScore(parseInt(stored, 10) || 0);
      }
    }
  }, []);

  const saveHighScore = useCallback((newScore: number) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
        }
        return newScore;
      }
      return prev;
    });
  }, []);

  const resetGame = useCallback(() => {
    let b = getEmptyBoard();
    b = spawnRandomTile(b);
    b = spawnRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setHasDismissedWin(false);
  }, []);

  const move = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (gameOver) return;

      const currentBoard = board.map((r) => [...r]);
      let totalGained = 0;
      let rotatedBoard: number[][];

      if (direction === 'left') {
        const newRows = currentBoard.map((row) => {
          const { newRow, gainedScore } = slideRow(row);
          totalGained += gainedScore;
          return newRow;
        });
        rotatedBoard = newRows;
      } else if (direction === 'right') {
        const newRows = currentBoard.map((row) => {
          const reversed = [...row].reverse();
          const { newRow, gainedScore } = slideRow(reversed);
          totalGained += gainedScore;
          return newRow.reverse();
        });
        rotatedBoard = newRows;
      } else if (direction === 'up') {
        // Transpose -> slide left -> Transpose
        const transposed = currentBoard[0].map((_, c) =>
          currentBoard.map((r) => r[c])
        );
        const newRows = transposed.map((row) => {
          const { newRow, gainedScore } = slideRow(row);
          totalGained += gainedScore;
          return newRow;
        });
        rotatedBoard = newRows[0].map((_, c) => newRows.map((r) => r[c]));
      } else {
        // 'down': Transpose -> reverse -> slide left -> reverse -> Transpose
        const transposed = currentBoard[0].map((_, c) =>
          currentBoard.map((r) => r[c])
        );
        const newRows = transposed.map((row) => {
          const reversed = [...row].reverse();
          const { newRow, gainedScore } = slideRow(reversed);
          totalGained += gainedScore;
          return newRow.reverse();
        });
        rotatedBoard = newRows[0].map((_, c) => newRows.map((r) => r[c]));
      }

      // Check if board changed
      let changed = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (currentBoard[r][c] !== rotatedBoard[r][c]) {
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        const newScore = score + totalGained;
        setScore(newScore);
        saveHighScore(newScore);

        const withSpawn = spawnRandomTile(rotatedBoard);
        setBoard(withSpawn);

        // Check for 2048 tile win
        if (!hasDismissedWin) {
          const reached2048 = withSpawn.some((row) =>
            row.some((val) => val >= 2048)
          );
          if (reached2048) {
            setGameWon(true);
          }
        }

        // Check for game over
        if (!canMove(withSpawn)) {
          setGameOver(true);
        }
      }
    },
    [board, gameOver, score, hasDismissedWin, saveHighScore]
  );

  // Keyboard navigation handler
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
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 30;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) move('right');
      else move('left');
    } else {
      if (deltaY > 0) move('down');
      else move('up');
    }
  };

  return (
    <div
      className="w-full h-full p-4 flex flex-col items-center justify-between select-none overflow-y-auto scrollbar-thin bg-bg-panel text-text-primary"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <div className="w-full max-w-sm flex items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="font-mono font-bold text-sm md:text-base tracking-wider text-accent-cyan flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> TECH_STACK_2048
          </h2>
          <p className="text-[10px] text-text-secondary font-mono">
            Merge tiles to Multiverse-OS
          </p>
        </div>

        {/* Score Boards */}
        <div className="flex items-center gap-2">
          <div className="bg-bg-primary/40 border border-border-subtle px-2.5 py-1 rounded-lg text-center font-mono">
            <span className="block text-[8px] text-text-secondary uppercase">
              Score
            </span>
            <span className="text-xs md:text-sm font-bold text-text-primary">
              {score}
            </span>
          </div>
          <div className="bg-bg-primary/40 border border-border-subtle px-2.5 py-1 rounded-lg text-center font-mono">
            <span className="block text-[8px] text-text-secondary uppercase flex items-center justify-center gap-0.5">
              <Trophy className="w-2.5 h-2.5 text-warning-amber" /> Best
            </span>
            <span className="text-xs md:text-sm font-bold text-warning-amber">
              {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* 4x4 Game Matrix Grid */}
      <div className="relative w-full max-w-sm aspect-square bg-bg-primary/30 border border-border-subtle rounded-2xl p-2.5 grid grid-cols-4 grid-rows-4 gap-2 shadow-inner">
        {board.map((row, rIdx) =>
          row.map((tileVal, cIdx) => {
            const config = TILE_MAP[tileVal];

            if (!config || tileVal === 0) {
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="w-full h-full rounded-xl bg-bg-panel/40 border border-border-subtle/30"
                />
              );
            }

            return (
              <div
                key={`${rIdx}-${cIdx}`}
                style={{
                  backgroundColor: config.bg,
                  color: config.textColor,
                }}
                className="w-full h-full rounded-xl flex flex-col items-center justify-center p-1 font-mono font-bold shadow-md transition-all duration-150 transform animate-in zoom-in-75"
              >
                <span className="text-[9px] sm:text-[10px] md:text-xs text-center leading-tight tracking-tight break-words px-0.5 font-sans font-semibold">
                  {config.label}
                </span>
                <span className="text-[8px] md:text-[9px] opacity-80 mt-0.5">
                  {config.sub}
                </span>
              </div>
            );
          })
        )}

        {/* Victory Overlay Screen */}
        {gameWon && !hasDismissedWin && (
          <div className="absolute inset-0 bg-bg-panel/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 border border-accent-cyan/50 animate-in fade-in duration-200">
            <Award className="w-12 h-12 text-accent-cyan mb-2 animate-bounce" />
            <h3 className="font-mono font-bold text-base md:text-lg text-accent-cyan mb-1">
              STACK COMPLETE!
            </h3>
            <p className="text-xs text-text-secondary font-sans mb-4">
              Multiverse-OS architecture milestone achieved.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHasDismissedWin(true)}
                className="font-mono text-xs px-3 py-1.5 rounded-lg bg-bg-primary border border-border-subtle text-text-primary hover:border-accent-cyan transition-colors cursor-pointer"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="font-mono text-xs px-3 py-1.5 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-opacity cursor-pointer font-bold shadow-sm"
              >
                New Game
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-bg-panel/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 border border-border-bright animate-in fade-in duration-200">
            <h3 className="font-mono font-bold text-base md:text-lg text-text-primary mb-1">
              GAME OVER
            </h3>
            <p className="text-xs text-text-secondary font-mono mb-1">
              Final Architecture Score
            </p>
            <span className="font-mono font-bold text-xl text-accent-cyan mb-4">
              {score}
            </span>
            <button
              type="button"
              onClick={resetGame}
              className="flex items-center gap-1.5 font-mono text-xs font-semibold px-4 py-2 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Control Bar & Touch D-pad for mobile */}
      <div className="w-full max-w-sm mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={resetGame}
          className="flex items-center gap-1.5 font-mono text-[10px] md:text-xs text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg bg-bg-primary/40 border border-border-subtle hover:border-border-bright transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESTART</span>
        </button>

        {/* Virtual Direction Keys */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => move('left')}
            className="p-1.5 rounded bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
            aria-label="Slide Left"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => move('up')}
              className="p-1.5 rounded bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
              aria-label="Slide Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => move('down')}
              className="p-1.5 rounded bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
              aria-label="Slide Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => move('right')}
            className="p-1.5 rounded bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan transition-colors"
            aria-label="Slide Right"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TechStack2048Game;
