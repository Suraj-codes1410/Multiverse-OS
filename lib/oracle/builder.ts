import { 
  getPortfolio, 
  getSkills, 
  getAchievements, 
  getProjects, 
  getTimeline,
  buildKnowledgeGraph 
} from '../data';
import { getRepositories } from '../github/github';
import { OracleContext, CandidateProfile, TechnicalSkillContext, ProjectContext, RepositoryContext, AchievementContext, TimelineContext, TechnologyRelationshipContext, RepositoryRelationshipContext } from './types';

export class OracleContextBuilder {
  /**
   * Aggregates and transforms all raw portfolio files and graph nodes into structured context.
   */
  async build(): Promise<OracleContext> {
    // 1. Fetch datasets from all knowledge sources
    const portfolio = getPortfolio();
    const skills = getSkills();
    const achievements = getAchievements();
    const projects = await getProjects();
    const timeline = getTimeline();
    const repositories = await getRepositories();
    const graph = await buildKnowledgeGraph();

    // 2. Build Candidate Profile Context
    const profile: CandidateProfile = {
      name: portfolio.name,
      title: portfolio.title,
      tagline: portfolio.tagline,
      bio: portfolio.bio,
      location: portfolio.location,
      email: portfolio.email,
      github: portfolio.github,
      linkedin: portfolio.linkedin,
      resume: portfolio.resume,
      education: {
        degree: portfolio.education.degree,
        institution: portfolio.education.institution,
        location: portfolio.education.location,
        cgpa: portfolio.education.cgpa,
        expectedGraduation: portfolio.education.expectedGraduation
      },
      interests: portfolio.interests || [],
      futureGoals: portfolio.futureGoals || []
    };

    // 3. Build Technical Skills Context
    const skillContexts: TechnicalSkillContext[] = skills.map(skill => {
      const associatedProjects: string[] = [];
      const associatedRepositories: string[] = [];

      // Query Knowledge Graph neighbors for associations
      const skillNodeId = `skill:${skill.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
      const neighbors = graph.getNeighbors(skillNodeId);
      
      neighbors.forEach(n => {
        if (n.node.type === 'Project') {
          associatedProjects.push(n.node.label);
        } else if (n.node.type === 'Repository') {
          associatedRepositories.push(n.node.label);
        }
      });

      // Fallback: match using local lists if graph traversal is empty
      if (associatedProjects.length === 0 && skill.relatedProjects) {
        skill.relatedProjects.forEach(pid => {
          const proj = projects.find(p => p.id.toLowerCase() === pid.toLowerCase());
          if (proj) associatedProjects.push(proj.title);
        });
      }

      return {
        name: skill.name,
        category: skill.category,
        level: skill.level,
        description: skill.description,
        associatedProjects: Array.from(new Set(associatedProjects)),
        associatedRepositories: Array.from(new Set(associatedRepositories))
      };
    });

    // 4. Build Projects Context
    const projectContexts: ProjectContext[] = projects.map(proj => {
      let associatedRepositoryName: string | undefined = undefined;
      if (proj.githubRepository) {
        associatedRepositoryName = proj.githubRepository.name;
      } else if (proj.githubUrl) {
        const parts = proj.githubUrl.split('/');
        associatedRepositoryName = parts[parts.length - 1];
      }

      return {
        id: proj.id,
        title: proj.title,
        subtitle: proj.subtitle,
        description: proj.description,
        featured: proj.featured,
        source: proj.source,
        problem: proj.problem,
        solution: proj.solution,
        architecture: proj.architecture,
        techStack: proj.techStack,
        challenges: proj.challenges || [],
        results: proj.results || [],
        lessons: proj.lessons || [],
        githubUrl: proj.githubUrl,
        liveUrl: proj.liveUrl,
        year: proj.year,
        associatedRepositoryName
      };
    });

    // 5. Build Repositories Context (linking intelligence metrics)
    const repositoryContexts: RepositoryContext[] = await Promise.all(repositories.map(async repo => {
      const proj = projects.find(p => 
        p.id.toLowerCase() === repo.name.toLowerCase() ||
        p.id.toLowerCase() === repo.name.toLowerCase() + 's' ||
        repo.name.toLowerCase() === p.id.toLowerCase() + 's' ||
        (p.githubUrl && p.githubUrl.toLowerCase().endsWith('/' + repo.name.toLowerCase()))
      );

      const classifications = proj?.githubRepository?.classifications || [];
      const intelligence = proj?.intelligence;
      const readmeExcerpt = proj?.readme ? proj.readme.slice(0, 1200) : undefined;

      return {
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        url: repo.htmlUrl,
        homepage: repo.homepage,
        starsCount: repo.starsCount,
        forksCount: repo.forksCount,
        language: repo.language,
        topics: repo.topics || [],
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
        classifications,
        intelligence,
        readmeExcerpt
      };
    }));

    // 6. Build Achievements Context
    const achievementContexts: AchievementContext[] = achievements.map(ach => {
      const associatedProjects: string[] = [];
      const achNodeId = `achievement:${ach.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
      
      const neighbors = graph.getNeighbors(achNodeId);
      neighbors.forEach(n => {
        if (n.node.type === 'Project') {
          associatedProjects.push(n.node.label);
        }
      });

      return {
        title: ach.title,
        year: ach.year,
        description: ach.description,
        associatedProjects: Array.from(new Set(associatedProjects))
      };
    });

    // 7. Build Chronological Timeline Context
    const timelineMap: {
      [year: string]: {
        id: string;
        title: string;
        date: string;
        type: string;
        description: string;
        relatedLink?: string;
      }[];
    } = {};
    timeline.forEach(event => {
      if (!timelineMap[event.year]) {
        timelineMap[event.year] = [];
      }
      timelineMap[event.year].push({
        id: event.id,
        title: event.title,
        date: event.date,
        type: event.type,
        description: event.description,
        relatedLink: event.relatedLink
      });
    });

    const timelineContexts: TimelineContext[] = Object.entries(timelineMap)
      .map(([year, milestones]) => ({
        year,
        milestones: milestones.sort((a, b) => a.title.localeCompare(b.title))
      }))
      .sort((a, b) => parseInt(b.year) - parseInt(a.year));

    // 8. Build Technology Relationships Context
    const technologyRelationships: TechnologyRelationshipContext[] = graph
      .getNodesByType('Skill')
      .map(skillNode => {
        const relatedTechnologies: string[] = [];
        const usedInProjects: string[] = [];
        const usedInRepositories: string[] = [];

        const neighbors = graph.getNeighbors(skillNode.id);
        neighbors.forEach(n => {
          if (n.node.type === 'Skill') {
            relatedTechnologies.push(n.node.label);
          } else if (n.node.type === 'Project') {
            usedInProjects.push(n.node.label);
          } else if (n.node.type === 'Repository') {
            usedInRepositories.push(n.node.label);
          }
        });

        return {
          technology: skillNode.label,
          category: (skillNode.properties.category as string) || 'Tools',
          relatedTechnologies: Array.from(new Set(relatedTechnologies)),
          usedInProjects: Array.from(new Set(usedInProjects)),
          usedInRepositories: Array.from(new Set(usedInRepositories))
        };
      });

    // 9. Build Repository Relationships Context
    const repositoryRelationships: RepositoryRelationshipContext[] = graph
      .getNodesByType('Repository')
      .map(repoNode => {
        const repositoryName = repoNode.label;
        let associatedProject: string | undefined = undefined;
        const skillsRequired: string[] = [];

        const neighbors = graph.getNeighbors(repoNode.id);
        neighbors.forEach(n => {
          if (n.node.type === 'Project') {
            associatedProject = n.node.label;
          } else if (n.node.type === 'Skill') {
            skillsRequired.push(n.node.label);
          }
        });

        const starsCount = (repoNode.properties.starsCount as number) || 0;
        
        const proj = projects.find(p => 
          p.id.toLowerCase() === repositoryName.toLowerCase() ||
          (p.githubRepository && p.githubRepository.name.toLowerCase() === repositoryName.toLowerCase())
        );

        const complexity = proj?.intelligence?.complexityAnalysis?.overallRating || 'Beginner';
        const architecturePattern = proj?.intelligence?.architectureAnalysis?.architecturePattern || 'Monolith';

        return {
          repositoryName,
          associatedProject,
          skillsRequired: Array.from(new Set(skillsRequired)),
          starsCount,
          complexity,
          architecturePattern
        };
      });

    return {
      profile,
      skills: skillContexts,
      projects: projectContexts,
      repositories: repositoryContexts,
      achievements: achievementContexts,
      timeline: timelineContexts,
      technologyRelationships,
      repositoryRelationships,
      generatedAt: new Date().toISOString()
    };
  }
}
