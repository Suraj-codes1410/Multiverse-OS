import { NextResponse } from 'next/server';
import { getSyncDiagnostics, RepositoryRefreshManager } from '@/lib/github/syncService';

export async function GET() {
  const diagnostics = getSyncDiagnostics();
  return NextResponse.json(diagnostics);
}

export async function POST() {
  const manager = RepositoryRefreshManager.getInstance();
  
  if (process.env.VERCEL === '1') {
    console.log('VERCEL_COMPATIBLE: Serverless environment detected. Awaiting sync execution synchronously.');
    await manager.triggerSync();
    return NextResponse.json({
      message: 'Sync completed successfully.',
      status: 'Completed'
    });
  }
  
  // Non-blocking trigger to background sync
  manager.triggerSync().catch(err => console.error('Manual sync failed:', err));
  
  return NextResponse.json({
    message: 'Manual sync triggered successfully. Processing in background.',
    status: 'Syncing'
  });
}

