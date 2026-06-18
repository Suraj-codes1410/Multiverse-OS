import { ExtractedReadmeData } from './readmeParser';
import { GitHubRepository } from '../types';

export interface RepositorySummary {
  RepositoryPurpose: string;
  KeyFeatures: string[];
  TechnologyStack: string[];
  ComplexityIndicators: string[];
}

export class RepositorySummaryGenerator {
  static generate(repo: GitHubRepository, parsedData: ExtractedReadmeData): RepositorySummary {
    // 1. Extract purpose
    let purpose = repo.description || 'GitHub Code Repository';
    const lines = parsedData.readmeContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed && 
        !trimmed.startsWith('#') && 
        !trimmed.startsWith('!') && 
        !trimmed.startsWith('[') && 
        trimmed.length > 20
      ) {
        purpose = trimmed;
        break;
      }
    }

    // 2. Key Features
    const keyFeatures = [...parsedData.features];
    if (keyFeatures.length === 0) {
      if (repo.description) {
        keyFeatures.push(repo.description);
      } else {
        keyFeatures.push('Standard repository functionality.');
      }
    }

    // 3. Tech Stack
    const techStackSet = new Set<string>();
    if (repo.language) techStackSet.add(repo.language);
    if (repo.topics) {
      repo.topics.forEach(topic => {
        const capitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
        techStackSet.add(capitalized);
      });
    }
    parsedData.technologies.forEach(tech => techStackSet.add(tech));

    // 4. Complexity Indicators
    const complexityIndicators: string[] = [];
    const textContext = parsedData.readmeContent.toLowerCase();

    if (techStackSet.size >= 4) {
      complexityIndicators.push('Polyglot Tech Stack Ingestion');
    }
    if (textContext.includes('grpc') && textContext.includes('kafka')) {
      complexityIndicators.push('Multi-Protocol Streaming Topology');
    }
    if (textContext.includes('raft') || textContext.includes('consensus')) {
      complexityIndicators.push('Distributed Consensus Management');
    }
    if (textContext.includes('pinecone') || textContext.includes('vector database')) {
      complexityIndicators.push('High-Dimensional Vector Spaces');
    }
    if (textContext.includes('timescaledb') || textContext.includes('leaflet')) {
      complexityIndicators.push('Geospatial Hypertable Scaling');
    }
    if (parsedData.readmeContent.length > 1500) {
      complexityIndicators.push('Extensive System Documentation');
    }
    if (parsedData.readmeContent.includes('```')) {
      complexityIndicators.push('Code Snippet Demonstrations');
    }
    if (parsedData.architectureDescriptions.length > 0) {
      complexityIndicators.push('Documented Architecture Pattern');
    }

    // 5. Custom Enrichments for Multiverse-OS and Uber-architecture
    const nameLower = repo.name.toLowerCase();
    if (nameLower === 'multiverse-os') {
      purpose = 'An agentic AI developer portfolio and cockpit designed as a high-fidelity interactive system. It integrates a local knowledge graph, Git synchronized repository intelligence, and an interactive ORACLE AI companion to explore projects, skills, experience, and system metrics.';
      
      const newFeatures = [
        'Interactive 3D-like terminal and dashboard interface',
        'Deterministic and agentic repository intelligence parser',
        'Graph-based portfolio context resolver (Knowledge Graph)',
        'ORACLE AI partner for technical inquiry response'
      ];
      newFeatures.forEach(f => {
        if (!keyFeatures.includes(f)) keyFeatures.push(f);
      });

      techStackSet.add('TypeScript');
      techStackSet.add('Next.js');
      techStackSet.add('React');
      techStackSet.add('TailwindCSS');
      techStackSet.add('Lucide Icons');

      if (!complexityIndicators.includes('Dynamic Context Compression')) {
        complexityIndicators.push('Dynamic Context Compression');
        complexityIndicators.push('Interactive Knowledge Graph Traversals');
      }
    } else if (nameLower === 'uber-architecture') {
      purpose = 'An Uber-like ridesharing backend architecture utilizing event-driven microservices built with Java and Spring Boot, using Redis for geospatial driver location tracking, MySQL for persistent data storage, and Kafka for event streaming.';
      
      const newFeatures = [
        'Microservice architecture for matching passengers with drivers',
        'Geospatial indexing using Redis',
        'Event-driven message routing using Confluent Kafka'
      ];
      newFeatures.forEach(f => {
        if (!keyFeatures.includes(f)) keyFeatures.push(f);
      });

      techStackSet.add('Java');
      techStackSet.add('Spring Boot');
      techStackSet.add('Redis');
      techStackSet.add('MySQL');
      techStackSet.add('Kafka');
      techStackSet.add('Docker');

      if (!complexityIndicators.includes('Event-Driven Microservices Topology')) {
        complexityIndicators.push('Event-Driven Microservices Topology');
        complexityIndicators.push('Geospatial High-Throughput Indexing');
      }
    }

    if (complexityIndicators.length === 0) {
      complexityIndicators.push('Standard Structural Patterns');
    }

    return {
      RepositoryPurpose: purpose,
      KeyFeatures: keyFeatures,
      TechnologyStack: Array.from(techStackSet),
      ComplexityIndicators: complexityIndicators
    };
  }
}
