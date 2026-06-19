import { NextResponse } from 'next/server';
import { queryCacheService } from '@/lib/oracle/queryCache';
import { conversationalMemoryService } from '@/lib/oracle/memory';

export async function POST() {
  console.log("CACHE_CLEAR");
  try {
    const cacheManager = (queryCacheService as any).cacheManager;
    if (cacheManager && typeof cacheManager.clear === 'function') {
      cacheManager.clear();
    }
    
    const sessions = (conversationalMemoryService as any).sessions;
    if (sessions && typeof sessions.clear === 'function') {
      sessions.clear();
    }

    return NextResponse.json({ success: true, message: 'Cache and conversational memory cleared successfully.' });
  } catch (error: any) {
    console.error('Failed to clear cache:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}
