import { RepositoryIntelligence } from '../types';

export interface CandidateProfile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  resume: string;
  education: {
    degree: string;
    institution: string;
    location: string;
    cgpa: string;
    expectedGraduation: string;
  };
  interests: string[];
  futureGoals: string[];
}

export interface TechnicalSkillContext {
  name: string;
  category: string;
  level: string;
  description: string;
  associatedProjects: string[]; // Project titles/IDs
  associatedRepositories: string[]; // Repository names
}

export interface ProjectContext {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  featured: boolean;
  source: string;
  problem: string;
  solution: string;
  architecture: string;
  techStack: string[];
  challenges: string[];
  results: string[];
  lessons: string[];
  githubUrl: string;
  liveUrl: string;
  year: string;
  associatedRepositoryName?: string;
}

export interface RepositoryContext {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  starsCount: number;
  forksCount: number;
  language: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  classifications: string[];
  intelligence?: RepositoryIntelligence;
  readmeExcerpt?: string;
}

export interface AchievementContext {
  title: string;
  year: string;
  description: string;
  associatedProjects: string[];
}

export interface TimelineContext {
  year: string;
  milestones: {
    id: string;
    title: string;
    date: string;
    type: string;
    description: string;
    relatedLink?: string;
  }[];
}

export interface TechnologyRelationshipContext {
  technology: string;
  category: string;
  relatedTechnologies: string[]; // Technologies co-used with this skill
  usedInProjects: string[]; // Project titles
  usedInRepositories: string[]; // Repository names
}

export interface RepositoryRelationshipContext {
  repositoryName: string;
  associatedProject?: string;
  skillsRequired: string[];
  starsCount: number;
  complexity: string;
  architecturePattern: string;
}

export interface OracleContext {
  profile: CandidateProfile;
  skills: TechnicalSkillContext[];
  projects: ProjectContext[];
  repositories: RepositoryContext[];
  achievements: AchievementContext[];
  timeline: TimelineContext[];
  technologyRelationships: TechnologyRelationshipContext[];
  repositoryRelationships: RepositoryRelationshipContext[];
  generatedAt: string;
}
