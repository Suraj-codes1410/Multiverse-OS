'use client';

import React, { useState } from 'react';
import { ShieldAlert, FileText, CheckCircle2, Copy, Mail, Star, Flame, Trophy, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { GithubIcon, LinkedinIcon } from '@/components/Icons';
import { Portfolio, Project, Skill, Experience, Achievement } from '@/lib/types';

interface RecruiterDashboardProps {
  portfolio: Portfolio;
  featuredProjects: Project[];
  skills: Skill[];
  experience: Experience[];
  achievements: Achievement[];
}

export default function RecruiterDashboard({
  portfolio,
  featuredProjects,
  skills,
  experience,
  achievements
}: RecruiterDashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(portfolio.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Group skills by category for summary list
  const skillCategories = ['Backend', 'AI / ML', 'Database', 'Cloud'];
  const getSkillsByCategory = (category: string) => {
    return skills.filter(s => s.category === category).slice(0, 4);
  };

  return (
    <div className="flex-grow py-8 font-sans text-sm">
      <Container>
        {/* Recruiter Header */}
        <div className="border border-accent-cyan/20 bg-accent-cyan/5 p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent-cyan/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-accent-cyan animate-pulse" />
                <h1 className="text-lg font-mono font-bold tracking-widest text-accent-cyan uppercase">
                  RECRUITER_FAST_ACCESS_PANEL
                </h1>
              </div>
              <p className="text-xl md:text-2xl font-bold text-text-primary mb-1">
                {portfolio.name} Candidate Summary
              </p>
              <p className="text-xs text-text-secondary/80 font-mono">
                ESTIMATED_READING_TIME: <span className="text-accent-cyan font-bold">90 SECONDS</span> • FOCUS: BACKEND SYSTEMS & AI ENGINE
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Button href={portfolio.resume} target="_blank" rel="noopener noreferrer" variant="primary" size="md">
                <FileText className="w-4 h-4 mr-2" /> Download Resume (PDF)
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Candidate Snapshot */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Star className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                  CANDIDATE_SNAPSHOT
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono mb-4">
                <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                  <span className="text-text-secondary block mb-0.5">TARGET_ROLE:</span>
                  <span className="text-text-primary font-bold">{portfolio.title}</span>
                </div>
                <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                  <span className="text-text-secondary block mb-0.5">GEOGRAPHIC_LOCATION:</span>
                  <span className="text-accent-purple font-bold">{portfolio.location}</span>
                </div>
                <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                  <span className="text-text-secondary block mb-0.5">AVAILABILITY:</span>
                  <span className="text-success-green font-bold">IMMEDIATE / ACTIVE SEEKING</span>
                </div>
                <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                  <span className="text-text-secondary block mb-0.5">ACADEMIC_TIMELINE:</span>
                  <span className="text-text-primary font-bold">
                    {portfolio.education.currentYear} Student (Graduation {portfolio.education.expectedGraduation})
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed bg-bg-panel/50 p-4 border border-border-subtle rounded-lg">
                <strong className="text-text-primary">Executive Summary:</strong> {portfolio.bio}
              </p>
            </Card>

            {/* Achievements Section */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Trophy className="w-4 h-4 text-warning-amber" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                  KEY_ACHIEVEMENTS_AND_HACKATHONS
                </h2>
              </div>
              
              <div className="space-y-4">
                {achievements.map((ach, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-bg-primary border border-border-subtle font-mono text-accent-cyan font-bold text-xs min-w-[70px] text-center">
                      {ach.year}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-text-primary">{ach.title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Featured Projects Preview */}
            <Card hoverable={false}>
              <div className="flex items-center justify-between gap-4 mb-6 border-b border-border-subtle/40 pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-accent-purple" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                    FEATURED_DOCKETS
                  </h2>
                </div>
                <Link href="/projects" className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-1">
                  VIEW_ALL <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project) => (
                  <div key={project.id} className="border border-border-subtle bg-bg-primary/20 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-accent-purple uppercase tracking-wider">{project.subtitle}</span>
                        <Badge color="cyan" variant="solid" className="text-[8px]">FEATURED</Badge>
                      </div>
                      <h4 className="text-base font-bold text-text-primary mb-1.5">{project.title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40 mt-auto">
                      <Link href={`/project/${project.id}`} className="text-xs font-mono text-accent-cyan hover:underline">
                        READ_DOSSIER →
                      </Link>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary">
                        <GithubIcon className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Sidebar Area (1 Col) */}
          <div className="space-y-6">
            
            {/* Quick Contact Box */}
            <Card hoverable={false} className="border-accent-cyan/20">
              <h3 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-4 border-b border-border-subtle/40 pb-2">
                Immediate Contact
              </h3>
              
              <div className="space-y-3">
                {/* One Click Copy Email */}
                <button
                  onClick={handleCopyEmail}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-all text-xs font-mono text-left focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> COPY_EMAIL
                  </span>
                  {copied ? (
                    <span className="text-success-green flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> COPIED
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* LinkedIn Link */}
                <a
                  href={portfolio.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-all text-xs font-mono"
                >
                  <span className="flex items-center gap-2">
                    <LinkedinIcon className="w-4 h-4" /> LINKEDIN
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* GitHub Link */}
                <a
                  href={portfolio.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-all text-xs font-mono"
                >
                  <span className="flex items-center gap-2">
                    <GithubIcon className="w-4 h-4" /> GITHUB
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>

            {/* Education Profile Card */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-4 border-b border-border-subtle/40 pb-2">
                Education Profile
              </h3>
              <div className="space-y-2 text-xs">
                <h4 className="text-xs font-bold text-text-primary leading-snug">
                  {portfolio.education.degree}
                </h4>
                <div className="font-mono text-[10px] text-text-secondary">
                  {portfolio.education.institution} ({portfolio.education.location})
                </div>
                <div className="flex justify-between font-mono text-[10px] text-accent-cyan mt-2 pt-2 border-t border-border-subtle/30">
                  <span>CGPA INDEX:</span>
                  <span className="font-bold">{portfolio.education.cgpa}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-text-secondary">
                  <span>GRADUATION_YEAR:</span>
                  <span>{portfolio.education.expectedGraduation}</span>
                </div>
              </div>
            </Card>

            {/* Structured Skills List */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary mb-4 border-b border-border-subtle/40 pb-2">
                Primary Stack
              </h3>
              
              <div className="space-y-3.5 text-xs">
                {skillCategories.map(cat => {
                  const catSkills = getSkillsByCategory(cat);
                  if (catSkills.length === 0) return null;
                  return (
                    <div key={cat}>
                      <span className="font-mono text-text-secondary block mb-1 uppercase text-[10px]">{cat}:</span>
                      <div className="flex flex-wrap gap-1">
                        {catSkills.map(s => (
                          <Badge key={s.name} color="cyan" variant="outline" className="text-[9px]">
                            {s.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

        </div>
      </Container>
    </div>
  );
}
