import { Command } from './types';
import { getProjects } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const whatCommand: Command = {
  name: 'what',
  aliases: ['technology-usage', 'tech-usage'],
  description: 'Explores and lists all projects, repositories, related technologies, complexity ratings, and architecture patterns utilizing a specific technology.',
  execute: async (args) => {
    if (args.length < 2 || args[0].toLowerCase() !== 'uses') {
      return {
        output: [
          'Usage: what uses <technology>',
          'Examples:',
          '  what uses fastapi',
          '  what uses kafka',
          '  what uses grpc',
          '  what uses react'
        ],
        success: false
      };
    }

    const techQuery = args.slice(1).join(' ').toLowerCase().trim();
    const allProjects = await getProjects();
    const graph = await buildKnowledgeGraph();

    // Dynamically query projects and repositories using metadata, intelligence, and the graph
    const matchingProjects = allProjects.filter(p => {
      // 1. Check project tech stack
      const inTechStack = p.techStack?.some(t => t.toLowerCase() === techQuery);

      // 2. Check repository intelligence extracted technologies
      const inIntelligence = p.intelligence?.technologies?.some(t => t.toLowerCase() === techQuery);

      // 3. Check GitHub repository topics and primary language
      const inRepoTopics = p.githubRepository?.topics?.some(t => t.toLowerCase() === techQuery);
      const isRepoLanguage = p.githubRepository?.language?.toLowerCase() === techQuery;

      // 4. Check Knowledge Graph neighbors
      let inGraph = false;
      const skillNodeId = `skill:${techQuery.replace(/[^a-z0-9]+/g, '-')}`;
      const skillNode = graph.getNode(skillNodeId);
      if (skillNode) {
        const neighbors = graph.getNeighbors(skillNodeId, 'both');
        const connectedProjId = `project:${p.id.toLowerCase()}`;
        const connectedRepoId = `repository:${p.githubRepository?.name.toLowerCase()}`;
        inGraph = neighbors.some(n => n.node.id === connectedProjId || n.node.id === connectedRepoId);
      }

      return inTechStack || inIntelligence || inRepoTopics || isRepoLanguage || inGraph;
    });

    if (matchingProjects.length === 0) {
      return {
        output: [
          `No projects or repositories found utilizing technology: "${techQuery}"`,
          'Verify keyword (e.g. "fastapi", "kafka", "grpc", "react").'
        ],
        success: true
      };
    }

    const output: string[] = [];
    output.push(`TECHNOLOGY UTILIZATION: ${techQuery.toUpperCase()}`);
    output.push('==================================================');

    // 1. Projects
    output.push('Projects');
    matchingProjects.forEach(p => output.push(`  * ${p.title}`));
    output.push('');

    // 2. Repositories
    output.push('Repositories');
    const repoAdded = new Set<string>();
    matchingProjects.forEach(p => {
      if (p.githubRepository && !repoAdded.has(p.githubRepository.name)) {
        repoAdded.add(p.githubRepository.name);
        output.push(`  * ${p.githubRepository.name}`);
      }
    });
    if (repoAdded.size === 0) {
      output.push('  * None');
    }
    output.push('');

    // 3. Related Technologies
    output.push('Related Technologies');
    const relatedTechs = new Set<string>();
    matchingProjects.forEach(p => {
      p.techStack?.forEach(t => {
        if (t.toLowerCase() !== techQuery) {
          relatedTechs.add(t);
        }
      });
      p.intelligence?.technologies?.forEach(t => {
        if (t.toLowerCase() !== techQuery) {
          relatedTechs.add(t);
        }
      });
    });
    if (relatedTechs.size > 0) {
      output.push(`  * ${Array.from(relatedTechs).join(', ')}`);
    } else {
      output.push('  * None');
    }
    output.push('');

    // 4. Complexity
    output.push('Complexity');
    matchingProjects.forEach(p => {
      const rating = p.intelligence?.complexityAnalysis?.overallRating || 'Unknown';
      const score = p.intelligence?.complexityAnalysis?.totalScore;
      const maxScore = p.intelligence?.complexityAnalysis?.maxTotalScore;
      const scoreStr = score !== undefined ? ` (Score: ${score}/${maxScore})` : '';
      output.push(`  * ${p.title}: ${rating}${scoreStr}`);
    });
    output.push('');

    // 5. Architecture Patterns
    output.push('Architecture Patterns');
    matchingProjects.forEach(p => {
      const pattern = p.intelligence?.architectureAnalysis?.architecturePattern || p.architecture || 'Unknown';
      output.push(`  * ${p.title}: ${pattern}`);
    });

    output.push('==================================================');

    return {
      output,
      success: true
    };
  }
};
