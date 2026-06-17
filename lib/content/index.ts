import portfolioData from '@/data/portfolio.json';
import projectsData from '@/data/projects.json';
import skillsData from '@/data/skills.json';
import universesData from '@/data/universes.json';
import experienceData from '@/data/experience.json';
import achievementsData from '@/data/achievements.json';
import githubConfig from '@/data/github-config.json';
import timelineData from '@/data/timeline.json';

import { Portfolio, Project, Skill, Universe, Experience, Achievement, TimelineMilestone } from '../types';
import { getRepositories } from '../github/github';
import { getReadmeContent } from '../github/readme';
import { generateRepositoryIntelligence } from '../github/intelligence';
import { classifyRepository } from '../github/classification';

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
  const enrichedManuals = await Promise.all(manuals.map(async (project) => {
    const matchingRepo = repos.find(repo => repo.name.toLowerCase() === project.id.toLowerCase());
    if (matchingRepo) {
      const readme = await getReadmeContent(matchingRepo.name);
      const intelligence = generateRepositoryIntelligence(matchingRepo, readme, project);
      const classifications = classifyRepository(matchingRepo, intelligence);
      return {
        ...project,
        githubUrl: project.githubUrl || matchingRepo.htmlUrl,
        liveUrl: project.liveUrl || matchingRepo.homepage || '',
        techStack: Array.from(new Set([
          ...project.techStack, 
          ...(matchingRepo.language ? [matchingRepo.language] : [])
        ])),
        githubRepository: {
          ...matchingRepo,
          classifications
        },
        readme,
        intelligence
      };
    }
    return project;
  }));

  const manualIds = manuals.map(m => m.id.toLowerCase());
  const pureGithubProjects: Project[] = [];

  // Synchronize any pure GitHub projects that aren't defined manually
  for (const repo of repos) {
    const isManual = manualIds.includes(repo.name.toLowerCase());
    const config = githubConfig.syncRepositories.find(
      (r: { name: string; featured?: boolean; portfolioVisible?: boolean; highlighted?: boolean }) => r.name.toLowerCase() === repo.name.toLowerCase()
    );

    if (!isManual && config && config.portfolioVisible) {
      const readme = await getReadmeContent(repo.name);
      const intelligence = generateRepositoryIntelligence(repo, readme);
      const classifications = classifyRepository(repo, intelligence);
      
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
        year: new Date(repo.createdAt).getFullYear().toString(),
        githubRepository: {
          ...repo,
          classifications
        },
        readme,
        intelligence
      });
    }
  }

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

export function getTimeline(): TimelineMilestone[] {
  return timelineData as TimelineMilestone[];
}
