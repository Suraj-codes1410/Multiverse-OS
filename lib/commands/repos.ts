import { Command } from './types';
import { getRepositories } from '@/lib/github/github';
import { getReadmeContent } from '@/lib/github/readme';
import { generateRepositoryIntelligence } from '@/lib/github/intelligence';
import { classifyRepository } from '@/lib/github/classification';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

export const reposCommand: Command = {
  name: 'repos',
  aliases: ['repositories', 'github-repos'],
  description: 'Lists public GitHub repositories and allows filtering by intelligence categories or technologies.',
  execute: async (args) => {
    const repos = await getRepositories();

    if (args.length === 0) {
      // Default behavior: list all repositories
      const output: string[] = [
        'GITHUB REPOSITORIES STREAM',
        '==================================================',
        'Type "repo <name>" to view detailed metrics and key concepts.',
        'Type "open github" to open the explorer portal.',
        'Type "repos <category/technology>" to filter repositories.',
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

    // Dynamic discovery filtering based on repository intelligence & classifications
    const query = args.join(' ').toLowerCase().trim();
    const graph = await buildKnowledgeGraph();

    const matchedRepos: {
      repo: typeof repos[0];
      intelligence: ReturnType<typeof generateRepositoryIntelligence>;
      classifications: string[];
    }[] = [];

    // Analyze each repository dynamically using Repository Intelligence Layer and Classification Engine
    for (const repo of repos) {
      const readme = await getReadmeContent(repo.name);
      const intelligence = generateRepositoryIntelligence(repo, readme);
      const classifications = classifyRepository(repo, intelligence, graph);

      // Normalize helper for data-driven, non-hardcoded comparison
      const normalize = (str: string) => {
        return str
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '')
          .replace('engineering', '')
          .replace('development', '');
      };

      const normQuery = normalize(query);

      const isCategoryMatch = classifications.some(c => normalize(c).includes(normQuery) || normQuery.includes(normalize(c)));
      const isTechMatch = intelligence.technologies.some(t => normalize(t) === normQuery);
      const isNameMatch = normalize(repo.name).includes(normQuery);

      if (isCategoryMatch || isTechMatch || isNameMatch) {
        matchedRepos.push({
          repo,
          intelligence,
          classifications
        });
      }
    }

    if (matchedRepos.length === 0) {
      return {
        output: [
          `No repositories found matching query: "${query}"`,
          'Try keywords like "ai", "backend", "distributed-systems", "fastapi", "kafka".'
        ],
        success: true
      };
    }

    const output: string[] = [
      `REPOSITORY INTELLIGENCE QUERY: ${query.toUpperCase()}`,
      '==================================================',
      ''
    ];

    matchedRepos.forEach((item, idx) => {
      output.push(`${idx + 1}. Repository Name: ${item.repo.name}`);
      output.push(`   Classification:  ${item.classifications.join(', ')}`);
      output.push(`   Technology Stack: ${item.intelligence.technologies.join(', ')}`);
      output.push(`   Complexity:      ${item.intelligence.complexityAnalysis?.overallRating || 'Unknown'}`);
      output.push(`   Repository URL:  ${item.repo.htmlUrl}`);
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
