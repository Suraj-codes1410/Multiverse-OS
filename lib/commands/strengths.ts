import { Command } from './types';
import { getPortfolio } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const strengthsCommand: Command = {
  name: 'strengths',
  aliases: ['professional-strengths', 'core-skills'],
  description: 'Displays a recruiter-focused summary of key professional strengths, dynamically compiled from the Knowledge Graph.',
  execute: async () => {
    const portfolio = getPortfolio();
    const graph = await buildKnowledgeGraph();

    // 1. Fetch skills and calculate top technologies
    const skills = graph.getNodesByType('Skill');
    const topSkills = skills
      .slice(0, 8)
      .map(s => s.label)
      .join(', ');

    // 2. Fetch advanced repositories count
    const repos = graph.getNodesByType('Repository');
    const advancedRepos = repos.filter(r => r.properties.complexityRating === 'Advanced').length;

    // 3. Gather hackathons/achievements
    const achievements = graph.getNodesByType('Achievement');
    const awards = achievements.map(a => a.label);

    const output: string[] = [
      'RECRUITER INTELLIGENCE: PROFESSIONAL STRENGTHS',
      '==================================================',
      `* Core Domains:        AI & Data Engineering, Distributed Systems, Backend Engineering`,
      `* Top Technologies:    ${topSkills}`,
      `* Code Telemetry:      ${repos.length} Active Repositories (${advancedRepos} rated Advanced by Repository Intelligence)`,
      `* Major Recognitions:`,
    ];

    awards.forEach(award => {
      output.push(`    - ${award}`);
    });

    if (portfolio.education) {
      output.push(`* Academic Status:     Pursuing ${portfolio.education.degree} (CGPA: ${portfolio.education.cgpa})`);
    }

    output.push('==================================================');

    return {
      output,
      success: true
    };
  }
};
