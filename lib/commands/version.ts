import { Command } from './types';

export const versionCommand: Command = {
  name: 'version',
  aliases: ['v', 'ver'],
  description: 'Displays the current Multiverse OS version.',
  execute: () => {
    return {
      output: 'Multiverse OS v0.1',
      success: true,
    };
  },
};
