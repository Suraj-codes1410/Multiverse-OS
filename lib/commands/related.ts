import { Command } from './types';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const relatedCommand: Command = {
  name: 'related',
  aliases: ['connections', 'neighbors', 'links'],
  description: 'Explores and lists all related projects, repositories, skills, and achievements for a given entity in the Knowledge Graph.',
  execute: async (args) => {
    if (args.length === 0) {
      return {
        output: [
          'Usage: related <entity-name>',
          'Examples:',
          '  related orbitair',
          '  related kafka',
          '  related fastapi'
        ],
        success: false
      };
    }

    const query = args.join(' ').toLowerCase().trim();
    const graph = await buildKnowledgeGraph();

    // Find nodes matching the target query
    const matches = graph.search(query);

    if (matches.length === 0) {
      return {
        output: [
          `No records found matching "${args.join(' ')}" in the Knowledge Graph.`,
          'Verify keywords (e.g. "orbitair", "kafka", "fastapi").'
        ],
        success: true
      };
    }

    const output: string[] = [];

    matches.forEach((node, index) => {
      if (index > 0) {
        output.push('');
        output.push('--------------------------------------------------');
        output.push('');
      }

      output.push(`EXPLORING RELATIONSHIPS FOR: [${node.type.toUpperCase()}] ${node.label}`);
      output.push('==================================================');

      // Traversal: Get neighbors of the matching node
      const neighbors = graph.getNeighbors(node.id, 'both');

      if (neighbors.length === 0) {
        output.push('No direct relationships mapped in the Knowledge Graph.');
        return;
      }

      // Group neighbors by node types
      const projects: string[] = [];
      const repositories: string[] = [];
      const skills: string[] = [];
      const achievements: string[] = [];
      const others: string[] = [];

      const seenNodeIds = new Set<string>();
      neighbors.forEach(n => {
        if (seenNodeIds.has(n.node.id)) {
          return;
        }
        seenNodeIds.add(n.node.id);

        const desc = n.relationship.properties?.description || n.relationship.type;
        const entry = `- ${n.node.label} (${desc})`;

        switch (n.node.type) {
          case 'Project':
            projects.push(entry);
            break;
          case 'Repository':
            repositories.push(entry);
            break;
          case 'Skill':
            skills.push(entry);
            break;
          case 'Achievement':
            achievements.push(entry);
            break;
          default:
            others.push(`- [${n.node.type.toUpperCase()}] ${n.node.label} (${desc})`);
            break;
        }
      });

      // Display results under requested groups
      if (projects.length > 0) {
        output.push('Related Projects');
        projects.forEach(p => output.push(`  ${p}`));
        output.push('');
      }

      if (repositories.length > 0) {
        output.push('Related Repositories');
        repositories.forEach(r => output.push(`  ${r}`));
        output.push('');
      }

      if (skills.length > 0) {
        output.push('Related Skills');
        skills.forEach(s => output.push(`  ${s}`));
        output.push('');
      }

      if (achievements.length > 0) {
        output.push('Related Achievements');
        achievements.forEach(a => output.push(`  ${a}`));
        output.push('');
      }

      if (others.length > 0) {
        output.push('Other Relationships:');
        others.forEach(o => output.push(`  ${o}`));
        output.push('');
      }

      // Trim trailing empty line of each section block
      if (output[output.length - 1] === '') {
        output.pop();
      }
    });

    output.push('==================================================');

    return {
      output,
      success: true
    };
  }
};
