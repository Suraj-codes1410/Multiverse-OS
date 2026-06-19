import { NextResponse } from 'next/server';
import { queryCacheService } from '@/lib/oracle/queryCache';
import { conversationalMemoryService } from '@/lib/oracle/memory';
import { RepositoryRefreshManager } from '@/lib/github/syncService';
import { analyticsService } from '@/lib/oracle/analyticsService';
import { contextService } from '@/lib/oracle/service';
import { OpenRouterProvider } from '@/lib/oracle/openRouterProvider';
import { SmartRouter } from '@/lib/oracle/smartRouter';

export async function GET() {
  console.log("HEALTH_CHECK");
  try {
    const cacheOk = !!queryCacheService;
    const memoryOk = !!conversationalMemoryService;
    const syncOk = !!RepositoryRefreshManager.getInstance();
    
    let analyticsOk = false;
    try {
      await analyticsService.getDashboardMetrics();
      analyticsOk = true;
    } catch (e) {}

    let oracleOk = false;
    try {
      const context = await contextService.getContext();
      oracleOk = !!context;
    } catch (e) {}

    const openrouterOk = !!process.env.OPENROUTER_API_KEY && !!(new OpenRouterProvider());
    const smartRouterOk = !!SmartRouter;

    const healthy = cacheOk && memoryOk && syncOk && analyticsOk && oracleOk && openrouterOk && smartRouterOk;

    return NextResponse.json({
      status: healthy ? 'healthy' : 'unhealthy',
      services: {
        oracle: oracleOk,
        analytics: analyticsOk,
        cache: cacheOk,
        githubSync: syncOk,
        memory: memoryOk,
        openrouter: openrouterOk,
        smartRouter: smartRouterOk
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: 'unhealthy',
      services: {
        oracle: false,
        analytics: false,
        cache: false,
        githubSync: false,
        memory: false,
        openrouter: false,
        smartRouter: false
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
