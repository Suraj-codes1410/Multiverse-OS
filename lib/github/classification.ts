import { GitHubRepository, RepositoryIntelligence } from '../types';
import { KnowledgeGraph } from '../knowledge/graph';

/**
 * Deterministically classifies a GitHub repository into supported categories:
 * - Backend Engineering
 * - Frontend Development
 * - Full Stack Development
 * - AI Engineering
 * - Data Engineering
 * - Distributed Systems
 * - Developer Tools
 * - Open Source
 *
 * Uses repository metadata, topics, languages, intelligence metrics, and optionally
 * adjacent knowledge graph nodes (skills, projects) for high fidelity taxonomy mapping.
 */
export function classifyRepository(
  repo: GitHubRepository,
  intelligence?: RepositoryIntelligence,
  graph?: KnowledgeGraph
): string[] {
  const categories = new Set<string>();
  const repoNameLower = repo.name.toLowerCase();

  // Normalize topics and compile search keywords
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const language = (repo.language || '').toLowerCase();
  
  // Combine core text context
  const textContext = `${repo.name} ${repo.description || ''} ${topics.join(' ')} ${language}`.toLowerCase();
  
  // If intelligence is available, enrich search context
  const intelTechnologies = (intelligence?.technologies || []).map(t => t.toLowerCase());
  const intelConcepts = (intelligence?.keyConcepts || []).map(c => c.toLowerCase());
  const intelComplexity = (intelligence?.complexityIndicators || []).map(c => c.toLowerCase());
  const intelProjType = (intelligence?.projectType || '').toLowerCase();
  const intelProjCategory = (intelligence?.projectCategory || '').toLowerCase();
  
  // Query the graph if it is passed
  const graphSkills: string[] = [];
  const graphProjects: string[] = [];
  
  if (graph) {
    const repoId = `repository:${repo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
    const neighbors = graph.getNeighbors(repoId, 'both');
    neighbors.forEach(({ node }) => {
      if (node.type === 'Skill') {
        graphSkills.push(node.label.toLowerCase());
        if (node.properties.category) {
          graphSkills.push(String(node.properties.category).toLowerCase());
        }
        if (node.properties.relatedDomain) {
          graphSkills.push(String(node.properties.relatedDomain).toLowerCase());
        }
      } else if (node.type === 'Project') {
        graphProjects.push(node.label.toLowerCase());
        if (node.properties.description) {
          graphProjects.push(String(node.properties.description).toLowerCase());
        }
        if (node.properties.category) {
          graphProjects.push(String(node.properties.category).toLowerCase());
        }
      }
    });
  }

  const allSkillsContext = [...intelTechnologies, ...graphSkills];
  const allProjectsContext = [...graphProjects];

  // Helper check function
  const hasKeyword = (kws: string[]) => {
    return kws.some(kw => 
      textContext.includes(kw) || 
      intelConcepts.some(c => c.includes(kw)) ||
      intelComplexity.some(c => c.includes(kw)) ||
      allSkillsContext.some(s => s.includes(kw)) ||
      allProjectsContext.some(p => p.includes(kw)) ||
      intelProjType.includes(kw) ||
      intelProjCategory.includes(kw)
    );
  };

  // 1. Backend Engineering
  const isBackendLanguage = ['java', 'go', 'python', 'rust', 'c++', 'c', 'kotlin', 'c#'].includes(language);
  const hasBackendTopic = topics.some(t => ['backend', 'spring-boot', 'fastapi', 'django', 'grpc', 'microservices', 'sql', 'mysql', 'postgres', 'postgresql', 'redis', 'hibernate', 'orm'].includes(t));
  const hasBackendKeyword = hasKeyword(['spring boot', 'springboot', 'fastapi', 'django', 'grpc', 'protobuf', 'rest api', 'microservice', 'microservices', 'hibernate', 'spring security', 'postgres', 'mysql', 'database', 'sql', 'backend engineering', 'server', 'routing', 'rbac', 'authorization']);
  
  if (isBackendLanguage || hasBackendTopic || hasBackendKeyword || intelProjCategory === 'backend engineering') {
    categories.add('Backend Engineering');
  }

  // 2. Frontend Development
  const isFrontendLanguage = ['typescript', 'javascript', 'html', 'css'].includes(language);
  const hasFrontendTopic = topics.some(t => ['react', 'nextjs', 'frontend', 'ui', 'ux', 'tailwind', 'css', 'leaflet', 'html'].includes(t));
  const hasFrontendKeyword = hasKeyword(['react', 'nextjs', 'frontend', 'ui', 'ux', 'leaflet', 'dashboard', 'tailwind', 'component', 'components', 'client side', 'browser', 'rendering', 'css', 'html', 'style']);
  
  if (isFrontendLanguage || hasFrontendTopic || hasFrontendKeyword || intelProjCategory === 'frontend engineering') {
    categories.add('Frontend Development');
  }

  // 3. Full Stack Development
  const hasFullStackTopic = topics.some(t => ['fullstack', 'full-stack', 'website', 'platform'].includes(t));
  const hasFullStackKeyword = hasKeyword(['fullstack', 'full-stack', 'lifestyle platform', 'mental health platform', 'dossier', 'aqi forecasting platform']);
  const hasBothFrontAndBack = categories.has('Backend Engineering') && categories.has('Frontend Development');
  
  if (hasFullStackTopic || hasFullStackKeyword || hasBothFrontAndBack || repoNameLower === 'sahai' || repoNameLower === 'orbitair') {
    categories.add('Full Stack Development');
  }

  // 4. AI Engineering
  const hasAITopic = topics.some(t => ['llm', 'agents', 'ai', 'ml', 'machine-learning', 'rag', 'pinecone', 'pytorch', 'forecasting'].includes(t));
  const hasAIKeyword = hasKeyword(['llm', 'agent', 'agents', 'artificial intelligence', 'machine learning', 'rag', 'retrieval-augmented', 'pinecone', 'pytorch', 'tensorflow', 'deep learning', 'vector search', 'forecasting', 'anomaly detection', 'model training', 'predictive', 'geospatial forecasting', 'neural']);
  
  if (hasAITopic || hasAIKeyword || intelProjCategory === 'ai & data engineering' || repoNameLower === 'orbitair' || repoNameLower === 'sahai') {
    categories.add('AI Engineering');
  }

  // 5. Data Engineering
  const hasDataTopic = topics.some(t => ['data-engineering', 'pipeline', 'ingestion', 'kafka', 'timescaledb', 'timescale', 'elasticsearch', 'stream', 'analytics'].includes(t));
  const hasDataKeyword = hasKeyword(['pipeline', 'ingestion', 'log ingestion', 'data pipeline', 'timescaledb', 'kafka', 'message queue', 'stream processing', 'event-driven streaming', 'geospatial indexing', 'analytics', 'etl', 'hypertable', 'data engineering']);
  
  if (hasDataTopic || hasDataKeyword || intelProjCategory === 'ai & data engineering' || repoNameLower === 'orbitair') {
    categories.add('Data Engineering');
  }

  // 6. Distributed Systems
  const hasDistributedTopic = topics.some(t => ['distributed', 'microservices', 'raft', 'consensus', 'grpc', 'kafka', 'rabbitmq', 'clustering'].includes(t));
  const hasDistributedKeyword = hasKeyword(['distributed', 'microservices', 'microservice', 'raft', 'consensus', 'grpc', 'protobuf', 'kafka', 'rabbitmq', 'message broker', 'event-driven', 'clustering', 'replication', 'high-performance distributed', 'load balancer', 'gateway']);
  
  if (hasDistributedTopic || hasDistributedKeyword || intelProjCategory === 'distributed systems' || repoNameLower === 'patient-management-service') {
    categories.add('Distributed Systems');
  }

  // 7. Developer Tools
  const hasDevToolsTopic = topics.some(t => ['framework', 'library', 'cli', 'tool', 'utils', 'sdk', 'developer-tool'].includes(t));
  const hasDevToolsKeyword = hasKeyword(['framework', 'library', 'cli', 'utility', 'developer tools', 'developer utility', 'sdk', 'orchestration framework', 'database engine', 'testing framework', 'pipeline framework', 'agent framework']);
  
  if (hasDevToolsTopic || hasDevToolsKeyword) {
    categories.add('Developer Tools');
  }

  // 8. Open Source
  // All public repositories in our portfolio are open source.
  categories.add('Open Source');

  return Array.from(categories);
}
