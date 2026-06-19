import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/oracle/analyticsService';

export async function GET() {
  try {
    const metrics = analyticsService.getDashboardMetrics();
    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate'
      }
    });
  } catch (error: any) {
    console.error('Error in Analytics API Route:', error);
    return NextResponse.json({
      error: 'ANALYTICS_API_ERROR',
      message: error.message || 'Unknown error occurred.'
    }, { status: 500 });
  }
}
