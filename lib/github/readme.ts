import { ReadmeFetcher } from './readmeFetcher';

/**
 * Reusable README service to retrieve raw README markdown content from GitHub repository.
 * Consumed by repository detail pages and future ORACLE agents.
 */
export async function getReadmeContent(repoName: string): Promise<string> {
  return ReadmeFetcher.fetch(repoName);
}
