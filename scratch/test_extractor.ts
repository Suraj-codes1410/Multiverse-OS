import { generateRepositoryIntelligence } from '../lib/github/intelligence';
import { GitHubRepository } from '../lib/types';

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

const MOCK_READMES: { [key: string]: string } = {
  novadb: `# NovaDB\n\nA high-performance, distributed vector database engineered in Go and Rust.\n\n## Core Features\n- **Sub-millisecond query latency**: Optimized similarity search indices.\n- **Raft Consensus**: Distributed state machine replication for failover protection.\n- **gRPC API Layer**: Fast serialization protocol buffers endpoints.\n\n## Quick Start\n\`\`\`bash\n# Run novadb standalone server\nnovadb-server --config ./config.yaml\n\`\`\`\n\n## References\nCheck the developer portal at [novadb.io](https://novadb.example.com) for specs.`,
  aetheragent: `# AetherAgent\n\nAn asynchronous, event-driven orchestration framework for executing complex multi-agent workflows.\n\n## Core Features\n- **Agent Handshakes**: Dynamic consensus negotiation.\n- **RabbitMQ Broker**: Decoupled task queue channels.\n- **State Persistence**: Memory store indexing using Redis.\n\n## Quick Start\n\`\`\`typescript\nimport { AetherNode } from 'aetheragent';\nconst node = new AetherNode();\nawait node.initialize();\n\`\`\`\n\n## References\nDocumentation available in the [Aether docs portal](https://aetheragent.example.com).`,
  logpulse: `# LogPulse\n\nA robust, real-time log ingestion and processing pipeline designed to handle 100,000+ events per second.\n\n## Core Features\n- **Kafka Streaming**: High-throughput distributed partition ingestion.\n- **Elastic Search Mapping**: Auto-indexing configurations.\n- **PyTorch Auditing**: Live anomaly detection model filters.\n\n## Quick Start\n\`\`\`bash\n# Start Kafka pipeline consumer\nlogpulse-pipeline --kafka-broker localhost:9092\n\`\`\`\n\n## References\nRead structural reviews at [logpulse.dev](https://logpulse.example.com).`,
  'patient-management-service': `# Patient Management Service\n\nA hospital billing and microservices system designed for high reliability and event-driven coordination.\n\n## System Architecture\nThe system consists of independent microservices built with **Spring Boot** communicating over **gRPC** for low latency and **Kafka** for asynchronous messaging.\n\n### Key Components\n* **Patient Billing Service**: Manages accounts and invoices.\n* **Notification Engine**: Consumes Kafka events to send billing updates.\n* **Staff Portal**: RBAC-isolated administration interface.`,
  sahai: `# SAHAI — Mental Health & Lifestyle Platform\n\nAn intelligent, full-stack mental health platform engineered with Django, FastAPI, and React.\n\n## Key Features\n* **RAG-powered Assistant**: Fast retrieval-augmented generation using Pinecone.\n* **Real-time Chat**: Bi-directional client-therapist chat rooms via WebSockets.\n* **Appointment Scheduler**: Resilient Django-based calendar management.`,
  orbitair: `# ORBITAIR — AI-Powered AQI Forecasting\n\nA geospatial forecasting platform that indexes satellite and local sensor data to predict air quality.\n\n## Features\n* **Geospatial Ingestion**: Integrates NASA TEMPO satellite and EPA/OpenAQ sensor feeds.\n* **High-Volume Time-Series**: Backed by TimescaleDB hypertables.\n* **Explainable AI Dashboard**: Beautiful React map rendering pollution forecasts.`
};

function testTechnologyExtraction() {
  console.log("\n=== Testing Structured Technology Profiles Extraction ===");
  MOCK_REPOSITORIES.forEach(repo => {
    const readme = MOCK_READMES[repo.name.toLowerCase()] || ``;
    const intelligence = generateRepositoryIntelligence(repo, readme);
    console.log(`\nRepository: ${repo.name.toUpperCase()}`);
    if (intelligence.technologyProfile) {
      Object.entries(intelligence.technologyProfile.categories).forEach(([category, techs]) => {
        console.log(`  ${category}: ${techs.join(', ')}`);
      });
    } else {
      console.log('  No technology profile extracted.');
    }
  });
}

testTechnologyExtraction();
