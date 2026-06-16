import { Command } from './types';
import { getAchievements } from '@/lib/data';

export const achievementsCommand: Command = {
  name: 'achievements',
  aliases: ['awards', 'honors'],
  description: 'Displays achievements and hackathon awards.',
  execute: () => {
    const achievements = getAchievements();
    
    if (achievements.length === 0) {
      return {
        output: [
          'ACHIEVEMENTS & AWARDS',
          '==================================================',
          'No achievements found.',
          '=================================================='
        ],
        success: true
      };
    }

    const output: string[] = [
      'ACHIEVEMENTS & AWARDS',
      '=================================================='
    ];

    achievements.forEach((ach) => {
      output.push(`* ${ach.title} (${ach.year})`);
      output.push(`  ${ach.description}`);
      output.push('');
    });

    if (output[output.length - 1] === '') {
      output.pop();
    }
    output.push('==================================================');

    return {
      output,
      success: true,
    };
  },
};
