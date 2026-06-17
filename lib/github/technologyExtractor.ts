import { GitHubRepository, TechnologyProfile, Project } from '../types';

interface CatalogItem {
  name: string;
  category: string;
  keywords: string[];
}

const CATALOG: CatalogItem[] = [
  // Backend Frameworks & Runtimes
  { name: 'FastAPI', category: 'Backend', keywords: ['fastapi'] },
  { name: 'Spring Boot', category: 'Backend', keywords: ['spring boot', 'springboot'] },
  { name: 'Django', category: 'Backend', keywords: ['django'] },
  { name: 'Express', category: 'Backend', keywords: ['express.js', 'expressjs', 'express '] },
  { name: 'NestJS', category: 'Backend', keywords: ['nestjs'] },
  { name: 'Flask', category: 'Backend', keywords: ['flask'] },
  { name: 'Spring Security', category: 'Backend', keywords: ['spring security', 'spring-security'] },
  
  // Frontend Frameworks & Libraries
  { name: 'React', category: 'Frontend', keywords: ['react', 'reactjs', 'react.js'] },
  { name: 'Next.js', category: 'Frontend', keywords: ['next.js', 'nextjs'] },
  { name: 'Vue', category: 'Frontend', keywords: ['vue.js', 'vuejs'] },
  { name: 'Angular', category: 'Frontend', keywords: ['angular'] },
  { name: 'TailwindCSS', category: 'Frontend', keywords: ['tailwindcss', 'tailwind'] },

  // Databases
  { name: 'TimescaleDB', category: 'Database', keywords: ['timescaledb', 'timescale'] },
  { name: 'Pinecone', category: 'Database', keywords: ['pinecone'] },
  { name: 'Redis', category: 'Database', keywords: ['redis'] },
  { name: 'MySQL', category: 'Database', keywords: ['mysql'] },
  { name: 'PostgreSQL', category: 'Database', keywords: ['postgres', 'postgresql'] },
  { name: 'Elasticsearch', category: 'Database', keywords: ['elasticsearch', 'elastic search'] },
  { name: 'SQLite', category: 'Database', keywords: ['sqlite'] },
  { name: 'MongoDB', category: 'Database', keywords: ['mongodb', 'mongo '] },
  { name: 'NovaDB', category: 'Database', keywords: ['novadb'] },

  // Visualization
  { name: 'Leaflet', category: 'Visualization', keywords: ['leaflet'] },
  { name: 'D3.js', category: 'Visualization', keywords: ['d3.js', 'd3'] },
  { name: 'Chart.js', category: 'Visualization', keywords: ['chart.js', 'chartjs'] },

  // Messaging / Streaming
  { name: 'Kafka', category: 'Messaging', keywords: ['kafka'] },
  { name: 'RabbitMQ', category: 'Messaging', keywords: ['rabbitmq'] },
  { name: 'MQTT', category: 'Messaging', keywords: ['mqtt'] },

  // RPC / API Communications
  { name: 'gRPC', category: 'RPC', keywords: ['grpc', 'protobuf'] },
  { name: 'WebSockets', category: 'RPC', keywords: ['websocket', 'websockets', 'socket.io'] },
  { name: 'GraphQL', category: 'RPC', keywords: ['graphql'] },

  // Containerization / DevOps
  { name: 'Docker', category: 'Containerization', keywords: ['docker', 'container'] },
  { name: 'Kubernetes', category: 'Containerization', keywords: ['kubernetes', 'k8s'] },

  // AI / ML
  { name: 'PyTorch', category: 'AI / ML', keywords: ['pytorch'] },
  { name: 'TensorFlow', category: 'AI / ML', keywords: ['tensorflow'] },
  { name: 'Machine Learning', category: 'AI / ML', keywords: ['machine learning', 'machine-learning', 'ml'] },
  { name: 'LLM', category: 'AI / ML', keywords: ['llm', 'large language model', 'openai', 'gemini'] }
];

export function extractTechnologyProfile(
  repo: GitHubRepository,
  readme: string,
  project?: Project
): TechnologyProfile {
  const categories: { [category: string]: string[] } = {};
  const detected = new Set<string>();

  // Normalize all texts
  const repoNameLower = repo.name.toLowerCase();
  const repoDesc = (repo.description || '').toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());
  const language = (repo.language || '').toLowerCase();
  const readmeLower = readme.toLowerCase();
  
  const projectTech = (project?.techStack || []).map(t => t.toLowerCase());
  const projectDesc = (project?.description || '').toLowerCase();
  const projectSubtitle = (project?.subtitle || '').toLowerCase();

  // Unified search target
  const textContext = [
    repoNameLower,
    repoDesc,
    ...topics,
    language,
    readmeLower,
    ...projectTech,
    projectDesc,
    projectSubtitle
  ].join(' ');

  // 1. Process catalog items
  CATALOG.forEach(item => {
    // Check keywords
    const matchesKeyword = item.keywords.some(keyword => {
      if (keyword.endsWith(' ')) {
        return textContext.includes(keyword);
      }
      return textContext.includes(keyword);
    });

    if (matchesKeyword) {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      if (!categories[item.category].includes(item.name)) {
        categories[item.category].push(item.name);
        detected.add(item.name.toLowerCase());
      }
    }
  });

  // 2. Fallbacks / Rule-based refinements for Backend languages if no specific framework is found
  const backendTech = categories['Backend'] || [];
  const hasSpecificBackendFramework = backendTech.some(t => 
    ['FastAPI', 'Spring Boot', 'Django', 'Express', 'NestJS', 'Flask'].includes(t)
  );

  // If Java is detected
  if (language === 'java' || topics.includes('java')) {
    if (!hasSpecificBackendFramework && !backendTech.includes('Java')) {
      if (!categories['Backend']) categories['Backend'] = [];
      categories['Backend'].push('Java');
    }
  }

  // Go
  if (language === 'go' || topics.includes('go') || topics.includes('golang')) {
    if (!backendTech.includes('Go')) {
      if (!categories['Backend']) categories['Backend'] = [];
      categories['Backend'].push('Go');
    }
  }

  // Rust
  if (language === 'rust' || topics.includes('rust')) {
    if (!backendTech.includes('Rust')) {
      if (!categories['Backend']) categories['Backend'] = [];
      categories['Backend'].push('Rust');
    }
  }

  // Python
  if (language === 'python' || topics.includes('python')) {
    if (!hasSpecificBackendFramework && !backendTech.includes('Python')) {
      if (!categories['Backend']) categories['Backend'] = [];
      categories['Backend'].push('Python');
    }
  }

  // Node.js/TypeScript fallback for Backend if it's not a pure Frontend repo
  const isNodeOrTs = language === 'typescript' || language === 'javascript' || topics.includes('typescript') || topics.includes('nodejs') || topics.includes('node');
  
  if (isNodeOrTs && (topics.includes('nodejs') || topics.includes('node') || textContext.includes('node.js') || textContext.includes('nodejs'))) {
    if (!hasSpecificBackendFramework && !backendTech.includes('Node.js')) {
      if (!categories['Backend']) categories['Backend'] = [];
      categories['Backend'].push('Node.js');
    }
  }

  return {
    projectName: project?.title || repo.name,
    categories
  };
}
