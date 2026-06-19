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

const MOCK_READMES: { [key: string]: string } = {
  'patient-management-service': `# Patient Management Service\n\nA hospital billing and microservices system designed for high reliability and event-driven coordination.\n\n## System Architecture\nThe system consists of independent microservices built with **Spring Boot** communicating over **gRPC** for low latency and **Kafka** for asynchronous messaging.\n\n### Key Components\n* **Patient Billing Service**: Manages accounts and invoices.\n* **Notification Engine**: Consumes Kafka events to send billing updates.\n* **Staff Portal**: RBAC-isolated administration interface.`,
  sahai: `# SAHAI — Mental Health & Lifestyle Platform\n\nAn intelligent, full-stack mental health platform engineered with Django, FastAPI, and React.\n\n## Key Features\n* **RAG-powered Assistant**: Fast retrieval-augmented generation using Pinecone.\n* **Real-time Chat**: Bi-directional client-therapist chat rooms via WebSockets.\n* **Appointment Scheduler**: Resilient Django-based calendar management.`,
  orbitair: `# ORBITAIR — AI-Powered AQI Forecasting\n\nA geospatial forecasting platform that indexes satellite and local sensor data to predict air quality.\n\n## Features\n* **Geospatial Ingestion**: Integrates NASA TEMPO satellite and EPA/OpenAQ sensor feeds.\n* **High-Volume Time-Series**: Backed by TimescaleDB hypertables.\n* **Explainable AI Dashboard**: Beautiful React map rendering pollution forecasts.`
};

function testTechnologyExtraction() {
  console.log("\n=== Testing Structured Technology Profiles, Architecture & Complexity Extraction ===");
  MOCK_REPOSITORIES.forEach(repo => {
    const readme = MOCK_READMES[repo.name.toLowerCase()] || ``;
    const intelligence = generateRepositoryIntelligence(repo, readme);
    console.log(`\nRepository: ${repo.name.toUpperCase()}`);
    if (intelligence.technologyProfile) {
      console.log('  [Technology Profile]');
      Object.entries(intelligence.technologyProfile.categories).forEach(([category, techs]) => {
        console.log(`    ${category}: ${techs.join(', ')}`);
      });
    }
    if (intelligence.architectureAnalysis) {
      console.log('  [Architecture Analysis]');
      console.log(`    Architecture Pattern: ${intelligence.architectureAnalysis.architecturePattern}`);
      if (intelligence.architectureAnalysis.communication) {
        console.log(`    Communication: ${intelligence.architectureAnalysis.communication.join(', ')}`);
      }
      if (intelligence.architectureAnalysis.security) {
        console.log(`    Security: ${intelligence.architectureAnalysis.security.join(', ')}`);
      }
      if (intelligence.architectureAnalysis.dataLayer) {
        console.log(`    Data Layer: ${intelligence.architectureAnalysis.dataLayer.join(', ')}`);
      }
    }
    if (intelligence.complexityAnalysis) {
      console.log('  [Complexity Analysis]');
      console.log(`    Overall Rating: ${intelligence.complexityAnalysis.overallRating}`);
      console.log(`    Total Score: ${intelligence.complexityAnalysis.totalScore} / ${intelligence.complexityAnalysis.maxTotalScore} PTS`);
      Object.entries(intelligence.complexityAnalysis.dimensions).forEach(([key, dim]) => {
        console.log(`    Dimension: ${key.toUpperCase()}`);
        console.log(`      Rating: ${dim.rating} (${dim.score} / ${dim.maxScore} PTS)`);
        dim.details.forEach(d => console.log(`      Reason: ${d}`));
      });
    }
  });
}

testTechnologyExtraction();
