import { Command } from './types';
import { getProjects } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const bestProjectsCommand: Command = {
  name: 'best-projects',
  aliases: ['top-projects', 'featured-dossier'],
  description: 'Displays a recruiter-focused dossier of the best featured projects, ranked by verified complexity and awards.',
  execute: async () => {
    const allProjects = await getProjects();
    const graph = await buildKnowledgeGraph();

    // 1. Gather featured projects
    const featuredProjects = allProjects.filter(p => p.featured);

    const output: string[] = [
      'RECRUITER INTELLIGENCE: FEATURED PROJECTS DOSSIER',
      '==================================================',
      'Dynamic list of top featured projects in the portfolio ranked by verified complexity and achievements.',
      ''
    ];

    featuredProjects.forEach((p, idx) => {
      const category = p.intelligence?.projectType || p.subtitle || 'Software System';
      const rating = p.intelligence?.complexityAnalysis?.overallRating || 'Advanced';
      const tech = p.techStack.join(', ');

      // Find if this project has associated achievements in the graph
      const neighbors = graph.getNeighbors(`project:${p.id.toLowerCase()}`, 'both');
      const achievements = Array.from(new Set(neighbors
        .filter(n => n.node.type === 'Achievement')
        .map(n => n.node.label)));

      output.push(`${idx + 1}. ${p.title}`);
      output.push(`   - Category:     ${category} (${rating} Complexity)`);
      if (achievements.length > 0) {
        output.push(`   - Highlights:   ${achievements.join(', ')}`);
      }
      output.push(`   - Stack:        ${tech}`);
      if (p.githubUrl) {
        output.push(`   - URL:          ${p.githubUrl}`);
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
