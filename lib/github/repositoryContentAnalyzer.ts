import { GitHubRepository } from '../types';
import { ReadmeFetcher } from './readmeFetcher';
import { ReadmeParser, ExtractedReadmeData } from './readmeParser';
import { RepositorySummaryGenerator, RepositorySummary } from './repositorySummaryGenerator';

export interface RepositoryContentAnalysisResult {
  extractedData: ExtractedReadmeData;
  summary: RepositorySummary;
}

export class RepositoryContentAnalyzer {
  static async analyze(repo: GitHubRepository): Promise<RepositoryContentAnalysisResult> {
    // 1. Fetch README content (raw README)
    const readme = await ReadmeFetcher.fetch(repo.name);
    
    // 2. Parse README content
    const extractedData = ReadmeParser.parse(readme);
    
    // 3. Generate summary grounded in README content
    let summary: RepositorySummary;
    if (readme === 'No README content available.') {
      summary = {
        RepositoryPurpose: 'No README content available.',
        KeyFeatures: [],
        TechnologyStack: [],
        ComplexityIndicators: ['No README content available.']
      };
    } else {
      summary = RepositorySummaryGenerator.generate(repo, extractedData);
    }
    
    return {
      extractedData,
      summary
    };
  }
}
