import { IKnowledgeGraph, KnowledgeNode, KnowledgeRelationship, NodeType, RelationshipType } from './types';

export class KnowledgeGraph implements IKnowledgeGraph {
  nodes: Map<string, KnowledgeNode> = new Map();
  relationships: KnowledgeRelationship[] = [];

  addNode(node: KnowledgeNode): void {
    this.nodes.set(node.id, node);
  }

  addRelationship(rel: KnowledgeRelationship): void {
    // Prevent self-loops
    if (rel.sourceId === rel.targetId) {
      return;
    }
    
    // Prevent duplicate relationships
    const exists = this.relationships.some(
      r => r.sourceId === rel.sourceId && r.targetId === rel.targetId && r.type === rel.type
    );
    if (!exists) {
      this.relationships.push(rel);
    }
  }

  getNode(id: string): KnowledgeNode | undefined {
    return this.nodes.get(id);
  }

  getNodes(): KnowledgeNode[] {
    return Array.from(this.nodes.values());
  }

  getRelationships(): KnowledgeRelationship[] {
    return this.relationships;
  }

  getNeighbors(
    id: string,
    direction: 'incoming' | 'outgoing' | 'both' = 'both'
  ): { node: KnowledgeNode; relationship: KnowledgeRelationship }[] {
    const neighbors: { node: KnowledgeNode; relationship: KnowledgeRelationship }[] = [];

    this.relationships.forEach(rel => {
      if ((direction === 'outgoing' || direction === 'both') && rel.sourceId === id) {
        const targetNode = this.getNode(rel.targetId);
        if (targetNode) {
          neighbors.push({ node: targetNode, relationship: rel });
        }
      }
      if ((direction === 'incoming' || direction === 'both') && rel.targetId === id) {
        const sourceNode = this.getNode(rel.sourceId);
        if (sourceNode) {
          neighbors.push({ node: sourceNode, relationship: rel });
        }
      }
    });

    return neighbors;
  }

  getNodesByType(type: NodeType): KnowledgeNode[] {
    return this.getNodes().filter(n => n.type === type);
  }

  getRelationshipsByType(type: RelationshipType): KnowledgeRelationship[] {
    return this.relationships.filter(r => r.type === type);
  }

  getRelationshipsForNode(id: string): KnowledgeRelationship[] {
    return this.relationships.filter(r => r.sourceId === id || r.targetId === id);
  }

  findPath(sourceId: string, targetId: string): KnowledgeNode[] | null {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) {
      return null;
    }
    if (sourceId === targetId) {
      const start = this.getNode(sourceId);
      return start ? [start] : null;
    }

    // BFS search
    const queue: string[][] = [[sourceId]];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const lastNodeId = path[path.length - 1];

      if (lastNodeId === targetId) {
        return path.map(id => this.getNode(id)!).filter(Boolean);
      }

      // Check outgoing relationships for next steps
      const neighbors = this.getNeighbors(lastNodeId, 'outgoing');
      for (const neighbor of neighbors) {
        const neighborId = neighbor.node.id;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([...path, neighborId]);
        }
      }
    }

    return null;
  }

  search(query: string): KnowledgeNode[] {
    const normalizedQuery = query.toLowerCase();
    return this.getNodes().filter(node => {
      if (node.label.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      if (node.properties.description?.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      if (node.type.toLowerCase().includes(normalizedQuery)) {
        return true;
      }
      return Object.entries(node.properties).some(([key, val]) => {
        if (key === 'originalData') return false;
        if (typeof val === 'string') {
          return val.toLowerCase().includes(normalizedQuery);
        }
        return false;
      });
    });
  }
}
