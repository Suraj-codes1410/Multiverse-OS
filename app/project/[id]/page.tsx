import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, ShieldCheck, Cpu, Terminal, Compass, BarChart } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { getProjectById } from '@/lib/data';
import MissionBriefing from '@/components/MissionBriefing';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) return { title: 'Project Not Found' };
  
  return {
    title: `Mission Briefing: ${project.title} | Suraj Samanta`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  // Phase 3.2: Only migrate ORBITAIR to the new Mission Briefing format.
  if (id.toLowerCase() === 'orbitair') {
    return <MissionBriefing project={project} />;
  }

  // Other projects render using the original detail page format
  const statusColor = 
    project.status.toLowerCase() === 'completed' || project.status.toLowerCase() === 'synced'
      ? 'green'
      : 'amber';

  return (
    <div className="flex-grow py-8 font-sans">
      <Container>
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-accent-cyan transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> RETURN_TO_REPOSITORY
          </Link>
        </div>

        {/* Mission Briefing Header */}
        <div className="border border-border-subtle bg-bg-panel/20 p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                <span className="text-[10px] font-mono tracking-widest text-accent-cyan uppercase">
                  {`CLASSIFIED_MISSION_BRIEFING // ID: ${project.id.toUpperCase()} // SOURCE: ${project.source.toUpperCase()}`}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold uppercase text-text-primary mb-1">
                {project.title}
              </h1>
              <p className="text-sm font-mono text-accent-purple tracking-wide">
                {project.subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {project.githubUrl && (
                <Button href={project.githubUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                  <GithubIcon className="w-4 h-4 mr-2" /> Code Base
                </Button>
              )}
              {project.liveUrl && (
                <Button href={project.liveUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" /> Live System
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Briefing Dossier */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview & Problem */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Terminal className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-sm font-mono uppercase tracking-wider text-text-primary">
                  01_MISSION_OBJECTIVE_AND_PROBLEM
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-accent-cyan uppercase mb-1.5">Overview</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono text-accent-purple uppercase mb-1.5">Problem Statement</h3>
                  <p className="text-sm text-text-secondary leading-relaxed border-l-2 border-accent-purple/30 pl-3 italic">
                    {project.problem}
                  </p>
                </div>
              </div>
            </Card>

            {/* Solution & Architecture */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Cpu className="w-4 h-4 text-success-green" />
                <h2 className="text-sm font-mono uppercase tracking-wider text-text-primary">
                  02_SYSTEM_INTEGRATION_AND_ARCHITECTURE
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-success-green uppercase mb-1.5">Engineered Solution</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {project.solution}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono text-text-primary/70 uppercase mb-1.5 font-bold">Architecture Design</h3>
                  <p className="text-sm text-text-secondary leading-relaxed bg-bg-primary/50 p-4 border border-border-subtle rounded-lg font-mono text-xs whitespace-pre-line">
                    {project.architecture}
                  </p>
                </div>
              </div>
            </Card>

            {/* Operational Challenges */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Compass className="w-4 h-4 text-warning-amber" />
                <h2 className="text-sm font-mono uppercase tracking-wider text-text-primary">
                  03_OPERATIONAL_CHALLENGES
                </h2>
              </div>
              {project.challenges && project.challenges.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2 text-sm text-text-secondary">
                  {project.challenges.map((challenge, idx) => (
                    <li key={idx} className="leading-relaxed">{challenge}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary italic">No critical challenges logged.</p>
              )}
            </Card>

            {/* Metrics & Post-Mortem */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <BarChart className="w-4 h-4 text-accent-purple" />
                <h2 className="text-sm font-mono uppercase tracking-wider text-text-primary">
                  04_METRICS_AND_POST_MORTEM
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-success-green uppercase mb-1.5">Mission Results</h3>
                  {project.results && project.results.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-secondary font-medium text-text-primary">
                      {project.results.map((result, idx) => (
                        <li key={idx} className="leading-relaxed">{result}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-secondary italic">No performance metrics recorded.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-mono text-accent-cyan uppercase mb-1.5">Lessons Learned</h3>
                  {project.lessons && project.lessons.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-text-secondary border-t border-border-subtle/30 pt-3 mt-3">
                      {project.lessons.map((lesson, idx) => (
                        <li key={idx} className="leading-relaxed">{lesson}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-secondary italic">No post-mortem entries compiled.</p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card hoverable={false} className="p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-accent-cyan mb-4 border-b border-border-subtle/40 pb-2">
                Mission Metadata
              </h3>
              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-secondary">SECURITY_STATUS:</span>
                  <Badge color={statusColor} variant="outline" className="text-[10px]">
                    {project.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">SYSTEM_ID:</span>
                  <span className="text-text-primary">{project.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">ROLE:</span>
                  <span className="text-accent-cyan">LEAD_BACKEND_ENGINEER</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">TIMELINE_YEAR:</span>
                  <span className="text-accent-purple">{project.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">ACCESS_CLEARANCE:</span>
                  <span className="text-text-primary">RECRUITER_LEVEL_1</span>
                </div>
              </div>
            </Card>

            {/* Tech Stack Card */}
            <Card hoverable={false} className="p-5">
              <h3 className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-4 border-b border-border-subtle/40 pb-2">
                Core Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} color="cyan" variant="outline" className="text-[10px]">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Dossier Actions */}
            <Card hoverable={false} className="p-5 border-dashed border-border-bright/50">
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary mb-3">
                Need more details?
              </h3>
              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                Contact Suraj directly for system walkthroughs, code architectural reviews, or live demonstrations of running service clusters.
              </p>
              <Button href="/contact" variant="primary" size="sm" className="w-full">
                Contact Candidate
              </Button>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
