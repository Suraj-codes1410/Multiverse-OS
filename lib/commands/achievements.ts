import { Command } from './types';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const achievementsCommand: Command = {
  name: 'achievements',
  aliases: ['awards', 'honors'],
  description: 'Displays achievements and hackathon awards from the Knowledge Graph.',
  execute: async () => {
    const graph = await buildKnowledgeGraph();
    const achievements = graph.getNodesByType('Achievement');
    
    if (achievements.length === 0) {
      return {
        output: [
          'ACHIEVEMENTS & AWARDS',
          '==================================================',
          'No achievements found in the Knowledge Graph.',
          '=================================================='
        ],
        success: true
      };
    }

    achievements.sort((a, b) => parseInt(b.properties.year || '0', 10) - parseInt(a.properties.year || '0', 10));

    const output: string[] = [
      'ACHIEVEMENTS & AWARDS',
      '==================================================',
      ''
    ];

    achievements.forEach((ach, idx) => {
      const dateStr = ach.properties.year ? ` (${ach.properties.year})` : '';
      output.push(`${idx + 1}. ${ach.label}${dateStr}`);
      if (ach.properties.description) {
        output.push(`   ${ach.properties.description}`);
      }
      
      // Query Knowledge Graph neighbors for related projects or skills
      const neighbors = graph.getNeighbors(ach.id, 'both');
      const projects = Array.from(new Set(neighbors.filter(n => n.node.type === 'Project').map(n => n.node.label)));
      const skills = Array.from(new Set(neighbors.filter(n => n.node.type === 'Skill').map(n => n.node.label)));
      
      if (projects.length > 0) {
        output.push(`   Related Projects: ${projects.join(', ')}`);
      }
      if (skills.length > 0) {
        output.push(`   Related Skills:   ${skills.join(', ')}`);
      }
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
