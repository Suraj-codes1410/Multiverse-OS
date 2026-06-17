import { Command } from './types';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const milestonesCommand: Command = {
  name: 'milestones',
  aliases: ['career-milestones', 'events'],
  description: 'Displays academic and career milestones from the Knowledge Graph.',
  execute: async () => {
    const graph = await buildKnowledgeGraph();
    const events = graph.getNodesByType('Timeline Event')
      .filter(e => e.properties.category === 'education' || e.properties.category === 'milestone' || e.properties.category === 'achievement');

    if (events.length === 0) {
      return {
        output: [
          'CAREER MILESTONES',
          '==================================================',
          'No milestones found in the Knowledge Graph.',
          '=================================================='
        ],
        success: true
      };
    }

    events.sort((a, b) => parseInt(b.properties.year || '0', 10) - parseInt(a.properties.year || '0', 10));

    const output: string[] = [
      'CAREER MILESTONES',
      '==================================================',
      ''
    ];

    events.forEach((e, idx) => {
      const dateStr = e.properties.date ? ` (${e.properties.date})` : '';
      const catName = String(e.properties.category || 'EVENT').toUpperCase();
      output.push(`${idx + 1}. ${e.label}${dateStr} [${catName}]`);
      if (e.properties.description) {
        output.push(`   ${e.properties.description}`);
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
