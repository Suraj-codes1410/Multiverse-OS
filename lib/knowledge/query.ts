import { KnowledgeGraph } from './graph';
import { KnowledgeNode, NodeType, RelationshipType } from './types';
import { buildKnowledgeGraph } from './builder';
import { Project } from '../types';

export class KnowledgeQueryEngine {
  private graph: KnowledgeGraph;

  constructor(graph: KnowledgeGraph) {
    this.graph = graph;
  }

  /**
   * Dynamic initialization factory. Loads all portfolio data, resolves repository intelligence,
   * constructs the Knowledge Graph, and binds it to the query service.
   */
  static async initialize(): Promise<KnowledgeQueryEngine> {
    const graph = await buildKnowledgeGraph();
    return new KnowledgeQueryEngine(graph);
  }

  /**
   * Traverses adjacent semantic edges to find connected nodes of a specific type.
   */
  findConnectedNodes(
    nodeId: string,
    targetType: NodeType,
    relType?: RelationshipType
  ): KnowledgeNode[] {
    const neighbors = this.graph.getNeighbors(nodeId, 'both');
    return neighbors
      .filter(item => {
        const typeMatch = item.node.type === targetType;
        const relMatch = !relType || item.relationship.type === relType;
        return typeMatch && relMatch;
      })
      .map(item => item.node);
  }

  /**
   * Query 1: Find all projects using a specific skill/technology (e.g. "FastAPI").
   */
  findProjectsBySkill(skillName: string): KnowledgeNode[] {
    const skillId = `skill:${skillName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
    return this.findConnectedNodes(skillId, 'Project');
  }

  /**
   * Query 2: Find all projects related to a domain or concept (e.g. "AI").
   * Scans categories, descriptions, and related tech domains of connected skills.
   */
  findProjectsRelatedToConcept(concept: string): KnowledgeNode[] {
    const normalizedConcept = concept.toLowerCase().trim();
    const allProjects = this.graph.getNodesByType('Project');

    return allProjects.filter(project => {
      // 1. Match category properties or subtitle
      if (project.properties.category?.toLowerCase().includes(normalizedConcept)) {
        return true;
      }
      
      // 2. Match project descriptions
      if (project.properties.description?.toLowerCase().includes(normalizedConcept)) {
        return true;
      }
      if ((project.properties.originalData as Project)?.problem?.toLowerCase().includes(normalizedConcept)) {
        return true;
      }
      if ((project.properties.originalData as Project)?.solution?.toLowerCase().includes(normalizedConcept)) {
        return true;
      }

      // 3. Match connected skills categories or names
      const connectedSkills = this.findConnectedNodes(project.id, 'Skill');
      return connectedSkills.some(skill => {
        if (skill.label.toLowerCase().includes(normalizedConcept)) {
          return true;
        }
        if (skill.properties.category?.toLowerCase().includes(normalizedConcept)) {
          return true;
        }
        if (skill.properties.relatedDomain && String(skill.properties.relatedDomain).toLowerCase().includes(normalizedConcept)) {
          return true;
        }
        return false;
      });
    });
  }

  /**
   * Query 3: Find achievements related to a project (e.g. "ORBITAIR").
   */
  findAchievementsByProject(projectTitleOrId: string): KnowledgeNode[] {
    let projectId = projectTitleOrId.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (!projectId.startsWith('project:')) {
      projectId = `project:${projectId}`;
    }
    return this.findConnectedNodes(projectId, 'Achievement', 'RELATED_TO');
  }

  /**
   * Query 4: Find repositories using a specific technology (e.g. "Kafka").
   */
  findRepositoriesBySkill(skillName: string): KnowledgeNode[] {
    const skillId = `skill:${skillName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
    return this.findConnectedNodes(skillId, 'Repository', 'USES');
  }

  /**
   * Helper: Explains the semantic pathway connecting two nodes.
   */
  explainPathway(sourceId: string, targetId: string): string[] | null {
    const path = this.graph.findPath(sourceId, targetId);
    if (!path) return null;
    return path.map(node => `[${node.type.toUpperCase()}] ${node.label}`);
  }

  /**
   * Exposes the underlying graph instance for custom queries.
   */
  getGraph(): KnowledgeGraph {
    return this.graph;
  }
}
