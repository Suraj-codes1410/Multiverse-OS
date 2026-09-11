'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rocket, Trophy, Heart, RotateCcw, Play } from 'lucide-react';

const HIGH_SCORE_KEY = 'hs_orbit-defense';
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 34;
const PLAYER_HEIGHT = 22;
const ENEMY_WIDTH = 26;
const ENEMY_HEIGHT = 18;

interface Bullet {
  x: number;
  y: number;
  vy: number;
  isEnemy: boolean;
}

interface Enemy {
  x: number;
  y: number;
  alive: boolean;
  row: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
}

interface BossUfo {
  x: number;
  y: number;
  vx: number;
  active: boolean;
  hp: number;
  maxHp: number;
}

export function OrbitDefenseGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [shield, setShield] = useState<number>(100);
  const [wave, setWave] = useState<number>(1);
  const [gameState, setGameState] = useState<
    'idle' | 'playing' | 'gameover' | 'victory'
  >('idle');

  // Physics and entity references for 60fps loop
  const stateRef = useRef({
    playerX: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
    playerY: CANVAS_HEIGHT - PLAYER_HEIGHT - 25,
    playerSpeed: 5,
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    enemyDir: 1,
    enemySpeed: 1.0,
    enemyDropTimer: 0,
    boss: null as BossUfo | null,
    stars: [] as Star[],
    keys: { left: false, right: false, fire: false },
    lastFireTime: 0,
    score: 0,
    lives: 3,
    shield: 100,
    wave: 1,
    isRunning: false,
  });

  // Load high score
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        setHighScore(parseInt(stored, 10) || 0);
      }
    }
  }, []);

  const saveHighScore = useCallback((currentScore: number) => {
    setHighScore((prev) => {
      if (currentScore > prev) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(HIGH_SCORE_KEY, currentScore.toString());
        }
        return currentScore;
      }
      return prev;
    });
  }, []);

  // Initialize Starfield
  const initStars = () => {
    const stars: Star[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.8 + 0.2,
      });
    }
    stateRef.current.stars = stars;
  };

  // Spawn enemy grid for the given wave
  const spawnEnemies = (waveNum: number) => {
    const enemies: Enemy[] = [];
    const rows = 3;
    const cols = 8;
    const startX = 60;
    const startY = 60;
    const spacingX = 55;
    const spacingY = 35;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        enemies.push({
          x: startX + c * spacingX,
          y: startY + r * spacingY,
          alive: true,
          row: r,
        });
      }
    }

    stateRef.current.enemies = enemies;
    stateRef.current.enemyDir = 1;
    stateRef.current.enemySpeed = 0.8 + waveNum * 0.2;

    // Spawn Boss every 5 waves
    if (waveNum % 5 === 0) {
      stateRef.current.boss = {
        x: -50,
        y: 35,
        vx: 2.2,
        active: true,
        hp: 6 + waveNum,
        maxHp: 6 + waveNum,
      };
    } else {
      stateRef.current.boss = null;
    }
  };

  const startGame = useCallback(() => {
    initStars();
    spawnEnemies(1);
    stateRef.current.playerX = (CANVAS_WIDTH - PLAYER_WIDTH) / 2;
    stateRef.current.bullets = [];
    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.shield = 100;
    stateRef.current.wave = 1;
    stateRef.current.isRunning = true;

    setScore(0);
    setLives(3);
    setShield(100);
    setWave(1);
    setGameState('playing');
  }, []);

  // Keyboard navigation & fire handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        stateRef.current.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        stateRef.current.keys.right = true;
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        stateRef.current.keys.fire = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stateRef.current.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stateRef.current.keys.right = false;
      } else if (e.key === ' ' || e.code === 'Space') {
        stateRef.current.keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
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

      // Update Starfield
      state.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * CANVAS_WIDTH;
        }
      });

      if (state.isRunning) {
        const now = Date.now();

        // 1. Move Player
        if (state.keys.left) {
          state.playerX = Math.max(10, state.playerX - state.playerSpeed);
        }
        if (state.keys.right) {
          state.playerX = Math.min(
            CANVAS_WIDTH - PLAYER_WIDTH - 10,
            state.playerX + state.playerSpeed
          );
        }

        // 2. Player Firing (Cooldown ~220ms)
        if (state.keys.fire && now - state.lastFireTime > 220) {
          state.bullets.push({
            x: state.playerX + PLAYER_WIDTH / 2,
            y: state.playerY - 4,
            vy: -7.5,
            isEnemy: false,
          });
          state.lastFireTime = now;
        }

        // 3. Update Boss UFO
        if (state.boss && state.boss.active) {
          state.boss.x += state.boss.vx;
          if (state.boss.x > CANVAS_WIDTH + 60) {
            state.boss.active = false;
          }
        }

        // 4. Move Enemies
        let shouldReverse = false;
        const livingEnemies = state.enemies.filter((e) => e.alive);

        livingEnemies.forEach((e) => {
          e.x += state.enemyDir * state.enemySpeed;
          if (e.x + ENEMY_WIDTH >= CANVAS_WIDTH - 15 || e.x <= 15) {
            shouldReverse = true;
          }
        });

        if (shouldReverse) {
          state.enemyDir *= -1;
          livingEnemies.forEach((e) => {
            e.y += 14;
            // Breach check
            if (e.y + ENEMY_HEIGHT >= state.playerY) {
              state.isRunning = false;
              setGameState('gameover');
            }
          });
        }

        // 5. Enemy Laser Drops
        if (
          livingEnemies.length > 0 &&
          Math.random() < 0.022 + state.wave * 0.005
        ) {
          const shooter =
            livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
          state.bullets.push({
            x: shooter.x + ENEMY_WIDTH / 2,
            y: shooter.y + ENEMY_HEIGHT,
            vy: 3.8 + state.wave * 0.3,
            isEnemy: true,
          });
        }

        // 6. Update Bullets & Collisions
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.y += b.vy;

          // Out of screen bounds
          if (b.y < -10 || b.y > CANVAS_HEIGHT + 10) {
            state.bullets.splice(i, 1);
            continue;
          }

          // Player Bullet hitting Enemy
          if (!b.isEnemy) {
            // Check Boss collision
            if (state.boss && state.boss.active) {
              if (
                b.x >= state.boss.x &&
                b.x <= state.boss.x + 45 &&
                b.y >= state.boss.y &&
                b.y <= state.boss.y + 22
              ) {
                state.bullets.splice(i, 1);
                state.boss.hp -= 1;
                if (state.boss.hp <= 0) {
                  state.boss.active = false;
                  state.score += 500;
                  setScore(state.score);
                  saveHighScore(state.score);
                }
                continue;
              }
            }

            // Check Standard Enemy collision
            let hitEnemy = false;
            for (const enemy of livingEnemies) {
              if (
                b.x >= enemy.x &&
                b.x <= enemy.x + ENEMY_WIDTH &&
                b.y >= enemy.y &&
                b.y <= enemy.y + ENEMY_HEIGHT
              ) {
                enemy.alive = false;
                state.bullets.splice(i, 1);
                hitEnemy = true;
                state.score += 100;
                setScore(state.score);
                saveHighScore(state.score);
                break;
              }
            }
            if (hitEnemy) continue;
          }

          // Enemy Bullet hitting Player
          else if (b.isEnemy) {
            if (
              b.x >= state.playerX &&
              b.x <= state.playerX + PLAYER_WIDTH &&
              b.y >= state.playerY &&
              b.y <= state.playerY + PLAYER_HEIGHT
            ) {
              state.bullets.splice(i, 1);

              if (state.shield > 25) {
                state.shield -= 25;
                setShield(state.shield);
              } else {
                state.lives -= 1;
                state.shield = 100;
                setLives(state.lives);
                setShield(100);

                if (state.lives <= 0) {
                  state.isRunning = false;
                  setGameState('gameover');
                }
              }
            }
          }
        }

        // 7. Check Wave Clearance
        if (livingEnemies.length === 0) {
          const nextWave = state.wave + 1;
          state.wave = nextWave;
          state.score += 250;
          setScore(state.score);
          saveHighScore(state.score);
          setWave(nextWave);
          spawnEnemies(nextWave);
        }
      }

      // --- RENDERING ---
      const style = getComputedStyle(document.documentElement);
      const accentCyan =
        style.getPropertyValue('--accent-cyan').trim() || '#00f2fe';
      const accentPurple =
        style.getPropertyValue('--accent-purple').trim() || '#a855f7';
      const warningAmber =
        style.getPropertyValue('--warning-amber').trim() || '#f59e0b';

      // 1. Clear Dark Space Background (#07090f)
      ctx.fillStyle = '#07090f';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Draw Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      state.stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Player Spaceship (Accent Cyan)
      ctx.fillStyle = accentCyan;
      ctx.shadowColor = accentCyan;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(state.playerX + PLAYER_WIDTH / 2, state.playerY); // Nose
      ctx.lineTo(state.playerX + PLAYER_WIDTH, state.playerY + PLAYER_HEIGHT); // Right wing
      ctx.lineTo(
        state.playerX + PLAYER_WIDTH / 2,
        state.playerY + PLAYER_HEIGHT - 4
      ); // Center thruster
      ctx.lineTo(state.playerX, state.playerY + PLAYER_HEIGHT); // Left wing
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Draw Enemies (Satellites in Accent Purple)
      ctx.fillStyle = accentPurple;
      ctx.shadowColor = accentPurple;
      ctx.shadowBlur = 6;
      state.enemies.forEach((e) => {
        if (!e.alive) return;
        // Draw satellite central core
        ctx.fillRect(e.x + 6, e.y + 3, ENEMY_WIDTH - 12, ENEMY_HEIGHT - 6);
        // Draw satellite solar wings
        ctx.fillRect(e.x, e.y + 6, 5, 6);
        ctx.fillRect(e.x + ENEMY_WIDTH - 5, e.y + 6, 5, 6);
      });
      ctx.shadowBlur = 0;

      // 5. Draw Boss UFO (Warning Amber)
      if (state.boss && state.boss.active) {
        ctx.fillStyle = warningAmber;
        ctx.shadowColor = warningAmber;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(
          state.boss.x + 22,
          state.boss.y + 11,
          22,
          10,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        // Boss Health Bar
        const hpPercent = state.boss.hp / state.boss.maxHp;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(state.boss.x, state.boss.y - 6, 44, 3);
        ctx.fillStyle = warningAmber;
        ctx.fillRect(state.boss.x, state.boss.y - 6, 44 * hpPercent, 3);
      }

      // 6. Draw Bullets
      state.bullets.forEach((b) => {
        if (!b.isEnemy) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(b.x - 1.5, b.y, 3, 9);
        } else {
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(b.x - 1.5, b.y, 3, 7);
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [saveHighScore]);

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-between select-none overflow-y-auto scrollbar-thin bg-bg-panel text-text-primary font-mono">
      {/* Top Header & Telemetry Bar */}
      <div className="w-full max-w-lg flex items-center justify-between border-b border-border-subtle pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Rocket className="w-4 h-4 text-accent-cyan animate-pulse" />
          <div>
            <h2 className="font-bold text-xs md:text-sm tracking-wider text-accent-cyan">
              ORBIT_DEFENSE // NASA_ORBITAIR
            </h2>
            <span className="text-[9px] text-text-secondary">
              WAVE: {wave} | SHIELD: {shield}%
            </span>
          </div>
        </div>

        {/* Lives & Shield */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-3.5 h-3.5 ${
                  idx < lives
                    ? 'text-red-500 fill-red-500'
                    : 'text-text-secondary opacity-30'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-bg-primary/40 border border-border-subtle px-2.5 py-1 rounded-lg">
            <Trophy className="w-3 h-3 text-warning-amber" />
            <span className="text-[10px] text-text-secondary">BEST:</span>
            <span className="text-xs font-bold text-warning-amber">
              {highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas Screen */}
      <div className="relative w-full max-w-lg aspect-[6/5] rounded-2xl overflow-hidden border border-border-subtle shadow-lg flex items-center justify-center my-auto">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full block bg-[#07090f]"
        />

        {/* Start Overlay */}
        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-bg-panel/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in">
            <Rocket className="w-12 h-12 text-accent-cyan mb-2 animate-bounce" />
            <h3 className="font-bold text-base md:text-lg text-accent-cyan mb-1">
              ORBIT DEFENSE: NASA ORBITAIR
            </h3>
            <p className="text-xs text-text-secondary mb-4 font-sans max-w-xs">
              Defend Earth against rogue telemetry satellite clusters. Use Arrow
              Keys or A/D to steer, Space to Fire.
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-2 font-mono text-xs font-bold px-5 py-2.5 rounded-xl bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LAUNCH MISSION</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-bg-panel/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 animate-in zoom-in-95">
            <h3 className="font-bold text-base md:text-lg text-red-500 mb-1">
              MISSION COMPROMISED
            </h3>
            <p className="text-xs text-text-secondary mb-1">
              Atmospheric grid breached at Wave {wave}
            </p>
            <p className="font-bold text-xl text-accent-cyan mb-4">
              SCORE: {score}
            </p>
            <button
              type="button"
              onClick={startGame}
              className="flex items-center gap-1.5 font-mono text-xs font-bold px-4 py-2 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RETRY MISSION</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Touch Action Controls (Left / Fire / Right) */}
      <div className="w-full max-w-lg mt-2.5 flex items-center justify-between gap-3">
        {/* Left Move Button */}
        <button
          type="button"
          onTouchStart={() => (stateRef.current.keys.left = true)}
          onTouchEnd={() => (stateRef.current.keys.left = false)}
          onMouseDown={() => (stateRef.current.keys.left = true)}
          onMouseUp={() => (stateRef.current.keys.left = false)}
          className="flex-1 py-3 rounded-xl bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan font-bold text-xs text-text-primary flex items-center justify-center active:bg-accent-cyan/20 transition-all"
        >
          <span>← LEFT</span>
        </button>

        {/* Fire Button */}
        <button
          type="button"
          onTouchStart={() => (stateRef.current.keys.fire = true)}
          onTouchEnd={() => (stateRef.current.keys.fire = false)}
          onMouseDown={() => (stateRef.current.keys.fire = true)}
          onMouseUp={() => (stateRef.current.keys.fire = false)}
          className="flex-1 py-3 rounded-xl bg-accent-cyan/20 border border-accent-cyan text-accent-cyan font-bold text-xs flex items-center justify-center active:bg-accent-cyan active:text-white transition-all shadow-sm"
        >
          <Rocket className="w-4 h-4 mr-1.5" />
          <span>FIRE</span>
        </button>

        {/* Right Move Button */}
        <button
          type="button"
          onTouchStart={() => (stateRef.current.keys.right = true)}
          onTouchEnd={() => (stateRef.current.keys.right = false)}
          onMouseDown={() => (stateRef.current.keys.right = true)}
          onMouseUp={() => (stateRef.current.keys.right = false)}
          className="flex-1 py-3 rounded-xl bg-bg-primary/50 border border-border-subtle hover:border-accent-cyan font-bold text-xs text-text-primary flex items-center justify-center active:bg-accent-cyan/20 transition-all"
        >
          <span>RIGHT →</span>
        </button>
      </div>
    </div>
  );
}

export default OrbitDefenseGame;
