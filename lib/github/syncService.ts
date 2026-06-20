import fs from 'fs';
import path from 'path';
import githubConfig from '@/data/github-config.json';
import { GitHubRepository, Project } from '../types';
import { generateRepositoryIntelligence } from './intelligence';
import { classifyRepository } from './classification';
import { buildKnowledgeGraph } from '../knowledge/builder';
import { ContextService } from '../oracle/service';
import { ReadmeFetcher } from './readmeFetcher';

export interface SyncDiagnostics {
  status: 'Idle' | 'Syncing' | 'Completed' | 'Failed';
  repositoriesSynced: number;
  lastRefreshTime: string;
  newRepositoriesFound: number;
  error?: string;
}

// Global diagnostics singleton
let diagnostics: SyncDiagnostics = {
  status: 'Idle',
  repositoriesSynced: 0,
  lastRefreshTime: '',
  newRepositoriesFound: 0
};

export function getSyncDiagnostics(): SyncDiagnostics {
  return diagnostics;
}

export class GitHubSyncService {
  private syncCachePath = path.join(process.cwd(), 'data/github-sync-cache.json');
  private readmeCachePath = path.join(process.cwd(), 'data/github-readme-cache.json');

  async sync(): Promise<void> {
    diagnostics.status = 'Syncing';
    diagnostics.newRepositoriesFound = 0;
    console.log('SYNC_START');

    try {
      const username = githubConfig.username;
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'suraj-multiverse-os'
      };

      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      }

      // 1. Fetch repositories from GitHub API with timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      let response;
      try {
        response = await fetch(`https://api.github.com/users/${username}/repos`, {
          headers,
          cache: 'no-store',
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`GitHub API returned status ${response.status}: ${await response.text()}`);
      }

      const fetchedReposData = await response.json();
      if (!Array.isArray(fetchedReposData)) {
        throw new Error('GitHub API response is not an array.');
      }

      // Convert to our GitHubRepository format
      const fetchedRepos: GitHubRepository[] = fetchedReposData.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        homepage: repo.homepage,
        starsCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        updatedAt: repo.updated_at,
        createdAt: repo.created_at
      }));

      // 2. Load existing caches
      let cachedRepos: GitHubRepository[] = [];
      if (fs.existsSync(this.syncCachePath)) {
        try {
          const content = fs.readFileSync(this.syncCachePath, 'utf8');
          const cache = JSON.parse(content);
          cachedRepos = cache.repositories || [];
        } catch (e) {
          console.warn('SyncService: Failed to parse sync cache, treating as empty.', e);
        }
      }

      let readmeCache: Record<string, string> = {};
      if (fs.existsSync(this.readmeCachePath)) {
        try {
          const content = fs.readFileSync(this.readmeCachePath, 'utf8');
          readmeCache = JSON.parse(content) || {};
        } catch (e) {
          console.warn('SyncService: Failed to parse readme cache, treating as empty.', e);
        }
      }

      const cachedMap = new Map<string, GitHubRepository>();
      cachedRepos.forEach(r => cachedMap.set(r.name.toLowerCase(), r));

      const newReposList: GitHubRepository[] = [];
      const updatedReposList: GitHubRepository[] = [];
      const unchangedReposList: GitHubRepository[] = [];

      // 3. Detect additions and updates
      for (const repo of fetchedRepos) {
        const cached = cachedMap.get(repo.name.toLowerCase());
        if (!cached) {
          newReposList.push(repo);
        } else if (
          cached.updatedAt !== repo.updatedAt ||
          cached.description !== repo.description ||
          cached.starsCount !== repo.starsCount ||
          cached.forksCount !== repo.forksCount
        ) {
          updatedReposList.push(repo);
        } else {
          unchangedReposList.push(repo);
        }
      }

      console.log(`SyncService: Detected ${newReposList.length} new repositories, ${updatedReposList.length} updated repositories.`);
      diagnostics.newRepositoriesFound = newReposList.length;

      const updatedReadmeCache = { ...readmeCache };
      const finalizedRepos: GitHubRepository[] = [...unchangedReposList];

      const toProcess = [...newReposList, ...updatedReposList];

      // 4. Process new and updated repositories incrementally
      for (const repo of toProcess) {
        console.log(`SyncService: Syncing details for ${repo.name}...`);
        
        // Fetch README
        let readmeContent = '';
        try {
          const readmeResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/readme`, {
            headers: {
              ...headers,
              'Accept': 'application/vnd.github.v3.raw'
            },
            cache: 'no-store'
          });
          if (readmeResponse.ok) {
            readmeContent = await readmeResponse.text();
          } else {
            console.warn(`SyncService: README status ${readmeResponse.status} for ${repo.name}. Using ReadmeFetcher fallback.`);
            readmeContent = await ReadmeFetcher.fetch(repo.name);
          }
        } catch (e) {
          console.error(`SyncService: Exception fetching README for ${repo.name}:`, e);
          readmeContent = await ReadmeFetcher.fetch(repo.name);
        }

        updatedReadmeCache[repo.name.toLowerCase()] = readmeContent;

        // Generate Repository Intelligence & Classifications
        const intelligence = generateRepositoryIntelligence(repo, readmeContent);
        const classifications = classifyRepository(repo, intelligence);
        
        repo.classifications = classifications;
        finalizedRepos.push(repo);

        // Incremental Knowledge Graph Update
        const graph = await buildKnowledgeGraph(); // Loads cached graph if already built
        const makeId = (type: string, key: string) => {
          return `${type.toLowerCase()}:${key.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
        };
        const repoId = makeId('repository', repo.name);

        // Add or update Repository node
        graph.addNode({
          id: repoId,
          type: 'Repository',
          label: repo.name,
          properties: {
            description: repo.description || 'GitHub Code Repository',
            url: repo.htmlUrl,
            language: repo.language || 'TypeScript',
            starsCount: repo.starsCount,
            originalData: repo,
            classifications
          }
        });

        // Filter out existing relationships for this repo to do an incremental replace
        graph.relationships = graph.relationships.filter(
          r => r.sourceId !== repoId && r.targetId !== repoId
        );

        // Reconnect Project link if exists
        const projectsPath = path.join(process.cwd(), 'data/projects.json');
        let matchingProject: Project | undefined = undefined;
        if (fs.existsSync(projectsPath)) {
          try {
            const projectsData = JSON.parse(fs.readFileSync(projectsPath, 'utf8')) as Project[];
            matchingProject = projectsData.find(p => 
              p.id.toLowerCase() === repo.name.toLowerCase() ||
              (p.githubUrl && p.githubUrl.toLowerCase().endsWith('/' + repo.name.toLowerCase()))
            );
          } catch (e) {
            console.error('SyncService: Failed to parse projects.json for incremental graph updates:', e);
          }
        }

        if (matchingProject) {
          const projectId = makeId('project', matchingProject.id);
          if (graph.getNode(projectId)) {
            graph.addRelationship({
              sourceId: projectId,
              targetId: repoId,
              type: 'RELATED_TO',
              properties: { description: `Project links to code repository: ${repo.name}` }
            });
            graph.addRelationship({
              sourceId: projectId,
              targetId: repoId,
              type: 'DEPENDS_ON',
              properties: { description: `Project code resides in repository: ${repo.name}` }
            });
            graph.addRelationship({
              sourceId: repoId,
              targetId: projectId,
              type: 'RELATED_TO',
              properties: { description: `Repository contains source code for project: ${matchingProject.title}` }
            });
          }
        }

        // Reconnect dynamically extracted technologies
        if (intelligence.technologyProfile) {
          const profile = intelligence.technologyProfile;
          Object.entries(profile.categories).forEach(([category, techs]) => {
            techs.forEach(tech => {
              const skillId = makeId('skill', tech);
              // Ensure dynamic skill node exists
              if (!graph.getNode(skillId)) {
                graph.addNode({
                  id: skillId,
                  type: 'Skill',
                  label: tech,
                  properties: {
                    description: `${tech} technology extracted dynamically.`,
                    category: 'Tools',
                    level: 'Advanced',
                    originalData: {
                      name: tech,
                      category: 'Tools',
                      level: 'Advanced',
                      description: `${tech} technology extracted dynamically.`,
                      relatedProjects: []
                    }
                  }
                });
              }

              graph.addRelationship({
                sourceId: repoId,
                targetId: skillId,
                type: 'USES',
                properties: { description: `Repository utilizes technology: ${tech}` }
              });
              graph.addRelationship({
                sourceId: skillId,
                targetId: repoId,
                type: 'RELATED_TO',
                properties: { description: `Technology ${tech} is utilized in repository: ${repo.name}` }
              });
            });
          });
        }
      }

      // Merge cached repos that are not returned by the API (like mock-only ones or hidden ones)
      const apiRepoNames = new Set(finalizedRepos.map(r => r.name.toLowerCase()));
      cachedRepos.forEach(mockRepo => {
        if (!apiRepoNames.has(mockRepo.name.toLowerCase())) {
          finalizedRepos.push(mockRepo);
        }
      });

      // 5. Write caches back to disk/memory
      const globalAny = global as any;
      globalAny.githubSyncCache = { repositories: finalizedRepos, lastUpdated: new Date().toISOString() };
      globalAny.githubReadmeCache = updatedReadmeCache;

      if (process.env.VERCEL === '1') {
        console.log("VERCEL_COMPATIBLE: Serverless environment detected. Wrote sync cache and readme cache to global memory. Skipping disk write.");
      } else {
        try {
          fs.writeFileSync(this.syncCachePath, JSON.stringify(globalAny.githubSyncCache, null, 2));
          fs.writeFileSync(this.readmeCachePath, JSON.stringify(globalAny.githubReadmeCache, null, 2));
        } catch (e) {
          console.error("SyncService: Failed to write to cache files:", e);
        }
      }


      // 6. Force reload context in ContextService to reflect newly synced data
      await ContextService.getInstance().refreshContext();

      diagnostics.status = 'Completed';
      diagnostics.repositoriesSynced = finalizedRepos.length;
      diagnostics.lastRefreshTime = new Date().toISOString();
      console.log('SYNC_SUCCESS');
    } catch (e: any) {
      console.log('SYNC_FAILURE');
      console.error('Sync failure details:', e);
      diagnostics.status = 'Failed';
      diagnostics.error = e.message || String(e);
      // Failures must never break Oracle, so we just log and catch the error.
    }
  }
}

export class RepositoryRefreshManager {
  private static instance: RepositoryRefreshManager | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private syncService: GitHubSyncService;
  private isSyncing = false;

  private constructor() {
    this.syncService = new GitHubSyncService();
  }

  public static getInstance(): RepositoryRefreshManager {
    if (!RepositoryRefreshManager.instance) {
      RepositoryRefreshManager.instance = new RepositoryRefreshManager();
    }
    return RepositoryRefreshManager.instance;
  }

  public async start(options: { intervalMs?: number; performStartupSync?: boolean } = {}) {
    const { intervalMs = 3600000, performStartupSync = true } = options;

    if (process.env.VERCEL === '1') {
      console.log('VERCEL_COMPATIBLE: Serverless environment detected. Skipping background start/setInterval in RepositoryRefreshManager.');
      return;
    }

    if (performStartupSync) {
      console.log('RepositoryRefreshManager: Initiating startup sync...');
      this.triggerSync().catch(err => console.error('RepositoryRefreshManager: Startup sync failed:', err));
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      console.log('RepositoryRefreshManager: Initiating periodic refresh sync...');
      this.triggerSync().catch(err => console.error('RepositoryRefreshManager: Periodic sync failed:', err));
    }, intervalMs);
  }


  public async triggerSync(): Promise<void> {
    if (this.isSyncing) {
      console.warn('RepositoryRefreshManager: Sync is already in progress. Skipping duplicate execution.');
      return;
    }
    this.isSyncing = true;
    try {
      await this.syncService.sync();
    } finally {
      this.isSyncing = false;
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
