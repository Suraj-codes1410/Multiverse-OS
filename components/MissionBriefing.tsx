import React from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Compass, 
  BarChart, 
  ExternalLink, 
  ArrowLeft, 
  Activity, 
  Lock, 
  Layers,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { Project } from '@/lib/types';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface MissionBriefingProps {
  project: Project;
}

export default function MissionBriefing({ project }: MissionBriefingProps) {
  // Normalize status styling
  const statusColor = 
    project.status.toLowerCase() === 'completed' || project.status.toLowerCase() === 'synced'
      ? 'green' 
      : 'amber';

  return (
    <div className="flex-grow py-8 font-mono text-xs sm:text-sm text-text-secondary">
      <Container>
        {/* Navigation Return */}
        <div className="mb-6 select-none">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs text-text-secondary hover:text-accent-cyan transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> RETURN_TO_SYSTEM_REPOSITORY
          </Link>
        </div>

        {/* Technical Docket Header */}
        <div className="border border-border-subtle bg-bg-panel/40 p-6 md:p-8 rounded-xl mb-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 select-none">
                <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                <span className="text-[10px] tracking-widest text-accent-cyan uppercase">
                  {`CLASSIFIED_MISSION_BRIEFING // ID: ${project.id.toUpperCase()} // STATUS: ${project.status.toUpperCase()}`}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase text-text-primary tracking-tight mb-1">
                {project.title}
              </h1>
              <p className="text-xs text-accent-purple uppercase tracking-wider font-semibold">
                {project.subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-3 select-none">
              {project.githubUrl && (
                <Button href={project.githubUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                  <GithubIcon className="w-4 h-4 mr-2" /> CODE_REPOSITORY
                </Button>
              )}
              {project.liveUrl && (
                <Button href={project.liveUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" /> LIVE_DEPLOYMENT
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Operations Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Briefing Dossier Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 01: Mission Objective & Problem Statement */}
            <Card hoverable={false} className="border-border-subtle bg-bg-panel/30">
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2 select-none">
                <Terminal className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  01_MISSION_OBJECTIVE_AND_CONTEXT
                </h2>
              </div>
              <div className="space-y-4 font-sans text-sm">
                <div>
                  <h3 className="text-xs font-mono text-accent-cyan uppercase mb-1.5 select-none">&gt; Mission Objective</h3>
                  <p className="text-text-secondary leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono text-accent-purple uppercase mb-1.5 select-none">&gt; Problem Statement</h3>
                  <p className="text-text-secondary leading-relaxed border-l border-accent-purple/40 pl-3 italic font-light">
                    {project.problem}
                  </p>
                </div>
              </div>
            </Card>

            {/* Section 02: Engineered Solution & Architecture Design */}
            <Card hoverable={false} className="border-border-subtle bg-bg-panel/30">
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2 select-none">
                <Cpu className="w-4 h-4 text-success-green" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  02_ENGINEERED_SYSTEM_AND_ARCHITECTURE
                </h2>
              </div>
              <div className="space-y-4 font-sans text-sm">
                <div>
                  <h3 className="text-xs font-mono text-success-green uppercase mb-1.5 select-none">&gt; Implemented Solution</h3>
                  <p className="text-text-secondary leading-relaxed font-light">
                    {project.solution}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-mono text-text-primary/70 uppercase mb-1.5 font-bold select-none">&gt; Architectural Design Schematic</h3>
                  <p className="text-text-secondary leading-relaxed bg-bg-primary/40 p-4 border border-border-subtle rounded font-mono text-xs whitespace-pre-line leading-loose">
                    {project.architecture}
                  </p>
                </div>
              </div>
            </Card>

            {/* Section 03: Operational Hurdles & Challenges */}
            <Card hoverable={false} className="border-border-subtle bg-bg-panel/30">
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2 select-none">
                <Compass className="w-4 h-4 text-warning-amber" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  03_OPERATIONAL_CHALLENGES_LOGGED
                </h2>
              </div>
              <div className="font-sans text-sm leading-relaxed">
                {project.challenges && project.challenges.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-text-secondary">
                    {project.challenges.map((challenge, idx) => (
                      <li key={idx} className="font-light">{challenge}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-text-secondary italic font-mono text-xs select-none">No anomalies or operational blockages registered.</p>
                )}
              </div>
            </Card>

            {/* Section 04: Performance Metrics & Post-Mortem */}
            <Card hoverable={false} className="border-border-subtle bg-bg-panel/30">
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/50 pb-2 select-none">
                <BarChart className="w-4 h-4 text-accent-purple" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  04_METRICS_AND_DEBRIEFING_ANALYTICS
                </h2>
              </div>
              <div className="space-y-4 font-sans text-sm">
                <div>
                  <h3 className="text-xs font-mono text-success-green uppercase mb-1.5 select-none">&gt; Mission Results</h3>
                  {project.results && project.results.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
                      {project.results.map((result, idx) => (
                        <li key={idx} className="font-light">{result}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-text-secondary italic font-mono text-xs select-none">No metrics available.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-mono text-accent-cyan uppercase mb-1.5 select-none">&gt; Engineering Lessons Learned</h3>
                  {project.lessons && project.lessons.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1.5 text-text-secondary border-t border-border-subtle/30 pt-3 mt-3">
                      {project.lessons.map((lesson, idx) => (
                        <li key={idx} className="font-light">{lesson}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-text-secondary italic font-mono text-xs select-none">No post-mortem analysis records found.</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Section 05: Linked GitHub Repository Information */}
            {project.githubRepository && (
              <Card hoverable={false} className="border-border-subtle bg-bg-panel/30">
                <div className="flex items-center justify-between mb-4 border-b border-border-subtle/50 pb-2 select-none">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-accent-cyan" />
                    <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                      05_LINKED_GITHUB_REPOSITORY_DOSSIER
                    </h2>
                  </div>
                  <Link href={`/github/${project.githubRepository.name}`} className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-0.5">
                    VIEW_FULL_EXPLORER_FILE →
                  </Link>
                </div>

                <div className="space-y-6">
                  {/* Repo Overview stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                      <span className="text-text-secondary block mb-0.5">REPO_NAME:</span>
                      <a href={project.githubRepository.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-accent-cyan font-bold hover:underline flex items-center gap-1">
                        {project.githubRepository.name} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                      <span className="text-text-secondary block mb-0.5">STARS / FORKS:</span>
                      <span className="text-text-primary font-bold">{project.githubRepository.starsCount} ★ / {project.githubRepository.forksCount} ⑂</span>
                    </div>
                    <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                      <span className="text-text-secondary block mb-0.5">ACTIVITY_LEVEL:</span>
                      <span className="text-success-green font-bold uppercase">{project.intelligence?.activityLevel || 'STABLE'}</span>
                    </div>
                  </div>

                  {/* Repository Intelligence */}
                  {project.intelligence && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Concepts */}
                      <div className="bg-bg-primary/25 border border-border-subtle/60 p-4 rounded-lg text-xs leading-normal">
                        <span className="text-accent-cyan font-mono text-[10px] block uppercase mb-2 font-bold">&gt; Core Concepts</span>
                        <ul className="space-y-1">
                          {project.intelligence.keyConcepts.map((concept, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-text-secondary">
                              <Sparkles className="w-3 h-3 text-accent-cyan flex-shrink-0" /> {concept}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Complexity */}
                      <div className="bg-bg-primary/25 border border-border-subtle/60 p-4 rounded-lg text-xs leading-normal">
                        <span className="text-accent-purple font-mono text-[10px] block uppercase mb-2 font-bold">&gt; Complexity Indicators</span>
                        <ul className="space-y-1">
                          {project.intelligence.complexityIndicators.map((indicator, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-text-secondary">
                              <Activity className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" /> {indicator}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* README Expose (Scrollable box) */}
                  {project.readme && (
                    <div>
                      <h3 className="text-xs font-mono text-text-secondary uppercase mb-2 select-none">&gt; Live README.md Documentation</h3>
                      <div className="p-4 bg-bg-primary/30 border border-border-subtle rounded-lg max-h-[300px] overflow-y-auto select-text">
                        <MarkdownRenderer content={project.readme} />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

          </div>

          {/* Sidebar Operations Panels & Extension Points */}
          <div className="space-y-6 select-none">
            
            {/* Dossier Metadata Panel */}
            <Card hoverable={false} className="border-border-subtle bg-bg-panel/20 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent-cyan mb-4 border-b border-border-subtle/40 pb-2">
                MISSION_METADATA
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">OPERATIONAL_STATUS:</span>
                  <Badge color={statusColor} variant="outline" className="text-[10px]">
                    {project.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">SYSTEM_ID:</span>
                  <span className="text-text-primary font-bold">{project.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">CHRONO_YEAR:</span>
                  <span className="text-text-primary font-bold">{project.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">SECURITY_CLEARANCE:</span>
                  <span className="text-accent-purple font-semibold">RECRUITER_LEVEL_1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">HOST_DOCKET:</span>
                  <span className="text-text-primary">PORTFOLIO_SYSTEM_OS</span>
                </div>
              </div>
            </Card>

            {/* Core Technology Inventory */}
            <Card hoverable={false} className="border-border-subtle bg-bg-panel/20 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent-purple mb-4 border-b border-border-subtle/40 pb-2">
                TECHNOLOGY_INVENTORY
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} color="purple" variant="outline" className="text-[10px]">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* ==========================================
                EXTENSION POINTS FOR FUTURE DEVELOPMENT
                ========================================== */}

            {/* Extension Point: ORACLE Telemetry Integration */}
            <Card hoverable={false} className="border-dashed border-border-subtle bg-[#0a0d16]/30 p-5 opacity-60">
              <div className="flex items-center gap-2 mb-2 text-text-secondary/50">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  [EXTENSION: ORACLE_TELEMETRY]
                </span>
              </div>
              <p className="text-[10px] text-text-secondary/70 leading-relaxed font-sans font-light">
                Secure integration path for ORACLE system analytics. Connects real-time compiler telemetry and AI metrics evaluation on this build.
              </p>
            </Card>

            {/* Extension Point: Timeline Chrono Integration */}
            <Card hoverable={false} className="border-dashed border-border-subtle bg-[#0a0d16]/30 p-5 opacity-60">
              <div className="flex items-center gap-2 mb-2 text-text-secondary/50">
                <Activity className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  [EXTENSION: CHRONO_LOG]
                </span>
              </div>
              <p className="text-[10px] text-text-secondary/70 leading-relaxed font-sans font-light">
                Milestone tracking datastream for operational deployments. Maps historical project milestones, commit frequency, and release paths.
              </p>
            </Card>

            {/* Extension Point: Recruiter Operations Analysis */}
            <Card hoverable={false} className="border-dashed border-border-subtle bg-[#0a0d16]/30 p-5 opacity-60">
              <div className="flex items-center gap-2 mb-2 text-text-secondary/50">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  [EXTENSION: RECRUITER_ANALYSIS]
                </span>
              </div>
              <p className="text-[10px] text-text-secondary/70 leading-relaxed font-sans font-light">
                Candidate alignment report panel. Matches project challenges and achievements against targeted job skills matrices.
              </p>
            </Card>

          </div>

        </div>
      </Container>
    </div>
  );
}
