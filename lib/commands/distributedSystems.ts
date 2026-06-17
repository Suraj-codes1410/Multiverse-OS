import { Command } from './types';
import { getProjects } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const distributedSystemsCommand: Command = {
  name: 'distributed-systems',
  aliases: ['dist-sys-telemetry', 'distributed-dossier'],
  description: 'Displays a recruiter-focused dossier of Distributed Systems and Microservices engineering experience.',
  execute: async () => {
    const allProjects = await getProjects();
    const graph = await buildKnowledgeGraph();

    // 1. Gather Distributed Systems projects dynamically
    const distProjects = allProjects.filter(p => {
      const classifications = p.githubRepository?.classifications || [];
      return classifications.includes('Distributed Systems') || 
             p.intelligence?.projectCategory === 'Distributed Systems' ||
             p.id === 'novadb' || 
             p.id === 'patient-management-service' ||
             p.id === 'logpulse';
    });

    // 2. Compile list of distributed systems related skills
    const dsKeywords = ['go', 'rust', 'kafka', 'grpc', 'docker', 'consensus', 'raft', 'message broker', 'event-driven'];
    const dsSkills = graph.getNodesByType('Skill')
      .filter(s => dsKeywords.some(kw => s.label.toLowerCase().includes(kw)))
      .map(s => s.label);

    const output: string[] = [
      'RECRUITER INTELLIGENCE: DISTRIBUTED SYSTEMS DOSSIER',
      '==================================================',
      'Dynamic telemetry summary of Distributed Systems engineering experience from the Knowledge Graph.',
      '',
      'Key Technologies:',
      `  - ${Array.from(new Set(dsSkills)).slice(0, 10).join(', ')}`,
      '',
      'Distributed Systems Projects:'
    ];

    distProjects.forEach(p => {
      const pattern = p.intelligence?.architectureAnalysis?.architecturePattern || p.architecture || 'Distributed Architecture';
      const tech = p.techStack.join(', ');
      output.push(`  * ${p.title}`);
      output.push(`    - Architecture:  ${pattern}`);
      output.push(`    - Core Stack:    ${tech}`);
      output.push(`    - Complexity:    ${p.intelligence?.complexityAnalysis?.overallRating || 'Advanced'}`);
      output.push('');
    });

    // Extract relevant key concepts from Repository Intelligence
    const dsConcepts = new Set<string>();
    distProjects.forEach(p => {
      p.intelligence?.keyConcepts?.forEach(c => {
        if (c.toLowerCase().includes('raft') || c.toLowerCase().includes('consensus') || c.toLowerCase().includes('event') || c.toLowerCase().includes('rpc') || c.toLowerCase().includes('microservice')) {
          dsConcepts.add(c);
        }
      });
    });

    if (dsConcepts.size > 0) {
      output.push('Verified Concepts:');
      Array.from(dsConcepts).slice(0, 4).forEach(c => {
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
