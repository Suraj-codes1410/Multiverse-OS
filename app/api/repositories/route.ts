import { NextResponse } from 'next/server';
import { getRepositories } from '@/lib/github/github';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const repos = await getRepositories();
    return NextResponse.json(repos);
  } catch (error) {
    console.error('API Error in /api/repositories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
