import { Command } from './types';
import { getSkills } from '@/lib/data';

export const skillsCommand: Command = {
  name: 'skills',
  aliases: ['tech', 'stack', 'languages'],
  description: 'Displays categorized technical skills.',
  execute: () => {
    const skills = getSkills();
    
    // Group skills by category
    const categories: { [key: string]: string[] } = {};
    skills.forEach(skill => {
      const cat = skill.category || 'Other';
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(`${skill.name} (${skill.level})`);
    });

    const output: string[] = [
      'TECHNICAL SKILLS',
      '=================================================='
    ];

    for (const [category, skillList] of Object.entries(categories)) {
      output.push(`${category}:`);
      output.push(`  ${skillList.join(', ')}`);
      output.push('');
    }
    
    // Remove last empty line if present
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
