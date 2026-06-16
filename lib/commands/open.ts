import { Command } from './types';

export const openCommand: Command = {
  name: 'open',
  aliases: ['goto', 'navigate'],
  description: 'Navigates to a specific portfolio page or project briefing.',
  execute: (args, context) => {
    if (!context.navigate) {
      return {
        output: 'Navigation is not available in this environment.',
        success: false
      };
    }

    if (args.length === 0) {
      return {
        output: [
          'Usage: open <target>',
          'Targets:',
          '  projects           - Navigates to projects portfolio page.',
          '  skills             - Navigates to technical skills page.',
          '  contact            - Navigates to contact form page.',
          '  recruiter          - Navigates to recruiter dashboard.',
          '  orbitair           - Navigates to Orbitair project briefing.',
          '  sahai              - Navigates to Sahai project briefing.',
          '  patient-management - Navigates to Patient Management Service project briefing.'
        ],
        success: false
      };
    }

    const target = args.join(' ').toLowerCase();

    // Map targets to existing routes
    switch (target) {
      case 'projects':
      case 'portfolio':
      case 'work':
        context.navigate('/projects');
        return { output: 'Navigating to projects repository...', success: true };
      case 'skills':
      case 'stack':
      case 'tech':
        context.navigate('/skills');
        return { output: 'Navigating to technical skills...', success: true };
      case 'contact':
      case 'hire':
        context.navigate('/contact');
        return { output: 'Navigating to contact gateway...', success: true };
      case 'recruiter':
      case 'dashboard':
        context.navigate('/recruiter');
        return { output: 'Navigating to recruiter intelligence system...', success: true };
      case 'orbitair':
        context.navigate('/project/orbitair');
        return { output: 'Navigating to ORBITAIR project file...', success: true };
      case 'sahai':
        context.navigate('/project/sahai');
        return { output: 'Navigating to SAHAI project file...', success: true };
      case 'patient-management':
      case 'patient-management-service':
      case 'patientmanagement':
        context.navigate('/project/patient-management-service');
        return { output: 'Navigating to Patient Management Service project file...', success: true };
      default:
        return {
          output: `Unknown navigation target: "${args.join(' ')}". Type "help open" for valid targets.`,
          success: false
        };
    }
  }
};
