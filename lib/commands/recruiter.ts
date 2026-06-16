import { Command } from './types';

export const recruiterCommand: Command = {
  name: 'recruiter',
  aliases: ['dashboard'],
  description: 'Navigates directly to the recruiter dashboard.',
  execute: (args, context) => {
    if (context.navigate) {
      context.navigate('/recruiter');
      return {
        output: 'Navigating to recruiter dashboard...',
        success: true
      };
    }
    return {
      output: 'Navigation is not available in this environment.',
      success: false
    };
  }
};
