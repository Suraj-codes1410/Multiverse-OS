'use client';

import { useEffect, useState } from 'react';

interface MetricSnapshot {
  overview: {
    repositoriesIndexed: number;
    projectsIndexed: number;
    kgNodesCount: number;
    kgRelationsCount: number;
    lastSync: string;
  };
  queries: {
    totalQueries: number;
    queriesPerHour: { [hour: string]: number };
    queriesPerDay: { [day: string]: number };
    uniqueQueryCount: number;
    repeatedQueryCount: number;
    recentQueries: Array<{
      query: string;
      timestamp: number;
      route: string;
      latencyMs: number;
      cacheHit: boolean;
    }>;
    mostCommonCategories: Array<{ category: string; count: number }>;
  };
  cache: {
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
    mostCachedQueries: Array<{ query: string; count: number }>;
    cacheSize: number;
    oldestEntry: { query: string; createdAt: number } | null;
    newestEntry: { query: string; createdAt: number } | null;
  };
  routing: {
    smartRoutes: number;
    directResponses: number;
    recruiterRoutes: number;
    narrativeRoutes: number;
    portfolioRoutes: number;
    generalKnowledgeRoutes: number;
    smartRouteRate: number;
    directResponseRate: number;
  };
  performance: {
    averageResponseTime: number;
    slowestQueries: Array<{ query: string; latencyMs: number }>;
    fastestQueries: Array<{ query: string; latencyMs: number }>;
    cacheResponseTime: number;
    openRouterResponseTime: number;
  };
  providers: {
    openRouterCalls: number;
    openRouterFailures: number;
    modelFailovers: number;
    rateLimit429Events: number;
    providerSuccessRate: number;
  };
  memory: {
    memoryResolutions: number;
    followUpResolutions: number;
    contextReuseRate: number;
    recentMemoryEvents: Array<{
      query: string;
      resolvedMemory: boolean;
      timestamp: number;
    }>;
  };
  recruiter: {
    recruiterQueries: number;
    backendEvaluationQueries: number;
    aiEvaluationQueries: number;
    resumeQueries: number;
    careerCopilotQueries: number;
  };
}

interface HealthStatus {
  status: string;
  services: {
    oracle: boolean;
    analytics: boolean;
    cache: boolean;
    githubSync: boolean;
    memory: boolean;
    openrouter: boolean;
    smartRouter: boolean;
  };
  timestamp: string;
}

const getRouteLabelClasses = (route: string) => {
  const base = 'text-xs px-2 py-0.5 rounded font-semibold ';
  switch (route) {
    case 'openrouter':
      return base + 'bg-blue-500/15 text-blue-400';
    case 'smart-route':
      return base + 'bg-emerald-500/15 text-emerald-400';
    case 'recruiter-insight':
      return base + 'bg-purple-500/15 text-purple-400';
    case 'narrative-engine':
      return base + 'bg-pink-500/15 text-pink-400';
    case 'copilot-engine':
      return base + 'bg-amber-500/15 text-amber-400';
    default:
      return base + 'bg-gray-500/15 text-gray-400';
  }
};

export default function OracleAdminDashboardClient() {
  console.log("DASHBOARD_RENDER_START");

  const [metrics, setMetrics] = useState<MetricSnapshot | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchMetricsAndHealth = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
      console.log("METRICS_REFRESH");
    }
    try {
      const [metricsRes, healthRes] = await Promise.all([
        fetch('/api/oracle/analytics'),
        fetch('/api/health')
      ]);

      if (metricsRes.ok && healthRes.ok) {
        const metricsData = await metricsRes.json();
        const healthData = await healthRes.json();
        setMetrics(metricsData);
        setHealth(healthData);
        console.log("DASHBOARD_DATA_RECEIVED");
      }
    } catch (e) {
      console.error('Failed to fetch dashboard metrics or health:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndHealth();
    // Poll stats every 30 seconds
    const interval = setInterval(() => fetchMetricsAndHealth(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the entire query cache and conversational memory sessions?')) {
      return;
    }
    setClearingCache(true);
    setMessage(null);
    try {
      const res = await fetch('/api/oracle/cache/clear', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: 'Cache and conversational memory cleared successfully.', type: 'success' });
        fetchMetricsAndHealth();
      } else {
        setMessage({ text: data.error || 'Failed to clear cache.', type: 'error' });
      }
    } catch (e: any) {
      setMessage({ text: e.message || 'Error occurred clearing cache.', type: 'error' });
    } finally {
      setClearingCache(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0f172a] text-[#f8fafc] font-sans">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-blue-500 mb-4"></div>
        <p className="text-sm font-medium">Loading Oracle Administration Dashboard...</p>
      </div>
    );
  }

  const systemHealthy = health?.status === 'healthy';

  console.log("DASHBOARD_RENDER_COMPLETE");

  return (
    <div className="max-w-[1400px] mx-auto p-8 w-full bg-[#0b0f19] text-[#f1f5f9] font-sans min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1e293b] pb-6 mb-8 gap-4">
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold text-[#f8fafc] tracking-tight">Oracle Admin</h1>
          <span className="text-[#64748b] text-sm mt-1 block">Operational Health & Diagnostics</span>
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          {message && (
            <div className={`px-4 py-2 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                : 'bg-red-500/15 text-red-500 border border-red-500/30'
            }`}>
              {message.text}
            </div>
          )}
          <button 
            onClick={() => handleClearCache()} 
            disabled={clearingCache}
            className="px-5 py-2.5 rounded-md font-semibold text-sm cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-[#ef4444] text-white hover:bg-[#dc2626]"
          >
            {clearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
          <button 
            onClick={() => fetchMetricsAndHealth(true)} 
            disabled={refreshing}
            className="px-5 py-2.5 rounded-md font-semibold text-sm cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* System Health */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-[#f1f5f9] m-0">System Status</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              systemHealthy 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/15 text-red-500 border-red-500/30'
            }`}>
              {health?.status.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm text-[#94a3b8]">
              <span>Oracle Engine</span>
              <span className={`w-2 h-2 rounded-full inline-block ${health?.services.oracle ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
            <div className="flex justify-between items-center text-sm text-[#94a3b8]">
              <span>Sync Service</span>
              <span className={`w-2 h-2 rounded-full inline-block ${health?.services.githubSync ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
            <div className="flex justify-between items-center text-sm text-[#94a3b8]">
              <span>Query Cache</span>
              <span className={`w-2 h-2 rounded-full inline-block ${health?.services.cache ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
            <div className="flex justify-between items-center text-sm text-[#94a3b8]">
              <span>Memory Storage</span>
              <span className={`w-2 h-2 rounded-full inline-block ${health?.services.memory ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
            <div className="flex justify-between items-center text-sm text-[#94a3b8]">
              <span>Analytics Service</span>
              <span className={`w-2 h-2 rounded-full inline-block ${health?.services.analytics ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
            </div>
          </div>
        </div>

        {/* Oracle Overview */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
          <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Oracle Overview</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Total Queries</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.queries.totalQueries || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Repositories Indexed</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.overview.repositoriesIndexed || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Projects Indexed</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.overview.projectsIndexed || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Knowledge Graph Size</span>
              <span className="font-semibold text-[#f1f5f9] text-right">
                {((metrics?.overview.kgNodesCount || 0) + (metrics?.overview.kgRelationsCount || 0))} 
                <span className="text-xs text-[#64748b] block">({metrics?.overview.kgNodesCount} nodes, {metrics?.overview.kgRelationsCount} edges)</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Last GitHub Sync</span>
              <span className="text-xs text-[#cbd5e1] font-semibold">
                {metrics?.overview.lastSync ? new Date(metrics.overview.lastSync).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
          <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Cache Health</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Cache Hit Rate</span>
              <span className="text-emerald-400 text-lg font-bold">{metrics?.cache.hitRate || 0.0}%</span>
            </div>
            <div className="bg-[#1e293b] rounded-full h-1.5 w-full overflow-hidden -mt-1 mb-1">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${metrics?.cache.hitRate || 0}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Cache Hits</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.cache.cacheHits || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Cache Misses</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.cache.cacheMisses || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Active Entries In Cache</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.cache.cacheSize || 0}</span>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
          <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Latency Stats</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Avg Response Time</span>
              <span className="text-blue-500 text-lg font-bold">{metrics?.performance.averageResponseTime || 0} ms</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Cache Avg Latency</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.performance.cacheResponseTime || 0} ms</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">OpenRouter Avg Latency</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.performance.openRouterResponseTime || 0} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Section */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left Column */}
        <div className="flex flex-col flex-[2] gap-6">
          {/* AI Providers & Failover */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
            <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">AI Provider & Model Failover Telemetry</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.providers.openRouterCalls || 0}</span>
                <span className="text-xs text-[#94a3b8]">API Requests</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-red-500 leading-none mb-1">{metrics?.providers.openRouterFailures || 0}</span>
                <span className="text-xs text-[#94a3b8]">Failures</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-amber-500 leading-none mb-1">{metrics?.providers.modelFailovers || 0}</span>
                <span className="text-xs text-[#94a3b8]">Failovers Triggered</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.providers.providerSuccessRate || 100}%</span>
                <span className="text-xs text-[#94a3b8]">Success Rate</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#94a3b8]">Primary Model</span>
              <span className="font-mono text-xs bg-[#1f2937] px-1.5 py-0.5 rounded">deepseek/deepseek-r1:free</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#94a3b8]">Fallback Model 1</span>
              <span className="font-mono text-xs bg-[#1f2937] px-1.5 py-0.5 rounded">meta-llama/llama-3.3-70b-instruct:free</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#94a3b8]">Upstream 429 Events</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.providers.rateLimit429Events || 0}</span>
            </div>
          </div>

          {/* Recruiter & Copilot */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
            <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Recruiter & Career Copilot Analytics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.recruiter.recruiterQueries || 0}</span>
                <span className="text-xs text-[#94a3b8]">Recruiter Queries</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.recruiter.backendEvaluationQueries || 0}</span>
                <span className="text-xs text-[#94a3b8]">Backend Evaluations</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.recruiter.aiEvaluationQueries || 0}</span>
                <span className="text-[#cbd5e1] text-xs text-[#94a3b8]">AI Evaluations</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.recruiter.resumeQueries || 0}</span>
                <span className="text-xs text-[#94a3b8]">Resume Inquiries</span>
              </div>
              <div className="bg-[#1f2937] border border-[#374151] rounded-lg p-4 text-center flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-[#f8fafc] leading-none mb-1">{metrics?.recruiter.careerCopilotQueries || 0}</span>
                <span className="text-xs text-[#94a3b8]">Career Copilot Queries</span>
              </div>
            </div>
          </div>

          {/* Recent Query Log Table */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
            <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Recent Query Observability Log</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1e293b]">
                    <th className="px-4 py-3 text-[#94a3b8] font-semibold">Query</th>
                    <th className="px-4 py-3 text-[#94a3b8] font-semibold">Route</th>
                    <th className="px-4 py-3 text-[#94a3b8] font-semibold">Latency</th>
                    <th className="px-4 py-3 text-[#94a3b8] font-semibold">Cache Hit</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.queries.recentQueries && metrics.queries.recentQueries.length > 0 ? (
                    metrics.queries.recentQueries.map((q, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors border-b border-[#1e293b]">
                        <td className="px-4 py-3 text-[#cbd5e1] max-w-[300px] truncate" title={q.query}>{q.query}</td>
                        <td className="px-4 py-3"><span className={getRouteLabelClasses(q.route)}>{q.route}</span></td>
                        <td className="px-4 py-3 text-[#cbd5e1]">{q.latencyMs} ms</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold ${q.cacheHit ? 'text-emerald-400' : 'text-[#64748b]'}`}>
                            {q.cacheHit ? 'HIT' : 'MISS'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[#64748b]">No query history logs recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col flex-1 gap-6">
          {/* Conversational Memory */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
            <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Conversational Memory</h3>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#94a3b8]">Memory Resolutions</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.memory.memoryResolutions || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#94a3b8]">Resolved Pronouns</span>
              <span className="font-semibold text-[#f1f5f9]">{metrics?.memory.followUpResolutions || 0}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-[#94a3b8]">Context Reuse Rate</span>
              <span className="text-emerald-400 text-lg font-bold">{metrics?.memory.contextReuseRate || 0.0}%</span>
            </div>
            <div className="bg-[#1e293b] rounded-full h-1.5 w-full overflow-hidden mb-5">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${metrics?.memory.contextReuseRate || 0}%` }}></div>
            </div>

            <h4 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider mb-3">Recent Memory Operations</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {metrics?.memory.recentMemoryEvents && metrics.memory.recentMemoryEvents.length > 0 ? (
                metrics.memory.recentMemoryEvents.slice(-4).map((evt, idx) => (
                  <li key={idx} className="bg-[#1e293b] rounded-md p-3 border-l-4 border-blue-500">
                    <span className="text-xs text-[#94a3b8] block mb-1">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    <p className="text-[13px] m-0 text-[#e2e8f0]">
                      Stored query context: "{evt.query.slice(0, 45)}{evt.query.length > 45 ? '...' : ''}"
                      {evt.resolvedMemory && <span className="bg-[#8b5cf6] text-white text-[10px] px-1 py-0.25 rounded ml-2 font-semibold">Resolved Pronoun</span>}
                    </p>
                  </li>
                ))
              ) : (
                <li className="text-[#64748b] text-sm text-center py-4">No conversational sessions stored yet.</li>
              )}
            </ul>
          </div>

          {/* Cache Metadata details */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 shadow-md hover:border-[#3b82f6] transition-all duration-200">
            <h3 className="text-lg font-bold text-[#f1f5f9] mt-0 mb-5">Cache Metadata</h3>
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-[#94a3b8] text-sm">Oldest Entry</span>
              <p className="text-xs text-[#cbd5e1] break-all bg-[#1e293b] p-2 rounded">{metrics?.cache.oldestEntry?.query || 'N/A'}</p>
            </div>
            <div className="flex flex-col gap-2 mb-6">
              <span className="text-[#94a3b8] text-sm">Newest Entry</span>
              <p className="text-xs text-[#cbd5e1] break-all bg-[#1e293b] p-2 rounded">{metrics?.cache.newestEntry?.query || 'N/A'}</p>
            </div>
            <h4 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider mb-3">Most Frequently Hit Cached Queries</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {metrics?.cache.mostCachedQueries && metrics.cache.mostCachedQueries.length > 0 ? (
                metrics.cache.mostCachedQueries.map((q, idx) => (
                  <li key={idx} className="text-[13px] text-[#cbd5e1] flex justify-between items-center">
                    <span className="truncate max-w-[200px]" title={q.query}>"{q.query}"</span>
                    <span className="bg-[#374151] text-[#94a3b8] text-xs px-1.5 py-0.5 rounded flex-shrink-0">{q.count} hits</span>
                  </li>
                ))
              ) : (
                <li className="text-[#64748b] text-sm text-center py-4">No cache hits recorded yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
