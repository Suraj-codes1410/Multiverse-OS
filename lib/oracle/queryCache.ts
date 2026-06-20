export interface CacheEntry {
  query: string;
  response: string;
  createdAt: number;
  expiresAt: number;
  source: string;
}

export class CacheManager {
  private static instance: CacheManager | null = null;
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Periodically evict expired entries to prevent memory growth
    if (typeof window === 'undefined') {
      if (process.env.VERCEL === '1') {
        console.log("VERCEL_COMPATIBLE: Serverless environment detected. Skipping background cache eviction loop.");
      } else {
        this.cleanupInterval = setInterval(() => this.evictExpired(), 60000);
        // Allow the process to exit even if this timer is active
        if (this.cleanupInterval && typeof this.cleanupInterval.unref === 'function') {
          this.cleanupInterval.unref();
        }
      }
    }
  }


  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  public get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (entry && Date.now() > entry.expiresAt) {
      console.log(`CACHE_EXPIRE\nQuery: ${entry.query}`);
      this.cache.delete(key);
      return undefined;
    }
    return entry;
  }

  public set(key: string, entry: CacheEntry): void {
    this.cache.set(key, entry);
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        console.log(`CACHE_EXPIRE\nQuery: ${entry.query}`);
        this.cache.delete(key);
      }
    }
  }
}

export class QueryCacheService {
  private cacheManager = CacheManager.getInstance();

  public get(query: string): string | null {
    const key = this.normalize(query);
    const entry = this.cacheManager.get(key);
    if (entry) {
      console.log(`CACHE_HIT\nQuery: ${query}`);
      return entry.response;
    }
    console.log(`CACHE_MISS\nQuery: ${query}`);
    return null;
  }

  public set(query: string, response: string, source: string): void {
    const key = this.normalize(query);
    const ttl = this.getTTL(query);
    const now = Date.now();
    const expiresAt = now + ttl;

    const entry: CacheEntry = {
      query,
      response,
      createdAt: now,
      expiresAt,
      source
    };

    this.cacheManager.set(key, entry);
    console.log(`CACHE_STORE\nQuery: ${query}`);
  }

  public normalize(query: string): string {
    // Normalizes query by removing punctuation, extra spaces, and casting to lowercase
    return query
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
      .replace(/\s+/g, ' ');
  }

  public getTTL(query: string): number {
    const queryLower = query.toLowerCase().trim();

    // 1. Repository Questions: 30 minutes (1,800,000 ms)
    const repositoryKeywords = ['repo', 'repository', 'readme', 'oracle-sync-test', 'sahai', 'orbitair', 'ecom', 'swot', 'satcom', 'microservice', 'orbit-ops', 'bookstore', 'ailearning'];
    if (repositoryKeywords.some(kw => queryLower.includes(kw))) {
      return 30 * 60 * 1000;
    }

    // 2. GitHub Metadata Queries: 5 minutes (300,000 ms)
    const metadataKeywords = ['sync', 'metadata', 'timestamp', 'created', 'updated', 'stars', 'forks', 'git', 'last updated', 'time'];
    if (metadataKeywords.some(kw => queryLower.includes(kw))) {
      return 5 * 60 * 1000;
    }

    // 3. Portfolio Questions: 1 hour (3,600,000 ms)
    const portfolioKeywords = ['suraj', 'samanta', 'portfolio', 'project', 'skill', 'achievement', 'timeline', 'experience', 'education', 'bio', 'background', 'contact', 'email', 'degree', 'studies'];
    if (portfolioKeywords.some(kw => queryLower.includes(kw))) {
      return 60 * 60 * 1000;
    }

    // 4. General Knowledge: 24 hours (86,400,000 ms)
    return 24 * 60 * 60 * 1000;
  }
}

export const queryCacheService = new QueryCacheService();
export default queryCacheService;
