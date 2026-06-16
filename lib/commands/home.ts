import { Command } from './types';

export const homeCommand: Command = {
  name: 'home',
  aliases: ['main'],
  description: 'Navigates back to the home page.',
  execute: (args, context) => {
    if (context.navigate) {
      context.navigate('/');
      return {
        output: 'Navigating to home page...',
        success: true
      };
    }
    return {
      output: 'Navigation is not available in this environment.',
      success: false
    };
  }
};
