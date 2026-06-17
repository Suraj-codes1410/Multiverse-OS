import { Command } from './types';
import { getProjects } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const aiExperienceCommand: Command = {
  name: 'ai-experience',
  aliases: ['ai-telemetry', 'ai-dossier'],
  description: 'Displays a recruiter-focused dossier of Artificial Intelligence and Data Engineering experience.',
  execute: async () => {
    const allProjects = await getProjects();
    const graph = await buildKnowledgeGraph();

    // 1. Gather AI/ML and Data engineering projects dynamically
    const aiProjects = allProjects.filter(p => {
      const classifications = p.githubRepository?.classifications || [];
      return classifications.includes('AI Engineering') || 
             classifications.includes('Data Engineering') || 
             p.intelligence?.projectCategory === 'AI & Data Engineering';
    });

    // 2. Fetch AI/ML skills from Knowledge Graph
    const aiSkills = graph.getNodesByType('Skill')
      .filter(s => s.properties.category === 'AI / ML' || s.label.toLowerCase() === 'pinecone' || s.label.toLowerCase() === 'timescaledb')
      .map(s => s.label);

    const output: string[] = [
      'RECRUITER INTELLIGENCE: AI & DATA ENGINEERING DOSSIER',
      '==================================================',
      'Dynamic telemetry summary of Artificial Intelligence & Data Engineering experience from the Knowledge Graph.',
      '',
      'Key Technologies:',
      `  - ${aiSkills.slice(0, 10).join(', ')}`,
      '',
      'AI & Data Projects:'
    ];

    aiProjects.forEach(p => {
      const desc = p.subtitle || p.description;
      const tech = p.techStack.join(', ');
      output.push(`  * ${p.title}`);
      output.push(`    - Focus:       ${desc}`);
      output.push(`    - Core Stack:  ${tech}`);
      output.push(`    - Complexity:  ${p.intelligence?.complexityAnalysis?.overallRating || 'Advanced'}`);
      output.push('');
    });

    // Extract relevant key concepts from Repository Intelligence
    const aiConcepts = new Set<string>();
    aiProjects.forEach(p => {
      p.intelligence?.keyConcepts?.forEach(c => {
        if (c.toLowerCase().includes('rag') || c.toLowerCase().includes('vector') || c.toLowerCase().includes('spatial') || c.toLowerCase().includes('agent')) {
          aiConcepts.add(c);
        }
      });
    });

    if (aiConcepts.size > 0) {
      output.push('Verified Concepts:');
      Array.from(aiConcepts).slice(0, 4).forEach(c => {
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
