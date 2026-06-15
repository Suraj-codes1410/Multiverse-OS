import React from 'react';
import SkillsDashboard from '@/components/SkillsDashboard';
import { getSkills, getProjects } from '@/lib/data';

export const metadata = {
  title: 'Skills | Suraj Samanta',
  description: 'Explore Suraj Samanta\'s technical capabilities across Backend, Frontend, Databases, DevOps, AI, and developer tools.',
};

export default async function SkillsPage() {
  const skills = getSkills();
  const projects = await getProjects();

  // Create a mapping of project ID to project title for synchronous lookups
  const projectMap: Record<string, string> = {};
  projects.forEach((proj) => {
    projectMap[proj.id.toLowerCase()] = proj.title;
  });

  return <SkillsDashboard skills={skills} projectMap={projectMap} />;
}
