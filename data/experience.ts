export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  period: string;
  description: string[];
  technologies?: string[];
}

export const experience: WorkExperience[] = [
  {
    id: 'job-1',
    company: 'Company Alpha',
    role: 'Senior Software Engineer',
    period: '2023 - Present',
    description: [
      'Lead engineering efforts on visual portal design tokens.',
      'Refactored bundle structures reducing hydrate lag times.',
    ],
    technologies: ['TypeScript', 'Next.js', 'React'],
  }
];
