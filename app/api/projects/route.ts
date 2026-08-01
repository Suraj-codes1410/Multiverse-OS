import { NextResponse } from 'next/server';
import { getProjects } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('API Error in /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
