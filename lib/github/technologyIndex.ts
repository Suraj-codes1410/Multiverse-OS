import { RepositoryProfile, RepositoryIntelligenceService } from './repositoryIntelligence';

export interface TechnologyIndexEntry {
  technology: string;
  repositoryNames: string[];
}

export class TechnologyIndex {
  private index: Map<string, string[]> = new Map();

  constructor(profiles: RepositoryProfile[]) {
    this.build(profiles);
  }

  private build(profiles: RepositoryProfile[]): void {
    profiles.forEach(profile => {
      profile.technologies.forEach(tech => {
        const normalizedTech = tech.toLowerCase().trim();
        if (!this.index.has(normalizedTech)) {
          this.index.set(normalizedTech, []);
        }
        const repoNames = this.index.get(normalizedTech)!;
        if (!repoNames.includes(profile.repositoryName)) {
          repoNames.push(profile.repositoryName);
        }
      });
    });
  }

  /**
   * Retrieves all repository names associated with the given technology.
   */
  public getRepositories(technologyName: string): string[] {
    const normalized = technologyName.toLowerCase().trim();
    // Support simple lookup matching
    for (const key of this.index.keys()) {
      if (key === normalized || key.includes(normalized) || normalized.includes(key)) {
        return this.index.get(key) || [];
      }
    }
    return this.index.get(normalized) || [];
  }

  /**
   * Returns all mapped entries in the index.
   */
  public getAllEntries(): TechnologyIndexEntry[] {
    return Array.from(this.index.entries()).map(([tech, repos]) => ({
      technology: tech,
      repositoryNames: repos
    }));
  }
}

export class TechnologyLookupService {
  private intelligenceService: RepositoryIntelligenceService;
  private index: TechnologyIndex | null = null;

  constructor(intelligenceService?: RepositoryIntelligenceService) {
    this.intelligenceService = intelligenceService || new RepositoryIntelligenceService();
  }

  /**
   * Initializes the reverse lookup index.
   */
  public async init(): Promise<void> {
    if (!this.index) {
      const profiles = await this.intelligenceService.getRepositoryProfiles();
      this.index = new TechnologyIndex(profiles);
    }
  }

  /**
   * Resolves a natural language query seeking repositories that use a specific technology.
   */
  public async lookup(query: string): Promise<string[] | null> {
    await this.init();
    if (!this.index) return null;

    const queryLower = query.toLowerCase().trim();

    // Scan all technology terms registered in our index
    const entries = this.index.getAllEntries();
    const sortedTechs = entries.map(e => e.technology).sort((a, b) => b.length - a.length);

    for (const tech of sortedTechs) {
      if (queryLower.includes(tech.toLowerCase())) {
        return this.index.getRepositories(tech);
      }
    }

    return null;
  }
}
