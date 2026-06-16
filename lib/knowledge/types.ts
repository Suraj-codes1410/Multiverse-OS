import { Project, Skill, GitHubRepository, Experience, Achievement, TimelineMilestone } from '../types';

export type NodeType =
  | 'Project'
  | 'Skill'
  | 'Repository'
  | 'Achievement'
  | 'Experience'
  | 'Education'
  | 'Timeline Event';

export type RelationshipType =
  | 'USES'
  | 'BUILT_WITH'
  | 'RELATED_TO'
  | 'ACHIEVED_AT'
  | 'PARTICIPATED_IN'
  | 'DEPENDS_ON';

export interface KnowledgeNode {
  id: string; // Unique namespace ID, e.g., "project:orbitair", "skill:react"
  type: NodeType;
  label: string; // Display name
  properties: {
    description?: string;
    url?: string;
    year?: string;
    language?: string;
    starsCount?: number;
    category?: string;
    level?: string;
    role?: string;
    company?: string;
    institution?: string;
    degree?: string;
    date?: string;
    originalData?: Project | Skill | GitHubRepository | Experience | Achievement | TimelineMilestone | unknown;
    [key: string]: unknown;
  };
}

export interface KnowledgeRelationship {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  properties?: {
    weight?: number;
    description?: string;
    [key: string]: unknown;
  };
}

export interface IKnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  relationships: KnowledgeRelationship[];
  
  addNode(node: KnowledgeNode): void;
  addRelationship(rel: KnowledgeRelationship): void;
  getNode(id: string): KnowledgeNode | undefined;
  getNodes(): KnowledgeNode[];
  getRelationships(): KnowledgeRelationship[];
  
  getNeighbors(id: string, direction?: 'incoming' | 'outgoing' | 'both'): { node: KnowledgeNode; relationship: KnowledgeRelationship }[];
  getNodesByType(type: NodeType): KnowledgeNode[];
  getRelationshipsByType(type: RelationshipType): KnowledgeRelationship[];
  getRelationshipsForNode(id: string): KnowledgeRelationship[];
  
  findPath(sourceId: string, targetId: string): KnowledgeNode[] | null;
  search(query: string): KnowledgeNode[];
}
