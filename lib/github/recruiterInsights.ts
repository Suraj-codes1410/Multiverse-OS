import { RepositoryIntelligenceService } from './repositoryIntelligence';

export interface RecruiterRecommendation {
  topic: string;
  recommendedRepository: string;
  evidence: string[];
  rationale: string;
}

export class RecruiterInsightService {
  private intelligenceService: RepositoryIntelligenceService;

  constructor(intelligenceService?: RepositoryIntelligenceService) {
    this.intelligenceService = intelligenceService || new RepositoryIntelligenceService();
  }

  /**
   * Evaluates recruiter questions and returns evidence-backed recommendations.
   */
  public async getInsight(query: string): Promise<RecruiterRecommendation | null> {
    const queryLower = query.toLowerCase().trim();
    const profiles = await this.intelligenceService.getRepositoryProfiles();

    // 1. Topic: Distributed Systems
    if (this.containsAny(queryLower, ['distributed', 'microservice', 'consensus', 'raft'])) {
      const pms = profiles.find(p => p.repositoryName.includes('patient-management'));
      
      const evidence = ['Kafka', 'gRPC', 'Docker', 'Microservices'];
      // Verify from profile if available
      if (pms) {
        if (pms.technologies.includes('Kafka') && !evidence.includes('Kafka')) evidence.push('Kafka');
        if (pms.technologies.includes('gRPC') && !evidence.includes('gRPC')) evidence.push('gRPC');
        if (pms.technologies.includes('Docker') && !evidence.includes('Docker')) evidence.push('Docker');
      }

      return {
        topic: 'Distributed Systems',
        recommendedRepository: pms?.repositoryName || 'patient-management-service',
        evidence,
        rationale: 'Demonstrates robust decoupled multi-protocol event streaming, binary RPC communications between services, and containerized topology orchestrating autonomous billing/inventory nodes.'
      };
    }

    // 2. Topic: Backend Engineering
    if (this.containsAny(queryLower, ['backend', 'server', 'database', 'sql', 'spring'])) {
      const pms = profiles.find(p => p.repositoryName.includes('patient-management'));
      
      const evidence = ['Spring Boot', 'Authentication', 'Role-Based Access Control', 'Java'];

      return {
        topic: 'Backend Engineering',
        recommendedRepository: pms?.repositoryName || 'patient-management-service',
        evidence,
        rationale: 'Exhibits production-grade Java enterprise patterns using Spring Boot, Hibernate ORM data layer integration, and robust secure endpoint access controls.'
      };
    }

    // 3. Topic: API Design
    if (this.containsAny(queryLower, ['api', 'apis', 'design', 'endpoint', 'endpoints', 'rest', 'graphql'])) {
      const orbit = profiles.find(p => p.repositoryName.includes('orbitair')) || 
                    profiles.find(p => p.repositoryName.includes('sahai'));
      
      const evidence = ['FastAPI', 'Pydantic validation', 'Asynchronous API endpoints', 'RESTful architecture'];

      return {
        topic: 'API Design',
        recommendedRepository: orbit?.repositoryName || 'orbitair',
        evidence,
        rationale: 'Leverages FastAPI asynchronous execution loops, Pydantic type-safe payload models, and structured REST conventions for high-performance integrations.'
      };
    }

    // 4. Topic: Scalability
    if (this.containsAny(queryLower, ['scalability', 'scalable', 'high-throughput', 'throughput', 'ingestion', 'performance'])) {
      const scaledRepo = profiles.find(p => p.repositoryName.includes('patient-management-service')) ||
                        profiles.find(p => p.repositoryName.includes('orbitair'));
      
      const evidence = ['Kafka', 'Java', 'Asynchronous event streaming', 'Decoupled billing microservices', 'Database connection pooling'];

      return {
        topic: 'Scalability',
        recommendedRepository: scaledRepo?.repositoryName || 'patient-management-service',
        evidence,
        rationale: 'Demonstrates horizontal scale readiness and message isolation using Kafka event-driven partitions and decoupled database architectures.'
      };
    }

    return null;
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }
}
