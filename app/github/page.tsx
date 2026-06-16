import React from 'react';
import Container from '@/components/Container';
import GithubExplorer from '@/components/GithubExplorer';
import { getRepositories } from '@/lib/github/github';

export const metadata = {
  title: 'GitHub Explorer | Suraj Samanta',
  description: "Browse Suraj Samanta's public GitHub repositories, containing distributed databases, event brokers, and AI-powered systems.",
};

export default async function GithubPage() {
  const repositories = await getRepositories();

  return (
    <div className="flex-grow py-8">
      <Container>
        {/* Page Header */}
        <div className="border-b border-border-subtle pb-6 mb-10 select-none">
          <p className="text-xs font-mono text-accent-cyan tracking-widest uppercase mb-2">
            GITHUB_INTEGRATION_DATAFEED
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            GitHub Explorer
          </h1>
        </div>

        {/* Explorer Client Panel */}
        <GithubExplorer repositories={repositories} />
      </Container>
    </div>
  );
}
