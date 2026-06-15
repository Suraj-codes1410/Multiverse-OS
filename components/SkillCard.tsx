'use client';

import React from 'react';
import Link from 'next/link';
import Card from './Card';
import Badge from './Badge';
import { Skill } from '@/lib/types';

interface SkillCardProps {
  skill: Skill;
  projectMap: Record<string, string>;
}

export default function SkillCard({ skill, projectMap }: SkillCardProps) {
  const getLevelColor = (level: string) => {
    const l = level.toLowerCase();
    if (l === 'advanced' || l === 'expert') return 'cyan';
    if (l === 'proficient') return 'purple';
    if (l === 'intermediate') return 'green';
    return 'default';
  };

  return (
    <Card hoverable={false} className="flex flex-col h-full justify-between p-5">
      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          <h4 className="text-lg font-semibold text-text-primary">
            {skill.name}
          </h4>
          <Badge color={getLevelColor(skill.level)} variant="solid">
            {skill.level}
          </Badge>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {skill.description}
        </p>
      </div>

      {skill.relatedProjects && skill.relatedProjects.length > 0 && (
        <div className="pt-3 border-t border-border-subtle/40 mt-auto">
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider block mb-1.5">
            Related Projects
          </span>
          <div className="flex flex-wrap gap-2">
            {skill.relatedProjects.map((projId) => {
              const projectTitle = projectMap[projId.toLowerCase()];
              if (!projectTitle) return null;
              return (
                <Link
                  key={projId}
                  href={`/project/${projId}`}
                  className="text-xs font-medium text-accent-cyan hover:text-text-primary transition-colors hover:underline focus:outline-none"
                >
                  {projectTitle}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
