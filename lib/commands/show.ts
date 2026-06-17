import { Command } from './types';
import { getProjects } from '@/lib/data';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';
import { classifyRepository } from '@/lib/github/classification';

export const showCommand: Command = {
  name: 'show',
  aliases: ['display', 'list-category'],
  description: 'Discovers and displays projects dynamically filtered by category classifications from the Knowledge Graph.',
  execute: async (args) => {
    if (args.length === 0) {
      // Fetch dynamic categories to present in usage help
      const allProjects = await getProjects();
      const graph = await buildKnowledgeGraph();
      const availableCategories = new Set<string>();

      allProjects.forEach(p => {
        if (p.githubRepository) {
          const classifications = classifyRepository(p.githubRepository, p.intelligence, graph);
          classifications.forEach(c => {
            // Expose meaningful categories to user (exclude 'Open Source' generic category)
            if (c !== 'Open Source') {
              availableCategories.add(c);
            }
          });
        }
      });

      return {
        output: [
          'Usage: show <category> [projects]',
          'Examples:',
          '  show ai projects',
          '  show backend projects',
          '  show distributed-systems projects',
          '  show frontend projects',
          '  show fullstack projects',
          '',
          'Available Dynamic Categories:',
          ...Array.from(availableCategories).map(cat => `  * ${cat}`)
        ],
        success: false
      };
    }

    // Clean arguments to filter out noise like 'projects' or 'project'
    const cleanArgs = args.filter(arg => {
      const l = arg.toLowerCase();
      return l !== 'projects' && l !== 'project';
    });

    const categoryQuery = cleanArgs.join(' ').toLowerCase().trim();

    if (!categoryQuery) {
      return {
        output: [
          'Error: Category name required.',
          'Usage: show <category> [projects]'
        ],
        success: false
      };
    }

    const allProjects = await getProjects();
    const graph = await buildKnowledgeGraph();
    const categoryProjectsMap = new Map<string, typeof allProjects>();

    // Dynamically classify all projects
    allProjects.forEach(p => {
      let classifications: string[] = [];
      if (p.githubRepository) {
        classifications = classifyRepository(p.githubRepository, p.intelligence, graph);
      } else {
        // Fallback: use project's category properties if repository is not present
        const category = p.intelligence?.projectCategory || '';
        if (category) {
          classifications.push(category);
        }
      }

      classifications.forEach(c => {
        if (!categoryProjectsMap.has(c)) {
          categoryProjectsMap.set(c, []);
        }
        categoryProjectsMap.get(c)!.push(p);
      });
    });

    // Normalize category query and keys to perform dynamic matching (no hardcoding)
    const normalize = (cat: string) => {
      return cat
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .replace('engineering', '')
        .replace('development', '');
    };

    const queryNormalized = normalize(categoryQuery);

    let matchedCategoryName: string | undefined = undefined;
    for (const catName of categoryProjectsMap.keys()) {
      if (normalize(catName) === queryNormalized) {
        matchedCategoryName = catName;
        break;
      }
    }

    if (!matchedCategoryName) {
      // Exclude 'Open Source' from listed categories for cleaner discovery
      const categoriesList = Array.from(categoryProjectsMap.keys())
        .filter(c => c !== 'Open Source')
        .map(c => `  * ${c}`);

      return {
        output: [
          `No projects found matching category: "${categoryQuery}"`,
          '',
          'Available Dynamic Categories:',
          ...categoriesList
        ],
        success: true
      };
    }

    const matchedProjects = categoryProjectsMap.get(matchedCategoryName)!;

    const output: string[] = [
      `CATEGORY: ${matchedCategoryName.toUpperCase()}`,
      '==================================================',
      ''
    ];

    matchedProjects.forEach((project, idx) => {
      output.push(`${idx + 1}. ${project.title} (${project.year})`);
      if (project.subtitle) {
        output.push(`   ${project.subtitle}`);
      }
      output.push(`   Tech:   ${project.techStack.join(', ')}`);
      if (project.githubUrl) {
        output.push(`   Link:   ${project.githubUrl}`);
      }
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
