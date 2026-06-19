export interface QueryRecord {
  query: string;
  normalizedQuery: string;
  timestamp: number;
  latencyMs: number;
  cacheHit: boolean;
  route: 'smart-route' | 'narrative-engine' | 'copilot-engine' | 'recruiter-insight' | 'openrouter';
  category: string;
  directAnswer: boolean;
  resolvedMemory: boolean;
  contextReused: boolean;
}

export interface ProviderRecord {
  model: string;
  timestamp: number;
  success: boolean;
  errorCode?: number;
  errorMessage?: string;
  isFailover: boolean;
}

export interface AnalyticsData {
  queries: QueryRecord[];
  providerCalls: ProviderRecord[];
}

export class AnalyticsService {
  private static instance: AnalyticsService | null = null;
  private data: AnalyticsData = { queries: [], providerCalls: [] };
  private filePath: string = '';

  private constructor() {
    if (typeof window === 'undefined') {
      try {
        const fs = eval('require')('fs');
        const path = eval('require')('path');
        this.filePath = path.join(process.cwd(), 'data/oracle-analytics.json');
        
        // Ensure directory exists
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(this.filePath)) {
          const content = fs.readFileSync(this.filePath, 'utf8');
          const parsed = JSON.parse(content);
          if (parsed) {
            this.data = {
              queries: parsed.queries || [],
              providerCalls: parsed.providerCalls || []
            };
          }
        }
      } catch (e) {
        console.error('Failed to initialize AnalyticsService:', e);
      }
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private save(): void {
    if (typeof window === 'undefined') {
      try {
        const fs = eval('require')('fs');
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
      } catch (e) {
        console.error('Failed to save analytics data:', e);
      }
    }
  }

  public recordQuery(record: Omit<QueryRecord, 'timestamp'>): void {
    const fullRecord: QueryRecord = {
      ...record,
      timestamp: Date.now()
    };
    this.data.queries.push(fullRecord);
    
    // Cap query log history at 2000 items
    if (this.data.queries.length > 2000) {
      this.data.queries.shift();
    }
    
    this.save();
    this.logConsoleStats(fullRecord);
  }

  public recordProviderCall(record: Omit<ProviderRecord, 'timestamp'>): void {
    const fullRecord: ProviderRecord = {
      ...record,
      timestamp: Date.now()
    };
    this.data.providerCalls.push(fullRecord);

    // Cap provider log history at 2000 items
    if (this.data.providerCalls.length > 2000) {
      this.data.providerCalls.shift();
    }

    this.save();
    
    console.log("ANALYTICS_EVENT", JSON.stringify({ type: 'PROVIDER_CALL', model: record.model, success: record.success, isFailover: record.isFailover }));
    if (record.isFailover) {
      console.log("FAILOVER_USAGE", `Model failover triggered to model: ${record.model}`);
    }
  }

  public clear(): void {
    this.data = { queries: [], providerCalls: [] };
    this.save();
  }

  private logConsoleStats(record: QueryRecord): void {
    const total = this.data.queries.length;
    const cacheHits = this.data.queries.filter(q => q.cacheHit).length;
    const hitRate = total > 0 ? ((cacheHits / total) * 100).toFixed(1) : "0.0";
    
    const smartRoutes = this.data.queries.filter(q => q.route === 'smart-route').length;
    const smartRouteRate = total > 0 ? ((smartRoutes / total) * 100).toFixed(1) : "0.0";

    console.log("ANALYTICS_EVENT", JSON.stringify({
      type: 'QUERY',
      query: record.query,
      route: record.route,
      latencyMs: record.latencyMs,
      cacheHit: record.cacheHit
    }));

    console.log("QUERY_LATENCY", `Query "${record.query}" took ${record.latencyMs}ms`);
    console.log("CACHE_HIT_RATE", `Cache Hit Rate: ${hitRate}%`);
    console.log("SMART_ROUTE_RATE", `Smart Route Direct Response Rate: ${smartRouteRate}%`);

    if (record.route === 'openrouter') {
      console.log("OPENROUTER_USAGE", `OpenRouter API called for query "${record.query}"`);
    }
  }

  public async getDashboardMetrics() {
    const queries = this.data.queries;
    const providerCalls = this.data.providerCalls;

    // 1. Query Analytics
    const totalQueries = queries.length;
    const queriesPerHour: { [hour: string]: number } = {};
    const queriesPerDay: { [day: string]: number } = {};
    
    for (let i = 0; i < 24; i++) {
      queriesPerHour[i.toString()] = 0;
    }

    const seen = new Set<string>();
    let uniqueQueryCount = 0;
    let repeatedQueryCount = 0;

    queries.forEach(q => {
      const date = new Date(q.timestamp);
      const hour = date.getHours().toString();
      queriesPerHour[hour] = (queriesPerHour[hour] || 0) + 1;

      const day = date.toISOString().split('T')[0];
      queriesPerDay[day] = (queriesPerDay[day] || 0) + 1;

      if (seen.has(q.normalizedQuery)) {
        repeatedQueryCount++;
      } else {
        seen.add(q.normalizedQuery);
        uniqueQueryCount++;
      }
    });

    // Recent queries
    const recentQueries = [...queries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10).map(q => ({
      query: q.query,
      timestamp: q.timestamp,
      route: q.route,
      latencyMs: q.latencyMs,
      cacheHit: q.cacheHit
    }));

    // Most common categories
    const categoryCounts: { [cat: string]: number } = {};
    queries.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    const mostCommonCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count }));

    // 2. Cache Analytics
    const cacheHits = queries.filter(q => q.cacheHit).length;
    const cacheMisses = totalQueries - cacheHits;
    const cacheHitRate = totalQueries > 0
      ? parseFloat(((cacheHits / totalQueries) * 100).toFixed(1))
      : 0.0;

    const hitCounts: { [query: string]: { original: string, count: number } } = {};
    queries.forEach(q => {
      if (q.cacheHit) {
        if (!hitCounts[q.normalizedQuery]) {
          hitCounts[q.normalizedQuery] = { original: q.query, count: 0 };
        }
        hitCounts[q.normalizedQuery].count++;
      }
    });
    const mostCachedQueries = Object.values(hitCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({ query: item.original, count: item.count }));

    // Live cache statistics
    let cacheSize = 0;
    let oldestEntry: any = null;
    let newestEntry: any = null;
    try {
      const { queryCacheService } = await import('./queryCache');
      const cacheManager = (queryCacheService as any).cacheManager;
      if (cacheManager) {
        const cacheMap = (cacheManager as any).cache as Map<string, any>;
        if (cacheMap) {
          cacheSize = cacheMap.size;
          const entries = Array.from(cacheMap.values());
          if (entries.length > 0) {
            const sortedEntries = [...entries].sort((a, b) => a.createdAt - b.createdAt);
            oldestEntry = { query: sortedEntries[0].query, createdAt: sortedEntries[0].createdAt };
            newestEntry = { query: sortedEntries[sortedEntries.length - 1].query, createdAt: sortedEntries[sortedEntries.length - 1].createdAt };
          }
        }
      }
    } catch (e) {}

    // 3. Smart Router Analytics
    let smartRoutes = 0;
    let directResponses = 0;
    let recruiterRoutes = 0;
    let narrativeRoutes = 0;
    let portfolioRoutes = 0;
    let generalKnowledgeRoutes = 0;

    queries.forEach(q => {
      if (q.route === 'smart-route') smartRoutes++;
      if (q.route === 'recruiter-insight' || q.category === 'Recruiter Insight') recruiterRoutes++;
      if (q.route === 'narrative-engine') narrativeRoutes++;
      if (q.route === 'copilot-engine') portfolioRoutes++;
      if (q.category === 'General Knowledge') generalKnowledgeRoutes++;
      if (q.directAnswer) directResponses++;
    });

    const smartRouteRate = totalQueries > 0
      ? parseFloat(((smartRoutes / totalQueries) * 100).toFixed(1))
      : 0.0;

    const directResponseRate = totalQueries > 0
      ? parseFloat(((directResponses / totalQueries) * 100).toFixed(1))
      : 0.0;

    // 4. Performance Analytics
    const totalLatency = queries.reduce((sum, q) => sum + q.latencyMs, 0);
    const averageResponseTime = totalQueries > 0
      ? parseFloat((totalLatency / totalQueries).toFixed(1))
      : 0;

    const sortedByLatencyDesc = [...queries].sort((a, b) => b.latencyMs - a.latencyMs);
    const slowestQueries = sortedByLatencyDesc.slice(0, 5).map(q => ({ query: q.query, latencyMs: q.latencyMs }));

    const sortedByLatencyAsc = [...queries].sort((a, b) => a.latencyMs - b.latencyMs);
    const fastestQueries = sortedByLatencyAsc.slice(0, 5).map(q => ({ query: q.query, latencyMs: q.latencyMs }));

    const cacheQueries = queries.filter(q => q.cacheHit);
    const cacheResponseTime = cacheQueries.length > 0
      ? parseFloat((cacheQueries.reduce((sum, q) => sum + q.latencyMs, 0) / cacheQueries.length).toFixed(1))
      : 0;

    const orQueries = queries.filter(q => q.route === 'openrouter' && !q.cacheHit);
    const openRouterResponseTime = orQueries.length > 0
      ? parseFloat((orQueries.reduce((sum, q) => sum + q.latencyMs, 0) / orQueries.length).toFixed(1))
      : 0;

    // 5. Providers Analytics
    const openRouterCalls = providerCalls.length;
    const openRouterFailures = providerCalls.filter(p => !p.success).length;
    const modelFailovers = providerCalls.filter(p => p.isFailover).length;
    const rateLimit429Events = providerCalls.filter(p => p.errorCode === 429).length;
    const successfulCalls = providerCalls.filter(p => p.success).length;
    const providerSuccessRate = openRouterCalls > 0
      ? parseFloat(((successfulCalls / openRouterCalls) * 100).toFixed(1))
      : 100.0;

    // 6. Memory Analytics
    const memoryResolutions = queries.length;
    const followUpResolutions = queries.filter(q => q.resolvedMemory).length;
    const contextReuseRate = totalQueries > 0
      ? parseFloat(((followUpResolutions / totalQueries) * 100).toFixed(1))
      : 0.0;
    
    const recentMemoryEvents = queries.slice(-5).map(q => ({
      query: q.query,
      resolvedMemory: q.resolvedMemory,
      timestamp: q.timestamp
    }));

    // 7. Recruiter Analytics
    let recruiterQueries = 0;
    let backendEvaluationQueries = 0;
    let aiEvaluationQueries = 0;
    let resumeQueries = 0;
    let careerCopilotQueries = 0;

    queries.forEach(q => {
      const queryLower = q.query.toLowerCase();

      if (q.route === 'recruiter-insight' || q.category === 'Recruiter Insight') {
        recruiterQueries++;
      }

      if (q.route === 'copilot-engine') {
        careerCopilotQueries++;
      }

      const hasBackendKw = /\b(backend|spring boot|springboot|database|java|go|rust|golang|novadb|logpulse|patient-management-service|microservice|concurrency|distributed|grpc|raft)\b/i.test(queryLower);
      const hasAiKw = /\b(ai|machine learning|vector|rag|pinecone|sahai|orbitair|llm|agents|neural|model)\b/i.test(queryLower);
      const hasResumeKw = /\b(resume|cv|portfolio|interview|hired|hire)\b/i.test(queryLower);

      if ((q.route === 'recruiter-insight' || q.category === 'Recruiter Insight') && hasBackendKw) {
        backendEvaluationQueries++;
      }

      if ((q.route === 'recruiter-insight' || q.category === 'Recruiter Insight') && hasAiKw) {
        aiEvaluationQueries++;
      }

      if (hasResumeKw) {
        resumeQueries++;
      }
    });

    // 8. Oracle Overview Stats (Knowledge Graph & GitHub Sync metadata)
    let kgNodesCount = 0;
    let kgRelationsCount = 0;
    try {
      const { buildKnowledgeGraph } = await import('@/lib/knowledge/builder');
      const graph = await buildKnowledgeGraph();
      kgNodesCount = graph.getNodes().length;
      kgRelationsCount = graph.getRelationships().length;
    } catch (e) {}

    let lastSyncTime = '';
    let reposIndexed = 0;
    try {
      const fs = eval('require')('fs');
      const path = eval('require')('path');
      const cachePath = path.join(process.cwd(), 'data/github-sync-cache.json');
      if (fs.existsSync(cachePath)) {
        const content = fs.readFileSync(cachePath, 'utf8');
        const cache = JSON.parse(content);
        lastSyncTime = cache.lastUpdated || '';
        reposIndexed = Array.isArray(cache.repositories) ? cache.repositories.length : 0;
      }
    } catch (e) {}

    let projectsIndexed = 0;
    try {
      const { getProjects } = await import('@/lib/content/index');
      const projects = await getProjects();
      projectsIndexed = projects.length;
    } catch (e) {}

    return {
      overview: {
        repositoriesIndexed: reposIndexed,
        projectsIndexed,
        kgNodesCount,
        kgRelationsCount,
        lastSync: lastSyncTime
      },
      queries: {
        totalQueries,
        queriesPerHour,
        queriesPerDay,
        uniqueQueryCount,
        repeatedQueryCount,
        recentQueries,
        mostCommonCategories
      },
      cache: {
        cacheHits,
        cacheMisses,
        hitRate: cacheHitRate,
        mostCachedQueries,
        cacheSize,
        oldestEntry,
        newestEntry
      },
      routing: {
        smartRoutes,
        directResponses,
        recruiterRoutes,
        narrativeRoutes,
        portfolioRoutes,
        generalKnowledgeRoutes,
        smartRouteRate,
        directResponseRate
      },
      performance: {
        averageResponseTime,
        slowestQueries,
        fastestQueries,
        cacheResponseTime,
        openRouterResponseTime
      },
      providers: {
        openRouterCalls,
        openRouterFailures,
        modelFailovers,
        rateLimit429Events,
        providerSuccessRate
      },
      memory: {
        memoryResolutions,
        followUpResolutions,
        contextReuseRate,
        recentMemoryEvents
      },
      recruiter: {
        recruiterQueries,
        backendEvaluationQueries,
        aiEvaluationQueries,
        resumeQueries,
        careerCopilotQueries
      }
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
export default analyticsService;
