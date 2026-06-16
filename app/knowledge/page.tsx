import React from 'react';
import { buildKnowledgeGraph } from '@/lib/knowledge/builder';
import KnowledgeExplorerClient from '@/components/KnowledgeExplorerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio Knowledge Graph Explorer | Suraj Samanta',
  description: 'Explore semantic connections across projects, technologies, academic credentials, and professional achievements in a unified graph dashboard.',
};

// Revalidate once per hour to sync with GitHub API updates
export const revalidate = 3600;

export default async function KnowledgeExplorerPage() {
  // Build graph on server side during build or revalidation
  const graph = await buildKnowledgeGraph();
  
  // Serialize Map and relationships array for safe transport to client component
  const initialNodes = graph.getNodes();
  const initialRelationships = graph.getRelationships();

  return (
    <KnowledgeExplorerClient 
      initialNodes={initialNodes}
      initialRelationships={initialRelationships}
    />
  );
}
