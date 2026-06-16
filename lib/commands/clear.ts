import { Command } from './types';

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls', 'clean'],
  description: 'Clears the terminal output.',
  execute: (args, context) => {
    context.clearTerminal();
    return {
      output: '',
      success: true,
    };
  },
};
