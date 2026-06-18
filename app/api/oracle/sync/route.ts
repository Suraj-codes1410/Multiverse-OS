import { NextResponse } from 'next/server';
import { getSyncDiagnostics, RepositoryRefreshManager } from '@/lib/github/syncService';

export async function GET() {
  const diagnostics = getSyncDiagnostics();
  return NextResponse.json(diagnostics);
}

export async function POST() {
  const manager = RepositoryRefreshManager.getInstance();
  
  // Non-blocking trigger to background sync
  manager.triggerSync().catch(err => console.error('Manual sync failed:', err));
  
  return NextResponse.json({
    message: 'Manual sync triggered successfully. Processing in background.',
    status: 'Syncing'
  });
}
