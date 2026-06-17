import { Command } from './types';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const findCommand: Command = {
  name: 'find',
  aliases: ['search', 'lookup'],
  description: 'Exposes Knowledge Graph details and semantic relationships for a technology or entity.',
  execute: async (args) => {
    if (args.length === 0) {
      return {
        output: [
          'Usage: find <technology/skill/project/repository>',
          'Examples:',
          '  find fastapi',
          '  find kafka',
          '  find react',
          '  find orbitair'
        ],
        success: false
      };
    }

    const query = args.join(' ').toLowerCase().trim();
    const graph = await buildKnowledgeGraph();

    // Query nodes matching the search criteria
    const matches = graph.search(query);

    if (matches.length === 0) {
      return {
        output: [
          `No records found matching "${args.join(' ')}" in the Knowledge Graph.`,
          'Please verify the search keyword.'
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

      output.push(`MATCHED ENTITY: [${node.type.toUpperCase()}] ${node.label}`);
      output.push('==================================================');
      output.push(`ID:          ${node.id}`);
      
      if (node.properties.description) {
        output.push(`Description: ${node.properties.description}`);
      }
      if (node.properties.category) {
        output.push(`Category:    ${node.properties.category}`);
      }
      if (node.properties.level) {
        output.push(`Level:       ${node.properties.level}`);
      }
      if (node.properties.language) {
        output.push(`Language:    ${node.properties.language}`);
      }
      if (node.properties.url) {
        output.push(`URL:         ${node.properties.url}`);
      }
      if (node.properties.year) {
        output.push(`Year:        ${node.properties.year}`);
      }

      // Fetch neighbors / connected relationships
      const neighbors = graph.getNeighbors(node.id, 'both');
      
      if (neighbors.length > 0) {
        output.push('');
        output.push('CONNECTED ENTITIES IN KNOWLEDGE GRAPH:');

        // Group neighbors by their node type
        const grouped: { [type: string]: string[] } = {};
        neighbors.forEach(n => {
          const type = n.node.type;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          const relDesc = n.relationship.properties?.description || n.relationship.type;
          grouped[type].push(`${n.node.label} (${relDesc})`);
        });

        for (const [type, list] of Object.entries(grouped)) {
          output.push(`  * ${type}s:`);
          list.forEach(item => {
            output.push(`    - ${item}`);
          });
        }
      }
    });

    output.push('==================================================');

    return {
      output,
      success: true
    };
  }
};
