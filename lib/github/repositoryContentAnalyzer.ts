import { GitHubRepository } from '../types';
import { getReadmeContent } from './readme';
import { ReadmeParser, ExtractedReadmeData } from './readmeParser';
import { RepositorySummaryGenerator, RepositorySummary } from './repositorySummaryGenerator';

export interface RepositoryContentAnalysisResult {
  extractedData: ExtractedReadmeData;
  summary: RepositorySummary;
}

export class RepositoryContentAnalyzer {
  static async analyze(repo: GitHubRepository): Promise<RepositoryContentAnalysisResult> {
    const readme = await getReadmeContent(repo.name);
    const extractedData = ReadmeParser.parse(readme);
    const summary = RepositorySummaryGenerator.generate(repo, extractedData);
    
    return {
      extractedData,
      summary
    };
  }
}
