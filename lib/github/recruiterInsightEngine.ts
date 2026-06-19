import { ProjectRankingService, RankedProject } from './projectRankingService';

export interface RecruiterRecommendationResult {
  query: string;
  bestDimensionMatched: string;
  recommendedProject: RankedProject;
  rankings: RankedProject[];
}

export class RecruiterInsightEngine {
  /**
   * Evaluates query keywords to find the most matching ranking dimension and returns evidence-backed recommendations.
   */
  static async evaluateQuery(query: string): Promise<RecruiterRecommendationResult | null> {
    const queryLower = query.toLowerCase().trim();
    const rankings = await ProjectRankingService.getRankings();

    const contains = (words: string[]) => {
      return words.some(word => {
        // Use word boundary check
        const regex = new RegExp(`\\b${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
        return regex.test(queryLower);
      });
    };

    let matchedDimension = '';

    // Match query keywords to ranking dimensions
    if (contains(['backend', 'server', 'database', 'sql', 'spring'])) {
      matchedDimension = 'Backend Engineering';
    } else if (
      contains([
        'distributed',
        'microservice',
        'microservices',
        'consensus',
        'raft',
        'network',
        'grpc',
        'message',
        'messages'
      ])
    ) {
      matchedDimension = 'Distributed Systems';
    } else if (
      contains([
        'ai',
        'ml',
        'machine learning',
        'rag',
        'llm',
        'vector',
        'similarity'
      ])
    ) {
      matchedDimension = 'AI/ML';
    } else if (
      contains([
        'full stack',
        'frontend',
        'ui',
        'web',
        'fullstack'
      ])
    ) {
      matchedDimension = 'Full Stack';
    } else if (
      contains([
        'scalability',
        'scalable',
        'throughput',
        'performance',
        'concurrency'
      ])
    ) {
      matchedDimension = 'Scalability';
    } else if (
      contains([
        'review first',
        'best',
        'impress',
        'complexity',
        'architecture',
        'recruiter',
        'recruiters',
        'start'
      ])
    ) {
      // Default fallback / "which should recruiters review first"
      matchedDimension = 'Architecture Complexity';
    }

    if (!matchedDimension) {
      return null;
    }

    const dimensionRanking = rankings.find(r => r.dimension === matchedDimension);
    if (!dimensionRanking || dimensionRanking.rankings.length === 0) {
      return null;
    }

    return {
      query,
      bestDimensionMatched: matchedDimension,
      recommendedProject: dimensionRanking.rankings[0],
      rankings: dimensionRanking.rankings
    };
  }
}
