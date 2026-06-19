import { IKnowledgeGraph, KnowledgeNode, KnowledgeRelationship, NodeType, RelationshipType } from './types';
import { KnowledgeGraph } from './graph';
import { RelationshipDiscoveryService } from './relationshipDiscoveryService';

export class RelationshipGraphBuilder {
  private graph: KnowledgeGraph;

  constructor(graph?: KnowledgeGraph) {
    this.graph = graph || new KnowledgeGraph();
  }

  /**
   * Adds a node to the graph and verifies integrity.
   */
  public addNode(node: KnowledgeNode): void {
    if (!node.id || !node.type || !node.label) {
      throw new Error(`Invalid node definition. Missing required fields: ${JSON.stringify(node)}`);
    }
    this.graph.addNode(node);
  }

  /**
   * Adds an edge (relationship) and maintains integrity:
   * - Checks that sourceId and targetId exist.
   * - Prevents self-loops.
   * - Prevents duplicate edges.
   */
  public addRelationship(rel: KnowledgeRelationship): void {
    // 1. Maintain relationship integrity: check for self-loop
    if (rel.sourceId === rel.targetId) {
      console.warn(`Relationship integrity warning: Self-loop detected on ${rel.sourceId}. Skipping.`);
      return;
    }

    // 2. Maintain relationship integrity: check referential integrity
    const sourceNode = this.graph.getNode(rel.sourceId);
    const targetNode = this.graph.getNode(rel.targetId);

    if (!sourceNode) {
      console.warn(`Relationship integrity warning: Source node ${rel.sourceId} does not exist. Skipping relationship.`);
      return;
    }

    if (!targetNode) {
      // Automatically create a placeholder node for missing targets (specifically skills/technologies)
      if (rel.targetId.startsWith('skill:')) {
        const techName = rel.targetId.split(':')[1].replace(/-/g, ' ');
        const formattedName = techName.charAt(0).toUpperCase() + techName.slice(1);
        this.addPlaceholderSkillNode(rel.targetId, formattedName);
      } else {
        console.warn(`Relationship integrity warning: Target node ${rel.targetId} does not exist. Skipping relationship.`);
        return;
      }
    }

    // 3. Prevent duplicate relationships
    this.graph.addRelationship(rel);
  }

  /**
   * Create placeholder Skill node to maintain referential integrity.
   */
  private addPlaceholderSkillNode(id: string, name: string): void {
    const category = RelationshipDiscoveryService.categorizeTech(name);
    let skillCategory: 'Backend' | 'Frontend' | 'Database' | 'Cloud' | 'AI / ML' | 'Tools' = 'Tools';
    if (category === 'Language') skillCategory = 'Backend';
    else if (category === 'Framework') skillCategory = 'Frontend';
    else if (category === 'Database') skillCategory = 'Database';

    this.graph.addNode({
      id,
      type: 'Skill',
      label: name,
      properties: {
        description: `${name} placeholder node generated for referential integrity.`,
        category: skillCategory,
        level: 'Intermediate',
        techType: category,
        originalData: {
          name,
          category: skillCategory,
          level: 'Intermediate',
          description: `${name} placeholder node generated for referential integrity.`,
          relatedProjects: []
        }
      }
    });
  }

  /**
   * Triggers the discovery process across the graph using RelationshipDiscoveryService.
   */
  public discoverRelationships(): void {
    RelationshipDiscoveryService.discoverAll(this.graph);
  }

  /**
   * Return the constructed graph.
   */
  public getGraph(): KnowledgeGraph {
    return this.graph;
  }
}
