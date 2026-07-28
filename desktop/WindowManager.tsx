'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useDesktop } from './DesktopContext';
import { DesktopWindow } from './DesktopWindow';
import { HomeWindowContent } from './HomeWindowContent';
import { useTheme } from '@/providers';

// Import Portfolio Components
import CareerTimeline from '@/components/CareerTimeline';
import SkillsDashboard from '@/components/SkillsDashboard';
import RecruiterDashboard from '@/components/RecruiterDashboard';
import GithubExplorer from '@/components/GithubExplorer';
import CliTerminal from '@/components/CliTerminal';
import OracleWindow from '@/components/OracleWindow';
import MissionBriefing from '@/components/MissionBriefing';
import ProjectCard from '@/components/ProjectCard';
import Card from '@/components/Card';
import ContactCard from '@/components/ContactCard';

// Lucide Icons
import { 
  BookOpen, 
  Target, 
  FileText, 
  Sparkles, 
  Settings, 
  Cpu 
} from 'lucide-react';

// Static Data Types & JSON
import { Portfolio, Project, Skill, Experience, Achievement, TimelineMilestone } from '@/lib/types';
import portfolioData from '@/data/portfolio.json';
import projectsData from '@/data/projects.json';
import skillsData from '@/data/skills.json';
import experienceData from '@/data/experience.json';
import achievementsData from '@/data/achievements.json';
import timelineData from '@/data/timeline.json';

export interface WindowManagerProps {
  children?: React.ReactNode;
}

/**
 * WindowManager serves as the desktop coordinator layer.
 * Maps open windows from DesktopContext and overlays dragging window frames.
 */
export function WindowManager({ children }: WindowManagerProps) {
  const { windows, closeWindow } = useDesktop();

  const openWindows = Object.values(windows).filter((win) => win.isOpen);

  // Stateful tracking for dynamically loaded GitHub data and repos comparison
  const [projects, setProjects] = useState<Project[]>(projectsData as Project[]);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDynamicData = async () => {
      try {
        const { getProjects } = await import('@/lib/data');
        const { getRepositories } = await import('@/lib/github/github');
        
        const [projectsList, reposList] = await Promise.all([
          getProjects(),
          getRepositories()
        ]);
        
        if (active) {
          setProjects(projectsList);
          setRepos(reposList);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load dynamic projects data:", err);
      }
    };
    loadDynamicData();
    return () => {
      active = false;
    };
  }, []);

  // Helper to render mock content for testing layout mechanics
  const renderWindowContent = (id: string) => {
    switch (id) {
      case 'home':
        return <HomeWindowContent />;

      case 'about':
        return <AboutAppContent />;

      case 'projects':
        return <ProjectsAppContent projects={projects} />;

      case 'skills':
        return <SkillsAppContent />;

      case 'timeline':
        return <TimelineAppContent />;

      case 'resume':
        return <ResumeAppContent />;

      case 'contact':
        return <ContactAppContent />;

      case 'oracle':
        return <OracleWindow isOpen={winOpen('oracle')} onClose={() => closeWindow('oracle')} />;

      case 'terminal':
        return <CliTerminal isOpen={winOpen('terminal')} onClose={() => closeWindow('terminal')} />;

      case 'explorer':
        return <ExplorerAppContent repos={repos} loading={loading} />;

      case 'settings':
        return <SettingsAppContent />;

      case 'dashboard':
        return <DashboardAppContent projects={projects} />;

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-secondary select-none font-mono">
            <span className="text-xs text-accent-cyan mb-2">{`[APP: ${id.toUpperCase()}]`}</span>
            <p className="text-xs">No active content linked. Application content placeholders ready for implementation.</p>
          </div>
        );
    }
  };

  function winOpen(id: string): boolean {
    const w = windows[id];
    return !!(w && w.isOpen && !w.isMinimized);
  }

  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {/* Dynamic Windows Layer */}
      {openWindows.map((win) => (
        <DesktopWindow key={win.id} id={win.id}>
          {renderWindowContent(win.id)}
        </DesktopWindow>
      ))}

      {/* Render children/original layouts outside the dynamic windows layer */}
      {children}
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: ABOUT
   ========================================================================== */
export function AboutAppContent() {
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

  return (
    <div className="flex-grow overflow-y-auto p-2 font-sans select-text scrollbar-thin text-text-secondary leading-relaxed">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-4">
        <div className="border-b border-border-subtle/40 pb-4">
          <p className="text-[9px] font-mono text-accent-cyan tracking-widest uppercase mb-1">
            SYSTEM_PROFILE // CORE_BIOGRAPHY
          </p>
          <h2 className="text-xl font-bold text-text-primary">Suraj Samanta</h2>
        </div>

        {/* Story */}
        <Card hoverable={false} className="p-4 bg-bg-panel/20 border-border-subtle/50">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-accent-cyan" />
            <h3 className="font-bold text-text-primary text-sm">My Story</h3>
          </div>
          <div className="space-y-3 text-xs leading-relaxed font-light">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Education */}
          <Card hoverable={false} className="p-4 bg-bg-panel/20 border-border-subtle/50">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-cyan mb-2.5">Education</h4>
            <div className="text-xs space-y-1.5">
              <h5 className="font-bold text-text-primary leading-tight">
                {portfolioData.education.degree}
              </h5>
              <p className="text-[10px] font-mono text-text-secondary/70">
                {portfolioData.education.institution}
              </p>
              <div className="flex justify-between font-mono text-[9px] pt-1.5 border-t border-border-subtle/30 mt-1.5">
                <span>CGPA INDEX:</span>
                <span className="font-bold text-accent-cyan">{portfolioData.education.cgpa}</span>
              </div>
              <div className="flex justify-between font-mono text-[9px]">
                <span>TIMELINE:</span>
                <span>{portfolioData.education.currentYear} ({portfolioData.education.expectedGraduation})</span>
              </div>
            </div>
          </Card>

          {/* Technical Focus */}
          <Card hoverable={false} className="p-4 bg-bg-panel/20 border-border-subtle/50">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-purple mb-2.5">Technical Focus</h4>
            <ul className="space-y-1.5 text-xs text-text-secondary font-light">
              {technicalFocus.map((item, i) => (
                <li key={i} className="flex gap-1.5 items-start">
                  <span className="text-accent-purple font-bold">•</span>
                  <span className="text-[11px] leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Career Interests */}
          <Card hoverable={false} className="p-4 bg-bg-panel/20 border-border-subtle/50">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-success-green mb-2.5">Career Interests</h4>
            <ul className="space-y-1.5 text-xs text-text-secondary font-light">
              {careerInterests.map((item, i) => (
                <li key={i} className="flex gap-1.5 items-start">
                  <span className="text-success-green font-bold">•</span>
                  <span className="text-[11px] leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Current Learning */}
          <Card hoverable={false} className="p-4 bg-bg-panel/20 border-border-subtle/50">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 mb-2.5">Current Learning</h4>
            <ul className="space-y-1.5 text-xs text-text-secondary font-light">
              {currentLearning.map((item, i) => (
                <li key={i} className="flex gap-1.5 items-start">
                  <span className="text-amber-500 font-bold">•</span>
                  <span className="text-[11px] leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Future Goals */}
        <Card hoverable={false} className="p-4 bg-bg-panel/20 border-border-subtle/50">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-accent-cyan" />
            <h3 className="font-bold text-text-primary text-sm">Future Goals</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioData.futureGoals.map((goal, idx) => (
              <div key={idx} className="flex gap-2 items-start text-xs font-light">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-[10px] font-mono text-accent-cyan">
                  {idx + 1}
                </div>
                <p className="leading-tight pt-0.5">{goal}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: PROJECTS
   ========================================================================== */
export function ProjectsAppContent({ projects }: { projects: Project[] }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id.toLowerCase() === selectedProjectId.toLowerCase());
  }, [selectedProjectId, projects]);

  const categories = ['All', 'Featured', 'Backend', 'AI / ML', 'Systems'];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (filterCategory === 'All') return matchesSearch;
      if (filterCategory === 'Featured') return project.featured && matchesSearch;
      if (filterCategory === 'Backend') return project.subtitle.toLowerCase().includes('backend') && matchesSearch;
      if (filterCategory === 'AI / ML') return (project.subtitle.toLowerCase().includes('ai') || project.subtitle.toLowerCase().includes('agent')) && matchesSearch;
      if (filterCategory === 'Systems') return (project.subtitle.toLowerCase().includes('system') || project.subtitle.toLowerCase().includes('database')) && matchesSearch;
      return matchesSearch;
    });
  }, [projects, searchQuery, filterCategory]);

  if (selectedProject) {
    return (
      <div className="flex-grow overflow-y-auto px-4 py-2 scrollbar-thin">
        <MissionBriefing project={selectedProject} onBack={() => setSelectedProjectId(null)} />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col overflow-hidden font-sans">
      {/* Search & Filters */}
      <div className="p-2 border-b border-border-subtle/40 bg-bg-panel/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-[10px] font-mono rounded-lg transition-all focus:outline-none border cursor-pointer ${
                filterCategory === cat
                  ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20 shadow-[0_0_8px_rgba(0,242,254,0.1)]'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-panel/30'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-bg-panel/40 border border-border-subtle/60 rounded-lg py-1.5 pl-3 pr-8 font-mono text-[10px] text-text-primary focus:outline-none focus:border-accent-cyan/40"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-grow overflow-y-auto p-4 scrollbar-thin select-text">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onLearnMore={(id) => setSelectedProjectId(id)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 font-mono text-xs text-text-secondary select-none">
            NO_PROJECTS_FOUND // CLASSIFIED
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: SKILLS
   ========================================================================== */
export function SkillsAppContent() {
  const skills = skillsData as Skill[];
  const projectMap = useMemo(() => {
    const map: Record<string, string> = {};
    projectsData.forEach((proj) => {
      map[proj.id.toLowerCase()] = proj.title;
    });
    return map;
  }, []);

  return (
    <div className="flex-grow overflow-y-auto scrollbar-thin select-text">
      <SkillsDashboard skills={skills} projectMap={projectMap} />
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: TIMELINE
   ========================================================================== */
export function TimelineAppContent() {
  const milestones = timelineData as TimelineMilestone[];

  return (
    <div className="flex-grow overflow-y-auto scrollbar-thin select-text py-4 px-2">
      <div className="max-w-4xl mx-auto border border-border-subtle bg-bg-panel/20 p-6 md:p-10 rounded-2xl">
        <CareerTimeline milestones={milestones} />
      </div>
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: RESUME PDF VIEWER
   ========================================================================== */
export function ResumeAppContent() {
  return (
    <div className="flex-grow flex flex-col md:flex-row overflow-hidden bg-bg-panel/5 rounded-lg border border-border-subtle/50 h-full font-sans">
      {/* Left side: interactive iframe preview */}
      <div className="flex-grow h-full bg-black relative min-h-[300px]">
        <iframe
          src="/resume/SurajSamanta_Resume_v6.pdf"
          className="w-full h-full border-none"
          title="Suraj Samanta Resume PDF Preview"
        />
      </div>

      {/* Right side: quick stats/download action */}
      <div className="w-full md:w-64 flex flex-col justify-between p-4 bg-bg-panel/15 border-t md:border-t-0 md:border-l border-border-subtle/40 select-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent-cyan" /> Curriculum Vitae
            </h3>
            <p className="text-[11px] text-text-secondary leading-relaxed font-light">
              Suraj Samanta's technical CV outlining 4+ years of backend engineering and AI architectures.
            </p>
          </div>
          
          <div className="space-y-2 text-[10px] font-mono text-text-secondary bg-bg-primary/30 p-2.5 rounded border border-border-subtle/30">
            <div className="flex justify-between">
              <span>FORMAT:</span>
              <span>PDF Document</span>
            </div>
            <div className="flex justify-between">
              <span>SIZE:</span>
              <span>625 KB</span>
            </div>
            <div className="flex justify-between">
              <span>UPDATED:</span>
              <span>June 2026</span>
            </div>
          </div>
        </div>

        <a
          href="/resume/SurajSamanta_Resume_v6.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 mt-4 rounded bg-accent-cyan/15 border border-accent-cyan/35 text-[10px] font-mono text-accent-cyan text-center hover:bg-accent-cyan hover:text-bg-primary transition-all cursor-pointer font-bold block"
        >
          DOWNLOAD RESUME
        </a>
      </div>
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: CONTACT
   ========================================================================== */
export function ContactAppContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSubmitting(true);
    setIsSuccess(false);
    setErrorMessage(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, honeypot }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setHoneypot('');
      } else {
        setErrorMessage(data.message || 'An error occurred while sending the message.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 select-text scrollbar-thin font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pb-4">
        
        {/* Connection details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-2 select-none">
              Establish Connection
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed font-light mb-4 select-none">
              Reach out for consultations, collaborations, or roles. Copy details below or fill the messaging form.
            </p>
          </div>

          <div className="space-y-3">
            <ContactCard type="email" value={portfolioData.email} label="Direct Email" />
            <ContactCard type="linkedin" value={portfolioData.linkedin} label="LinkedIn Profile" />
            <ContactCard type="github" value={portfolioData.github} label="GitHub Profile" />
          </div>

          {/* Resume Download CV Box */}
          <Card hoverable={false} className="bg-bg-panel/20 p-4 border border-dashed border-accent-cyan/20 rounded-lg mt-4 select-none">
            <h4 className="text-xs font-semibold text-text-primary mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-accent-cyan" /> Resume / Curriculum Vitae
            </h4>
            <p className="text-[10px] text-text-secondary mb-3 leading-snug">
              Download Suraj Samanta's technical resume containing detailed systems architecture and backend history.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-text-secondary/50">FILE_SIZE: 625 KB</span>
              <a
                href={portfolioData.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded bg-bg-panel/60 border border-border-subtle/50 text-[10px] font-mono text-accent-cyan hover:text-text-primary hover:border-accent-cyan/40 transition-colors"
              >
                DOWNLOAD
              </a>
            </div>
          </Card>
        </div>

        {/* Messaging Form */}
        <Card hoverable={false} className="p-4 bg-bg-panel/25 border-border-subtle/50">
          <h3 className="text-xs font-bold text-text-primary mb-4 flex items-center gap-1.5 select-none">
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan animate-pulse" /> MESSAGE_TRANSMISSION
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label htmlFor="win-name" className="block text-[9px] font-mono text-text-secondary uppercase select-none">Name *</label>
              <input
                id="win-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary focus:border-accent-cyan/60 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="win-email" className="block text-[9px] font-mono text-text-secondary uppercase select-none">Email *</label>
              <input
                id="win-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary focus:border-accent-cyan/60 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="win-subject" className="block text-[9px] font-mono text-text-secondary uppercase select-none">Subject</label>
              <input
                id="win-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary focus:border-accent-cyan/60 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="win-msg" className="block text-[9px] font-mono text-text-secondary uppercase select-none">Message *</label>
              <textarea
                id="win-msg"
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border-subtle bg-bg-primary/50 text-text-primary focus:border-accent-cyan/60 focus:outline-none resize-none"
              />
            </div>

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input type="text" value={honeypot} onChange={(e) => setName(e.target.value)} tabIndex={-1} />
            </div>

            {isSuccess && (
              <div className="p-2 rounded bg-success-green/10 border border-success-green/20 text-success-green font-mono text-[10px]">
                TRANSMITTED: Message sent successfully.
              </div>
            )}

            {errorMessage && (
              <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-500 font-mono text-[10px]">
                ERROR: {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !name || !email || !message}
              className="w-full py-2 rounded-lg bg-accent-cyan/15 border border-accent-cyan/35 text-[10px] font-mono text-accent-cyan hover:bg-accent-cyan hover:text-bg-primary transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'TRANSMITTING...' : 'SEND_MESSAGE'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: FILE SYSTEM EXPLORER
   ========================================================================== */
interface ExplorerAppContentProps {
  repos: any[];
  loading: boolean;
}

export function ExplorerAppContent({ repos, loading }: ExplorerAppContentProps) {
  if (loading && repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center font-mono text-xs text-text-secondary select-none">
        <Cpu className="w-5 h-5 animate-spin text-accent-cyan mb-2" />
        <span>READING_GITHUB_SYNC_CACHE...</span>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto scrollbar-thin select-text">
      <GithubExplorer repositories={repos} />
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: CONTROL PANEL SETTINGS
   ========================================================================== */
export function SettingsAppContent() {
  const { windows, activeWindowId } = useDesktop();
  const { themeName, setThemeName } = useTheme();

  const totalWindows = Object.keys(windows).length;
  const openWindows = Object.values(windows).filter(w => w.isOpen).length;

  return (
    <div className="flex-grow overflow-y-auto p-4 select-none font-sans text-xs text-text-secondary scrollbar-thin">
      <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-4">
        <div className="border-b border-border-subtle/40 pb-3">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-accent-cyan" /> Control Panel Settings
          </h3>
        </div>

        {/* Section: Themes */}
        <div className="space-y-3">
          <h4 className="font-mono text-[9px] uppercase text-text-secondary/70 tracking-wider">System Appearance Theme</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'default', label: 'PastelOS (Light)', accent: 'terracotta' },
              { id: 'dark', label: 'Obsidian Dark', accent: 'cyan' },
              { id: 'cyberpunk', label: 'Cyberpunk', accent: 'purple' },
              { id: 'matrix', label: 'Matrix', accent: 'green' },
              { id: 'high-contrast', label: 'High Contrast', accent: 'amber' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setThemeName(t.id as any)}
                className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all focus:outline-none cursor-pointer ${
                  themeName === t.id
                    ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan shadow-[0_0_12px_rgba(0,242,254,0.1)]'
                    : 'border-border-subtle/55 bg-bg-panel/20 hover:bg-bg-panel/45 text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="font-semibold text-xs leading-none">{t.label}</span>
                <span className="text-[8px] font-mono text-text-secondary/50">Theme ID: {t.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Telemetry Info */}
        <div className="space-y-3 mt-2">
          <h4 className="font-mono text-[9px] uppercase text-text-secondary/70 tracking-wider">Window Manager Diagnostics</h4>
          <Card hoverable={false} className="p-3 bg-bg-panel/10 border border-border-subtle/40 rounded-lg font-mono text-[10px] space-y-2">
            <div className="flex justify-between">
              <span>REGISTERED_WINDOWS:</span>
              <span className="text-text-primary">{totalWindows} apps</span>
            </div>
            <div className="flex justify-between">
              <span>ACTIVE_OPEN_WINDOWS:</span>
              <span className="text-accent-cyan font-bold">{openWindows} running</span>
            </div>
            <div className="flex justify-between">
              <span>FOCUSED_WINDOW_ID:</span>
              <span className="text-accent-purple font-bold">{activeWindowId || 'NULL (DESKTOP)'}</span>
            </div>
            <div className="flex justify-between">
              <span>OS_RUNTIME_STATUS:</span>
              <span className="text-success-green font-bold uppercase animate-pulse">NOMINAL_EXECUTION</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   APP COMPONENT: RECRUITER DASHBOARD
   ========================================================================== */
export function DashboardAppContent({ projects }: { projects: Project[] }) {
  const featuredProjects = useMemo(() => projects.filter(p => p.featured), [projects]);
  const skills = skillsData as Skill[];
  const experience = experienceData as Experience[];
  const achievements = achievementsData as Achievement[];
  const portfolio = portfolioData as Portfolio;

  return (
    <div className="flex-grow overflow-y-auto scrollbar-thin select-text">
      <RecruiterDashboard
        portfolio={portfolio}
        featuredProjects={featuredProjects}
        skills={skills}
        experience={experience}
        achievements={achievements}
        allProjects={projects}
      />
    </div>
  );
}
