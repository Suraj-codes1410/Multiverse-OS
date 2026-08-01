export interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
  location?: string;
  gpa?: string;
  highlights?: string[];
}

export const education: Education[] = [
  {
    id: 'edu-1',
    institution: 'Technology University',
    degree: 'Bachelor of Science in Computer Science',
    period: '2019 - 2023',
    highlights: [
      'Specialized in Distributed Systems',
      'Deans List academic award',
    ],
  },
];
