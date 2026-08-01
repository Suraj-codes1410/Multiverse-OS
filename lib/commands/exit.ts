import { Command } from './types';

export const exitCommand: Command = {
  name: 'exit',
  aliases: ['gui', 'desktop', 'quit'],
  description:
    'Exits the terminal shell and returns to the GUI desktop workspace.',
  execute: (args, context) => {
    if ((context as any).exit) {
      (context as any).exit();
      return {
        output: 'Exiting terminal and launching GUI desktop...',
        success: true,
      };
    }
    return {
      output: 'Exit command not bound to an active terminal environment.',
      success: false,
    };
  },
};
export default exitCommand;
