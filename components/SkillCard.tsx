import React from 'react';
import Card from './Card';
import Badge from './Badge';
import { Skill } from '@/lib/types';
import SkillRelationships from './SkillRelationships';

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

      <div className="mt-auto">
        <SkillRelationships skill={skill} projectMap={projectMap} />
      </div>
    </Card>
  );
}
