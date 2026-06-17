import { GitHubRepository, RepositoryIntelligence, Project } from '../types';
import { extractTechnologyProfile } from './technologyExtractor';

/**
 * Generates repository intelligence metrics using deterministic rules only.
 * Consumed by repo detail panels and future ORACLE search vectors.
 */
export function generateRepositoryIntelligence(
  repo: GitHubRepository,
  readme: string,
  project?: Project
): RepositoryIntelligence {
  const contentToSearch = `${repo.name} ${repo.description || ''} ${repo.topics.join(' ')} ${readme}`.toLowerCase();

  // 1. Determine Project Type
  let projectType = 'Software Repository';
  if (contentToSearch.includes('microservice') || contentToSearch.includes('microservices')) {
    projectType = 'Microservices Architecture';
  } else if (contentToSearch.includes('vector database') || contentToSearch.includes('similarity search') || contentToSearch.includes('novadb')) {
    projectType = 'Distributed Database Engine';
  } else if (contentToSearch.includes('multi-agent') || contentToSearch.includes('aetheragent') || contentToSearch.includes('orchestration') || contentToSearch.includes('agent')) {
    projectType = 'Autonomous Agent Framework';
  } else if (contentToSearch.includes('logpulse') || contentToSearch.includes('ingestion') || contentToSearch.includes('kafka')) {
    projectType = 'Data Ingestion Pipeline';
  } else if (contentToSearch.includes('aqi') || contentToSearch.includes('forecasting') || contentToSearch.includes('orbitair')) {
    projectType = 'Geospatial Forecasting Platform';
  } else if (contentToSearch.includes('library') || contentToSearch.includes('framework')) {
    projectType = 'Developer Utility Library';
  } else if (contentToSearch.includes('sahai') || contentToSearch.includes('mental health')) {
    projectType = 'Intelligent Web Platform';
  }

  // 2. Determine Technologies
  const knownTech = [
    { name: 'Spring Boot', keywords: ['spring boot', 'springboot'] },
    { name: 'Kafka', keywords: ['kafka'] },
    { name: 'gRPC', keywords: ['grpc', 'protobuf'] },
    { name: 'Docker', keywords: ['docker', 'container'] },
    { name: 'FastAPI', keywords: ['fastapi'] },
    { name: 'Django', keywords: ['django'] },
    { name: 'React', keywords: ['react'] },
    { name: 'WebSockets', keywords: ['websocket', 'websockets'] },
    { name: 'MySQL', keywords: ['mysql'] },
    { name: 'Pinecone', keywords: ['pinecone'] },
    { name: 'TimescaleDB', keywords: ['timescaledb', 'timescale'] },
    { name: 'Leaflet', keywords: ['leaflet'] },
    { name: 'Hibernate', keywords: ['hibernate'] },
    { name: 'Spring Security', keywords: ['spring security'] },
    { name: 'Redis', keywords: ['redis'] },
    { name: 'Go', keywords: ['golang', 'go language'] },
    { name: 'Rust', keywords: ['rustlang', 'rust language'] },
    { name: 'TypeScript', keywords: ['typescript'] },
    { name: 'RabbitMQ', keywords: ['rabbitmq'] }
  ];

  const technologies = new Set<string>();
  if (repo.language) {
    technologies.add(repo.language);
  }
  
  knownTech.forEach(tech => {
    tech.keywords.forEach(kw => {
      if (contentToSearch.includes(kw)) {
        technologies.add(tech.name);
      }
    });
  });

  // 3. Determine Key Concepts
  const keyConceptsList = [
    { concept: 'Distributed Consensus (Raft)', keywords: ['raft', 'consensus'] },
    { concept: 'Vector Similarity Search', keywords: ['vector', 'similarity', 'ann'] },
    { concept: 'Retrieval-Augmented Generation (RAG)', keywords: ['rag', 'retrieval-augmented', 'pinecone'] },
    { concept: 'Event-Driven Streaming', keywords: ['event-driven', 'kafka', 'message queue'] },
    { concept: 'Binary RPC Communication', keywords: ['grpc', 'protobuf', 'rpc'] },
    { concept: 'Real-Time Bidirectional Comms', keywords: ['websocket', 'websockets', 'socket.io'] },
    { concept: 'Time-Series Geospatial Partitioning', keywords: ['timescaledb', 'hypertable', 'geospatial'] },
    { concept: 'Microservice Gateway & RBAC', keywords: ['gateway', 'spring security', 'rbac'] },
    { concept: 'Multi-Agent State Orchestration', keywords: ['agent', 'orchestration', 'workflow'] }
  ];

  const keyConcepts: string[] = [];
  keyConceptsList.forEach(item => {
    item.keywords.forEach(kw => {
      if (contentToSearch.includes(kw) && !keyConcepts.includes(item.concept)) {
        keyConcepts.push(item.concept);
      }
    });
  });

  if (keyConcepts.length === 0) {
    keyConcepts.push('Open-Source Collaboration');
  }

  // 4. Determine Project Category
  let projectCategory = 'Backend Engineering';
  if (contentToSearch.includes('agent') || contentToSearch.includes('llm') || contentToSearch.includes('rag') || contentToSearch.includes('vector') || contentToSearch.includes('forecast')) {
    projectCategory = 'AI & Data Engineering';
  } else if (contentToSearch.includes('react') || contentToSearch.includes('css') || contentToSearch.includes('leaflet') || contentToSearch.includes('frontend')) {
    projectCategory = 'Frontend Engineering';
  } else if (contentToSearch.includes('distributed') || contentToSearch.includes('raft') || contentToSearch.includes('consensus') || contentToSearch.includes('microservice')) {
    projectCategory = 'Distributed Systems';
  }

  // 5. Determine Complexity Indicators
  const complexityIndicators: string[] = [];
  if (technologies.size >= 4) {
    complexityIndicators.push('Polyglot Tech Stack Ingestion');
  }
  if (contentToSearch.includes('grpc') && contentToSearch.includes('kafka')) {
    complexityIndicators.push('Multi-Protocol Streaming Topology');
  }
  if (contentToSearch.includes('raft') || contentToSearch.includes('consensus')) {
    complexityIndicators.push('Distributed Consensus Management');
  }
  if (contentToSearch.includes('pinecone') || contentToSearch.includes('vector database')) {
    complexityIndicators.push('High-Dimensional Vector Spaces');
  }
  if (contentToSearch.includes('timescaledb') || contentToSearch.includes('leaflet')) {
    complexityIndicators.push('Geospatial Hypertable Scaling');
  }
  if (readme.length > 1500) {
    complexityIndicators.push('Extensive System Documentation');
  }
  if (readme.includes('```')) {
    complexityIndicators.push('Code Snippet Demonstrations');
  }

  if (complexityIndicators.length === 0) {
    complexityIndicators.push('Standard Structural Patterns');
  }

  // 6. Determine Repository Activity (compared to current time: June 2026)
  let activityLevel: 'High' | 'Medium' | 'Low' | 'Stable Archive' = 'Stable Archive';
  const lastUpdated = new Date(repo.updatedAt);
  const now = new Date('2026-06-16');
  const diffTime = Math.abs(now.getTime() - lastUpdated.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) {
    activityLevel = 'High';
  } else if (diffDays <= 90) {
    activityLevel = 'Medium';
  } else if (diffDays <= 180) {
    activityLevel = 'Low';
  }

  const technologyProfile = extractTechnologyProfile(repo, readme, project);

  return {
    projectType,
    technologies: Array.from(technologies),
    keyConcepts,
    projectCategory,
    complexityIndicators,
    activityLevel,
    technologyProfile
  };
}
