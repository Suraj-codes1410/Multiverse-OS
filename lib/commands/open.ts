import { Command } from './types';
import { getRepositories } from '@/lib/github/github';

export const openCommand: Command = {
  name: 'open',
  aliases: ['goto', 'navigate'],
  description: 'Navigates to a specific portfolio page or project briefing.',
  execute: async (args, context) => {
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
          '  timeline           - Navigates to career timeline page.',
          '  contact            - Navigates to contact form page.',
          '  recruiter          - Navigates to recruiter dashboard.',
          '  github             - Navigates to GitHub Explorer portal.',
          '  repo <name>        - Navigates to a specific GitHub repository details page.',
          '  orbitair           - Navigates to Orbitair project briefing.',
          '  sahai              - Navigates to Sahai project briefing.',
          '  patient-management - Navigates to Patient Management Service project briefing.'
        ],
        success: false
      };
    }

    const target = args.join(' ').toLowerCase();

    // 1. Check for Github Explorer portal
    if (target === 'github' || target === 'explorer') {
      context.navigate('/github');
      return { output: 'Navigating to GitHub Explorer portal...', success: true };
    }

    // 2. Check for explicit "open repo <name>"
    if (target.startsWith('repo ')) {
      const repoName = target.slice(5).trim();
      context.navigate(`/github/${repoName}`);
      return { output: `Navigating to repository details: ${repoName}...`, success: true };
    }

    // 3. Fallback direct match with routes
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
      case 'timeline':
      case 'chrono':
      case 'history':
        context.navigate('/timeline');
        return { output: 'Navigating to chronological career datastream...', success: true };
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
    }

    // 4. Check if target matches a repository name dynamically
    try {
      const repos = await getRepositories();
      const matchedRepo = repos.find(r => r.name.toLowerCase() === target);
      if (matchedRepo) {
        context.navigate(`/github/${matchedRepo.name}`);
        return { output: `Navigating to repository details: ${matchedRepo.name}...`, success: true };
      }
    } catch (err) {
      console.error('Error fetching repos for navigation match:', err);
    }

    return {
      output: `Unknown navigation target: "${args.join(' ')}". Type "help open" for valid targets.`,
      success: false
    };
  }
};
