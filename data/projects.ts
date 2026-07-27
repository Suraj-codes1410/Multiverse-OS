export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  role?: string;
  highlights?: string[];
}

export const projects: Project[] = [
  {
    id: 'multiverse-os',
    title: 'Multiverse-OS',
    description: 'The core platform hosting the 3D visual cyberspace portfolio and intelligence systems.',
    technologies: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Framer Motion'],
    role: 'Frontend Architect',
  }
];
