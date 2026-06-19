import { NextResponse } from 'next/server';
import { queryCacheService } from '@/lib/oracle/queryCache';
import { conversationalMemoryService } from '@/lib/oracle/memory';
import { RepositoryRefreshManager } from '@/lib/github/syncService';
import { analyticsService } from '@/lib/oracle/analyticsService';
import { contextService } from '@/lib/oracle/service';

export async function GET() {
  console.log("HEALTH_CHECK");
  try {
    const cacheOk = !!queryCacheService;
    const memoryOk = !!conversationalMemoryService;
    const syncOk = !!RepositoryRefreshManager.getInstance();
    const analyticsOk = !!analyticsService.getDashboardMetrics();
    const context = await contextService.getContext();
    const oracleOk = !!context;

    const healthy = cacheOk && memoryOk && syncOk && analyticsOk && oracleOk;

    return NextResponse.json({
      status: healthy ? 'healthy' : 'unhealthy',
      analytics: analyticsOk,
      cache: cacheOk,
      githubSync: syncOk,
      memory: memoryOk,
      oracle: oracleOk
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: 'unhealthy',
      analytics: false,
      cache: false,
      githubSync: false,
      memory: false,
      oracle: false
    }, { status: 500 });
  }
}
