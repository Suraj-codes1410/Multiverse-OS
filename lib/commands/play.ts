import { Command } from './types';

const GAME_ALIASES: Record<string, { id: string; title: string }> = {
  '2048': { id: 'stack-2048', title: 'Tech Stack 2048' },
  'stack-2048': { id: 'stack-2048', title: 'Tech Stack 2048' },
  stack: { id: 'stack', title: 'Stack Tower' },
  tower: { id: 'stack', title: 'Stack Tower' },
  'stack-tower': { id: 'stack', title: 'Stack Tower' },
  breach: { id: 'cyber-breach', title: 'Cyber Breach' },
  'cyber-breach': { id: 'cyber-breach', title: 'Cyber Breach' },
  cyber: { id: 'cyber-breach', title: 'Cyber Breach' },
  pong: { id: 'pong', title: 'Oracle Pong' },
  'oracle-pong': { id: 'pong', title: 'Oracle Pong' },
  orbit: { id: 'orbit-defense', title: 'Orbit Defense' },
  'orbit-defense': { id: 'orbit-defense', title: 'Orbit Defense' },
  defense: { id: 'orbit-defense', title: 'Orbit Defense' },
  tetris: { id: 'tetris', title: 'Neon Tetris' },
  'neon-tetris': { id: 'tetris', title: 'Neon Tetris' },
  snake: { id: 'snake', title: 'Retro Snake' },
};

export const playCommand: Command = {
  name: 'play',
  aliases: ['launchgame'],
  description: 'Launches a specific retro mini-game by name.',
  execute: (args) => {
    if (args.length === 0) {
      return {
        output: [
          'Usage: play <game>',
          'Available games:',
          '  play stack   - Stack Tower',
          '  play 2048    - Tech Stack 2048',
          '  play breach  - Cyber Breach',
          '  play pong    - Oracle Pong',
          '  play orbit   - Orbit Defense',
          '  play tetris  - Neon Tetris',
          '  play snake   - Retro Snake',
          '',
          'Type "games" to view full game descriptions or "arcade" to open Arcade Center.',
        ],
        success: false,
      };
    }

    const query = args.join('-').toLowerCase();
    const matched = GAME_ALIASES[query] || GAME_ALIASES[args[0].toLowerCase()];

    if (matched) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('launchApp', { detail: matched.id })
        );
        return {
          output: `Launching ${matched.title} [window: ${matched.id}]...`,
          success: true,
        };
      }
      return {
        output: 'Games can only be launched within a browser session.',
        success: false,
      };
    }

    return {
      output: `Unknown game: "${args.join(' ')}". Type "games" to list available titles or "play 2048".`,
      success: false,
    };
  },
};
