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
    title: `${project.title} — Suraj Samanta`,
    description: project.description,
    alternates: {
      canonical: `/project/${id}`,
    },
    openGraph: {
      title: `${project.title} | Suraj Samanta`,
      description: project.description,
      url: `https://surajdev.indevs.in/project/${id}`,
      type: 'article',
    },
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
