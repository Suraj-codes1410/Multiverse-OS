export interface Skill {
  name: string;
  category: 'Frontend' | 'Backend' | 'DevOps' | 'AI/ML' | 'Other';
  level: 'Beginner' | 'Intermediate' | 'Expert';
  yearsOfExperience?: number;
  description?: string;
}

export const skills: Skill[] = [
  {
    name: 'React',
    category: 'Frontend',
    level: 'Expert',
    yearsOfExperience: 5,
  },
];
