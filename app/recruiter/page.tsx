import React from 'react';
import RecruiterDashboard from '@/components/RecruiterDashboard';
import { getPortfolio, getFeaturedProjects, getSkills, getExperience, getAchievements } from '@/lib/data';

export const metadata = {
  title: 'Recruiter Dashboard | Suraj Samanta',
  description: 'Quick scan candidate summary of Suraj Samanta. 90-second overview of achievements, role targets, recent experience, and core skills.',
};

export default async function RecruiterPage() {
  const portfolio = getPortfolio();
  const featuredProjects = await getFeaturedProjects();
  const skills = getSkills();
  const experience = getExperience();
  const achievements = getAchievements();

  return (
    <RecruiterDashboard
      portfolio={portfolio}
      featuredProjects={featuredProjects}
      skills={skills}
      experience={experience}
      achievements={achievements}
    />
  );
}
