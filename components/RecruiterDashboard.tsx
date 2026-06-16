'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Mail, 
  Star, 
  Flame, 
  Trophy, 
  ExternalLink, 
  ArrowRight,
  Cpu,
  Database,
  Server,
  Layers,
  Activity,
  Check,
  Lock,
  Settings,
  AlertTriangle,
  Award,
  GraduationCap
} from 'lucide-react';
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
  allProjects?: Project[];
}

export default function RecruiterDashboard({
  portfolio,
  featuredProjects,
  skills,
  experience,
  achievements,
  allProjects
}: RecruiterDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'backend' | 'distributed' | 'ai'>('backend');
  const [customJd, setCustomJd] = useState('');
  const [showJdResult, setShowJdResult] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(portfolio.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const projects = allProjects || featuredProjects;

  // Calculate Technology Coverage dynamically
  const techCounts: { [key: string]: number } = {};
  projects.forEach(project => {
    project.techStack.forEach(tech => {
      techCounts[tech] = (techCounts[tech] || 0) + 1;
    });
  });

  const sortedTech = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / projects.length) * 100),
    }));

  const roleRequirements = {
    backend: {
      title: 'Backend Developer / Systems Engineer',
      skills: ['Java', 'Spring Boot', 'Python', 'FastAPI', 'Django', 'Spring Security'],
      projects: ['patient-management-service', 'sahai', 'orbitair'],
      description: 'Focuses on building scalable API structures, robust secure filter chains, database ORM configurations, and type-safe systems.'
    },
    distributed: {
      title: 'Distributed Systems & Devops Engineer',
      skills: ['Kafka', 'gRPC', 'Docker', 'WebSockets', 'Redis'],
      projects: ['patient-management-service', 'sahai'],
      description: 'Focuses on asynchronous message brokers, inter-process binary communication protocol layers, and containerized deployments.'
    },
    ai: {
      title: 'AI Integrations & Data Engineer',
      skills: ['Pinecone', 'Spring AI', 'Python', 'FastAPI', 'TimescaleDB'],
      projects: ['sahai', 'orbitair'],
      description: 'Focuses on embedding indexes, Vector DB query tuning, retrieval-augmented generation (RAG) pipelines, and timeseries geospatial forecasting.'
    }
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

        {/* Top Overview Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Candidate Snapshot */}
          <div className="lg:col-span-2">
            <Card hoverable={false} className="h-full">
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
                <div className="bg-bg-primary/40 border border-border-subtle p-3 rounded-lg">
                  <span className="text-text-secondary block mb-0.5">PROFESSIONAL_EXPERIENCE:</span>
                  <span className="text-text-primary font-bold font-mono text-[10px]">
                    {experience && experience.length > 0 
                      ? `${experience.length} records` 
                      : 'Academic Track (B.Tech CSE)'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed bg-bg-panel/50 p-4 border border-border-subtle rounded-lg">
                <strong className="text-text-primary">Executive Summary:</strong> {portfolio.bio}
              </p>
            </Card>
          </div>

          {/* Quick Contact Box */}
          <div>
            <Card hoverable={false} className="border-accent-cyan/20 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                  <Mail className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-accent-cyan">
                    Immediate Contact
                  </h3>
                </div>
                
                <div className="space-y-3">
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
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/30 text-[10px] font-mono text-text-secondary flex items-center justify-between">
                <span>COMMS_STATUS:</span>
                <span className="text-success-green font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-ping" /> ONLINE
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Core Strengths Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
            <Cpu className="w-4 h-4 text-accent-cyan" />
            <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
              CORE_STRENGTHS
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Backend Engineering */}
            <Card hoverable={true} className="border-accent-cyan/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-border-subtle/20 pb-2">
                  <span className="text-[10px] font-mono text-accent-cyan tracking-wider uppercase font-semibold">STRENGTH_01</span>
                  <Badge color="cyan" variant="solid" className="text-[8px] tracking-widest font-bold">CORE_BACKEND</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Server className="w-4.5 h-4.5 text-accent-cyan" /> Backend Engineering
                </h3>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Design and implementation of highly structured, type-safe API architectures, database mappings, and strict role-based route security controls.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-text-secondary block mb-1">KEY_CAPABILITIES:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Java', 'Spring Boot', 'Python', 'FastAPI', 'Django', 'Spring Security', 'Hibernate'].map(tech => {
                        const skill = skills.find(s => s.name === tech);
                        if (!skill) return null;
                        return (
                          <Badge key={tech} color="cyan" variant="outline" className="text-[9px]">
                            {tech}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-text-secondary block mb-1">VERIFIED_APPLICATIONS:</span>
                    <div className="space-y-1">
                      {projects.filter(p => ['patient-management-service', 'sahai', 'orbitair'].includes(p.id)).map(p => (
                        <Link key={p.id} href={`/project/${p.id}`} className="text-xs text-accent-cyan hover:underline flex items-center gap-1 font-mono">
                          → [docket: {p.title}]
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/30 text-[10px] font-mono">
                <span className="text-text-secondary block mb-0.5">CORE_OUTCOME:</span>
                <span className="text-text-primary font-bold">Decoupled microservice domains & secure REST/gRPC gateways.</span>
              </div>
            </Card>

            {/* Distributed Systems */}
            <Card hoverable={true} className="border-accent-purple/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-border-subtle/20 pb-2">
                  <span className="text-[10px] font-mono text-accent-purple tracking-wider uppercase font-semibold">STRENGTH_02</span>
                  <Badge color="purple" variant="solid" className="text-[8px] tracking-widest font-bold">INFRASTRUCTURE</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-accent-purple" /> Distributed Systems
                </h3>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Configuring robust event-driven stream processing pipelines, service-to-service RPC, concurrent sockets, and multi-container orchestration patterns.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-text-secondary block mb-1">KEY_CAPABILITIES:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Kafka', 'gRPC', 'Docker', 'WebSockets', 'Redis', 'TimescaleDB', 'PostgreSQL'].map(tech => {
                        const skill = skills.find(s => s.name === tech);
                        if (!skill) return null;
                        return (
                          <Badge key={tech} color="purple" variant="outline" className="text-[9px]">
                            {tech}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-text-secondary block mb-1">VERIFIED_APPLICATIONS:</span>
                    <div className="space-y-1">
                      {projects.filter(p => ['patient-management-service', 'sahai'].includes(p.id)).map(p => (
                        <Link key={p.id} href={`/project/${p.id}`} className="text-xs text-accent-purple hover:underline flex items-center gap-1 font-mono">
                          → [docket: {p.title}]
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/30 text-[10px] font-mono">
                <span className="text-text-secondary block mb-0.5">CORE_OUTCOME:</span>
                <span className="text-text-primary font-bold">Low-latency service synchronization & event outbox pipelines.</span>
              </div>
            </Card>

            {/* AI Engineering */}
            <Card hoverable={true} className="border-success-green/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-border-subtle/20 pb-2">
                  <span className="text-[10px] font-mono text-success-green tracking-wider uppercase font-semibold">STRENGTH_03</span>
                  <Badge color="green" variant="solid" className="text-[8px] tracking-widest font-bold">AI_INTEGRATION</Badge>
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-success-green" /> AI Engineering
                </h3>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                  Integrating intelligent components: vector indexing for semantic similarity checks, RAG pipelines, timeseries forecasting models, and geospatial visual layers.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono text-text-secondary block mb-1">KEY_CAPABILITIES:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Pinecone', 'Spring AI', 'FastAPI', 'Python', 'TimescaleDB', 'Leaflet'].map(tech => {
                        const skill = skills.find(s => s.name === tech);
                        if (!skill) return null;
                        return (
                          <Badge key={tech} color="green" variant="outline" className="text-[9px]">
                            {tech}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-text-secondary block mb-1">VERIFIED_APPLICATIONS:</span>
                    <div className="space-y-1">
                      {projects.filter(p => ['sahai', 'orbitair'].includes(p.id)).map(p => (
                        <Link key={p.id} href={`/project/${p.id}`} className="text-xs text-success-green hover:underline flex items-center gap-1 font-mono">
                          → [docket: {p.title}]
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle/30 text-[10px] font-mono">
                <span className="text-text-secondary block mb-0.5">CORE_OUTCOME:</span>
                <span className="text-text-primary font-bold">98% environmental forecast accuracy & sub-second wellness RAG.</span>
              </div>
            </Card>

          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Hackathon Highlights */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Trophy className="w-4 h-4 text-warning-amber" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                  HACKATHON_HIGHLIGHTS
                </h2>
              </div>

              <div className="space-y-6">
                {/* NASA Space Apps Challenge */}
                <div className="border border-border-subtle/50 bg-bg-panel/40 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 font-mono text-[9px] text-accent-cyan bg-accent-cyan/15 rounded-bl-lg">
                    TOP_5_INDIA
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4.5 h-4.5 text-accent-cyan" />
                    <h3 className="text-sm font-bold text-text-primary">NASA Space Apps Challenge 2025</h3>
                  </div>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    Developed <strong>ORBITAIR</strong>, an AI-powered geospatial AQI forecasting system. Competed against 823 teams nationwide. Designed high-volume time-series geospatial query structures and hypertable partitioning.
                  </p>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle/20 text-xs">
                    <span className="font-mono text-text-secondary">PROJECT_LINK: <Link href="/project/orbitair" className="text-accent-cyan hover:underline">ORBITAIR Dossier</Link></span>
                    <span className="font-mono text-success-green font-bold">98% FORECASTING_ACCURACY</span>
                  </div>
                </div>

                {/* Smart India Hackathon */}
                <div className="border border-border-subtle/50 bg-bg-panel/40 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 font-mono text-[9px] text-warning-amber bg-warning-amber/15 rounded-bl-lg">
                    NATIONAL_FINALIST
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4.5 h-4.5 text-warning-amber" />
                    <h3 className="text-sm font-bold text-text-primary">Smart India Hackathon 2025</h3>
                  </div>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    Selected to represent ADGIPS at the SIH National Finals for building <strong>SAHAI</strong>, a mental health & lifestyle platform. Integrated a Pinecone-backed retrieval-augmented generation (RAG) wellness assistant and managed concurrent therapist chat rooms via WebSockets.
                  </p>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle/20 text-xs">
                    <span className="font-mono text-text-secondary">PROJECT_LINK: <Link href="/project/sahai" className="text-warning-amber hover:underline">SAHAI Dossier</Link></span>
                    <span className="font-mono text-accent-purple font-bold">RAG_ASSISTANT & WEBSOCKETS</span>
                  </div>
                </div>

                {/* Smart Delhi Ideathon */}
                <div className="border border-border-subtle/50 bg-bg-panel/40 p-4 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 font-mono text-[9px] text-accent-purple bg-accent-purple/15 rounded-bl-lg">
                    CIVIC_PRIZE
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4.5 h-4.5 text-accent-purple" />
                    <h3 className="text-sm font-bold text-text-primary">Smart Delhi Ideathon 2025</h3>
                  </div>
                  <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                    Placed in the top 5 and awarded the Civic Prize for developing civic tech solutions resolving local municipal challenges. Engineered workflow routing protocols for immediate community reporting of infrastructure failures.
                  </p>
                  <div className="flex items-center justify-between pt-2.5 border-t border-border-subtle/20 text-xs">
                    <span className="font-mono text-text-secondary">OUTCOME: <span className="text-text-primary">Civic Tech Deployment Strategy</span></span>
                    <span className="font-mono text-accent-cyan font-bold">₹7,000 CASH_AWARD</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Project Impact */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2">
                <Activity className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                  PROJECT_IMPACT_METRICS
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-text-secondary leading-relaxed mb-2">
                  System performance and project recognition metrics extracted dynamically from portfolio data models:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.flatMap(p => 
                    (p.results || []).map((res, index) => ({
                      projectTitle: p.title,
                      projectId: p.id,
                      result: res,
                      id: `${p.id}-res-${index}`
                    }))
                  ).map((item) => (
                    <div key={item.id} className="bg-bg-primary/30 border border-border-subtle/70 p-3 rounded-lg flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-success-green" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-mono uppercase text-accent-purple font-semibold">[{item.projectTitle}]</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-border-subtle/50" />
                          <span className="text-[8px] font-mono text-text-secondary uppercase">METRIC_VERIFIED</span>
                        </div>
                        <p className="text-xs text-text-primary leading-relaxed font-sans font-light">
                          {item.result}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Featured Projects Preview */}
            <Card hoverable={false}>
              <div className="flex items-center justify-between gap-4 mb-6 border-b border-border-subtle/40 pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-accent-purple" />
                  <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                    FEATURED_DOSSIERS
                  </h2>
                </div>
                <Link href="/projects" className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-1">
                  VIEW_ALL <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project) => (
                  <div key={project.id} className="border border-border-subtle bg-bg-primary/20 p-5 rounded-xl flex flex-col justify-between hover:border-border-bright transition-all duration-300">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-mono text-accent-purple uppercase tracking-wider">{project.subtitle}</span>
                        <Badge color="purple" variant="solid" className="text-[8px]">FEATURED</Badge>
                      </div>
                      <h4 className="text-base font-bold text-text-primary mb-1.5">{project.title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3">{project.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40 mt-auto">
                      <Link href={`/project/${project.id}`} className="text-xs font-mono text-accent-cyan hover:underline">
                        READ_DOSSIER →
                      </Link>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">
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
            
            {/* Technology Coverage */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary mb-4 border-b border-border-subtle/40 pb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-accent-cyan" /> Technology Coverage
              </h3>
              
              <div className="space-y-4">
                <p className="text-[11px] text-text-secondary leading-normal font-mono">
                  AGGREGATION_BY_PROJECT_FREQUENCY (N={projects.length}):
                </p>
                <div className="space-y-3">
                  {sortedTech.slice(0, 8).map((tech) => (
                    <div key={tech.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-primary font-bold">{tech.name}</span>
                        <span className="text-text-secondary font-semibold">
                          {tech.count} {tech.count === 1 ? 'docket' : 'dockets'} ({tech.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-bg-primary border border-border-subtle h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-accent-cyan h-full rounded-full transition-all duration-500" 
                          style={{ width: `${tech.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Achievements Summary */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-warning-amber mb-4 border-b border-border-subtle/40 pb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-warning-amber" /> Achievements Summary
              </h3>

              <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[9px] text-center">
                <div className="bg-bg-primary/50 border border-border-subtle p-2 rounded-lg">
                  <span className="text-text-secondary block">COMPETITIVE_INDEX:</span>
                  <span className="text-accent-cyan font-bold">Top 5 India</span>
                </div>
                <div className="bg-bg-primary/50 border border-border-subtle p-2 rounded-lg">
                  <span className="text-text-secondary block">SELECTION_LEVEL:</span>
                  <span className="text-accent-purple font-bold">National Finalist</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {achievements.map((ach, i) => (
                  <div key={i} className="border-l-2 border-warning-amber/30 pl-3 py-0.5">
                    <div className="flex justify-between text-xs font-mono mb-0.5">
                      <span className="font-bold text-text-primary leading-tight">{ach.title}</span>
                      <span className="text-text-secondary text-[10px] font-semibold">{ach.year}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-sans font-light">
                      {ach.description}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education Profile Card */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-4 border-b border-border-subtle/40 pb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-accent-purple" /> Education Profile
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

            {/* AI Compatibility Evaluation (Extension Point) */}
            <Card hoverable={false} className="border-border-bright/20 bg-bg-panel/85">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle/40 pb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-text-primary animate-spin" style={{ animationDuration: '6s' }} />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary">
                    AI_COGNITIVE_GATEWAY
                  </h3>
                </div>
                <Badge color="default" variant="solid" className="text-[8px] animate-pulse">OFFLINE</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-text-secondary block mb-1.5 uppercase">
                    Select Role Preset (Verified checklist matching):
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(Object.keys(roleRequirements) as Array<keyof typeof roleRequirements>).map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setShowJdResult(false);
                        }}
                        className={`py-1 px-0.5 text-[9px] font-mono rounded border text-center transition-all ${
                          selectedRole === role
                            ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/40 font-bold'
                            : 'text-text-secondary border-border-subtle bg-bg-primary/30 hover:text-text-primary'
                        }`}
                      >
                        {role.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-bg-primary/50 border border-border-subtle p-3 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-border-subtle/30 pb-1.5">
                    <span className="font-bold text-text-primary">{roleRequirements[selectedRole].title}</span>
                    <Badge color="green" variant="solid" className="text-[8px]">100% VERIFIED</Badge>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {roleRequirements[selectedRole].description}
                  </p>

                  {/* Skills Checklist */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-text-secondary block uppercase">Verified Skill Checks:</span>
                    <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
                      {roleRequirements[selectedRole].skills.map(skillName => {
                        const hasSkill = skills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
                        return (
                          <div key={skillName} className="flex items-center gap-1">
                            {hasSkill ? (
                              <Check className="w-3.5 h-3.5 text-success-green" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-text-secondary" />
                            )}
                            <span className={hasSkill ? 'text-text-primary font-medium' : 'text-text-secondary'}>
                              {skillName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Proven Projects */}
                  <div className="space-y-1 pt-1.5 border-t border-border-subtle/20">
                    <span className="text-[9px] font-mono text-text-secondary block uppercase">Proven Portfolio Dossiers:</span>
                    <div className="space-y-1 font-mono text-[9px]">
                      {roleRequirements[selectedRole].projects.map(projId => {
                        const proj = projects.find(p => p.id === projId);
                        if (!proj) return null;
                        return (
                          <div key={projId} className="flex items-center gap-1 text-accent-cyan hover:underline">
                            <Check className="w-3.5 h-3.5 text-success-green" />
                            <Link href={`/project/${projId}`}>{proj.title}</Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* JD Input Area (Extension Point) */}
                <div className="space-y-2 pt-2 border-t border-border-subtle/30">
                  <span className="text-[10px] font-mono text-text-secondary block uppercase">
                    Parse Custom Job Description (Extension Slot):
                  </span>
                  <textarea
                    value={customJd}
                    onChange={(e) => setCustomJd(e.target.value)}
                    placeholder="Paste a job description here to simulate vector alignment checks..."
                    className="w-full h-16 bg-bg-primary/50 border border-border-subtle p-2 rounded text-xs font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50 resize-none"
                  />
                  <button
                    disabled={!customJd.trim()}
                    onClick={() => setShowJdResult(true)}
                    className="w-full py-1.5 bg-bg-primary hover:bg-bg-panel border border-border-bright/25 hover:border-accent-cyan/40 text-text-primary font-mono text-[10px] rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    RUN_AI_COMPATIBILITY_SCAN
                  </button>

                  {showJdResult && (
                    <div className="p-2.5 bg-accent-cyan/5 border border-accent-cyan/20 rounded font-mono text-[10px] text-text-secondary leading-relaxed space-y-1.5">
                      <div className="flex items-center gap-1.5 text-accent-cyan font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> GATEWAY_OFFLINE
                      </div>
                      <p>
                        AI parser model pipeline is offline (strictly zero external API calls/generated scores). 
                      </p>
                      <p>
                        <strong>Extension Config:</strong> Embeddings endpoint ready in <code>next.config.ts</code> for Phase 4 neural matching against portfolio embeddings vector store.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

          </div>

        </div>
      </Container>
    </div>
  );
}
