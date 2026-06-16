import { Command } from './types';
import { getPortfolio } from '@/lib/data';

export const aboutCommand: Command = {
  name: 'about',
  aliases: ['bio', 'info'],
  description: 'Displays name, professional title, education summary, and biography.',
  execute: () => {
    const portfolio = getPortfolio();
    const edu = portfolio.education;
    
    const output = [
      'ABOUT ME',
      '==================================================',
      `Name:        ${portfolio.name}`,
      `Title:       ${portfolio.title}`,
      `Location:    ${portfolio.location}`,
      '--------------------------------------------------',
      'Education:',
      `  ${edu.degree}`,
      `  ${edu.institution} (${edu.currentYear})`,
      `  CGPA: ${edu.cgpa} | Expected: ${edu.expectedGraduation}`,
      '--------------------------------------------------',
      'Summary:',
      `  ${portfolio.bio || portfolio.tagline}`,
      '=================================================='
    ];

    return {
      output,
      success: true,
    };
  },
};
