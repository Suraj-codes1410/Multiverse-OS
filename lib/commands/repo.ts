import { Command } from './types';
import { getRepositories } from '@/lib/github/github';
import { getReadmeContent } from '@/lib/github/readme';
import { generateRepositoryIntelligence } from '@/lib/github/intelligence';

export const repoCommand: Command = {
  name: 'repo',
  aliases: ['repository'],
  description: 'Displays structural metrics and deterministic intelligence for a specific GitHub repository.',
  execute: async (args) => {
    if (args.length === 0) {
      return {
        output: [
          'Usage: repo <name>',
          'Examples:',
          '  repo orbitair',
          '  repo sahai',
          '  repo patient-management-service'
        ],
        success: false
      };
    }

    const inputName = args.join(' ').toLowerCase();
    const repos = await getRepositories();

    // Match exact or contains name
    const repo = repos.find(r => 
      r.name.toLowerCase() === inputName || 
      r.name.toLowerCase().includes(inputName)
    );

    if (!repo) {
      return {
        output: `Repository "${args.join(' ')}" not found in active data feed. Type "repos" to see all options.`,
        success: false
      };
    }

    const readme = await getReadmeContent(repo.name);
    const intelligence = generateRepositoryIntelligence(repo, readme);

    const output = [
      `REPOSITORY DOSSIER: ${repo.name}`,
      '==================================================',
      `Full Name:    ${repo.fullName}`,
      `Description:  ${repo.description || 'No description provided.'}`,
      `Language:     ${repo.language || 'Unknown'}`,
      `Category:     ${intelligence.projectCategory}`,
      `Project Type: ${intelligence.projectType}`,
      `Tech Stack:   ${intelligence.technologies.join(', ') || 'Not Detected'}`,
      `Topics:       ${repo.topics.join(', ') || 'None declared'}`,
      '--------------------------------------------------',
      'Key Concepts:',
      ...intelligence.keyConcepts.map(c => `  * ${c}`),
      '',
      'Complexity Indicators:',
      ...intelligence.complexityIndicators.map(ci => `  * ${ci}`),
      '',
      'Activity Level:',
      `  ${intelligence.activityLevel} (Last updated: ${new Date(repo.updatedAt).toLocaleDateString()})`,
      '',
      'Available Actions:',
      `  * Type: open repo ${repo.name} (Opens detail page in browser)`,
      `  * Type: open github (Opens Explorer in browser)`,
      '=================================================='
    ];

    return {
      output,
      success: true
    };
  }
};
