import { buildKnowledgeGraph } from '../knowledge/builder';
import { getProjects } from '../content';
import { Project } from '../types';

export interface DiscoveryResult {
  query: string;
  matchedFilters: {
    category?: string;
    technology?: string;
    text?: string;
  };
  projects: Project[];
}

/**
 * Deterministic discovery service for programmatically searching and filtering
 * repositories and projects using classification, intelligence, and graph linkages.
 * 
 * Prepares integrations for CLI commands, ORACLE query gateways, and recruiter portals.
 */
export async function discoverRepositories(queryText: string): Promise<DiscoveryResult> {
  const normalizedQuery = queryText.toLowerCase().trim();
  const graph = await buildKnowledgeGraph();
  const allProjects = await getProjects();

  const matchedFilters: {
    category?: string;
    technology?: string;
    text?: string;
  } = {};

  // 1. Identify category filters
  let targetCategory: string | undefined = undefined;
  if (normalizedQuery.includes('ai') || normalizedQuery.includes('machine learning') || normalizedQuery.includes('ml')) {
    targetCategory = 'AI Engineering';
    matchedFilters.category = 'AI Engineering';
  } else if (normalizedQuery.includes('backend')) {
    targetCategory = 'Backend Engineering';
    matchedFilters.category = 'Backend Engineering';
  } else if (normalizedQuery.includes('distributed')) {
    targetCategory = 'Distributed Systems';
    matchedFilters.category = 'Distributed Systems';
  } else if (normalizedQuery.includes('frontend')) {
    targetCategory = 'Frontend Development';
    matchedFilters.category = 'Frontend Development';
  } else if (normalizedQuery.includes('full stack') || normalizedQuery.includes('fullstack')) {
    targetCategory = 'Full Stack Development';
    matchedFilters.category = 'Full Stack Development';
  } else if (normalizedQuery.includes('data')) {
    targetCategory = 'Data Engineering';
    matchedFilters.category = 'Data Engineering';
  } else if (normalizedQuery.includes('tool')) {
    targetCategory = 'Developer Tools';
    matchedFilters.category = 'Developer Tools';
  }

  // 2. Identify technology filters
  let targetTech: string | undefined = undefined;
  const knownTechs = [
    'FastAPI', 'Kafka', 'React', 'Spring Boot', 'gRPC', 'Docker', 'TimescaleDB', 'Pinecone', 'Redis', 'MySQL', 'PostgreSQL', 'Elasticsearch', 'RabbitMQ', 'WebSockets', 'PyTorch', 'Django', 'Go', 'Rust', 'Java', 'Python', 'TypeScript', 'JavaScript'
  ];

  for (const tech of knownTechs) {
    if (normalizedQuery.includes(tech.toLowerCase())) {
      targetTech = tech;
      matchedFilters.technology = tech;
      break;
    }
  }

  // 3. Filter the projects
  let matchedProjects = [...allProjects];

  if (targetCategory) {
    matchedProjects = matchedProjects.filter(project => {
      // Check repository classifications
      const repoClass = project.githubRepository?.classifications || [];
      if (repoClass.some(c => c.toLowerCase() === targetCategory!.toLowerCase())) {
        return true;
      }
      // Check intelligence category
      if (project.intelligence?.projectCategory?.toLowerCase() === targetCategory!.toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  if (targetTech) {
    // Query Knowledge Graph for nodes connected to this technology
    // Match skillId format from builder: skill:name-hyphenated
    const techSkillId = `skill:${targetTech.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
    const skillNode = graph.getNode(techSkillId);

    if (skillNode) {
      const neighbors = graph.getNeighbors(techSkillId, 'both');
      const connectedProjectIds = neighbors
        .filter(n => n.node.type === 'Project')
        .map(n => n.node.id.replace('project:', ''));

      matchedProjects = matchedProjects.filter(project => {
        if (connectedProjectIds.includes(project.id.toLowerCase())) {
          return true;
        }
        if (project.techStack?.some(t => t.toLowerCase() === targetTech!.toLowerCase())) {
          return true;
        }
        if (project.intelligence?.technologies?.some(t => t.toLowerCase() === targetTech!.toLowerCase())) {
          return true;
        }
        return false;
      });
    } else {
      matchedProjects = matchedProjects.filter(project => {
        return (
          project.techStack?.some(t => t.toLowerCase() === targetTech!.toLowerCase()) ||
          project.intelligence?.technologies?.some(t => t.toLowerCase() === targetTech!.toLowerCase())
        );
      });
    }
  }

  // 4. Free-text matching fallback if no specific category or technology was identified
  if (!targetCategory && !targetTech) {
    matchedFilters.text = normalizedQuery;
    matchedProjects = matchedProjects.filter(project => {
      const searchText = [
        project.title,
        project.subtitle,
        project.description,
        project.techStack.join(' '),
        project.githubRepository?.name || '',
        project.githubRepository?.description || '',
        project.githubRepository?.topics.join(' ') || '',
        project.intelligence?.projectType || '',
        project.intelligence?.projectCategory || '',
        project.intelligence?.keyConcepts.join(' ') || '',
        project.intelligence?.complexityIndicators.join(' ') || '',
        project.intelligence?.architectureAnalysis?.architecturePattern || ''
      ].join(' ').toLowerCase();

      return searchText.includes(normalizedQuery);
    });
  }

  return {
    query: queryText,
    matchedFilters,
    projects: matchedProjects
  };
}
