'use client';

import React, { useEffect, useState } from 'react';
import {
  Gamepad2,
  Layers,
  Terminal,
  Activity,
  Rocket,
  Grid,
  Trophy,
  Play,
} from 'lucide-react';

export interface ArcadeGame {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ArcadeHubProps {
  onLaunch: (gameId: string) => void;
}

const ARCADE_GAMES: ArcadeGame[] = [
  {
    id: 'stack-2048',
    name: 'Tech Stack 2048',
    description: 'Merge your stack to Multiverse-OS',
    icon: Layers,
  },
  {
    id: 'cyber-breach',
    name: 'Cyber Breach',
    description: 'Decrypt 5-letter tech keywords',
    icon: Terminal,
  },
  {
    id: 'pong',
    name: 'Oracle Pong',
    description: 'Beat the Oracle AI in table tennis',
    icon: Activity,
  },
  {
    id: 'orbit-defense',
    name: 'Orbit Defense',
    description: 'Defend Earth in the NASA universe',
    icon: Rocket,
  },
  {
    id: 'tetris',
    name: 'Neon Tetris',
    description: 'Classic blocks, neon style',
    icon: Grid,
  },
  {
    id: 'snake',
    name: 'Retro Snake',
    description: 'The original, refactored',
    icon: Gamepad2,
  },
  {
    id: 'stack',
    name: 'Stack Tower',
    description: 'Build the tallest tower. Perfect stacks = no cuts.',
    icon: Layers,
  },
];

export function ArcadeHub({ onLaunch }: ArcadeHubProps) {
  const [highScores, setHighScores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scores: Record<string, string> = {};
    ARCADE_GAMES.forEach((game) => {
      const storedScore = localStorage.getItem(`hs_${game.id}`);
      scores[game.id] = storedScore !== null ? storedScore : '0';
    });
    setHighScores(scores);
  }, []);

  return (
    <div className="w-full h-full p-4 md:p-6 flex flex-col justify-between overflow-y-auto scrollbar-thin">
      {/* Header Info */}
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-5 h-5 text-accent-cyan" />
          <h2 className="font-mono font-bold text-sm md:text-base text-text-primary tracking-wider">
            MULTIVERSE_ARCADE // CABINET_HUB
          </h2>
        </div>
        <span className="font-mono text-[10px] md:text-xs text-text-secondary">
          7 TITLES READY
        </span>
      </div>

      {/* 2x3 Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-grow">
        {ARCADE_GAMES.map((game) => {
          const IconComponent = game.icon;
          const bestScore = highScores[game.id] ?? '0';

          return (
            <div
              key={game.id}
              className="bg-bg-panel border border-border-subtle hover:border-accent-cyan/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md group"
            >
              {/* Card Header & Icon */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-bg-primary/40 border border-border-subtle text-accent-cyan group-hover:scale-105 transition-transform duration-200">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-secondary bg-bg-primary/30 px-2 py-0.5 rounded border border-border-subtle">
                    <Trophy className="w-3 h-3 text-warning-amber" />
                    <span>BEST: {bestScore}</span>
                  </div>
                </div>

                {/* Game Title */}
                <h3 className="font-mono font-bold text-sm text-text-primary tracking-wide mb-1">
                  {game.name}
                </h3>

                {/* One Line Description */}
                <p className="text-xs text-text-secondary font-sans leading-relaxed line-clamp-1">
                  {game.description}
                </p>
              </div>

              {/* Play Action Button */}
              <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onLaunch(game.id)}
                  className="w-full flex items-center justify-center gap-1.5 font-mono text-xs font-semibold px-3 py-2 rounded-lg bg-accent-cyan/10 hover:bg-accent-cyan text-accent-cyan hover:text-white border border-accent-cyan/30 transition-all duration-200 cursor-pointer shadow-sm active:scale-98"
                  aria-label={`Play ${game.name}`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ArcadeHub;
