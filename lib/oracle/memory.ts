import { GitHubRepository, Project } from '@/lib/types';
import { getRepositories } from '@/lib/github/github';
import { getProjects, getSkills } from '@/lib/content/index';
import { QueryIntentClassifier } from './smartRouter';

export interface Interaction {
  query: string;
  response: string;
  referencedRepositories: string[];
  referencedProjects: string[];
  referencedTechnologies: string[];
  referencedSkills: string[];
  timestamp: number;
}

export interface SessionMemory {
  interactions: Interaction[];
}

export class ContextualEntityTracker {
  /**
   * Extracts repositories, projects, technologies, and skills mentioned in any text
   */
  public static async extractEntities(
    text: string,
    repositories: GitHubRepository[],
    projects: Project[]
  ): Promise<{
    repositories: string[];
    projects: string[];
    technologies: string[];
    skills: string[];
  }> {
    const textLower = text.toLowerCase().trim();

    // 1. Repositories and Projects from classifier
    const classification = QueryIntentClassifier.classify(text, repositories, projects);
    const matchedReposAndProjs = classification.extractedEntities.repositories;

    const referencedProjects = matchedReposAndProjs
      .filter(name => projects.some(p => p.id.toLowerCase() === name.toLowerCase()))
      .map(name => {
        const proj = projects.find(p => p.id.toLowerCase() === name.toLowerCase());
        return proj ? proj.id : name;
      });

    const referencedRepositories = matchedReposAndProjs
      .filter(name => repositories.some(r => r.name.toLowerCase() === name.toLowerCase()))
      .map(name => {
        const repo = repositories.find(r => r.name.toLowerCase() === name.toLowerCase());
        return repo ? repo.name : name;
      });

    // 2. Technologies
    const referencedTechnologies = classification.extractedEntities.technologies;

    // 3. Skills
    const referencedSkills: string[] = [];
    try {
      const skills = getSkills();
      skills.forEach(s => {
        const escaped = s.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(textLower)) {
          referencedSkills.push(s.name);
        }
      });
    } catch (e) {
      console.error("Failed to load skills for entity tracker:", e);
    }

    return {
      repositories: Array.from(new Set(referencedRepositories)),
      projects: Array.from(new Set(referencedProjects)),
      technologies: Array.from(new Set(referencedTechnologies)),
      skills: Array.from(new Set(referencedSkills))
    };
  }
}

export class FollowUpResolver {
  /**
   * Detects follow-up questions and expands them using conversation memory history
   */
  public static resolve(
    sessionId: string,
    query: string,
    interactions: Interaction[]
  ): { resolvedQuery: string; hit: boolean; resolvedEntities: string[] } {
    const queryLower = query.toLowerCase().trim();

    // Follow-up phrase detection patterns
    const hasIt = /\b(it)\b/i.test(queryLower);
    const hasThis = /\b(this)\b/i.test(queryLower);
    const hasThat = /\b(that)\b/i.test(queryLower) && !/\b(that project|that repository)\b/i.test(queryLower);
    const hasThatProject = /\b(that project)\b/i.test(queryLower);
    const hasThatRepository = /\b(that repository)\b/i.test(queryLower);
    const hasThisProject = /\b(this project)\b/i.test(queryLower);
    const hasThisRepository = /\b(this repository)\b/i.test(queryLower);
    const hasThisOne = /\b(this one)\b/i.test(queryLower);
    const hasWhichOne = /\b(which one)\b/i.test(queryLower);
    const hasTheOtherOne = /\b(the other one)\b/i.test(queryLower);
    const hasBoth = /\b(both)\b/i.test(queryLower);
    const hasEither = /\b(either)\b/i.test(queryLower);
    const hasWhy = /^\s*why\s*\??\s*$/i.test(queryLower);

    const isFollowUp = (
      hasIt || hasThis || hasThat || hasThatProject || hasThatRepository ||
      hasThisProject || hasThisRepository || hasThisOne || hasWhichOne ||
      hasTheOtherOne || hasBoth || hasEither || hasWhy
    );

    if (!isFollowUp || interactions.length === 0) {
      return { resolvedQuery: query, hit: false, resolvedEntities: [] };
    }

    let resolvedEntities: string[] = [];
    let resolvedQuery = query;

    const lastInteraction = interactions[interactions.length - 1];

    const formatEntity = (name: string) => {
      const upper = name.toUpperCase();
      if (upper === 'SAHAI' || upper === 'ORBITAIR') return upper;
      return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Case 1: Standalone "Why?" follow-up query
    if (hasWhy) {
      const lastQuery = lastInteraction.query;
      const resolved = lastInteraction.referencedProjects[0] || lastInteraction.referencedRepositories[0];
      if (resolved) {
        const formatted = formatEntity(resolved);
        const match = lastQuery.match(/which project (?:best )?demonstrates (.*)/i);
        if (match) {
          resolvedQuery = `Why does ${formatted} best demonstrate ${match[1]}?`;
        } else {
          resolvedQuery = `Why does ${formatted} relate to the previous query: "${lastQuery}"?`;
        }
        resolvedEntities = [formatted];
      }
    }
    // Case 2: Comparison queries ("which one", "both", "either", etc.)
    else if (hasWhichOne || hasThisOne || hasTheOtherOne || hasBoth || hasEither) {
      const prevEntities = [
        ...lastInteraction.referencedProjects,
        ...lastInteraction.referencedRepositories
      ].map(formatEntity);

      const uniquePrev = Array.from(new Set(prevEntities));

      if (uniquePrev.length >= 2) {
        resolvedEntities = uniquePrev.slice(0, 2);
        const joinedAnd = resolvedEntities.join(' and ');
        const joinedOr = resolvedEntities.join(' or ');

        if (hasWhichOne) {
          resolvedQuery = resolvedQuery.replace(/\bwhich one\b/i, `which of ${joinedAnd}`);
        }
        if (hasThisOne) {
          resolvedQuery = resolvedQuery.replace(/\bthis one\b/i, `${resolvedEntities[0]}`);
        }
        if (hasTheOtherOne) {
          resolvedQuery = resolvedQuery.replace(/\bthe other one\b/i, `${resolvedEntities[1]}`);
        }
        if (hasBoth) {
          resolvedQuery = resolvedQuery.replace(/\bboth\b/i, joinedAnd);
        }
        if (hasEither) {
          resolvedQuery = resolvedQuery.replace(/\beither\b/i, joinedOr);
        }
      } else if (uniquePrev.length === 1) {
        resolvedEntities = uniquePrev;
        const formatted = uniquePrev[0];
        resolvedQuery = resolvedQuery.replace(/\b(which one|this one|the other one|both|either)\b/i, formatted);
      }
    }
    // Case 3: Singular pronoun replacement (it, this, that, that project, etc.)
    else {
      let resolved: string | undefined = undefined;

      for (let i = interactions.length - 1; i >= 0; i--) {
        const interaction = interactions[i];

        if (hasThatProject || hasThisProject) {
          if (interaction.referencedProjects.length > 0) {
            resolved = interaction.referencedProjects[0];
            break;
          }
        }
        if (hasThatRepository || hasThisRepository) {
          if (interaction.referencedRepositories.length > 0) {
            resolved = interaction.referencedRepositories[0];
            break;
          }
        }
        if (hasIt || hasThis || hasThat) {
          if (interaction.referencedProjects.length > 0) {
            resolved = interaction.referencedProjects[0];
            break;
          }
          if (interaction.referencedRepositories.length > 0) {
            resolved = interaction.referencedRepositories[0];
            break;
          }
          if (interaction.referencedTechnologies.length > 0) {
            resolved = interaction.referencedTechnologies[0];
            break;
          }
          if (interaction.referencedSkills.length > 0) {
            resolved = interaction.referencedSkills[0];
            break;
          }
        }
      }

      if (resolved) {
        const formatted = formatEntity(resolved);
        resolvedEntities = [formatted];

        if (hasThatProject) {
          resolvedQuery = resolvedQuery.replace(/\bthat project\b/i, formatted);
        }
        if (hasThisProject) {
          resolvedQuery = resolvedQuery.replace(/\bthis project\b/i, formatted);
        }
        if (hasThatRepository) {
          resolvedQuery = resolvedQuery.replace(/\bthat repository\b/i, formatted);
        }
        if (hasThisRepository) {
          resolvedQuery = resolvedQuery.replace(/\bthis repository\b/i, formatted);
        }
        if (hasIt) {
          resolvedQuery = resolvedQuery.replace(/\bit\b/i, formatted);
        }
        if (hasThis) {
          resolvedQuery = resolvedQuery.replace(/\bthis\b/i, formatted);
        }
        if (hasThat) {
          resolvedQuery = resolvedQuery.replace(/\bthat\b/i, formatted);
        }
      }
    }

    const hit = resolvedEntities.length > 0;

    if (hit) {
      console.log("\nFOLLOWUP_DETECTED");
      console.log(`Original:\n${query}\n`);
      console.log("ENTITY_RESOLVED\n");
      resolvedEntities.forEach(e => console.log(e));
      console.log("\nMEMORY_CONTEXT_USED");
      console.log(`Resolved Query:\n${resolvedQuery}\n`);
    }

    return { resolvedQuery, hit, resolvedEntities };
  }
}

export class ConversationalMemoryService {
  private static instance: ConversationalMemoryService | null = null;
  private sessions: Map<string, SessionMemory> = new Map();

  private constructor() {}

  public static getInstance(): ConversationalMemoryService {
    if (!ConversationalMemoryService.instance) {
      ConversationalMemoryService.instance = new ConversationalMemoryService();
    }
    return ConversationalMemoryService.instance;
  }

  public getSession(sessionId: string): SessionMemory {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { interactions: [] });
    }
    return this.sessions.get(sessionId)!;
  }

  /**
   * Stores the interaction and extracts referenced entities from the query/response
   */
  public async store(
    sessionId: string,
    query: string,
    response: string
  ): Promise<void> {
    const repositories = await getRepositories();
    const projects = await getProjects();

    const queryEntities = await ContextualEntityTracker.extractEntities(query, repositories, projects);
    const responseEntities = await ContextualEntityTracker.extractEntities(response, repositories, projects);

    const referencedProjects = Array.from(new Set([...queryEntities.projects, ...responseEntities.projects]));
    const referencedRepositories = Array.from(new Set([...queryEntities.repositories, ...responseEntities.repositories]));
    const referencedTechnologies = Array.from(new Set([...queryEntities.technologies, ...responseEntities.technologies]));
    const referencedSkills = Array.from(new Set([...queryEntities.skills, ...responseEntities.skills]));

    const session = this.getSession(sessionId);
    const interaction: Interaction = {
      query,
      response,
      referencedRepositories,
      referencedProjects,
      referencedTechnologies,
      referencedSkills,
      timestamp: Date.now()
    };

    session.interactions.push(interaction);

    // Limit short-term context to last 10 interactions
    if (session.interactions.length > 10) {
      session.interactions.shift();
    }

    console.log("MEMORY_STORE");
    console.log(`Query: ${query}`);
    console.log(`Referenced Repositories: ${referencedRepositories.join(', ') || 'none'}`);
    console.log(`Referenced Projects: ${referencedProjects.join(', ') || 'none'}`);
    console.log(`Referenced Technologies: ${referencedTechnologies.join(', ') || 'none'}`);
    console.log(`Referenced Skills: ${referencedSkills.join(', ') || 'none'}`);
  }

  /**
   * Resolves query follow-ups and pronouns to their actual context
   */
  public resolve(
    sessionId: string,
    query: string
  ): { resolvedQuery: string; hit: boolean; resolvedEntities: string[] } {
    const session = this.getSession(sessionId);
    return FollowUpResolver.resolve(sessionId, query, session.interactions);
  }

  public clear(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

export const conversationalMemoryService = ConversationalMemoryService.getInstance();
