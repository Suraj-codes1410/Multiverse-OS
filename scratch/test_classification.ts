import { classifyRepository } from '../lib/github/classification';
import { generateRepositoryIntelligence } from '../lib/github/intelligence';
import { GitHubRepository } from '../lib/types';

const MOCK_REPOSITORIES: GitHubRepository[] = [
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

function testMockRepos() {
  console.log("\n=== Testing Mock Repositories Classification ===");
  MOCK_REPOSITORIES.forEach(repo => {
    const readme = `README for ${repo.name}. Topics: ${repo.topics.join(', ')}`;
    const intelligence = generateRepositoryIntelligence(repo, readme);
    const classifications = classifyRepository(repo, intelligence);
    console.log(`\nRepository: ${repo.name}`);
    console.log(`  Description: ${repo.description}`);
    console.log(`  Topics: ${repo.topics}`);
    console.log(`  Intelligence Category: ${intelligence.projectCategory}`);
    console.log(`  Classifications:`, classifications);
  });
}

testMockRepos();
