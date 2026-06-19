import { GitHubRepository, ArchitectureAnalysis, TechnologyProfile, Project } from '../types';

export function analyzeArchitecture(
  repo: GitHubRepository,
  readme: string,
  technologyProfile?: TechnologyProfile,
  project?: Project
): ArchitectureAnalysis {
  // Normalize all texts
  const repoNameLower = repo.name.toLowerCase();
  const repoDesc = (repo.description || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const language = (repo.language || '').toLowerCase();
  const readmeLower = readme.toLowerCase();

  const textContext = [
    repoNameLower,
    repoDesc,
    ...topics,
    language,
    readmeLower,
    project?.subtitle?.toLowerCase() || '',
    project?.description?.toLowerCase() || '',
    project?.architecture?.toLowerCase() || ''
  ].join(' ');

  // 1. Detect Communication Protocols/Tools
  const communication: string[] = [];
  if (textContext.includes('grpc') || textContext.includes('protobuf')) {
    communication.push('gRPC');
  }
  if (textContext.includes('kafka')) {
    communication.push('Kafka');
  }
  if (textContext.includes('rabbitmq')) {
    communication.push('RabbitMQ');
  }
  if (textContext.includes('websocket') || textContext.includes('websockets') || textContext.includes('socket.io')) {
    communication.push('WebSockets');
  }
  if (textContext.includes('rest') || textContext.includes('http') || textContext.includes('fastapi') || textContext.includes('express')) {
    if (!communication.includes('HTTP/REST')) {
      communication.push('HTTP/REST');
    }
  }

  // 2. Detect Security
  const security: string[] = [];
  if (textContext.includes('spring security') || textContext.includes('spring-security')) {
    security.push('Spring Security');
  }
  if (textContext.includes('rbac') || textContext.includes('role-based access control') || textContext.includes('authorization')) {
    security.push('RBAC');
  }
  if (textContext.includes('jwt') || textContext.includes('json web token')) {
    security.push('JWT');
  }
  if (textContext.includes('oauth') || textContext.includes('oauth2')) {
    security.push('OAuth2');
  }

  // 3. Detect Data Layer
  const dataLayer: string[] = [];
  const dbCatalog = [
    { name: 'TimescaleDB', keywords: ['timescaledb', 'timescale'] },
    { name: 'Pinecone', keywords: ['pinecone'] },
    { name: 'Redis', keywords: ['redis'] },
    { name: 'MySQL', keywords: ['mysql'] },
    { name: 'PostgreSQL', keywords: ['postgres', 'postgresql'] },
    { name: 'Elasticsearch', keywords: ['elasticsearch', 'elastic search'] },
    { name: 'SQLite', keywords: ['sqlite'] },
    { name: 'MongoDB', keywords: ['mongodb', 'mongo '] }
  ];
  dbCatalog.forEach(db => {
    const matched = db.keywords.some(kw => textContext.includes(kw));
    if (matched) {
      dataLayer.push(db.name);
    }
  });

  // 4. Determine Architecture Pattern
  let architecturePattern = 'Monolith'; // default fallback

  // Rule-based classification
  const isMicroservices = textContext.includes('microservice') || textContext.includes('microservices') || (communication.includes('gRPC') && communication.includes('Kafka'));
  const isEventDriven = textContext.includes('event-driven') || textContext.includes('event driven') || topics.includes('kafka') || topics.includes('rabbitmq') || communication.includes('Kafka') || communication.includes('RabbitMQ');
  const isAnalyticsPlatform = textContext.includes('analytics') || textContext.includes('forecasting') || textContext.includes('dashboard') || textContext.includes('leaflet') || textContext.includes('timescaledb');
  const isFullStack = (technologyProfile?.categories['Backend']?.length || 0) > 0 && (technologyProfile?.categories['Frontend']?.length || 0) > 0;
  const isApiDriven = textContext.includes('api driven') || textContext.includes('api-driven') || ((technologyProfile?.categories['Backend']?.length || 0) > 0 && (technologyProfile?.categories['Frontend']?.length || 0) === 0);

  if (repoNameLower === 'orbitair' || (isAnalyticsPlatform && isFullStack && dataLayer.includes('TimescaleDB'))) {
    architecturePattern = 'Backend API + Analytics Dashboard';
  } else if (isMicroservices || repoNameLower === 'patient-management-service') {
    architecturePattern = 'Microservices';
  } else if (isAnalyticsPlatform) {
    architecturePattern = 'Analytics Platform';
  } else if (isEventDriven) {
    architecturePattern = 'Event Driven';
  } else if (isFullStack || repoNameLower === 'sahai') {
    architecturePattern = 'Full Stack';
  } else if (isApiDriven) {
    architecturePattern = 'API Driven';
  }

  // Create the returned object
  const analysis: ArchitectureAnalysis = {
    architecturePattern
  };

  if (communication.length > 0) {
    analysis.communication = communication;
  }
  if (security.length > 0) {
    analysis.security = security;
  }
  if (dataLayer.length > 0) {
    analysis.dataLayer = dataLayer;
  }

  return analysis;
}
