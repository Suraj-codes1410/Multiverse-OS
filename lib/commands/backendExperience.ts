import { Command } from './types';
import { getProjects } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const backendExperienceCommand: Command = {
  name: 'backend-experience',
  aliases: ['backend-telemetry', 'backend-dossier'],
  description: 'Displays a recruiter-focused dossier of backend engineering experience, skills, and systems architectures.',
  execute: async () => {
    const allProjects = await getProjects();
    const graph = await buildKnowledgeGraph();

    // 1. Gather all backend projects dynamically
    const backendProjects = allProjects.filter(p => {
      const classifications = p.githubRepository?.classifications || [];
      return classifications.includes('Backend Engineering') || p.intelligence?.projectCategory === 'Backend Engineering';
    });

    // 2. Fetch backend skills from Knowledge Graph
    const backendSkills = graph.getNodesByType('Skill')
      .filter(s => s.properties.category === 'Backend' || s.properties.category === 'Database')
      .map(s => s.label);

    const output: string[] = [
      'RECRUITER INTELLIGENCE: BACKEND ENGINEERING DOSSIER',
      '==================================================',
      'Dynamic telemetry summary of Backend Engineering experience extracted from the Knowledge Graph.',
      '',
      'Key Technologies:',
      `  - ${backendSkills.slice(0, 10).join(', ')}`,
      '',
      'Backend Projects & Architectures:'
    ];

    backendProjects.forEach(p => {
      const pattern = p.intelligence?.architectureAnalysis?.architecturePattern || p.architecture || 'Backend Service';
      const tech = p.techStack.join(', ');
      output.push(`  * ${p.title}`);
      output.push(`    - Architecture:  ${pattern}`);
      output.push(`    - Core Stack:    ${tech}`);
      output.push(`    - Complexity:    ${p.intelligence?.complexityAnalysis?.overallRating || 'Advanced'}`);
      output.push('');
    });

    // Extract relevant key concepts from Repository Intelligence
    const backendConcepts = new Set<string>();
    backendProjects.forEach(p => {
      p.intelligence?.keyConcepts?.forEach(c => backendConcepts.add(c));
    });

    if (backendConcepts.size > 0) {
      output.push('Verified Concepts:');
      Array.from(backendConcepts).slice(0, 4).forEach(c => {
        output.push(`  * ${c}`);
      });
    }

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
