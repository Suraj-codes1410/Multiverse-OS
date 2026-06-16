import { Command } from './types';
import { getPortfolio } from '@/lib/data';

export const educationCommand: Command = {
  name: 'education',
  aliases: ['edu', 'studies', 'college'],
  description: 'Displays educational background details.',
  execute: () => {
    const portfolio = getPortfolio();
    const edu = portfolio.education;
    
    const output = [
      'EDUCATION BACKGROUND',
      '==================================================',
      `Degree:              ${edu.degree}`,
      `Institution:         ${edu.institution}`,
      `Location:            ${edu.location}`,
      `Current Year:        ${edu.currentYear}`,
      `CGPA:                ${edu.cgpa}`,
      `Expected Graduation: ${edu.expectedGraduation}`,
      '=================================================='
    ];

    return {
      output,
      success: true,
    };
  },
};
