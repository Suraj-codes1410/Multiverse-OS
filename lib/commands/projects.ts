import { Command } from './types';
import { getProjects } from '@/lib/data';

export const projectsCommand: Command = {
  name: 'projects',
  aliases: ['work', 'portfolio'],
  description: 'Displays portfolio projects and details.',
  execute: async (args) => {
    const projects = await getProjects();
    
    if (args.length > 0) {
      // Find details for a specific project
      const query = args.join(' ').toLowerCase();
      const project = projects.find(p => p.title.toLowerCase().includes(query) || p.id.toLowerCase() === query);
      
      if (!project) {
        return {
          output: `No project found matching: "${args.join(' ')}"`,
          success: false
        };
      }

      const output = [
        `PROJECT: ${project.title}`,
        project.subtitle ? `Subtitle: ${project.subtitle}` : '',
        `Year:     ${project.year}`,
        `Status:   ${project.status}`,
        `Tech:     ${project.techStack.join(', ')}`,
        '--------------------------------------------------',
        'Description:',
        `  ${project.description}`,
        '',
        'Problem:',
        `  ${project.problem}`,
        '',
        'Solution:',
        `  ${project.solution}`,
        project.githubUrl ? `GitHub:   ${project.githubUrl}` : '',
        project.liveUrl ? `Live URL: ${project.liveUrl}` : '',
        '=================================================='
      ].filter(line => line !== '');

      return {
        output,
        success: true
      };
    }

    // Default: List all projects
    const output: string[] = [
      'PROJECTS PORTFOLIO',
      '==================================================',
      'Type "projects <name>" to view detailed information on a specific project.',
      ''
    ];

    projects.forEach((project, idx) => {
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
      success: true,
    };
  },
};
