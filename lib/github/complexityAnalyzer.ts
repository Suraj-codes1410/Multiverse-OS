import { GitHubRepository, ComplexityAnalysis, TechnologyProfile, ArchitectureAnalysis, Project, ComplexityDimension } from '../types';

export function analyzeComplexity(
  repo: GitHubRepository,
  readme: string,
  technologyProfile?: TechnologyProfile,
  architectureAnalysis?: ArchitectureAnalysis,
  project?: Project
): ComplexityAnalysis {
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

  // Gather all technologies
  const allTechs: string[] = [];
  if (technologyProfile) {
    Object.values(technologyProfile.categories).forEach(techList => {
      techList.forEach(t => {
        if (!allTechs.includes(t)) {
          allTechs.push(t);
        }
      });
    });
  }
  if (repo.language && !allTechs.includes(repo.language)) {
    allTechs.push(repo.language);
  }

  // ==========================================
  // 1. Technology Count Dimension
  // ==========================================
  let techScore = 1;
  let techRating: 'Low' | 'Medium' | 'High' = 'Low';
  const techDetails: string[] = [];

  const techCount = allTechs.length;
  if (techCount >= 5) {
    techScore = 3;
    techRating = 'High';
  } else if (techCount >= 3) {
    techScore = 2;
    techRating = 'Medium';
  }

  techDetails.push(`Detected ${techCount} distinct technologies: ${allTechs.join(', ')}.`);
  if (techRating === 'High') {
    techDetails.push('Polyglot environment with high framework density.');
  } else if (techRating === 'Medium') {
    techDetails.push('Multi-language stack with standard tooling integration.');
  } else {
    techDetails.push('Focused single-language runtime environment.');
  }

  const technologyCount: ComplexityDimension = {
    score: techScore,
    maxScore: 3,
    rating: techRating,
    details: techDetails
  };

  // ==========================================
  // 2. Architecture Complexity Dimension
  // ==========================================
  let archScore = 1;
  let archRating: 'Low' | 'Medium' | 'High' = 'Low';
  const archDetails: string[] = [];

  const pattern = architectureAnalysis?.architecturePattern || 'Monolith';
  if (pattern === 'Microservices' || pattern === 'Backend API + Analytics Dashboard') {
    archScore = 3;
    archRating = 'High';
  } else if (pattern === 'Event Driven' || pattern === 'Analytics Platform' || pattern === 'Full Stack' || pattern === 'API Driven') {
    archScore = 2;
    archRating = 'Medium';
  }

  archDetails.push(`Architecture pattern classified as: ${pattern}.`);
  if (archRating === 'High') {
    archDetails.push('Distributed topology requiring service isolation and coordination.');
  } else if (archRating === 'Medium') {
    archDetails.push('Multi-tier integration pattern with distinct processing stages.');
  } else {
    archDetails.push('Colocated monolothic design with unified codebase execution.');
  }

  const architectureComplexity: ComplexityDimension = {
    score: archScore,
    maxScore: 3,
    rating: archRating,
    details: archDetails
  };

  // ==========================================
  // 3. Infrastructure Complexity Dimension
  // ==========================================
  let infraScore = 1;
  let infraRating: 'Low' | 'Medium' | 'High' = 'Low';
  const infraDetails: string[] = [];

  const infraComponents: string[] = [];
  const highInfraKeywords = [
    { name: 'Docker', keywords: ['docker', 'container'] },
    { name: 'Kubernetes', keywords: ['kubernetes', 'k8s'] },
    { name: 'Kafka', keywords: ['kafka'] },
    { name: 'RabbitMQ', keywords: ['rabbitmq'] },
    { name: 'Raft Consensus', keywords: ['raft', 'consensus'] }
  ];
  const medInfraKeywords = [
    { name: 'TimescaleDB', keywords: ['timescaledb', 'timescale'] },
    { name: 'Pinecone', keywords: ['pinecone'] },
    { name: 'Redis', keywords: ['redis'] },
    { name: 'MySQL', keywords: ['mysql'] },
    { name: 'PostgreSQL', keywords: ['postgres', 'postgresql'] },
    { name: 'Elasticsearch', keywords: ['elasticsearch', 'elastic search'] }
  ];

  highInfraKeywords.forEach(k => {
    if (textContext.includes(k.keywords[0])) infraComponents.push(k.name);
  });
  medInfraKeywords.forEach(k => {
    if (textContext.includes(k.keywords[0])) infraComponents.push(k.name);
  });

  const highCount = highInfraKeywords.filter(k => k.keywords.some(kw => textContext.includes(kw))).length;
  const medCount = medInfraKeywords.filter(k => k.keywords.some(kw => textContext.includes(kw))).length;

  if (highCount >= 1 || medCount >= 3) {
    infraScore = 3;
    infraRating = 'High';
  } else if (medCount >= 1) {
    infraScore = 2;
    infraRating = 'Medium';
  }

  if (infraComponents.length > 0) {
    infraDetails.push(`Identified infrastructure components: ${infraComponents.join(', ')}.`);
  } else {
    infraDetails.push('No advanced database, container, or message brokers detected.');
  }

  if (infraRating === 'High') {
    infraDetails.push('Containerized runtimes, event queues, or distributed state systems require deep ops orchestration.');
  } else if (infraRating === 'Medium') {
    infraDetails.push('Utilizes structured databases or indexing caches requiring storage configuration.');
  } else {
    infraDetails.push('Standard file-based storage or SQLite fallback configuration.');
  }

  const infrastructureComplexity: ComplexityDimension = {
    score: infraScore,
    maxScore: 3,
    rating: infraRating,
    details: infraDetails
  };

  // ==========================================
  // 4. Service Count Dimension
  // ==========================================
  let serviceScore = 1;
  let serviceRating: 'Low' | 'Medium' | 'High' = 'Low';
  const serviceDetails: string[] = [];

  const servicesList: string[] = [];
  
  // Detect frontend service
  const hasFrontend = allTechs.some(t => ['React', 'Next.js', 'Vue', 'Angular', 'HTML/CSS'].includes(t));
  if (hasFrontend) servicesList.push('Frontend User Interface');

  // Detect backend service
  const hasBackend = allTechs.some(t => ['FastAPI', 'Spring Boot', 'Django', 'Express', 'NestJS', 'Flask', 'Go', 'Rust', 'Java', 'Python', 'Node.js'].includes(t));
  if (hasBackend) servicesList.push('Backend API Server');

  // Detect database service
  const hasDb = medInfraKeywords.some(k => textContext.includes(k.keywords[0])) || textContext.includes('novadb') || textContext.includes('mongodb');
  if (hasDb) servicesList.push('Storage Database');

  // Detect broker service
  const hasBroker = textContext.includes('kafka') || textContext.includes('rabbitmq');
  if (hasBroker) servicesList.push('Message Queue Broker');

  // Detect background worker / analytics
  const hasWorker = textContext.includes('worker') || textContext.includes('anomaly') || textContext.includes('agent') || textContext.includes('pipeline') || textContext.includes('forecasting');
  if (hasWorker) servicesList.push('Background Processing Worker');

  const servCount = servicesList.length;
  if (servCount >= 4) {
    serviceScore = 3;
    serviceRating = 'High';
  } else if (servCount >= 2) {
    serviceScore = 2;
    serviceRating = 'Medium';
  }

  serviceDetails.push(`Identified ${servCount} system services: ${servicesList.join(', ')}.`);
  if (serviceRating === 'High') {
    serviceDetails.push('Multi-layered application stack with independent runtime processes.');
  } else if (serviceRating === 'Medium') {
    serviceDetails.push('Standard two-tier client-server structure.');
  } else {
    serviceDetails.push('Single unified process execution scope.');
  }

  const serviceCount: ComplexityDimension = {
    score: serviceScore,
    maxScore: 3,
    rating: serviceRating,
    details: serviceDetails
  };

  // ==========================================
  // 5. Integration Count Dimension
  // ==========================================
  let integrationScore = 1;
  let integrationRating: 'Low' | 'Medium' | 'High' = 'Low';
  const integrationDetails: string[] = [];

  const integrations: string[] = [];
  // Detect protocol integrations
  if (textContext.includes('grpc')) integrations.push('gRPC RPC Interops');
  if (textContext.includes('websocket') || textContext.includes('websockets')) integrations.push('WebSocket real-time streams');
  if (textContext.includes('kafka')) integrations.push('Kafka messaging pipelines');
  if (textContext.includes('rabbitmq')) integrations.push('RabbitMQ queue handlers');
  
  // Detect domain integrations
  if (textContext.includes('pinecone') || textContext.includes('rag')) integrations.push('Pinecone Vector Search / RAG');
  if (textContext.includes('pytorch') || textContext.includes('tensorflow') || textContext.includes('anomaly-detection')) integrations.push('AI / ML Auditing model integration');
  if (textContext.includes('satellite') || textContext.includes('aqi') || textContext.includes('tempo') || textContext.includes('nasa')) integrations.push('External Satellite Sensor feed ingestion');

  const integCount = integrations.length;
  if (integCount >= 3) {
    integrationScore = 3;
    integrationRating = 'High';
  } else if (integCount >= 1) {
    integrationScore = 2;
    integrationRating = 'Medium';
  }

  if (integCount > 0) {
    integrationDetails.push(`Identified ${integCount} integrations: ${integrations.join(', ')}.`);
  } else {
    integrationDetails.push('No advanced network, protocol, or data feed integrations detected.');
  }

  if (integrationRating === 'High') {
    integrationDetails.push('Exposes multiple complex API protocols or orchestrates raw external sensory data.');
  } else if (integrationRating === 'Medium') {
    integrationDetails.push('Standard backend API interface or basic database connection.');
  } else {
    integrationDetails.push('Simple local CLI script or non-networked application.');
  }

  const integrationCount: ComplexityDimension = {
    score: integrationScore,
    maxScore: 3,
    rating: integrationRating,
    details: integrationDetails
  };

  // ==========================================
  // Overall Scoring Evaluation
  // ==========================================
  const totalScore = techScore + archScore + infraScore + serviceScore + integrationScore;
  let overallRating: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';

  if (totalScore >= 11) {
    overallRating = 'Advanced';
  } else if (totalScore >= 6) {
    overallRating = 'Intermediate';
  }

  return {
    overallRating,
    totalScore,
    maxTotalScore: 15,
    dimensions: {
      technologyCount,
      architectureComplexity,
      infrastructureComplexity,
      serviceCount,
      integrationCount
    }
  };
}
