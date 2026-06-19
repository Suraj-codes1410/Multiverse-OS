import { OracleContext, ProjectContext, RepositoryContext, TechnicalSkillContext, AchievementContext, TimelineContext } from './types';
import { EntityResolver } from './entityResolver';
import { GraphTraversalService } from './graphTraversal';
import { TechnologyLookupService } from '../github/technologyIndex';
import { RepositoryComparisonService } from '../github/repositoryComparison';
import { RecruiterInsightService } from '../github/recruiterInsights';
import { RelationshipDiscoveryService } from '../knowledge/relationshipDiscoveryService';

export interface SelectedContext {
  profile: OracleContext['profile'];
  skills: TechnicalSkillContext[];
  projects: ProjectContext[];
  repositories: RepositoryContext[];
  achievements: AchievementContext[];
  timeline: TimelineContext[];
  selectedSections: string[];
}

export class OracleContextSelector {
  private static entityResolver = new EntityResolver();
  private static traversalService = new GraphTraversalService();
  private static techLookupService = new TechnologyLookupService();
  private static comparisonService = new RepositoryComparisonService();
  private static recruiterInsightService = new RecruiterInsightService();
  private static isInitialized = false;

  private static async ensureInitialized() {
    if (!this.isInitialized) {
      await this.traversalService.init();
      await this.techLookupService.init();
      this.isInitialized = true;
    }
  }

  static async select(
    query: string, 
    context: OracleContext
  ): Promise<SelectedContext & { resolvedEntity: string; traversedRelationships: string[]; repositoryMetadata?: string }> {
    await this.ensureInitialized();
    const graph = this.traversalService.getGraph();
    const queryLower = query.toLowerCase().trim();

    // Initialize clean collections
    const selectedSkills: TechnicalSkillContext[] = [];
    const selectedProjects: ProjectContext[] = [];
    const selectedRepos: RepositoryContext[] = [];
    const selectedAchievements: AchievementContext[] = [];
    const selectedTimeline: TimelineContext[] = [];
    const selectedSections: string[] = [];
    const traversedRelationships: string[] = [];
    let resolvedEntity = 'None';

    // Helper functions to find and push items from full context
    const addSkill = (name: string) => {
      const item = context.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (item && !selectedSkills.some(s => s.name === item.name)) {
        selectedSkills.push(item);
      }
    };
    
    const addProject = (titleOrId: string) => {
      const item = context.projects.find(p => 
        p.title.toLowerCase() === titleOrId.toLowerCase() || 
        p.id.toLowerCase() === titleOrId.toLowerCase()
      );
      if (item && !selectedProjects.some(p => p.id === item.id)) {
        selectedProjects.push(item);
      }
    };

    const addRepo = (name: string) => {
      const item = context.repositories.find(r => r.name.toLowerCase() === name.toLowerCase());
      if (item && !selectedRepos.some(r => r.name === item.name)) {
        selectedRepos.push(item);
      }
    };

    const addAchievement = (title: string) => {
      const item = context.achievements.find(a => a.title.toLowerCase() === title.toLowerCase());
      if (item && !selectedAchievements.some(a => a.title === item.title)) {
        selectedAchievements.push(item);
      }
    };

    const addTimelineYear = (year: string) => {
      const item = context.timeline.find(t => t.year === year);
      if (item && !selectedTimeline.some(t => t.year === item.year)) {
        selectedTimeline.push(item);
      }
    };

    // Helper: traverse neighbors of a given node
    const traverseAndAssemble = (nodeId: string) => {
      const node = graph.getNode(nodeId);
      if (!node) return;

      if (node.type === 'Project') addProject(node.label);
      if (node.type === 'Repository') addRepo(node.label);
      if (node.type === 'Skill') addSkill(node.label);
      if (node.type === 'Achievement') addAchievement(node.label);

      const neighbors = graph.getNeighbors(nodeId);
      neighbors.forEach(n => {
        const edgeDesc = `${node.label} -[${n.relationship.type}]-> ${n.node.label}`;
        traversedRelationships.push(edgeDesc);

        if (n.node.type === 'Project') addProject(n.node.label);
        if (n.node.type === 'Repository') addRepo(n.node.label);
        if (n.node.type === 'Skill') addSkill(n.node.label);
        if (n.node.type === 'Achievement') addAchievement(n.node.label);
      });
    };

    // 1. Check for SHARED technology queries
    // "What technologies connect SAHAI and ORBITAIR?" or "shared between SAHAI and ORBITAIR"
    const sharedRegex = /(?:shared between|connect|commonalities between)\s+([\w\s-]+)\s+and\s+([\w\s-]+)/i;
    const sharedMatch = queryLower.match(sharedRegex);
    if (sharedMatch) {
      const name1 = sharedMatch[1].trim();
      const name2 = sharedMatch[2].trim();
      
      const sharedTechs = RelationshipDiscoveryService.findSharedTechnologies(graph, name1, name2);
      if (sharedTechs.length > 0) {
        resolvedEntity = `Shared tech between ${name1} and ${name2}`;
        selectedSections.push('Shared Technologies');
        
        const id1 = this.resolveEntityNodeId(graph, name1);
        const id2 = this.resolveEntityNodeId(graph, name2);
        if (id1) traverseAndAssemble(id1);
        if (id2) traverseAndAssemble(id2);

        sharedTechs.forEach(t => {
          addSkill(t.label);
          traversedRelationships.push(`Shared Tech: ${t.label}`);
        });

        return {
          profile: context.profile,
          skills: selectedSkills,
          projects: selectedProjects,
          repositories: selectedRepos,
          achievements: selectedAchievements,
          timeline: selectedTimeline,
          selectedSections,
          resolvedEntity,
          traversedRelationships
        };
      }
    }

    // 2. Check for INTERSECTION technology queries
    // "repositories using both FastAPI and React" or "use both FastAPI and React"
    const intersectRegex = /both\s+([\w\s.#+-]+)\s+and\s+([\w\s.#+-]+)/i;
    const intersectMatch = queryLower.match(intersectRegex);
    if (intersectMatch) {
      const tech1 = intersectMatch[1].trim();
      const tech2 = intersectMatch[2].trim();
      
      const intersectionRepos = RelationshipDiscoveryService.findRepositoriesWithAllTech(graph, [tech1, tech2]);
      if (intersectionRepos.length > 0) {
        resolvedEntity = `Intersection of ${tech1} and ${tech2}`;
        selectedSections.push('Intersection Repositories');

        addSkill(tech1);
        addSkill(tech2);

        intersectionRepos.forEach(r => {
          addRepo(r.label);
          traverseAndAssemble(r.id);
        });

        return {
          profile: context.profile,
          skills: selectedSkills,
          projects: selectedProjects,
          repositories: selectedRepos,
          achievements: selectedAchievements,
          timeline: selectedTimeline,
          selectedSections,
          resolvedEntity,
          traversedRelationships
        };
      }
    }

    // 3. Check for REVERSE LOOKUP queries
    // "Which repositories use FastAPI?" or "projects using Kafka"
    const reverseLookupKeywords = ['use', 'using', 'built with', 'utilize', 'utilizing'];
    let isReverseLookup = false;
    let targetTech = '';
    let targetType: 'Repository' | 'Project' | null = null;

    if (queryLower.includes('reposit') || queryLower.includes('repo')) {
      targetType = 'Repository';
    } else if (queryLower.includes('project')) {
      targetType = 'Project';
    }

    const techList = graph.getNodesByType('Skill').map(n => n.label);
    for (const tech of techList) {
      const techLower = tech.toLowerCase();
      if (queryLower.includes(techLower)) {
        const hasKeyword = reverseLookupKeywords.some(kw => queryLower.includes(kw));
        const startsWithWhich = queryLower.startsWith('which') || queryLower.startsWith('what');
        if (hasKeyword || startsWithWhich) {
          isReverseLookup = true;
          targetTech = tech;
          break;
        }
      }
    }

    if (isReverseLookup && targetTech && targetType) {
      resolvedEntity = `Reverse lookup: ${targetType}s using ${targetTech}`;
      selectedSections.push(`Reverse Lookup: ${targetTech}`);

      addSkill(targetTech);

      if (targetType === 'Repository') {
        const matchingRepos = RelationshipDiscoveryService.findRepositoriesByTech(graph, targetTech);
        matchingRepos.forEach(r => {
          addRepo(r.label);
          traverseAndAssemble(r.id);
        });
      } else {
        const matchingProjects = RelationshipDiscoveryService.findProjectsByTech(graph, targetTech);
        matchingProjects.forEach(p => {
          addProject(p.label);
          traverseAndAssemble(p.id);
        });
      }

      return {
        profile: context.profile,
        skills: selectedSkills,
        projects: selectedProjects,
        repositories: selectedRepos,
        achievements: selectedAchievements,
        timeline: selectedTimeline,
        selectedSections,
        resolvedEntity,
        traversedRelationships
      };
    }

    // 4. Single Entity Resolution (Project, Skill, Achievement)
    const resolved = this.entityResolver.resolve(query);
    if (resolved && resolved.confidence > 0.6) {
      const entity = resolved.entity;
      resolvedEntity = `${entity.type}:${entity.id}`;
      selectedSections.push(`Resolved Entity: ${entity.name}`);

      let nodeId = '';
      if (entity.type === 'project') {
        nodeId = `project:${entity.id}`;
      } else if (entity.type === 'skill') {
        nodeId = `skill:${entity.id}`;
      } else if (entity.type === 'achievement') {
        nodeId = `achievement:${entity.id}`;
      }

      if (nodeId) {
        traverseAndAssemble(nodeId);
      }

      const originalNode = graph.getNode(nodeId);
      if (originalNode && originalNode.properties.year) {
        addTimelineYear(String(originalNode.properties.year));
      }

      return {
        profile: context.profile,
        skills: selectedSkills,
        projects: selectedProjects,
        repositories: selectedRepos,
        achievements: selectedAchievements,
        timeline: selectedTimeline,
        selectedSections,
        resolvedEntity,
        traversedRelationships
      };
    }

    // Fallback: Check if any skill/technology name is directly mentioned in the query
    let skillFound = false;
    for (const tech of techList) {
      if (queryLower.includes(tech.toLowerCase())) {
        const skillId = `skill:${tech.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
        resolvedEntity = `skill:${tech}`;
        selectedSections.push(`Resolved Tech: ${tech}`);
        traverseAndAssemble(skillId);
        skillFound = true;
      }
    }

    if (skillFound) {
      return {
        profile: context.profile,
        skills: selectedSkills,
        projects: selectedProjects,
        repositories: selectedRepos,
        achievements: selectedAchievements,
        timeline: selectedTimeline,
        selectedSections,
        resolvedEntity,
        traversedRelationships
      };
    }

    // Fallback: Check if the query explicitly mentions any repository name or README keyword/token
    let matchedRepoByName: RepositoryContext | null = null;
    let matchedRepoByReadme: RepositoryContext | null = null;

    const stopWords = new Set(['what', 'is', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'how', 'why', 'where', 'when', 'who', 'which', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'and', 'or', 'so', 'if', 'then', 'else', 'not', 'can', 'will', 'should', 'would', 'could', 'summarize']);
    const queryWords = queryLower
      .replace(/[.,\/#!$%\^&\*;:{}=\-`~()?]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w));

    for (const r of context.repositories) {
      const repoNameLower = r.name.toLowerCase();
      
      // Check for exact repository name match in query
      if (queryLower.includes(repoNameLower)) {
        matchedRepoByName = r;
        break; // name matches take absolute priority
      }
      
      // Check for keyword matches in README excerpt
      if (r.readmeExcerpt) {
        const readmeLower = r.readmeExcerpt.toLowerCase();
        for (const word of queryWords) {
          if (readmeLower.includes(word)) {
            matchedRepoByReadme = r;
            break;
          }
        }
      }
    }

    const matchedRepo = matchedRepoByName || matchedRepoByReadme;
    if (matchedRepo) {
      resolvedEntity = `Repository:${matchedRepo.name}`;
      selectedSections.push(`Repository Content Match: ${matchedRepo.name}`);
      addRepo(matchedRepo.name);
      traverseAndAssemble(`repository:${matchedRepo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`);
      
      // Also add associated project if any
      const proj = context.projects.find(p => 
        p.id.toLowerCase() === matchedRepo.name.toLowerCase() ||
        (p.githubUrl && p.githubUrl.toLowerCase().endsWith('/' + matchedRepo.name.toLowerCase()))
      );
      if (proj) {
        addProject(proj.id);
      }

      // Generate a clear metadata note mapping any search terms to the matched repository
      let foundKeyword: string | undefined = undefined;
      let repositoryMetadata: string | undefined = undefined;
      if (matchedRepoByReadme && !matchedRepoByName) {
        const foundWord = queryWords.find(w => matchedRepo.readmeExcerpt?.toLowerCase().includes(w));
        if (foundWord) {
          const index = queryLower.indexOf(foundWord);
          const originalWord = index !== -1 ? query.substring(index, index + foundWord.length) : foundWord;
          foundKeyword = originalWord;
          repositoryMetadata = `[SEARCH RESULT] The term "${originalWord}" is located inside the README file of the repository "${matchedRepo.name}".`;
        }
      }

      console.log("QUERY:", query);
      console.log("MATCHED REPO:", matchedRepo?.name);
      console.log("README MATCH:", foundKeyword);
      console.log("SEARCH RESULT INJECTED:", !!repositoryMetadata);

      return {
        profile: context.profile,
        skills: selectedSkills,
        projects: selectedProjects,
        repositories: selectedRepos,
        achievements: selectedAchievements,
        timeline: selectedTimeline,
        selectedSections,
        resolvedEntity,
        traversedRelationships,
        repositoryMetadata
      };
    }

    // 5. Total Fallback: Return all data
    return {
      profile: context.profile,
      skills: context.skills,
      projects: context.projects,
      repositories: context.repositories,
      achievements: context.achievements,
      timeline: context.timeline,
      selectedSections: ['All Portfolio Data'],
      resolvedEntity: 'None (Direct Routing)',
      traversedRelationships: [],
      repositoryMetadata: undefined
    };
  }

  private static resolveEntityNodeId(graph: any, name: string): string | null {
    const lower = name.toLowerCase().trim();
    const nodes = graph.getNodes();
    
    for (const node of nodes) {
      if (node.label.toLowerCase() === lower || node.id.split(':').slice(1).join(':').toLowerCase() === lower) {
        return node.id;
      }
    }
    
    for (const node of nodes) {
      if (node.label.toLowerCase().includes(lower)) {
        return node.id;
      }
    }

    return null;
  }

  /**
   * Compresses the selected context entities and formats them as a clean, highly readable Markdown prompt text.
   */
  static compressAndFormat(selected: SelectedContext & { repositoryMetadata?: string }): string {
    let output = '';

    if (selected.repositoryMetadata) {
      output += `${selected.repositoryMetadata}\n`;
    }

    // 1. Candidate Profile
    output += `### CANDIDATE PROFILE\n`;
    output += `Name: ${selected.profile.name}\n`;
    output += `Title: ${selected.profile.title}\n`;
    output += `Bio: ${selected.profile.bio}\n`;
    output += `Location: ${selected.profile.location}\n`;
    output += `Education: ${selected.profile.education.degree} at ${selected.profile.education.institution} (CGPA: ${selected.profile.education.cgpa}, Expected Graduation: ${selected.profile.education.expectedGraduation})\n\n`;

    // 2. Technical Skills
    if (selected.skills.length > 0) {
      output += `### RELEVANT TECHNICAL SKILLS\n`;
      selected.skills.forEach(s => {
        output += `- **${s.name}** (${s.category} - ${s.level}): ${s.description}\n`;
      });
      output += `\n`;
    }

    // 3. Projects
    if (selected.projects.length > 0) {
      output += `### RELEVANT PROJECTS\n`;
      selected.projects.forEach(p => {
        output += `- **${p.title}** (${p.year})\n`;
        output += `  Summary: ${p.subtitle}. ${p.description}\n`;
        output += `  Technologies: ${p.techStack.join(', ')}\n`;
        if (p.problem && p.problem !== 'No manual problem statement defined. Synced dynamically from GitHub repository.') {
          output += `  Problem Statement: ${p.problem}\n`;
          output += `  Solution Provided: ${p.solution}\n`;
        }
        if (p.githubUrl) {
          output += `  Repository Link: ${p.githubUrl}\n`;
        }
      });
      output += `\n`;
    }

    // 4. Repositories
    if (selected.repositories.length > 0) {
      output += `### RELEVANT REPOSITORIES\n`;
      selected.repositories.forEach(r => {
        output += `- **${r.name}** (${r.language || 'TypeScript'})\n`;
        output += `  Description: ${r.description || 'GitHub Code Repository'}\n`;
        if (r.topics && r.topics.length > 0) {
          output += `  Topics: ${r.topics.join(', ')}\n`;
        }
        if (r.intelligence) {
          output += `  Category: ${r.intelligence.projectCategory}, Pattern: ${r.intelligence.architecturePattern}, Complexity Rating: ${r.intelligence.complexityRating}\n`;
        }
        if (r.readmeExcerpt) {
          output += `  README Excerpt:\n\`\`\`\n${r.readmeExcerpt}\n\`\`\`\n`;
        }
        if (r.repositorySummary) {
          output += `  Purpose: ${r.repositorySummary.RepositoryPurpose}\n`;
          if (r.repositorySummary.KeyFeatures && r.repositorySummary.KeyFeatures.length > 0) {
            output += `  Key Features: ${r.repositorySummary.KeyFeatures.join(', ')}\n`;
          }
          if (r.repositorySummary.TechnologyStack && r.repositorySummary.TechnologyStack.length > 0) {
            output += `  Technologies: ${r.repositorySummary.TechnologyStack.join(', ')}\n`;
          }
          if (r.repositorySummary.ComplexityIndicators && r.repositorySummary.ComplexityIndicators.length > 0) {
            output += `  Complexity Indicators: ${r.repositorySummary.ComplexityIndicators.join(', ')}\n`;
          }
        }
        output += `  Stars: ${r.starsCount}, Forks: ${r.forksCount}, Link: ${r.url}\n`;
      });
      output += `\n`;
    }

    // 5. Achievements
    if (selected.achievements.length > 0) {
      output += `### RELEVANT ACHIEVEMENTS\n`;
      selected.achievements.forEach(a => {
        output += `- **${a.title}** (${a.year}): ${a.description}\n`;
      });
      output += `\n`;
    }

    // 6. Timeline Milestones
    if (selected.timeline.length > 0) {
      output += `### RELEVANT TIMELINE MILESTONES\n`;
      selected.timeline.forEach(t => {
        output += `- **${t.year}**:\n`;
        t.milestones.forEach(m => {
          output += `  * [${m.type}] ${m.title}: ${m.description}\n`;
        });
      });
      output += `\n`;
    }

    return output.trim();
  }
}
