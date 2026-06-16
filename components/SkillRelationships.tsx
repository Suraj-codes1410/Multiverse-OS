import React from 'react';
import Link from 'next/link';
import { Skill } from '@/lib/types';
import { Cpu, Briefcase, Globe } from 'lucide-react';

interface SkillRelationshipsProps {
  skill: Skill;
  projectMap: Record<string, string>;
}

export default function SkillRelationships({ skill, projectMap }: SkillRelationshipsProps) {
  const hasRelationships = 
    skill.relatedDomain || 
    (skill.relatedTechnologies && skill.relatedTechnologies.length > 0) ||
    (skill.relatedProjects && skill.relatedProjects.length > 0);

  if (!hasRelationships) return null;

  return (
    <div className="pt-3 border-t border-border-subtle/40 mt-3 font-mono text-[10px] space-y-2.5">
      {/* Domain Relation */}
      {skill.relatedDomain && (
        <div>
          <span className="text-text-secondary/50 uppercase tracking-wider block mb-1 flex items-center gap-1.5 select-none">
            <Globe className="w-3 h-3 text-accent-cyan" /> Related Domain
          </span>
          <span className="text-text-primary pl-4.5 font-medium">{skill.relatedDomain}</span>
        </div>
      )}

      {/* Tech Relation */}
      {skill.relatedTechnologies && skill.relatedTechnologies.length > 0 && (
        <div>
          <span className="text-text-secondary/50 uppercase tracking-wider block mb-1 flex items-center gap-1.5 select-none">
            <Cpu className="w-3 h-3 text-accent-purple" /> Related Tech
          </span>
          <span className="text-text-primary pl-4.5 font-medium">
            {skill.relatedTechnologies.join(', ')}
          </span>
        </div>
      )}

      {/* Project Relation */}
      {skill.relatedProjects && skill.relatedProjects.length > 0 && (
        <div>
          <span className="text-text-secondary/50 uppercase tracking-wider block mb-1 flex items-center gap-1.5 select-none">
            <Briefcase className="w-3 h-3 text-success-green" /> Related Projects
          </span>
          <div className="pl-4.5 flex flex-wrap gap-x-2 gap-y-1">
            {skill.relatedProjects.map((projId) => {
              const projectTitle = projectMap[projId.toLowerCase()];
              if (!projectTitle) return null;
              return (
                <Link
                  key={projId}
                  href={`/project/${projId}`}
                  className="text-accent-cyan hover:text-text-primary transition-colors hover:underline focus:outline-none"
                >
                  {projectTitle}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Architecture Helper for Future D3 Visual Constellation
export interface GraphNode {
  id: string;
  label: string;
  type: 'skill' | 'tech' | 'project' | 'domain';
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export function getSkillGraphData(skill: Skill): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [{ id: skill.name, label: skill.name, type: 'skill' }];
  const links: GraphLink[] = [];

  if (skill.relatedDomain) {
    nodes.push({ id: skill.relatedDomain, label: skill.relatedDomain, type: 'domain' });
    links.push({ source: skill.name, target: skill.relatedDomain, relationship: 'domain' });
  }

  if (skill.relatedTechnologies) {
    skill.relatedTechnologies.forEach(tech => {
      nodes.push({ id: tech, label: tech, type: 'tech' });
      links.push({ source: skill.name, target: tech, relationship: 'technology' });
    });
  }

  if (skill.relatedProjects) {
    skill.relatedProjects.forEach(proj => {
      nodes.push({ id: proj, label: proj, type: 'project' });
      links.push({ source: skill.name, target: proj, relationship: 'project' });
    });
  }

  return { nodes, links };
}
