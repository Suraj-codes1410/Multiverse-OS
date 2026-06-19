import { IKnowledgeGraph, KnowledgeNode, KnowledgeRelationship, NodeType, RelationshipType } from './types';
import { Project, Skill, GitHubRepository, Achievement } from '../types';

export class RelationshipDiscoveryService {
  // Classification dictionary
  private static LANGUAGES = new Set(['go', 'golang', 'rust', 'typescript', 'javascript', 'python', 'java', 'html', 'css', 'c++', 'c', 'shell', 'bash', 'sql']);
  
  private static FRAMEWORKS = new Set([
    'spring boot', 'springboot', 'fastapi', 'django', 'react', 'next.js', 'nextjs', 'vite', 'leaflet', 
    'websockets', 'websocket', 'grpc', 'spring security', 'hibernate', 'express', 'nestjs', 'angular', 
    'vue', 'tailwind', 'tailwindcss', 'django REST framework', 'flask'
  ]);

  private static DATABASES = new Set([
    'pinecone', 'timescaledb', 'redis', 'mysql', 'postgresql', 'postgres', 'mongodb', 'elasticsearch', 
    'cassandra', 'sqlite', 'mariadb', 'neo4j'
  ]);

  private static TOOLS = new Set([
    'kafka', 'docker', 'rabbitmq', 'pytorch', 'elasticsearch', 'kubernetes', 'raft', 'grpc', 'anomaly-detection', 
    'git', 'github actions', 'jenkins', 'ansible', 'terraform', 'prometheus', 'grafana'
  ]);

  /**
   * Helper to categorize a technology string.
   */
  public static categorizeTech(techName: string): 'Language' | 'Framework' | 'Database' | 'Tool' | 'Skill' {
    const name = techName.toLowerCase().trim();
    if (this.LANGUAGES.has(name)) return 'Language';
    if (this.FRAMEWORKS.has(name)) return 'Framework';
    if (this.DATABASES.has(name)) return 'Database';
    if (this.TOOLS.has(name)) return 'Tool';
    return 'Skill';
  }

  /**
   * Discover and establish relationships across the entire graph.
   */
  public static discoverAll(graph: IKnowledgeGraph): void {
    const projects = graph.getNodesByType('Project');

    // Ensure all projects with a GitHub URL have a corresponding Repository node in the graph
    projects.forEach(projNode => {
      const proj = projNode.properties.originalData as Project;
      if (!proj || !proj.githubUrl) return;

      const parts = proj.githubUrl.split('/');
      const repoName = parts[parts.length - 1]?.trim();
      if (!repoName) return;

      const repoId = `repository:${repoName.toLowerCase()}`;
      if (!graph.getNode(repoId)) {
        const repoTopics = proj.techStack?.map(t => t.toLowerCase()) || [];
        graph.addNode({
          id: repoId,
          type: 'Repository',
          label: repoName,
          properties: {
            description: proj.description || 'GitHub Code Repository',
            url: proj.githubUrl,
            language: proj.techStack?.[0] || 'TypeScript',
            starsCount: 0,
            originalData: {
              id: Math.floor(Math.random() * 1000000),
              name: repoName,
              fullName: `Suraj-codes1410/${repoName}`,
              description: proj.description,
              htmlUrl: proj.githubUrl,
              homepage: null,
              starsCount: 0,
              forksCount: 0,
              language: proj.techStack?.[0] || 'TypeScript',
              topics: repoTopics,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
      }
    });

    const nodes = graph.getNodes();
    const repos = graph.getNodesByType('Repository');
    const achievements = graph.getNodesByType('Achievement');
    const skills = graph.getNodesByType('Skill');

    // 1. Discover Repository ↔ Technology / Language / Framework / Project
    repos.forEach(repoNode => {
      const repo = repoNode.properties.originalData as GitHubRepository;
      if (!repo) return;

      // Repository ↔ Language
      if (repo.language) {
        this.addBidirectionalRelationship(
          graph,
          repoNode.id,
          this.getSkillNodeId(repo.language),
          'BUILT_WITH',
          'RELATED_TO',
          {
            description: `Repository is built with language: ${repo.language}`,
            source: 'github',
            confidence: 1.0,
            discoveryMethod: 'github_language'
          }
        );
      }

      // Repository ↔ Technology / Framework (from topics)
      if (repo.topics) {
        repo.topics.forEach(topic => {
          const type = this.categorizeTech(topic);
          const skillId = this.getSkillNodeId(topic);
          this.ensureSkillNodeExists(graph, topic);
          
          this.addBidirectionalRelationship(
            graph,
            repoNode.id,
            skillId,
            'USES',
            'RELATED_TO',
            {
              description: `Repository uses ${type.toLowerCase()}: ${topic} (found in topics)`,
              source: 'github',
              confidence: 0.95,
              discoveryMethod: 'github_topics'
            }
          );
        });
      }

      // Repository ↔ Technology / Framework (from description / readme summary)
      if (repo.description) {
        this.scanTextForTechnologies(repo.description).forEach(tech => {
          const skillId = this.getSkillNodeId(tech);
          this.ensureSkillNodeExists(graph, tech);
          this.addBidirectionalRelationship(
            graph,
            repoNode.id,
            skillId,
            'USES',
            'RELATED_TO',
            {
              description: `Repository description references technology: ${tech}`,
              source: 'repository_intelligence',
              confidence: 0.8,
              discoveryMethod: 'description_analysis'
            }
          );
        });
      }

      // Look in repositorySummary (from content analysis)
      const repoSummary = repoNode.properties.repositorySummary as any;
      if (repoSummary) {
        // Check TechnologyStack
        if (Array.isArray(repoSummary.TechnologyStack)) {
          repoSummary.TechnologyStack.forEach((tech: string) => {
            const type = this.categorizeTech(tech);
            const skillId = this.getSkillNodeId(tech);
            this.ensureSkillNodeExists(graph, tech);
            this.addBidirectionalRelationship(
              graph,
              repoNode.id,
              skillId,
              'USES',
              'RELATED_TO',
              {
                description: `Repository summary identifies technology: ${tech}`,
                source: 'readme_parser',
                confidence: 0.9,
                discoveryMethod: 'readme_analysis'
              }
            );
          });
        }
        // Check RepositoryPurpose (scan for tech)
        if (repoSummary.RepositoryPurpose && typeof repoSummary.RepositoryPurpose === 'string') {
          this.scanTextForTechnologies(repoSummary.RepositoryPurpose).forEach(tech => {
            const skillId = this.getSkillNodeId(tech);
            this.ensureSkillNodeExists(graph, tech);
            this.addBidirectionalRelationship(
              graph,
              repoNode.id,
              skillId,
              'USES',
              'RELATED_TO',
              {
                description: `Repository purpose references technology: ${tech}`,
                source: 'readme_parser',
                confidence: 0.8,
                discoveryMethod: 'readme_analysis'
              }
            );
          });
        }
      }

      // Repository ↔ Project
      projects.forEach(projNode => {
        const proj = projNode.properties.originalData as Project;
        if (!proj) return;
        
        let isMatch = false;
        let matchReason = '';

        if (repo.name.toLowerCase() === proj.id.toLowerCase()) {
          isMatch = true;
          matchReason = 'Exact name match between repository and project ID';
        } else if (proj.githubUrl && proj.githubUrl.toLowerCase().endsWith(`/${repo.name.toLowerCase()}`)) {
          isMatch = true;
          matchReason = 'Project GitHub URL links to repository';
        } else if (repo.description?.toLowerCase().includes(proj.title.toLowerCase()) || 
                   proj.description?.toLowerCase().includes(repo.name.toLowerCase())) {
          isMatch = true;
          matchReason = 'Text overlap between project title/description and repository';
        }

        if (isMatch) {
          this.addBidirectionalRelationship(
            graph,
            repoNode.id,
            projNode.id,
            'RELATED_TO',
            'DEPENDS_ON',
            {
              description: `Repository linked to Project context: ${proj.title}. Reason: ${matchReason}`,
              source: 'inference',
              confidence: 1.0,
              discoveryMethod: 'project_repo_link'
            }
          );
        }
      });
    });

    // 2. Discover Project ↔ Achievement / Skill
    projects.forEach(projNode => {
      const proj = projNode.properties.originalData as Project;
      if (!proj) return;

      // Project ↔ Achievement
      achievements.forEach(achNode => {
        const ach = achNode.properties.originalData as Achievement;
        if (!ach) return;

        const titleMatches = ach.title.toLowerCase().includes(proj.title.toLowerCase()) || 
                             ach.title.toLowerCase().includes(proj.id.toLowerCase());
        const descMatches = ach.description.toLowerCase().includes(proj.title.toLowerCase()) || 
                            ach.description.toLowerCase().includes(proj.id.toLowerCase());

        if (titleMatches || descMatches) {
          this.addBidirectionalRelationship(
            graph,
            projNode.id,
            achNode.id,
            'RELATED_TO',
            'RELATED_TO',
            {
              description: `Project ${proj.title} is linked to achievement: ${ach.title}`,
              source: 'manual',
              confidence: 0.9,
              discoveryMethod: 'text_matching'
            }
          );
        }
      });

      // Project ↔ Skill / Tech Stack
      if (proj.techStack) {
        proj.techStack.forEach(tech => {
          const skillId = this.getSkillNodeId(tech);
          this.ensureSkillNodeExists(graph, tech);
          this.addBidirectionalRelationship(
            graph,
            projNode.id,
            skillId,
            'BUILT_WITH',
            'USES',
            {
              description: `Project is built with technology: ${tech}`,
              source: 'manual',
              confidence: 1.0,
              discoveryMethod: 'project_tech_stack'
            }
          );
        });
      }

      // Project ↔ Skills from intelligence profiles
      const intelligence = proj.intelligence;
      if (intelligence && intelligence.technologies) {
        intelligence.technologies.forEach(tech => {
          const skillId = this.getSkillNodeId(tech);
          this.ensureSkillNodeExists(graph, tech);
          this.addBidirectionalRelationship(
            graph,
            projNode.id,
            skillId,
            'BUILT_WITH',
            'USES',
            {
              description: `Repository intelligence extracted technology: ${tech}`,
              source: 'repository_intelligence',
              confidence: 0.95,
              discoveryMethod: 'intelligence_extraction'
            }
          );
        });
      }
    });
  }

  /**
   * Scans free text for mentions of known technologies.
   */
  private static scanTextForTechnologies(text: string): string[] {
    const found: string[] = [];
    const allKnown = [
      ...Array.from(this.LANGUAGES),
      ...Array.from(this.FRAMEWORKS),
      ...Array.from(this.DATABASES),
      ...Array.from(this.TOOLS)
    ];

    allKnown.forEach(tech => {
      const escapedTech = tech.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTech}\\b`, 'i');
      if (regex.test(text)) {
        found.push(tech);
      }
    });

    return found;
  }

  /**
   * Helper to format standard IDs for skill/technology nodes.
   */
  private static getSkillNodeId(name: string): string {
    return `skill:${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
  }

  /**
   * Dynamically create Skill node if it doesn't exist in the graph.
   */
  private static ensureSkillNodeExists(graph: IKnowledgeGraph, name: string): void {
    const id = this.getSkillNodeId(name);
    if (!graph.getNode(id)) {
      const category = this.categorizeTech(name);
      let skillCategory: 'Backend' | 'Frontend' | 'Database' | 'Cloud' | 'AI / ML' | 'Tools' = 'Tools';
      
      if (category === 'Language') skillCategory = 'Backend';
      else if (category === 'Framework') {
        const lower = name.toLowerCase();
        if (lower.includes('react') || lower.includes('leaflet') || lower.includes('vue') || lower.includes('angular') || lower.includes('tailwind')) {
          skillCategory = 'Frontend';
        } else {
          skillCategory = 'Backend';
        }
      }
      else if (category === 'Database') skillCategory = 'Database';
      
      graph.addNode({
        id,
        type: 'Skill',
        label: name,
        properties: {
          description: `${name} technology extracted dynamically.`,
          category: skillCategory,
          level: 'Advanced',
          techType: category,
          originalData: {
            name,
            category: skillCategory,
            level: 'Advanced',
            description: `${name} technology extracted dynamically.`,
            relatedProjects: []
          }
        }
      });
    }
  }

  /**
   * Helper to add a relationship in both directions to the graph with integrity check.
   */
  private static addBidirectionalRelationship(
    graph: IKnowledgeGraph,
    sourceId: string,
    targetId: string,
    forwardType: RelationshipType,
    reverseType: RelationshipType,
    props: { description: string; source: string; confidence: number; discoveryMethod: string }
  ): void {
    if (sourceId === targetId) return;

    // Source must exist
    if (!graph.getNode(sourceId)) {
      return;
    }
    // Target must exist
    if (!graph.getNode(targetId)) {
      return;
    }

    // Forward relationship
    graph.addRelationship({
      sourceId,
      targetId,
      type: forwardType,
      properties: {
        weight: props.confidence,
        ...props
      }
    });

    // Reverse relationship
    graph.addRelationship({
      sourceId: targetId,
      targetId: sourceId,
      type: reverseType,
      properties: {
        weight: props.confidence,
        description: `Reverse link: ${props.description}`,
        source: props.source,
        confidence: props.confidence,
        discoveryMethod: props.discoveryMethod
      }
    });
  }

  // ==========================================
  // QUERY & REVERSE LOOKUP API
  // ==========================================

  /**
   * Which repositories use a specific technology? (e.g. "FastAPI", "Spring Boot")
   */
  public static findRepositoriesByTech(graph: IKnowledgeGraph, techName: string): KnowledgeNode[] {
    const techId = this.getSkillNodeId(techName);
    const neighbors = graph.getNeighbors(techId, 'incoming');
    return neighbors
      .filter(n => n.node.type === 'Repository' && (n.relationship.type === 'USES' || n.relationship.type === 'BUILT_WITH'))
      .map(n => n.node);
  }

  /**
   * Which projects use a specific technology? (e.g. "Docker", "Kafka")
   */
  public static findProjectsByTech(graph: IKnowledgeGraph, techName: string): KnowledgeNode[] {
    const techId = this.getSkillNodeId(techName);
    const neighbors = graph.getNeighbors(techId, 'incoming');
    return neighbors
      .filter(n => n.node.type === 'Project' && (n.relationship.type === 'USES' || n.relationship.type === 'BUILT_WITH'))
      .map(n => n.node);
  }

  /**
   * What technologies are shared between two projects/repositories? (e.g. "SAHAI" and "ORBITAIR")
   */
  public static findSharedTechnologies(graph: IKnowledgeGraph, entity1Name: string, entity2Name: string): KnowledgeNode[] {
    const id1 = this.resolveEntityNodeId(graph, entity1Name);
    const id2 = this.resolveEntityNodeId(graph, entity2Name);

    if (!id1 || !id2) return [];

    const neighbors1 = graph.getNeighbors(id1, 'outgoing');
    const neighbors2 = graph.getNeighbors(id2, 'outgoing');

    const techs1 = neighbors1.filter(n => n.node.type === 'Skill').map(n => n.node);
    const techs2 = neighbors2.filter(n => n.node.type === 'Skill').map(n => n.node);

    const map2 = new Map(techs2.map(t => [t.id, t]));
    return techs1.filter(t => map2.has(t.id));
  }

  /**
   * What repositories use both of the specified technologies? (e.g. "FastAPI" and "React")
   */
  public static findRepositoriesWithAllTech(graph: IKnowledgeGraph, techNames: string[]): KnowledgeNode[] {
    if (techNames.length === 0) return [];
    
    let candidates: KnowledgeNode[] = this.findRepositoriesByTech(graph, techNames[0]);

    for (let i = 1; i < techNames.length; i++) {
      const currentTechRepos = this.findRepositoriesByTech(graph, techNames[i]);
      const currentIds = new Set(currentTechRepos.map(r => r.id));
      candidates = candidates.filter(c => currentIds.has(c.id));
    }

    return candidates;
  }

  /**
   * Utility to resolve entity name to graph node ID.
   */
  private static resolveEntityNodeId(graph: IKnowledgeGraph, name: string): string | null {
    const lower = name.toLowerCase().trim();
    const nodes = graph.getNodes();
    
    // Exact match on label or id
    for (const node of nodes) {
      if (node.label.toLowerCase() === lower || node.id.split(':').slice(1).join(':').toLowerCase() === lower) {
        return node.id;
      }
    }
    
    // Substring match
    for (const node of nodes) {
      if (node.label.toLowerCase().includes(lower)) {
        return node.id;
      }
    }

    return null;
  }

  /**
   * Generates graph diagnostics.
   */
  public static getDiagnostics(graph: IKnowledgeGraph) {
    const nodes = graph.getNodes();
    const relationships = graph.getRelationships();

    // Most connected technologies (Skills)
    const techConnections = graph.getNodesByType('Skill').map(node => {
      const count = graph.getRelationshipsForNode(node.id).length;
      return { name: node.label, count };
    });
    techConnections.sort((a, b) => b.count - a.count);

    // Most connected repositories
    const repoConnections = graph.getNodesByType('Repository').map(node => {
      const count = graph.getRelationshipsForNode(node.id).length;
      return { name: node.label, count };
    });
    repoConnections.sort((a, b) => b.count - a.count);

    return {
      totalNodes: nodes.length,
      totalRelationships: relationships.length,
      mostConnectedTechnologies: techConnections.slice(0, 5),
      mostConnectedRepositories: repoConnections.slice(0, 5)
    };
  }
}
