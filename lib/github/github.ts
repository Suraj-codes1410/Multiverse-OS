import { GitHubRepository } from '../types';
import githubConfig from '@/data/github-config.json';

// Local fallback cache to avoid rate-limiting issues on GitHub public APIs during development/builds
const MOCK_REPOSITORIES: GitHubRepository[] = [
  {
    id: 101,
    name: 'novadb',
    fullName: 'surajsamanta/novadb',
    description: 'A high-performance, distributed vector database engineered in Go and Rust.',
    htmlUrl: 'https://github.com/surajsamanta/novadb',
    homepage: 'https://novadb.example.com',
    starsCount: 42,
    forksCount: 8,
    language: 'Go',
    topics: ['go', 'rust', 'vector-database', 'raft', 'grpc'],
    updatedAt: '2026-06-15T10:00:00Z',
    createdAt: '2024-02-10T12:00:00Z'
  },
  {
    id: 102,
    name: 'aetheragent',
    fullName: 'surajsamanta/aetheragent',
    description: 'An asynchronous, event-driven orchestration framework for executing complex multi-agent workflows.',
    htmlUrl: 'https://github.com/surajsamanta/aetheragent',
    homepage: 'https://aetheragent.example.com',
    starsCount: 56,
    forksCount: 12,
    language: 'TypeScript',
    topics: ['typescript', 'nodejs', 'llm', 'agents', 'redis', 'rabbitmq'],
    updatedAt: '2026-06-15T11:00:00Z',
    createdAt: '2024-05-15T14:30:00Z'
  },
  {
    id: 103,
    name: 'logpulse',
    fullName: 'surajsamanta/logpulse',
    description: 'A robust, real-time log ingestion and processing pipeline designed to handle 100,000+ events per second.',
    htmlUrl: 'https://github.com/surajsamanta/logpulse',
    homepage: 'https://logpulse.example.com',
    starsCount: 31,
    forksCount: 4,
    language: 'Go',
    topics: ['go', 'kafka', 'elasticsearch', 'anomaly-detection', 'pytorch'],
    updatedAt: '2026-06-15T09:00:00Z',
    createdAt: '2023-09-01T08:15:00Z'
  },
  {
    id: 201,
    name: 'patient-management-service',
    fullName: 'surajsamanta/patient-management-service',
    description: 'Hospital Billing & Microservices System using Spring Boot, gRPC, and Kafka.',
    htmlUrl: 'https://github.com/Suraj-codes1410/patient-management-service',
    homepage: null,
    starsCount: 15,
    forksCount: 3,
    language: 'Java',
    topics: ['java', 'spring-boot', 'kafka', 'grpc', 'docker', 'spring-security'],
    updatedAt: '2026-06-15T08:00:00Z',
    createdAt: '2025-01-10T10:00:00Z'
  },
  {
    id: 202,
    name: 'sahai',
    fullName: 'surajsamanta/sahai',
    description: 'SAHAI — Mental Health & Lifestyle Platform with Pinecone-backed RAG and WebSockets.',
    htmlUrl: 'https://github.com/Suraj-codes1410/sahai',
    homepage: null,
    starsCount: 28,
    forksCount: 6,
    language: 'Python',
    topics: ['django', 'fastapi', 'react', 'websockets', 'mysql', 'pinecone'],
    updatedAt: '2026-06-14T15:30:00Z',
    createdAt: '2025-02-15T11:00:00Z'
  },
  {
    id: 203,
    name: 'orbitair',
    fullName: 'surajsamanta/orbitair',
    description: 'ORBITAIR — AI-Powered AQI Forecasting with TimescaleDB geospatial indexing.',
    htmlUrl: 'https://github.com/Suraj-codes1410/orbitair',
    homepage: null,
    starsCount: 35,
    forksCount: 9,
    language: 'Python',
    topics: ['fastapi', 'timescaledb', 'react', 'leaflet', 'machine-learning'],
    updatedAt: '2026-06-15T18:00:00Z',
    createdAt: '2025-03-20T14:00:00Z'
  }
];

interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  created_at: string;
}

export async function getRepositories(): Promise<GitHubRepository[]> {
  try {
    const username = githubConfig.username;
    // Cache GitHub requests for 1 hour to optimize performance and prevent rate limiting
    const response = await fetch(`https://api.github.com/users/${username}/repos`, {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'suraj-multiverse-os'
      }
    });

    if (!response.ok) {
      console.warn(`GitHub API returned status ${response.status}. Falling back to cached local mock data.`);
      return MOCK_REPOSITORIES;
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return MOCK_REPOSITORIES;
    }

    return data.map((repo: GitHubRepoResponse) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      homepage: repo.homepage,
      starsCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      language: repo.language,
      topics: repo.topics || [],
      updatedAt: repo.updated_at,
      createdAt: repo.created_at
    }));
  } catch (error) {
    console.error('Error fetching GitHub repositories, returning mock cache.', error);
    return MOCK_REPOSITORIES;
  }
}

export async function getFeaturedRepositories(): Promise<GitHubRepository[]> {
  const allRepos = await getRepositories();
  const featuredNames = githubConfig.syncRepositories
    .filter(r => r.featured)
    .map(r => r.name.toLowerCase());
  return allRepos.filter(repo => featuredNames.includes(repo.name.toLowerCase()));
}

export async function getRepositoryByName(name: string): Promise<GitHubRepository | undefined> {
  const allRepos = await getRepositories();
  return allRepos.find(repo => repo.name.toLowerCase() === name.toLowerCase());
}

export async function getPinnedRepositories(): Promise<GitHubRepository[]> {
  const allRepos = await getRepositories();
  const highlightedNames = githubConfig.syncRepositories
    .filter(r => r.highlighted)
    .map(r => r.name.toLowerCase());
  return allRepos.filter(repo => highlightedNames.includes(repo.name.toLowerCase()));
}
