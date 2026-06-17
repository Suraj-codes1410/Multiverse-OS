import { Command } from './types';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const timelineCommand: Command = {
  name: 'timeline',
  aliases: ['history', 'career-path'],
  description: 'Displays a chronological timeline of career milestones, education, projects, and achievements.',
  execute: async () => {
    const graph = await buildKnowledgeGraph();
    const events = graph.getNodesByType('Timeline Event');

    if (events.length === 0) {
      return {
        output: [
          'CAREER TIMELINE',
          '==================================================',
          'No timeline events found in the Knowledge Graph.',
          '=================================================='
        ],
        success: true
      };
    }

    // Sort events chronologically
    events.sort((a, b) => {
      const yearA = parseInt(a.properties.year || '0', 10);
      const yearB = parseInt(b.properties.year || '0', 10);
      if (yearA !== yearB) return yearA - yearB;
      
      const dateA = new Date(a.properties.date || '');
      const dateB = new Date(b.properties.date || '');
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateA.getTime() - dateB.getTime();
      }
      return 0;
    });

    // Group by year
    const grouped: { [year: string]: typeof events } = {};
    events.forEach(e => {
      const year = e.properties.year || 'Unknown';
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(e);
    });

    const output: string[] = [
      'CAREER TIMELINE',
      '==================================================',
      ''
    ];

    Object.keys(grouped).sort().forEach(year => {
      output.push(year);
      output.push('--------------------------------------------------');
      grouped[year].forEach(e => {
        const dateStr = e.properties.date ? ` (${e.properties.date})` : '';
        const typeStr = e.properties.category ? ` [${e.properties.category.toUpperCase()}]` : '';
        output.push(`* ${e.label}${dateStr}${typeStr}`);
        if (e.properties.description) {
          output.push(`  ${e.properties.description}`);
        }
        output.push('');
      });
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
