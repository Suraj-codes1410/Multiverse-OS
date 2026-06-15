import React from 'react';
import Container from '@/components/Container';
import ProjectCard from '@/components/ProjectCard';
import { getProjects } from '@/lib/data';

export const metadata = {
  title: 'Projects Showcase | Suraj Samanta',
  description: 'Explore the portfolio of Suraj Samanta, featuring distributed vector search engines, autonomous AI agent orchestrators, and real-time log ingestion systems.',
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex-grow py-8">
      <Container>
        {/* Page Header */}
        <div className="border-b border-border-subtle pb-6 mb-12">
          <p className="text-xs font-mono text-accent-cyan tracking-widest uppercase mb-2">
            PROJECT_REPOSITORY
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Engineering Projects
          </h1>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 text-text-secondary text-sm font-mono">
            NO_PROJECTS_FOUND
          </div>
        )}
      </Container>
    </div>
  );
}
