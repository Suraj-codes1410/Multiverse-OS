import { Command } from './types';
import { getExperience } from '@/lib/data';

export const experienceCommand: Command = {
  name: 'experience',
  aliases: ['jobs', 'history', 'career'],
  description: 'Displays professional work experience.',
  execute: () => {
    const experiences = getExperience();
    
    if (experiences.length === 0) {
      return {
        output: [
          'WORK EXPERIENCE',
          '==================================================',
          'No professional experience entries found.',
          '=================================================='
        ],
        success: true
      };
    }

    const output: string[] = [
      'WORK EXPERIENCE',
      '=================================================='
    ];

    experiences.forEach((exp) => {
      output.push(`Role:        ${exp.role}`);
      output.push(`Company:     ${exp.company}`);
      output.push(`Duration:    ${exp.startDate} - ${exp.endDate}`);
      output.push(`Tech Stack:  ${exp.technologies.join(', ')}`);
      output.push('Description:');
      output.push(`  ${exp.description}`);
      output.push('--------------------------------------------------');
    });

    // Remove the last separator line
    if (output[output.length - 1] === '--------------------------------------------------') {
      output.pop();
    }

    output.push('==================================================');

    return {
      output,
      success: true,
    };
  },
};
