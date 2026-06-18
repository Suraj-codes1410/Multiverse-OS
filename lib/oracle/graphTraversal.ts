import { buildKnowledgeGraph } from '../knowledge/builder';
import { KnowledgeGraph } from '../knowledge/graph';
import { KnowledgeNode } from '../knowledge/types';
import { EntityResolver } from './entityResolver';

export interface TraversalResult {
  sourceEntity: {
    id: string;
    name: string;
    type: string;
  };
  relationType: string;
  targetEntities: {
    id: string;
    name: string;
    type: string;
    description?: string;
  }[];
}

export class GraphTraversalService {
  private graph: KnowledgeGraph | null = null;

  /**
   * Initializes the service by building the knowledge graph.
   */
  public async init(): Promise<void> {
    if (!this.graph) {
      this.graph = await buildKnowledgeGraph();
    }
  }

  public getGraph(): KnowledgeGraph {
    if (!this.graph) {
      throw new Error('GraphTraversalService is not initialized. Call init() first.');
    }
    return this.graph;
  }

  /**
   * Helper to deduplicate nodes by their unique ID.
   */
  private deduplicateNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
    const seen = new Set<string>();
    return nodes.filter(node => {
      if (seen.has(node.id)) {
        return false;
      }
      seen.add(node.id);
      return true;
    });
  }

  /**
   * Retrieves all skills/technologies linked to a project.
   */
  public getProjectSkills(projectId: string): KnowledgeNode[] {
    const graph = this.getGraph();
    const neighbors = graph.getNeighbors(projectId);
    const nodes = neighbors
      .filter(n => n.node.type === 'Skill' && (n.relationship.type === 'BUILT_WITH' || n.relationship.type === 'USES'))
      .map(n => n.node);
    return this.deduplicateNodes(nodes);
  }

  /**
   * Retrieves all projects linked to a skill/technology.
   */
  public getSkillProjects(skillId: string): KnowledgeNode[] {
    const graph = this.getGraph();
    const neighbors = graph.getNeighbors(skillId);
    const nodes = neighbors
      .filter(n => n.node.type === 'Project' && (n.relationship.type === 'USES' || n.relationship.type === 'BUILT_WITH'))
      .map(n => n.node);
    return this.deduplicateNodes(nodes);
  }

  /**
   * Retrieves all achievements linked to a project.
   */
  public getProjectAchievements(projectId: string): KnowledgeNode[] {
    const graph = this.getGraph();
    const neighbors = graph.getNeighbors(projectId);
    const nodes = neighbors
      .filter(n => n.node.type === 'Achievement')
      .map(n => n.node);
    return this.deduplicateNodes(nodes);
  }

  /**
   * Retrieves all repositories linked to a project.
   */
  public getProjectRepositories(projectId: string): KnowledgeNode[] {
    const graph = this.getGraph();
    const neighbors = graph.getNeighbors(projectId);
    const nodes = neighbors
      .filter(n => n.node.type === 'Repository')
      .map(n => n.node);
    return this.deduplicateNodes(nodes);
  }

  /**
   * Retrieves all skills/technologies linked to a repository.
   */
  public getRepositoryTechnologies(repositoryId: string): KnowledgeNode[] {
    const graph = this.getGraph();
    const neighbors = graph.getNeighbors(repositoryId);
    const nodes = neighbors
      .filter(n => n.node.type === 'Skill' && (n.relationship.type === 'USES' || n.relationship.type === 'RELATED_TO'))
      .map(n => n.node);
    return this.deduplicateNodes(nodes);
  }
}

export class RelationshipEngine {
  private traversalService: GraphTraversalService;
  private entityResolver: EntityResolver;

  constructor(traversalService: GraphTraversalService, entityResolver?: EntityResolver) {
    this.traversalService = traversalService;
    this.entityResolver = entityResolver || new EntityResolver();
  }

  /**
   * Parses a natural language query and traverses the graph to return structured relationship results.
   */
  public async query(queryString: string): Promise<TraversalResult | null> {
    await this.traversalService.init();
    const graph = this.traversalService.getGraph();
    const queryLower = queryString.toLowerCase().trim();

    // 1. Classify relationship intent based on keywords
    const isTechQuery = this.containsAny(queryLower, ['technology', 'technologies', 'skill', 'skills', 'tech', 'languages', 'language', 'stack']);
    const isProjectQuery = this.containsAny(queryLower, ['project', 'projects', 'built', 'uses', 'use', 'using']);
    const isAchievementQuery = this.containsAny(queryLower, ['achievement', 'achievements', 'award', 'awards', 'prize', 'prizes', 'won', 'linked', 'associated']);
    const isRepoQuery = this.containsAny(queryLower, ['repository', 'repositories', 'repo', 'repos', 'github', 'codebase']);

    // 2. Resolve entities in the query
    
    // A. Check if the query asks about a Project using EntityResolver (or direct text scan)
    const resolvedProject = this.entityResolver.resolve(queryString);
    let projectId: string | null = null;
    let projectLabel = '';

    if (resolvedProject && resolvedProject.entity.type === 'project') {
      projectId = `project:${resolvedProject.entity.id}`;
      projectLabel = resolvedProject.entity.name;
    } else {
      // Fallback direct scan for project nodes in graph
      const projectNode = this.scanNodesForMatch(queryLower, graph.getNodesByType('Project'));
      if (projectNode) {
        projectId = projectNode.id;
        projectLabel = projectNode.label;
      }
    }

    // B. Check if the query asks about a Skill
    const skillNode = this.scanNodesForMatch(queryLower, graph.getNodesByType('Skill'));

    // C. Check if the query asks about a Repository
    const repoNode = this.scanNodesForMatch(queryLower, graph.getNodesByType('Repository'));

    // 3. Match Intent & Traverse Relationships

    // Intent: Project -> Achievements
    // "What achievements are linked to SAHAI?"
    if (projectId && isAchievementQuery && !skillNode) {
      const achievements = this.traversalService.getProjectAchievements(projectId);
      return {
        sourceEntity: { id: projectId, name: projectLabel, type: 'Project' },
        relationType: 'HAS_ACHIEVEMENT',
        targetEntities: achievements.map(node => ({
          id: node.id,
          name: node.label,
          type: node.type,
          description: node.properties.description
        }))
      };
    }

    // Intent: Repository -> Technologies
    // "What technologies are used in the ORBITAIR repository?"
    if (repoNode && isTechQuery && isRepoQuery) {
      const skills = this.traversalService.getRepositoryTechnologies(repoNode.id);
      return {
        sourceEntity: { id: repoNode.id, name: repoNode.label, type: 'Repository' },
        relationType: 'UTILIZES_TECHNOLOGY',
        targetEntities: skills.map(node => ({
          id: node.id,
          name: node.label,
          type: node.type,
          description: node.properties.description
        }))
      };
    }

    // Intent: Project -> Skills / Technologies
    // "What technologies were used in ORBITAIR?"
    if (projectId && isTechQuery) {
      const skills = this.traversalService.getProjectSkills(projectId);
      return {
        sourceEntity: { id: projectId, name: projectLabel, type: 'Project' },
        relationType: 'BUILT_WITH',
        targetEntities: skills.map(node => ({
          id: node.id,
          name: node.label,
          type: node.type,
          description: node.properties.description
        }))
      };
    }

    // Intent: Project -> Repositories
    // "What repositories are linked to ORBITAIR?"
    if (projectId && isRepoQuery) {
      const repos = this.traversalService.getProjectRepositories(projectId);
      return {
        sourceEntity: { id: projectId, name: projectLabel, type: 'Project' },
        relationType: 'HAS_REPOSITORY',
        targetEntities: repos.map(node => ({
          id: node.id,
          name: node.label,
          type: node.type,
          description: node.properties.description
        }))
      };
    }

    // Intent: Skill -> Projects
    // "Which projects use FastAPI?"
    if (skillNode && isProjectQuery) {
      const projects = this.traversalService.getSkillProjects(skillNode.id);
      return {
        sourceEntity: { id: skillNode.id, name: skillNode.label, type: 'Skill' },
        relationType: 'USED_IN_PROJECTS',
        targetEntities: projects.map(node => ({
          id: node.id,
          name: node.label,
          type: node.type,
          description: node.properties.description
        }))
      };
    }

    // Fallback: If project was matched but no specific relationship keywords were present,
    // default to listing its technology stack (a very common query pattern)
    if (projectId) {
      const skills = this.traversalService.getProjectSkills(projectId);
      return {
        sourceEntity: { id: projectId, name: projectLabel, type: 'Project' },
        relationType: 'BUILT_WITH',
        targetEntities: skills.map(node => ({
          id: node.id,
          name: node.label,
          type: node.type,
          description: node.properties.description
        }))
      };
    }

    return null;
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }

  /**
   * Scans a list of graph nodes to find the best match present in the query text.
   * Longer labels are prioritized to prevent matching partial substrings (e.g., matching "Java" when query is "JavaScript").
   */
  private scanNodesForMatch(query: string, nodes: KnowledgeNode[]): KnowledgeNode | null {
    const candidates: { node: KnowledgeNode; index: number }[] = [];

    for (const node of nodes) {
      const labelLower = node.label.toLowerCase();
      const idLower = node.id.split(':').slice(1).join(':').toLowerCase();
      
      let index = query.indexOf(labelLower);
      if (index === -1) {
        index = query.indexOf(idLower);
      }

      if (index !== -1) {
        candidates.push({ node, index });
      }
    }

    if (candidates.length === 0) return null;

    // Sort candidates by matching label length descending to prioritize longer and more specific labels
    candidates.sort((a, b) => b.node.label.length - a.node.label.length);

    return candidates[0].node;
  }
}
