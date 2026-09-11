'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  RotateCcw,
  Trophy,
  Sparkles,
  Cpu,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type Difficulty = 'casual' | 'senior' | 'super';

const HIGH_SCORE_KEY = 'hs_pong';
const WINNING_SCORE = 7;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 70;
const BALL_RADIUS = 6;
const PLAYER_SPEED = 6;

export function OraclePongGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [gameState, setGameState] = useState<
    'idle' | 'playing' | 'won' | 'lost'
  >('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('senior');
  const [totalWins, setTotalWins] = useState<number>(0);

  // Game physics state references for 60fps animation loop
  const stateRef = useRef({
    playerY: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
    aiY: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT / 2,
    ballVx: 4,
    ballVy: 2,
    keys: { up: false, down: false },
    isRunning: false,
    playerScore: 0,
    aiScore: 0,
    difficulty: 'senior' as Difficulty,
  });

  // Sync refs with state
  useEffect(() => {
    stateRef.current.difficulty = difficulty;
  }, [difficulty]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        setTotalWins(parseInt(stored, 10) || 0);
      }
    }
  }, []);

  const resetBall = (serveTowardsAi: boolean) => {
    stateRef.current.ballX = CANVAS_WIDTH / 2;
    stateRef.current.ballY = CANVAS_HEIGHT / 2;
    const speed = 4.5;
    stateRef.current.ballVx = serveTowardsAi ? speed : -speed;
    stateRef.current.ballVy = Math.random() * 4 - 2;
  };

  const startGame = useCallback(() => {
    stateRef.current.playerY = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    stateRef.current.aiY = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    stateRef.current.playerScore = 0;
    stateRef.current.aiScore = 0;
    setPlayerScore(0);
    setAiScore(0);
    resetBall(Math.random() > 0.5);
    stateRef.current.isRunning = true;
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

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        stateRef.current.keys.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        stateRef.current.keys.down = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        stateRef.current.keys.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        stateRef.current.keys.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse & Touch paddle steering
  const updatePaddlePosition = (clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touchY = clientY - rect.top;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const scaledY = touchY * scaleY - PADDLE_HEIGHT / 2;
    stateRef.current.playerY = Math.max(
      0,
      Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, scaledY)
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePaddlePosition(e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    updatePaddlePosition(e.touches[0].clientY);
  };

  // 60FPS Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const state = stateRef.current;

      // 1. Move Player by keys
      if (state.keys.up) {
        state.playerY = Math.max(0, state.playerY - PLAYER_SPEED);
      }
      if (state.keys.down) {
        state.playerY = Math.min(
          CANVAS_HEIGHT - PADDLE_HEIGHT,
          state.playerY + PLAYER_SPEED
        );
      }

      // 2. Move AI Paddle
      if (state.isRunning) {
        let aiSpeed = 3.6; // Casual: 60%
        let targetY = state.ballY - PADDLE_HEIGHT / 2;

        if (state.difficulty === 'senior') {
          aiSpeed = 5.0; // Senior: 85%
        } else if (state.difficulty === 'super') {
          aiSpeed = 6.2; // Superintelligence: 100% + trajectory projection
          if (state.ballVx > 0) {
            const timeToReach =
              (CANVAS_WIDTH - 35 - state.ballX) / state.ballVx;
            targetY =
              state.ballY + state.ballVy * timeToReach - PADDLE_HEIGHT / 2;
          }
        }

        const aiCenter = state.aiY + PADDLE_HEIGHT / 2;
        const targetCenter = targetY + PADDLE_HEIGHT / 2;

        if (Math.abs(aiCenter - targetCenter) > 4) {
          if (aiCenter < targetCenter) {
            state.aiY = Math.min(
              CANVAS_HEIGHT - PADDLE_HEIGHT,
              state.aiY + aiSpeed
            );
          } else {
            state.aiY = Math.max(0, state.aiY - aiSpeed);
          }
        }

        // 3. Move Ball
        state.ballX += state.ballVx;
        state.ballY += state.ballVy;

        // Top/bottom wall bounce
        if (state.ballY - BALL_RADIUS <= 0) {
          state.ballY = BALL_RADIUS;
          state.ballVy = Math.abs(state.ballVy);
        } else if (state.ballY + BALL_RADIUS >= CANVAS_HEIGHT) {
          state.ballY = CANVAS_HEIGHT - BALL_RADIUS;
          state.ballVy = -Math.abs(state.ballVy);
        }

        // Player paddle collision (Left)
        const playerX = 25;
        if (
          state.ballX - BALL_RADIUS <= playerX + PADDLE_WIDTH &&
          state.ballX + BALL_RADIUS >= playerX &&
          state.ballY >= state.playerY - 4 &&
          state.ballY <= state.playerY + PADDLE_HEIGHT + 4
        ) {
          state.ballX = playerX + PADDLE_WIDTH + BALL_RADIUS;
          const hitOffset =
            (state.ballY - (state.playerY + PADDLE_HEIGHT / 2)) /
            (PADDLE_HEIGHT / 2);
          state.ballVx = Math.min(Math.abs(state.ballVx) * 1.05, 10);
          state.ballVy = hitOffset * 5.2;
        }

        // AI paddle collision (Right)
        const aiX = CANVAS_WIDTH - 25 - PADDLE_WIDTH;
        if (
          state.ballX + BALL_RADIUS >= aiX &&
          state.ballX - BALL_RADIUS <= aiX + PADDLE_WIDTH &&
          state.ballY >= state.aiY - 4 &&
          state.ballY <= state.aiY + PADDLE_HEIGHT + 4
        ) {
          state.ballX = aiX - BALL_RADIUS;
          const hitOffset =
            (state.ballY - (state.aiY + PADDLE_HEIGHT / 2)) /
            (PADDLE_HEIGHT / 2);
          state.ballVx = -Math.min(Math.abs(state.ballVx) * 1.05, 10);
          state.ballVy = hitOffset * 5.2;
        }

        // Scoring: Point for AI
        if (state.ballX < 0) {
          state.aiScore += 1;
          setAiScore(state.aiScore);

          if (state.aiScore >= WINNING_SCORE) {
            state.isRunning = false;
            setGameState('lost');
          } else {
            resetBall(true);
          }
        }

        // Scoring: Point for Player
        else if (state.ballX > CANVAS_WIDTH) {
          state.playerScore += 1;
          setPlayerScore(state.playerScore);

          if (state.playerScore >= WINNING_SCORE) {
            state.isRunning = false;
            setGameState('won');
            setTotalWins((prev) => {
              const updated = prev + 1;
              if (typeof window !== 'undefined') {
                localStorage.setItem(HIGH_SCORE_KEY, updated.toString());
              }
              return updated;
            });
          } else {
            resetBall(false);
          }
        }
      }

      // --- RENDERING ---
      const style = getComputedStyle(document.documentElement);
      const bgPrimary =
        style.getPropertyValue('--bg-primary').trim() || '#0a0c16';
      const accentCyan =
        style.getPropertyValue('--accent-cyan').trim() || '#00f2fe';
      const textPrimary =
        style.getPropertyValue('--text-primary').trim() || '#ffffff';
      const borderSubtle =
        style.getPropertyValue('--border-subtle').trim() ||
        'rgba(255,255,255,0.15)';

      // Clear Canvas Background
      ctx.fillStyle = bgPrimary;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Center Dividing Net
      ctx.strokeStyle = borderSubtle;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Paddles with glowing style
      ctx.fillStyle = accentCyan;
      ctx.shadowColor = accentCyan;
      ctx.shadowBlur = 8;

      // Player Paddle (Left)
      ctx.beginPath();
      ctx.roundRect(25, state.playerY, PADDLE_WIDTH, PADDLE_HEIGHT, 4);
      ctx.fill();

      // AI Paddle (Right)
      ctx.beginPath();
      ctx.roundRect(
        CANVAS_WIDTH - 25 - PADDLE_WIDTH,
        state.aiY,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        4
      );
      ctx.fill();

      // Draw Ball
      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Labels on Canvas
      ctx.fillStyle = textPrimary;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('YOU', 30, 25);
      ctx.fillText('ORACLE AI', CANVAS_WIDTH - 105, 25);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-between select-none overflow-y-auto scrollbar-thin bg-bg-panel text-text-primary font-mono">
      {/* Header Info & Score */}
      <div className="w-full max-w-lg flex items-center justify-between border-b border-border-subtle pb-2.5 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-cyan" />
          <h2 className="font-bold text-xs md:text-sm tracking-wider text-accent-cyan">
            ORACLE_PONG // MATCH
          </h2>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-3 bg-bg-primary/40 border border-border-subtle px-3 py-1 rounded-xl">
          <span className="font-bold text-xs md:text-sm text-accent-cyan">
            YOU {playerScore}
          </span>
          <span className="text-text-secondary text-xs">—</span>
          <span className="font-bold text-xs md:text-sm text-accent-purple">
            {aiScore} ORACLE
          </span>
        </div>

        {/* High Score / Total Wins */}
        <div className="flex items-center gap-1.5 bg-bg-primary/40 border border-border-subtle px-2.5 py-1 rounded-lg">
          <Trophy className="w-3 h-3 text-warning-amber" />
          <span className="text-[10px] text-text-secondary">WINS:</span>
          <span className="text-xs font-bold text-warning-amber">
            {totalWins}
          </span>
        </div>
      </div>

      {/* Main Canvas Playing Field */}
      <div className="relative w-full max-w-lg aspect-[3/2] rounded-2xl overflow-hidden border border-border-subtle shadow-md flex items-center justify-center my-auto cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="w-full h-full block bg-bg-primary"
        />

        {/* Initial Start Prompt */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-bg-panel/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
            <Cpu className="w-10 h-10 text-accent-cyan mb-2 animate-pulse" />
            <h3 className="font-bold text-base md:text-lg text-accent-cyan mb-1">
              ORACLE PONG INITIATIVE
            </h3>
            <p className="text-xs text-text-secondary mb-4 font-sans max-w-xs">
              First to 7 points wins the match. Move your mouse over the field
              or use W/S keys / Arrow keys.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 font-mono text-xs font-bold px-5 py-2.5 rounded-xl bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START MATCH</span>
            </button>
          </div>
        )}

        {/* Match Won Overlay */}
        {gameState === 'won' && (
          <div className="absolute inset-0 bg-bg-panel/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-in zoom-in-95">
            <Sparkles className="w-12 h-12 text-accent-cyan mb-2 animate-bounce" />
            <h3 className="font-bold text-base md:text-lg text-accent-cyan mb-1">
              YOU DEFEATED THE ORACLE
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Superior neural deflection confirmed.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-1.5 font-mono text-xs font-bold px-4 py-2 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        )}

        {/* Match Lost Overlay */}
        {gameState === 'lost' && (
          <div className="absolute inset-0 bg-bg-panel/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-in zoom-in-95">
            <h3 className="font-bold text-base md:text-lg text-red-500 mb-1">
              ORACLE WINS. TRY AGAIN.
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Oracle calculated your angles.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-1.5 font-mono text-xs font-bold px-4 py-2 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>REMATCH</span>
            </button>
          </div>
        )}
      </div>

      {/* Difficulty Selection & Controls Helper */}
      <div className="w-full max-w-lg mt-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-text-secondary uppercase mr-1">
            AI LEVEL:
          </span>
          {(['casual', 'senior', 'super'] as Difficulty[]).map((level) => {
            const isSelected = difficulty === level;
            const labelMap = {
              casual: 'Casual (60%)',
              senior: 'Senior (85%)',
              super: 'Super AI (100%)',
            };

            return (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`text-[9px] md:text-[10px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-accent-cyan text-white border-accent-cyan font-bold'
                    : 'bg-bg-primary/40 border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                {labelMap[level]}
              </button>
            );
          })}
        </div>

        {/* Mobile Up / Down Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onMouseDown={() => (stateRef.current.keys.up = true)}
            onMouseUp={() => (stateRef.current.keys.up = false)}
            onTouchStart={() => (stateRef.current.keys.up = true)}
            onTouchEnd={() => (stateRef.current.keys.up = false)}
            className="p-1.5 rounded bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan"
            aria-label="Move Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={() => (stateRef.current.keys.down = true)}
            onMouseUp={() => (stateRef.current.keys.down = false)}
            onTouchStart={() => (stateRef.current.keys.down = true)}
            onTouchEnd={() => (stateRef.current.keys.down = false)}
            className="p-1.5 rounded bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan text-text-secondary hover:text-accent-cyan"
            aria-label="Move Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={startGame}
            className="flex items-center gap-1 font-mono text-[10px] md:text-xs text-text-secondary hover:text-text-primary px-2.5 py-1 rounded bg-bg-primary/40 border border-border-subtle hover:border-border-bright transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default OraclePongGame;
