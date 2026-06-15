'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { GithubIcon } from './Icons';
import Card from './Card';
import Badge from './Badge';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card hoverable glowOnHover className="flex flex-col h-full justify-between">
      <div>
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent-purple">
            {project.subtitle}
          </span>
          {project.featured && (
            <Badge color="cyan" variant="solid" className="text-[9px]">
              FEATURED
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-cyan transition-colors mb-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-3 mb-6">
          {project.description}
        </p>

        {/* Tech Stack Badges */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.techStack.map((tech) => (
            <Badge key={tech} color="default" variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50 mt-auto">
        <Link
          href={`/project/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-accent-cyan hover:text-text-primary transition-colors focus:outline-none"
        >
          LEARN_MORE <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            aria-label={`${project.title} GitHub repository`}
          >
            <GithubIcon className="w-4 h-4" />
          </a>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              aria-label={`${project.title} live demo`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
