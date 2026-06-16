import React from 'react';
import { notFound } from 'next/navigation';
import { getProjectById } from '@/lib/data';
import MissionBriefing from '@/components/MissionBriefing';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return { title: 'Project Not Found' };
  
  return {
    title: `Mission Briefing: ${project.title} | Suraj Samanta`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  // All projects are now migrated to the Mission Briefing framework
  return <MissionBriefing project={project} />;
}
