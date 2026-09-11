import { Command } from './types';

export const arcadeCommand: Command = {
  name: 'arcade',
  aliases: ['gameshub', 'gamecenter'],
  description: 'Opens the Multiverse Retro Arcade Center.',
  execute: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('launchApp', { detail: 'arcade' }));
      return {
        output: 'Launching Retro Arcade Center...',
        success: true,
      };
    }
    return {
      output: 'Arcade can only be launched within a browser session.',
      success: false,
    };
  },
};
