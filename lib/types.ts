export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Portfolio {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  resume: string;
  location: string;
  futureGoals: string[];
  interests: string[];
  education: {
    degree: string;
    institution: string;
    location: string;
    cgpa: string;
    currentYear: string;
    expectedGraduation: string;
  };
  socialLinks: SocialLink[]; // Keep for navbar/footer rendering
}

export interface RepositoryIntelligence {
  projectType: string;
  technologies: string[];
  keyConcepts: string[];
  projectCategory: string;
  complexityIndicators: string[];
  activityLevel: 'High' | 'Medium' | 'Low' | 'Stable Archive';
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  featured: boolean;
  source: 'manual' | 'github';
  problem: string;
  solution: string;
  architecture: string;
  techStack: string[];
  challenges: string[];
  results: string[];
  lessons: string[];
  githubUrl: string;
  liveUrl: string;
  status: string;
  year: string;
  // Connected GitHub Metadata (Phase 3.5.7)
  githubRepository?: GitHubRepository;
  readme?: string;
  intelligence?: RepositoryIntelligence;
}

export interface Skill {
  name: string;
  category: 'Backend' | 'Frontend' | 'Database' | 'Cloud' | 'AI / ML' | 'Tools';
  level: string;
  description: string;
  relatedProjects: string[];
  relatedTechnologies?: string[];
  relatedDomain?: string;
}

export interface Universe {
  id: string;
  name: string;
  description: string;
  status: 'locked' | 'unlocked';
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export interface Achievement {
  title: string;
  year: string;
  description: string;
}

// GitHub specific repository type mapping
export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  starsCount: number;
  forksCount: number;
  language: string | null;
  topics: string[];
  updatedAt: string;
  createdAt: string;
  classifications?: string[];
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  year: string;
  type: 'project' | 'hackathon' | 'achievement' | 'education' | 'milestone';
  description: string;
  relatedLink?: string;
  icon?: string;
}

