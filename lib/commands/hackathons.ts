import { Command } from './types';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const hackathonsCommand: Command = {
  name: 'hackathons',
  aliases: ['competitions', 'hacks'],
  description: 'Displays hackathon awards and experience from the Knowledge Graph.',
  execute: async () => {
    const graph = await buildKnowledgeGraph();
    const events = graph.getNodesByType('Timeline Event')
      .filter(e => e.properties.category === 'hackathon');

    if (events.length === 0) {
      return {
        output: [
          'HACKATHONS & COMPETITIONS',
          '==================================================',
          'No hackathon milestones found in the Knowledge Graph.',
          '=================================================='
        ],
        success: true
      };
    }

    events.sort((a, b) => parseInt(b.properties.year || '0', 10) - parseInt(a.properties.year || '0', 10));

    const output: string[] = [
      'HACKATHONS & COMPETITIONS',
      '==================================================',
      ''
    ];

    events.forEach((e, idx) => {
      const dateStr = e.properties.date ? ` (${e.properties.date})` : '';
      output.push(`${idx + 1}. ${e.label}${dateStr}`);
      if (e.properties.description) {
        output.push(`   ${e.properties.description}`);
      }

      // Query Knowledge Graph neighbors for connected projects or achievements
      const neighbors = graph.getNeighbors(e.id, 'both');
      const projects = Array.from(new Set(neighbors.filter(n => n.node.type === 'Project').map(n => n.node.label)));
      const achievements = Array.from(new Set(neighbors.filter(n => n.node.type === 'Achievement').map(n => n.node.label)));

      if (projects.length > 0) {
        output.push(`   Projects:      ${projects.join(', ')}`);
      }
      if (achievements.length > 0) {
        output.push(`   Achievements:  ${achievements.join(', ')}`);
      }
      output.push('');
    });

    if (output[output.length - 1] === '') {
      output.pop();
    }
    output.push('==================================================');

    return {
      output,
      success: true
    };
  }
};
