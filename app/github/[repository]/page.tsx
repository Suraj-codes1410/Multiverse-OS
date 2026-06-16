import React from 'react';
import { notFound } from 'next/navigation';
import { getRepositoryByName } from '@/lib/github/github';
import { getReadmeContent } from '@/lib/github/readme';
import GithubRepoDetail from '@/components/GithubRepoDetail';

interface PageProps {
  params: Promise<{ repository: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { repository } = await params;
  const repo = await getRepositoryByName(repository);
  if (!repo) return { title: 'Repository Not Found' };
  
  return {
    title: `Repository: ${repo.name} | Suraj Samanta`,
    description: repo.description || `Technical dossier and metrics for GitHub repository ${repo.name}.`,
  };
}

export default async function RepositoryDetailPage({ params }: PageProps) {
  const { repository } = await params;
  const repo = await getRepositoryByName(repository);

  if (!repo) {
    notFound();
  }

  const readme = await getReadmeContent(repo.name);

  return <GithubRepoDetail repo={repo} readme={readme} />;
}
