import { Command } from './types';

export const gamesCommand: Command = {
  name: 'games',
  aliases: ['listgames', 'gamelist'],
  description: 'Lists all 7 available mini-games with descriptions.',
  execute: () => {
    return {
      output: [
        'MULTIVERSE_OS // ARCADE TITLES:',
        '  1. stack         - Stack Tower: Build the tallest tower. Perfect stacks = no cuts',
        '  2. stack-2048    - Tech Stack 2048: Merge your stack to Multiverse-OS',
        '  3. cyber-breach  - Cyber Breach: Decrypt 5-letter tech keywords',
        '  4. pong          - Oracle Pong: Beat the Oracle AI in table tennis',
        '  5. orbit-defense - Orbit Defense: Defend Earth in the NASA universe',
        '  6. tetris        - Neon Tetris: Classic blocks, neon style',
        '  7. snake         - Retro Snake: The original, refactored',
        '',
        'To launch a game, type: play <name> (e.g. "play stack", "play 2048", "play snake")',
        'Or type "arcade" to open the interactive Retro Arcade Center.',
      ],
      success: true,
    };
  },
};
