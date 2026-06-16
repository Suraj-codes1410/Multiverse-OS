import { Command } from './types';
import { getPortfolio } from '@/lib/data';

export const resumeCommand: Command = {
  name: 'resume',
  aliases: ['cv'],
  description: 'Displays resume actions (view or download).',
  execute: (args) => {
    const portfolio = getPortfolio();
    const resumeUrl = portfolio.resume;

    if (args.length > 0) {
      const action = args[0].toLowerCase();
      if (action === 'view') {
        if (typeof window !== 'undefined') {
          window.open(resumeUrl, '_blank');
          return {
            output: 'Opening resume in a new tab...',
            success: true
          };
        } else {
          return {
            output: 'Server environment detected. Resume action "view" can only run in the browser.',
            success: false
          };
        }
      } else if (action === 'download') {
        if (typeof window !== 'undefined') {
          const link = document.createElement('a');
          link.href = resumeUrl;
          link.download = resumeUrl.substring(resumeUrl.lastIndexOf('/') + 1) || 'resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return {
            output: 'Initiating resume download...',
            success: true
          };
        } else {
          return {
            output: 'Server environment detected. Resume action "download" can only run in the browser.',
            success: false
          };
        }
      } else {
        return {
          output: `Unknown action: "${action}". Available actions: "view", "download".`,
          success: false
        };
      }
    }

    const output = [
      'RESUME ACTIONS',
      '==================================================',
      `Resume File Path: ${resumeUrl}`,
      '--------------------------------------------------',
      'Available Actions:',
      '  resume view      - Opens the resume in a new browser tab.',
      '  resume download  - Triggers a download of the resume file.',
      '=================================================='
    ];

    return {
      output,
      success: true,
    };
  },
};
