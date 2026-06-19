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

export default function OracleAdminDashboardClient() {
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
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Oracle Administration Dashboard...</p>
        <style jsx>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #0f172a;
            color: #f8fafc;
            font-family: Inter, sans-serif;
          }
          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const systemHealthy = health?.status === 'healthy';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Oracle Admin</h1>
          <span className="subtitle">Operational Health & Diagnostics</span>
        </div>
        <div className="header-right">
          {message && (
            <div className={`toast-message ${message.type}`}>
              {message.text}
            </div>
          )}
          <button 
            onClick={() => handleClearCache()} 
            disabled={clearingCache}
            className="btn btn-danger"
          >
            {clearingCache ? 'Clearing...' : 'Clear Cache'}
          </button>
          <button 
            onClick={() => fetchMetricsAndHealth(true)} 
            disabled={refreshing}
            className="btn btn-primary"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="metrics-grid">
        {/* System Health */}
        <div className="metric-card health-card">
          <div className="card-header">
            <h3>System Status</h3>
            <span className={`status-badge ${systemHealthy ? 'healthy' : 'unhealthy'}`}>
              {health?.status.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
          <div className="health-checks">
            <div className="check-item">
              <span>Oracle Engine</span>
              <span className={`dot ${health?.services.oracle ? 'green' : 'red'}`} />
            </div>
            <div className="check-item">
              <span>Sync Service</span>
              <span className={`dot ${health?.services.githubSync ? 'green' : 'red'}`} />
            </div>
            <div className="check-item">
              <span>Query Cache</span>
              <span className={`dot ${health?.services.cache ? 'green' : 'red'}`} />
            </div>
            <div className="check-item">
              <span>Memory Storage</span>
              <span className={`dot ${health?.services.memory ? 'green' : 'red'}`} />
            </div>
            <div className="check-item">
              <span>Analytics Service</span>
              <span className={`dot ${health?.services.analytics ? 'green' : 'red'}`} />
            </div>
          </div>
        </div>

        {/* Oracle Overview */}
        <div className="metric-card">
          <h3>Oracle Overview</h3>
          <div className="stat-list">
            <div className="stat-row">
              <span className="label">Total Queries</span>
              <span className="val">{metrics?.queries.totalQueries || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Repositories Indexed</span>
              <span className="val">{metrics?.overview.repositoriesIndexed || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Projects Indexed</span>
              <span className="val">{metrics?.overview.projectsIndexed || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Knowledge Graph Size</span>
              <span className="val">
                {((metrics?.overview.kgNodesCount || 0) + (metrics?.overview.kgRelationsCount || 0))} 
                <span className="small-text"> ({metrics?.overview.kgNodesCount} nodes, {metrics?.overview.kgRelationsCount} edges)</span>
              </span>
            </div>
            <div className="stat-row">
              <span className="label">Last GitHub Sync</span>
              <span className="val val-date">
                {metrics?.overview.lastSync ? new Date(metrics.overview.lastSync).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Cache Performance */}
        <div className="metric-card">
          <h3>Cache Health</h3>
          <div className="stat-list">
            <div className="stat-row">
              <span className="label">Cache Hit Rate</span>
              <span className="val highlight">{metrics?.cache.hitRate || 0.0}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${metrics?.cache.hitRate || 0}%` }}></div>
            </div>
            <div className="stat-row">
              <span className="label">Cache Hits</span>
              <span className="val">{metrics?.cache.cacheHits || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Cache Misses</span>
              <span className="val">{metrics?.cache.cacheMisses || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Active Entries In Cache</span>
              <span className="val">{metrics?.cache.cacheSize || 0}</span>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="metric-card">
          <h3>Latency Stats</h3>
          <div className="stat-list">
            <div className="stat-row">
              <span className="label">Avg Response Time</span>
              <span className="val highlight-blue">{metrics?.performance.averageResponseTime || 0} ms</span>
            </div>
            <div className="stat-row">
              <span className="label">Cache Avg Latency</span>
              <span className="val">{metrics?.performance.cacheResponseTime || 0} ms</span>
            </div>
            <div className="stat-row">
              <span className="label">OpenRouter Avg Latency</span>
              <span className="val">{metrics?.performance.openRouterResponseTime || 0} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Section */}
      <div className="details-layout">
        {/* Left Column */}
        <div className="details-col flex-2">
          {/* AI Providers & Failover */}
          <div className="metric-card mt-6">
            <h3>AI Provider & Model Failover Telemetry</h3>
            <div className="model-grid">
              <div className="stat-box">
                <span className="box-val">{metrics?.providers.openRouterCalls || 0}</span>
                <span className="box-label">API Requests</span>
              </div>
              <div className="stat-box">
                <span className="box-val red-text">{metrics?.providers.openRouterFailures || 0}</span>
                <span className="box-label">Failures</span>
              </div>
              <div className="stat-box">
                <span className="box-val orange-text">{metrics?.providers.modelFailovers || 0}</span>
                <span className="box-label">Failovers Triggered</span>
              </div>
              <div className="stat-box">
                <span className="box-val">{metrics?.providers.providerSuccessRate || 100}%</span>
                <span className="box-label">Success Rate</span>
              </div>
            </div>
            <div className="stat-row mt-4">
              <span className="label">Primary Model</span>
              <span className="val font-mono">deepseek/deepseek-r1:free</span>
            </div>
            <div className="stat-row">
              <span className="label">Fallback Model 1</span>
              <span className="val font-mono">meta-llama/llama-3.3-70b-instruct:free</span>
            </div>
            <div className="stat-row">
              <span className="label">Upstream 429 Events</span>
              <span className="val">{metrics?.providers.rateLimit429Events || 0}</span>
            </div>
          </div>

          {/* Recruiter & Copilot */}
          <div className="metric-card mt-6">
            <h3>Recruiter & Career Copilot Analytics</h3>
            <div className="recruiter-grid">
              <div className="stat-box">
                <span className="box-val">{metrics?.recruiter.recruiterQueries || 0}</span>
                <span className="box-label">Recruiter Queries</span>
              </div>
              <div className="stat-box">
                <span className="box-val">{metrics?.recruiter.backendEvaluationQueries || 0}</span>
                <span className="box-label">Backend Evaluations</span>
              </div>
              <div className="stat-box">
                <span className="box-val">{metrics?.recruiter.aiEvaluationQueries || 0}</span>
                <span className="box-label">AI Evaluations</span>
              </div>
              <div className="stat-box">
                <span className="box-val">{metrics?.recruiter.resumeQueries || 0}</span>
                <span className="box-label">Resume Inquiries</span>
              </div>
              <div className="stat-box">
                <span className="box-val">{metrics?.recruiter.careerCopilotQueries || 0}</span>
                <span className="box-label">Career Copilot Queries</span>
              </div>
            </div>
          </div>

          {/* Recent Query Log Table */}
          <div className="metric-card mt-6">
            <h3>Recent Query Observability Log</h3>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>Route</th>
                    <th>Latency</th>
                    <th>Cache Hit</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics?.queries.recentQueries && metrics.queries.recentQueries.length > 0 ? (
                    metrics.queries.recentQueries.map((q, idx) => (
                      <tr key={idx}>
                        <td className="query-text" title={q.query}>{q.query}</td>
                        <td><span className={`route-label ${q.route}`}>{q.route}</span></td>
                        <td>{q.latencyMs} ms</td>
                        <td>
                          <span className={`cache-badge ${q.cacheHit ? 'hit' : 'miss'}`}>
                            {q.cacheHit ? 'HIT' : 'MISS'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">No query history logs recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="details-col flex-1">
          {/* Conversational Memory */}
          <div className="metric-card mt-6">
            <h3>Conversational Memory</h3>
            <div className="stat-row">
              <span className="label">Memory Resolutions</span>
              <span className="val">{metrics?.memory.memoryResolutions || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Resolved Pronouns</span>
              <span className="val">{metrics?.memory.followUpResolutions || 0}</span>
            </div>
            <div className="stat-row">
              <span className="label">Context Reuse Rate</span>
              <span className="val highlight">{metrics?.memory.contextReuseRate || 0.0}%</span>
            </div>
            <div className="progress-bar-container mt-2">
              <div className="progress-bar" style={{ width: `${metrics?.memory.contextReuseRate || 0}%` }}></div>
            </div>

            <h4 className="section-subheading mt-6">Recent Memory Operations</h4>
            <ul className="event-list">
              {metrics?.memory.recentMemoryEvents && metrics.memory.recentMemoryEvents.length > 0 ? (
                metrics.memory.recentMemoryEvents.slice(-4).map((evt, idx) => (
                  <li key={idx} className="event-item">
                    <span className="event-time">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    <p className="event-desc">
                      Stored query context: "{evt.query.slice(0, 45)}{evt.query.length > 45 ? '...' : ''}"
                      {evt.resolvedMemory && <span className="resolved-flag">Resolved Pronoun</span>}
                    </p>
                  </li>
                ))
              ) : (
                <li className="no-events">No conversational sessions stored yet.</li>
              )}
            </ul>
          </div>

          {/* Cache Metadata details */}
          <div className="metric-card mt-6">
            <h3>Cache Metadata</h3>
            <div className="stat-row">
              <span className="label">Oldest Entry</span>
              <p className="small-text-query mt-1">{metrics?.cache.oldestEntry?.query || 'N/A'}</p>
            </div>
            <div className="stat-row">
              <span className="label">Newest Entry</span>
              <p className="small-text-query mt-1">{metrics?.cache.newestEntry?.query || 'N/A'}</p>
            </div>
            <h4 className="section-subheading mt-6">Most Frequently Hit Cached Queries</h4>
            <ul className="bullet-list">
              {metrics?.cache.mostCachedQueries && metrics.cache.mostCachedQueries.length > 0 ? (
                metrics.cache.mostCachedQueries.map((q, idx) => (
                  <li key={idx}>
                    "{q.query}" <span className="badge-count">{q.count} hits</span>
                  </li>
                ))
              ) : (
                <li className="no-events">No cache hits recorded yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background-color: #0b0f19;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }
        .dashboard-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -0.05em;
        }
        .dashboard-header .subtitle {
          color: #64748b;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }
        .header-right {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .toast-message {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
        }
        .toast-message.success {
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .toast-message.error {
          background-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .btn-primary {
          background-color: #2563eb;
          color: #ffffff;
        }
        .btn-primary:hover {
          background-color: #1d4ed8;
        }
        .btn-danger {
          background-color: #ef4444;
          color: #ffffff;
        }
        .btn-danger:hover {
          background-color: #dc2626;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .metric-card {
          background-color: #111827;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .metric-card:hover {
          border-color: #3b82f6;
        }
        .metric-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-top: 0;
          margin-bottom: 1.25rem;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .card-header h3 {
          margin-bottom: 0;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .status-badge.healthy {
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-badge.unhealthy {
          background-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .health-checks {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .check-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #94a3b8;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot.green {
          background-color: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .dot.red {
          background-color: #ef4444;
          box-shadow: 0 0 8px #ef4444;
        }
        .stat-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }
        .stat-row .label {
          color: #94a3b8;
        }
        .stat-row .val {
          font-weight: 600;
          color: #f1f5f9;
        }
        .stat-row .val.highlight {
          color: #10b981;
          font-size: 1.125rem;
          font-weight: 700;
        }
        .stat-row .val.highlight-blue {
          color: #3b82f6;
          font-size: 1.125rem;
          font-weight: 700;
        }
        .stat-row .val.val-date {
          font-size: 0.75rem;
          color: #cbd5e1;
        }
        .progress-bar-container {
          background-color: #1e293b;
          border-radius: 9999px;
          height: 6px;
          width: 100%;
          overflow: hidden;
          margin-top: -0.25rem;
          margin-bottom: 0.25rem;
        }
        .progress-bar {
          background-color: #10b981;
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }
        .details-layout {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .details-col {
          display: flex;
          flex-direction: column;
          min-width: 320px;
        }
        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .font-mono {
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.75rem;
          background-color: #1f2937;
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
        }
        .model-grid, .recruiter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .stat-box {
          background-color: #1f2937;
          border: 1px solid #374151;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .stat-box .box-val {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f8fafc;
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .stat-box .box-val.red-text { color: #ef4444; }
        .stat-box .box-val.orange-text { color: #f59e0b; }
        .stat-box .box-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .table-responsive {
          overflow-x: auto;
          margin-top: 0.5rem;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.875rem;
        }
        .table th, .table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #1e293b;
        }
        .table th {
          color: #94a3b8;
          font-weight: 600;
        }
        .table tr:hover td {
          background-color: rgba(255, 255, 255, 0.02);
        }
        .query-text {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #cbd5e1;
        }
        .route-label {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .route-label.openrouter {
          background-color: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        .route-label.smart-route {
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        .route-label.recruiter-insight {
          background-color: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }
        .route-label.narrative-engine {
          background-color: rgba(236, 72, 153, 0.15);
          color: #ec4899;
        }
        .route-label.copilot-engine {
          background-color: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .cache-badge {
          font-size: 0.75rem;
          font-weight: 700;
        }
        .cache-badge.hit { color: #10b981; }
        .cache-badge.miss { color: #64748b; }
        .section-subheading {
          font-size: 0.875rem;
          font-weight: 700;
          color: #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .event-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .event-item {
          background-color: #1e293b;
          border-radius: 6px;
          padding: 0.75rem;
          border-left: 3px solid #3b82f6;
        }
        .event-time {
          font-size: 0.75rem;
          color: #94a3b8;
          display: block;
          margin-bottom: 0.25rem;
        }
        .event-desc {
          font-size: 0.8125rem;
          margin: 0;
          color: #e2e8f0;
        }
        .resolved-flag {
          background-color: #8b5cf6;
          color: #ffffff;
          font-size: 0.625rem;
          padding: 0.0625rem 0.25rem;
          border-radius: 3px;
          margin-left: 0.5rem;
          font-weight: 600;
        }
        .no-events {
          color: #64748b;
          font-size: 0.875rem;
          text-align: center;
          padding: 1rem;
        }
        .small-text-query {
          font-size: 0.75rem;
          color: #cbd5e1;
          word-break: break-all;
        }
        .small-text {
          font-size: 0.75rem;
          color: #64748b;
        }
        .bullet-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .bullet-list li {
          font-size: 0.8125rem;
          color: #cbd5e1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .badge-count {
          background-color: #374151;
          color: #94a3b8;
          font-size: 0.75rem;
          padding: 0.0625rem 0.375rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
