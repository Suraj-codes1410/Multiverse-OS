import { RepositoryProfile, RepositoryIntelligenceService } from './repositoryIntelligence';

export interface RepositoryComparisonResult {
  repoA: {
    name: string;
    category: string;
    architecture: string;
    complexityScore: number;
    description: string;
  };
  repoB: {
    name: string;
    category: string;
    architecture: string;
    complexityScore: number;
    description: string;
  };
  sharedTechnologies: string[];
  differences: {
    architecture: { repoA: string; repoB: string };
    category: { repoA: string; repoB: string };
    repoAOnlyTechnologies: string[];
    repoBOnlyTechnologies: string[];
  };
  strengths: {
    repoA: string[];
    repoB: string[];
  };
  useCases: {
    repoA: string;
    repoB: string;
  };
}

export class RepositoryComparisonService {
  private intelligenceService: RepositoryIntelligenceService;

  constructor(intelligenceService?: RepositoryIntelligenceService) {
    this.intelligenceService = intelligenceService || new RepositoryIntelligenceService();
  }

  /**
   * Compares two repositories by their names and returns structured comparison data.
   */
  public async compare(repoNameA: string, repoNameB: string): Promise<RepositoryComparisonResult | null> {
    const profileA = await this.intelligenceService.getRepositoryProfile(repoNameA);
    const profileB = await this.intelligenceService.getRepositoryProfile(repoNameB);

    if (!profileA || !profileB) return null;

    // 1. Shared Technologies
    const techSetA = new Set(profileA.technologies.map(t => t.toLowerCase()));
    const techSetB = new Set(profileB.technologies.map(t => t.toLowerCase()));
    
    // Find original casing for display
    const sharedTechnologies = profileA.technologies.filter(t => techSetB.has(t.toLowerCase()));

    // 2. Differences
    const repoAOnlyTechnologies = profileA.technologies.filter(t => !techSetB.has(t.toLowerCase()));
    const repoBOnlyTechnologies = profileB.technologies.filter(t => !techSetA.has(t.toLowerCase()));

    // 3. Generate Strengths deterministically
    const strengthsA = this.deriveStrengths(profileA);
    const strengthsB = this.deriveStrengths(profileB);

    // 4. Generate Use Cases deterministically
    const useCaseA = this.deriveUseCase(profileA);
    const useCaseB = this.deriveUseCase(profileB);

    return {
      repoA: {
        name: profileA.repositoryName,
        category: profileA.projectCategory,
        architecture: profileA.architectureType,
        complexityScore: profileA.repositoryImportanceScore,
        description: profileA.repositoryDescription
      },
      repoB: {
        name: profileB.repositoryName,
        category: profileB.projectCategory,
        architecture: profileB.architectureType,
        complexityScore: profileB.repositoryImportanceScore,
        description: profileB.repositoryDescription
      },
      sharedTechnologies,
      differences: {
        architecture: {
          repoA: profileA.architectureType,
          repoB: profileB.architectureType
        },
        category: {
          repoA: profileA.projectCategory,
          repoB: profileB.projectCategory
        },
        repoAOnlyTechnologies,
        repoBOnlyTechnologies
      },
      strengths: {
        repoA: strengthsA,
        repoB: strengthsB
      },
      useCases: {
        repoA: useCaseA,
        repoB: useCaseB
      }
    };
  }

  /**
   * Derives key strengths from technologies and metadata.
   */
  private deriveStrengths(profile: RepositoryProfile): string[] {
    const strengths: string[] = [];
    const techsLower = profile.technologies.map(t => t.toLowerCase());

    if (techsLower.includes('timescaledb')) {
      strengths.push('High-volume geospatial time-series optimization');
    }
    if (techsLower.includes('pinecone') || techsLower.includes('llm')) {
      strengths.push('Semantic AI-powered search & RAG (Retrieval-Augmented Generation)');
    }
    if (techsLower.includes('kafka') && techsLower.includes('grpc')) {
      strengths.push('Robust multi-protocol microservices streaming topology');
    } else if (techsLower.includes('kafka')) {
      strengths.push('Real-time event streaming & decoupling queues');
    }
    if (techsLower.includes('websockets')) {
      strengths.push('Bidirectional, sub-millisecond real-time communication');
    }
    if (techsLower.includes('spring security')) {
      strengths.push('Secure enterprise role-based authorization & authentication');
    }
    if (techsLower.includes('docker')) {
      strengths.push('Containerized development & cloud-ready deployments');
    }
    if (profile.repositoryImportanceScore >= 90) {
      strengths.push('Complex multi-layer system architecture & data modeling');
    }

    if (strengths.length === 0) {
      strengths.push('Standard components with clean architectural design');
    }

    return strengths;
  }

  /**
   * Maps a repository profile to its primary use case.
   */
  private deriveUseCase(profile: RepositoryProfile): string {
    const nameLower = profile.repositoryName.toLowerCase();
    if (nameLower.includes('orbitair')) {
      return 'Geospatial air pollution forecasting and explanation dashboard for tracking index fluctuations.';
    }
    if (nameLower.includes('sahai')) {
      return 'Real-time peer-to-peer mental-wellness chat client and virtual AI therapist assistant.';
    }
    if (nameLower.includes('patient-management')) {
      return 'Enterprise hospital billing, notifications, and clinical record management using decoupled services.';
    }
    if (nameLower.includes('novadb')) {
      return 'Distributed similarity index database engine executing vector search queries across partitions.';
    }
    if (nameLower.includes('aetheragent')) {
      return 'Autonomous multi-agent orchestration executor running parallel stateful task loops.';
    }
    if (nameLower.includes('logpulse')) {
      return 'High-speed real-time logs ingestion and anomaly detection pipeline.';
    }
    return profile.repositoryDescription;
  }
}
