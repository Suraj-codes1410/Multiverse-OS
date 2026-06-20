import React from 'react';
import { Server, Brain, Cpu, Layers, ArrowRight, ShieldAlert, FileText, Mail } from 'lucide-react';
import Container from '@/components/Container';
import Section from '@/components/Section';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ProjectCard from '@/components/ProjectCard';
import HomeConsoleWidgets from '@/components/HomeConsoleWidgets';
import { getPortfolio, getFeaturedProjects } from '@/lib/data';

export default async function HomePage() {
  const portfolio = getPortfolio();
  const featuredProjects = await getFeaturedProjects();

  const technicalAreas = [
    {
      title: 'Backend Engineering',
      icon: <Server className="w-7 h-7 text-accent-cyan" />,
      description: 'Developing low-latency microservices, concurrent APIs using Go and Rust, and high-performance RPC systems.'
    },
    {
      title: 'Artificial Intelligence',
      icon: <Brain className="w-7 h-7 text-accent-purple" />,
      description: 'Integrating large language models, setting up multi-agent state machines, and building telemetry-guided prompt loops.'
    },
    {
      title: 'System Design',
      icon: <Cpu className="w-7 h-7 text-success-green" />,
      description: 'Architecting distributed queues, consensus sharding setups, and managing pipeline backpressures.'
    },
    {
      title: 'Product Development',
      icon: <Layers className="w-7 h-7 text-warning-amber" />,
      description: 'Creating developer tools and clean system boundaries that combine high-quality code with high reliability.'
    }
  ];

  return (
    <div className="flex-grow">
      {/* Hero Section */}
      <div className="border-b border-border-subtle bg-radial-[at_top] from-accent-cyan/5 via-bg-primary/0 to-bg-primary/0 py-20 md:py-28">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent-cyan/25 bg-accent-cyan/5 text-accent-cyan text-xs font-mono mb-6 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
              PHASE 1 FOUNDATION ONLINE
            </div>

            {/* Name */}
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-text-primary mb-4">
              {portfolio.name}
            </h1>

            {/* Title / Role */}
            <p className="text-sm sm:text-lg font-mono text-accent-cyan tracking-wide mb-8">
              Backend Developer <span className="text-text-secondary/40">|</span> AI Engineer <span className="text-text-secondary/40">|</span> Problem Solver
            </p>

            {/* Value Proposition */}
            <h2 className="text-xl sm:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              Designing high-performance distributed systems and AI solutions that solve real-world problems.
            </h2>

            {/* CTA Grid */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="/recruiter" variant="primary" size="lg" className="w-full sm:w-auto">
                <ShieldAlert className="w-4 h-4 mr-2" />
                Recruiter Mode
              </Button>
              
              <Button href="/projects" variant="outline" size="lg" className="w-full sm:w-auto">
                View Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Glowing Onboarding Centerpiece Widgets for Oracle & CLI */}
            <HomeConsoleWidgets />

            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-mono text-text-secondary">
              <a href={portfolio.resume} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors">
                <FileText className="w-3.5 h-3.5" /> DOWNLOAD_RESUME
              </a>
              <span className="text-border-subtle">/</span>
              <a href="/contact" className="flex items-center gap-1.5 hover:text-accent-cyan transition-colors">
                <Mail className="w-3.5 h-3.5" /> CONTACT_DIRECT
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Featured Technical Areas */}
      <Container>
        <Section title="Technical Focus Areas" subtitle="CORE EXPERTISE">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {technicalAreas.map((area, idx) => (
              <Card key={idx} hoverable={true} glowOnHover={true} className="flex flex-col p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-bg-primary border border-border-subtle group-hover:border-accent-cyan/20 group-hover:shadow-[0_0_12px_rgba(0,242,254,0.1)] transition-all mb-4">
                  {area.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {area.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {area.description}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </Container>

      {/* Featured Projects Preview */}
      <div className="border-t border-border-subtle bg-bg-panel/10">
        <Container>
          <Section title="Featured Projects" subtitle="PORTFOLIO PREVIEW">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="text-center">
              <Button href="/projects" variant="outline">
                Explore All Projects
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Section>
        </Container>
      </div>
    </div>
  );
}
