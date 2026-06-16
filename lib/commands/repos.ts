import { Command } from './types';
import { getRepositories } from '@/lib/github/github';

export const reposCommand: Command = {
  name: 'repos',
  aliases: ['repositories', 'github-repos'],
  description: 'Lists public GitHub repositories.',
  execute: async () => {
    const repos = await getRepositories();
    
    const output: string[] = [
      'GITHUB REPOSITORIES STREAM',
      '==================================================',
      'Type "repo <name>" to view detailed metrics and key concepts.',
      'Type "open github" to open the explorer portal.',
      ''
    ];

    repos.forEach((repo, idx) => {
      output.push(`${idx + 1}. ${repo.name} [stars: ${repo.starsCount} | forks: ${repo.forksCount}]`);
      if (repo.description) {
        output.push(`   Description: ${repo.description}`);
      }
      output.push(`   Language:    ${repo.language || 'Unknown'}`);
      output.push(`   URL:         ${repo.htmlUrl}`);
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
