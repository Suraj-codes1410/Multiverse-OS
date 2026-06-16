import { Command } from './types';
import { getProjects } from '@/lib/data';

export const projectCommand: Command = {
  name: 'project',
  aliases: [],
  description: 'Displays metadata and CLI actions for a specific project.',
  execute: async (args) => {
    if (args.length === 0) {
      return {
        output: [
          'Usage: project <name>',
          'Available Projects:',
          '  orbitair',
          '  sahai',
          '  patient-management'
        ],
        success: false
      };
    }

    const inputName = args.join(' ').toLowerCase();
    
    // Fetch all projects dynamically
    const projects = await getProjects();
    
    // Normalize target id/title mapping
    let targetId = inputName;
    if (inputName === 'patient-management' || inputName === 'patient-management-service' || inputName === 'patientmanagement') {
      targetId = 'patient-management-service';
    }

    const project = projects.find(p => p.id.toLowerCase() === targetId || p.title.toLowerCase().includes(inputName));

    if (!project) {
      return {
        output: `Project "${args.join(' ')}" not found. Try one of: orbitair, sahai, patient-management.`,
        success: false
      };
    }

    // Map the display achievements/results
    const achievementsList = project.results && project.results.length > 0
      ? project.results.map(r => `  * ${r}`)
      : ['  * Successfully designed and deployed project architecture.'];

    // Map open command name
    const openTargetName = project.id === 'patient-management-service' ? 'patient-management' : project.id;

    const output = [
      `PROJECT BRIEFING: ${project.title}`,
      '==================================================',
      `Description:`,
      `  ${project.description}`,
      '',
      `Tech Stack:`,
      `  ${project.techStack.join(', ')}`,
      '',
      `Achievements:`,
      ...achievementsList,
      '',
      `Available Actions:`,
      `  Type: open ${openTargetName} (Navigates directly to this project page)`,
      '=================================================='
    ];

    return {
      output,
      success: true
    };
  }
};
