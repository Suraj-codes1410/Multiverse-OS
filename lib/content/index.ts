import portfolioData from '@/data/portfolio.json';
import projectsData from '@/data/projects.json';
import skillsData from '@/data/skills.json';
import universesData from '@/data/universes.json';
import experienceData from '@/data/experience.json';
import achievementsData from '@/data/achievements.json';
import githubConfig from '@/data/github-config.json';

import { Portfolio, Project, Skill, Universe, Experience, Achievement } from '../types';
import { getRepositories } from '../github/github';

export function getPortfolio(): Portfolio {
  return portfolioData as Portfolio;
}

export function getSkills(): Skill[] {
  return skillsData as Skill[];
}

export function getUniverses(): Universe[] {
  return universesData as Universe[];
}

export function getExperience(): Experience[] {
  return experienceData as Experience[];
}

export function getAchievements(): Achievement[] {
  return achievementsData as Achievement[];
}

// Aggregates manual projects and synchronizes dynamic GitHub repositories
export async function getProjects(): Promise<Project[]> {
  const manuals = projectsData as Project[];
  const repos = await getRepositories();

  // Enrich manually curated projects with GitHub repository statistics if they match
  const enrichedManuals = manuals.map(project => {
    const matchingRepo = repos.find(repo => repo.name.toLowerCase() === project.id.toLowerCase());
    if (matchingRepo) {
      return {
        ...project,
        githubUrl: project.githubUrl || matchingRepo.htmlUrl,
        liveUrl: project.liveUrl || matchingRepo.homepage || '',
        techStack: Array.from(new Set([
          ...project.techStack, 
          ...(matchingRepo.language ? [matchingRepo.language] : [])
        ]))
      };
    }
    return project;
  });

  const manualIds = manuals.map(m => m.id.toLowerCase());
  const pureGithubProjects: Project[] = [];

  // Synchronize any pure GitHub projects that aren't defined manually
  repos.forEach(repo => {
    const isManual = manualIds.includes(repo.name.toLowerCase());
    const config = githubConfig.syncRepositories.find(
      (r: any) => r.name.toLowerCase() === repo.name.toLowerCase()
    );

    if (!isManual && config && config.portfolioVisible) {
      pureGithubProjects.push({
        id: repo.name.toLowerCase(),
        title: repo.name,
        subtitle: repo.language || 'GitHub Repository',
        description: repo.description || 'Synchronized repository from GitHub.',
        featured: config.featured || false,
        source: 'github',
        problem: 'No manual problem statement defined. Synced dynamically from GitHub repository.',
        solution: repo.description || 'Dynamic code repository.',
        architecture: 'Refer to source files in repository root.',
        techStack: repo.language ? [repo.language] : [],
        challenges: [],
        results: [],
        lessons: [],
        githubUrl: repo.htmlUrl,
        liveUrl: repo.homepage || '',
        status: 'Synced',
        year: new Date(repo.createdAt).getFullYear().toString()
      });
    }
  });

  return [...enrichedManuals, ...pureGithubProjects];
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const all = await getProjects();
  return all.find(p => p.id.toLowerCase() === id.toLowerCase());
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const all = await getProjects();
  return all.filter(p => p.featured);
}
