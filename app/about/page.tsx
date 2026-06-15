import React from 'react';
import { BookOpen, Target, BrainCircuit, Terminal, Briefcase } from 'lucide-react';
import Container from '@/components/Container';
import Section from '@/components/Section';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import TimelineItem from '@/components/TimelineItem';
import { getPortfolio, getExperience } from '@/lib/data';

export const metadata = {
  title: 'About | Suraj Samanta',
  description: 'Learn about Suraj Samanta\'s journey, technical focus, learning targets, and professional career history.',
};

export default function AboutPage() {
  const portfolio = getPortfolio();

  const technicalFocus = [
    'Distributed Systems & Consensus Protocols (Raft, Consistent Hashing)',
    'High-Throughput Concurrent Programming in Go & Systems Programming in Rust',
    'Asynchronous Event-Driven Architectures (Kafka, RabbitMQ, Redis)',
    'Agentic Workflows, Stateful AI Orchestrators, and LLM Tool-Use Guardrails'
  ];

  const careerInterests = [
    'Backend Engineer Roles focusing on high-scalability infrastructure',
    'AI Platform Engineering building AI agent runtime executors',
    'Core Infrastructure teams working on database engines and message buses'
  ];

  const currentLearning = [
    'Rust memory management models and high-performance cross-language compiling (CGO/FFI)',
    'Advanced Vector Indexing techniques (HNSW graph compression, IVFFlat optimizations)',
    'OpenTelemetry distributed tracing implementations in highly asynchronous worker pools'
  ];

  const careerTimeline = getExperience();

  return (
    <div className="flex-grow py-8">
      <Container>
        {/* Page Header */}
        <div className="border-b border-border-subtle pb-6 mb-12">
          <p className="text-xs font-mono text-accent-cyan tracking-widest uppercase mb-2">
            PROFILE_IDENTIFICATION
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            About Suraj Samanta
          </h1>
        </div>

        {/* Grid: Story & Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column: Story */}
          <div className="lg:col-span-2 space-y-8">
            <Card hoverable={false} className="h-full">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-5 h-5 text-accent-cyan" />
                <h3 className="text-lg font-bold text-text-primary">
                  My Story
                </h3>
              </div>
              <div className="space-y-4 text-sm md:text-base text-text-secondary leading-relaxed font-light">
                <p>
                  I am a Backend Developer and AI Engineer who thrives on solving difficult computational and architectural problems. My professional path is driven by a deep curiosity about how large-scale computer systems manage and move data, and how we can use artificial intelligence to solve complex workflows autonomously.
                </p>
                <p>
                  I enjoy working at the boundary where systems software meets machine learning. I believe that writing good code is about more than just solving the immediate bug—it is about designing clean interfaces, understanding performance limits (CPU cache misses, garbage collection, serialization), and keeping systems maintainable for years to come.
                </p>
                <p>
                  Whether it is optimizing a custom HNSW vector database in Rust, managing state transitions in a multi-agent AI system, or debugging a Kafka backpressure queue, I focus on engineering solid, reproducible solutions.
                </p>
              </div>
            </Card>
          </div>

          {/* Right Column: Focus Areas */}
          <div className="space-y-6">
            {/* Education Profile */}
            <Card hoverable={false} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-accent-cyan" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Education Profile
                </h4>
              </div>
              <div className="space-y-2 text-xs text-text-secondary">
                <h5 className="font-bold text-text-primary leading-snug">
                  {portfolio.education.degree}
                </h5>
                <p className="font-mono text-[10px]">
                  {portfolio.education.institution} ({portfolio.education.location})
                </p>
                <div className="flex justify-between font-mono text-[10px] text-accent-cyan mt-2 pt-2 border-t border-border-subtle/30">
                  <span>CGPA INDEX:</span>
                  <span className="font-bold">{portfolio.education.cgpa}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span>TIMELINE:</span>
                  <span>{portfolio.education.currentYear} (Exp: {portfolio.education.expectedGraduation})</span>
                </div>
              </div>
            </Card>

            {/* Technical Focus */}
            <Card hoverable={false} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-accent-cyan" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Technical Focus
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                {technicalFocus.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent-cyan font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Career Interests */}
            <Card hoverable={false} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-accent-purple" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Career Interests
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                {careerInterests.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-accent-purple font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Current Learning */}
            <Card hoverable={false} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BrainCircuit className="w-4 h-4 text-success-green" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  Current Learning
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-text-secondary">
                {currentLearning.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-success-green font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Section: Future Goals */}
        <div className="mb-16">
          <Card hoverable={false} className="bg-bg-panel/40 border-accent-cyan/10">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-accent-cyan" />
              <h3 className="text-lg font-bold text-text-primary">
                Future Goals & Directions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {portfolio.futureGoals.map((goal, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-xs font-mono text-accent-cyan">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed pt-0.5">
                    {goal}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Timeline Section */}
        {careerTimeline && careerTimeline.length > 0 && (
          <Section title="Career Progression Timeline" subtitle="PROFESSIONAL EXPERIENCE">
            <div className="max-w-4xl mx-auto border border-border-subtle bg-bg-panel/20 p-6 md:p-10 rounded-2xl">
              {careerTimeline.map((item, idx) => (
                <TimelineItem
                  key={idx}
                  year={`${item.startDate} — ${item.endDate}`}
                  title={item.role}
                  subtitle={item.company}
                  description={item.description}
                  bullets={item.technologies.map(t => `Utilized ${t}`)}
                />
              ))}
            </div>
          </Section>
        )}
      </Container>
    </div>
  );
}
