import { Command } from './types';

export const oracleCommand: Command = {
  name: 'oracle',
  aliases: ['ai', 'chat', 'ask'],
  description: 'Launch AI Portfolio Intelligence.',
  execute: (args, context) => {
    if (context && typeof (context as any).openOracle === 'function') {
      (context as any).openOracle();
      return {
        output: 'Launching Oracle AI Portfolio Intelligence...',
        success: true,
      };
    }
    return {
      output: 'Oracle system can only be launched within a browser session.',
      success: false,
    };
  },
};
