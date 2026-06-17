import React from 'react';
import { notFound } from 'next/navigation';
import { getRepositoryByName } from '@/lib/github/github';
import { getReadmeContent } from '@/lib/github/readme';
import GithubRepoDetail from '@/components/GithubRepoDetail';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';

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

  // Fetch the knowledge graph and locate related nodes
  const graph = await buildKnowledgeGraph();
  const repoId = `repository:${repo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
  const neighbors = graph.getNeighbors(repoId, 'both');

  const relatedProjects = Array.from(new Set(
    neighbors
      .filter(item => item.node.type === 'Project')
      .map(item => item.node.label)
  ));

  const techKeywords = [
    'spring boot', 'fastapi', 'django', 'hibernate', 'react', 'next.js', 'leaflet', 'kafka', 'rabbitmq', 'grpc', 'docker', 'spring security', 'websockets', 'pinecone', 'timescaledb', 'elasticsearch', 'redis', 'mysql', 'postgresql', 'novadb', 'mongodb', 'sqlite'
  ];

  const relatedSkills: string[] = [];
  const relatedTechnologies: string[] = [];

  neighbors
    .filter(item => item.node.type === 'Skill')
    .forEach(item => {
      const labelLower = item.node.label.toLowerCase();
      const isTech = techKeywords.includes(labelLower) || item.node.properties.category === 'Tools';
      if (isTech) {
        if (!relatedTechnologies.includes(item.node.label)) {
          relatedTechnologies.push(item.node.label);
        }
      } else {
        if (!relatedSkills.includes(item.node.label)) {
          relatedSkills.push(item.node.label);
        }
      }
    });

  return (
    <GithubRepoDetail 
      repo={repo} 
      readme={readme} 
      relatedProjects={relatedProjects}
      relatedSkills={relatedSkills}
      relatedTechnologies={relatedTechnologies}
    />
  );
}
