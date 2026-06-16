import { Command } from './types';
import { getPortfolio } from '@/lib/data';

export const contactCommand: Command = {
  name: 'contact',
  aliases: ['email', 'socials', 'phone'],
  description: 'Displays contact and social media information.',
  execute: () => {
    const portfolio = getPortfolio();
    
    const output = [
      'CONTACT INFORMATION',
      '==================================================',
      `Email:    ${portfolio.email}`,
      `Phone:    ${portfolio.phone}`,
      `Location: ${portfolio.location}`,
      '--------------------------------------------------',
      'Social Links:',
      `  GitHub:   ${portfolio.github}`,
      `  LinkedIn: ${portfolio.linkedin}`,
      '=================================================='
    ];

    return {
      output,
      success: true,
    };
  },
};
