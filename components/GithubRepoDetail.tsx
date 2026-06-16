'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GitBranch, 
  Star, 
  GitFork, 
  ExternalLink, 
  Calendar, 
  Cpu, 
  BookOpen, 
  Terminal,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import Container from './Container';
import Button from './Button';
import { GitHubRepository } from '@/lib/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { generateRepositoryIntelligence } from '@/lib/github/intelligence';
import { classifyRepository } from '@/lib/github/classification';

interface GithubRepoDetailProps {
  repo: GitHubRepository;
  readme: string;
}

export default function GithubRepoDetail({ repo, readme }: GithubRepoDetailProps) {
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  
  const intelligence = generateRepositoryIntelligence(repo, readme);
  const classifications = repo.classifications || classifyRepository(repo, intelligence);

  // Format dates
  const createdDate = new Date(repo.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedDate = new Date(repo.updatedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getLanguageColor = (lang: string | null) => {
    if (!lang) return 'bg-text-secondary';
    switch (lang.toLowerCase()) {
      case 'java': return 'bg-red-500';
      case 'python': return 'bg-blue-500';
      case 'go': return 'bg-cyan-500';
      case 'rust': return 'bg-orange-500';
      case 'typescript': return 'bg-indigo-500';
      case 'javascript': return 'bg-yellow-500';
      default: return 'bg-accent-cyan';
    }
  };

  const handleOracleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;

    // Simulate ORACLE offline status
    setOracleResponse(
      `[ORACLE_GATEWAY_OFFLINE]: Query processed deterministically. \n` +
      `Agent interaction for repository context requires Phase 4 LLM code indexing. \n` +
      `Your query "${oracleQuery}" has been cached under transaction slot.`
    );
  };

  return (
    <div className="py-8 font-sans text-sm">
      <Container>
        {/* Back Link */}
        <div className="mb-6 select-none">
          <Link 
            href="/github" 
            className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-accent-cyan transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK_TO_EXPLORER
          </Link>
        </div>

        {/* Repository Header Brief */}
        <div className="border border-border-subtle bg-bg-panel/40 p-6 md:p-8 rounded-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-cyan/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs select-none">
                <GitBranch className="w-4 h-4 text-accent-cyan" />
                <span className="text-text-secondary">REPOSITORY_DOSSIER:</span>
                <Badge color="cyan" variant="solid" className="text-[9px]">ACTIVE</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {repo.name}
              </h1>
              <p className="text-xs text-text-secondary font-mono">
                FULL_NAME: <span className="text-text-primary font-bold">{repo.fullName}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" variant="primary" size="md">
                <ExternalLink className="w-4 h-4 mr-2" /> View GitHub Repository
              </Button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Core Metadata Dossier */}
            <Card hoverable={false}>
              <div className="flex items-center gap-2 mb-4 border-b border-border-subtle/40 pb-2 select-none">
                <Layers className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-xs font-mono uppercase tracking-wider text-text-primary">
                  METADATA_SPECIFICATION
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono text-text-secondary uppercase mb-1">Description</h3>
                  <p className="text-sm text-text-primary leading-relaxed bg-bg-primary/30 p-4 border border-border-subtle rounded-lg">
                    {repo.description || 'No description provided for this repository.'}
                  </p>
                </div>

                {classifications && classifications.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-text-secondary uppercase mb-2">Engine Classifications</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {classifications.map((cat) => (
                        <Badge key={cat} color="purple" variant="solid" className="text-[10px] uppercase font-bold tracking-wider">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {repo.topics && repo.topics.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-text-secondary uppercase mb-2">Topics & Tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {repo.topics.map((topic) => (
                        <Badge key={topic} color="default" className="text-[10px]">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-bg-primary/20 border border-border-subtle p-3.5 rounded-lg font-mono text-xs">
                    <span className="text-text-secondary block mb-1">PRIMARY_LANGUAGE:</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(repo.language)}`} />
                      <span className="text-text-primary font-bold">{repo.language || 'Not Detected'}</span>
                    </div>
                  </div>

                  <div className="bg-bg-primary/20 border border-border-subtle p-3.5 rounded-lg font-mono text-xs">
                    <span className="text-text-secondary block mb-1">STARS_COUNT:</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-warning-amber" />
                      <span className="text-text-primary font-bold">{repo.starsCount}</span>
                    </div>
                  </div>

                  <div className="bg-bg-primary/20 border border-border-subtle p-3.5 rounded-lg font-mono text-xs">
                    <span className="text-text-secondary block mb-1">FORKS_COUNT:</span>
                    <div className="flex items-center gap-1.5">
                      <GitFork className="w-4 h-4 text-accent-purple" />
                      <span className="text-text-primary font-bold">{repo.forksCount}</span>
                    </div>
                  </div>

                  <div className="bg-bg-primary/20 border border-border-subtle p-3.5 rounded-lg font-mono text-xs">
                    <span className="text-text-secondary block mb-1">HOMEPAGE_URL:</span>
                    {repo.homepage ? (
                      <a 
                        href={repo.homepage} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-accent-cyan hover:underline truncate block font-bold"
                      >
                        {repo.homepage}
                      </a>
                    ) : (
                      <span className="text-text-secondary italic">None declared</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* README Preview & Documentation */}
            <Card hoverable={false} className="border-accent-cyan/15 bg-bg-panel/60">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle/40 pb-2 select-none">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary">
                    README_DOCUMENTATION_PREVIEW
                  </h3>
                </div>
                <Badge color="green" variant="outline" className="text-[8px]">LIVE_DATA</Badge>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-bg-primary/30 border border-border-subtle/70 rounded-lg max-h-[500px] overflow-y-auto">
                  <MarkdownRenderer content={readme} />
                </div>
                
                <div className="p-3 bg-bg-primary/10 border border-border-subtle/40 rounded-lg font-mono text-[9px] text-text-secondary leading-relaxed flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent-cyan" />
                  </div>
                  <div>
                    <span className="text-accent-cyan font-bold block mb-0.5">EXTENSION_SLOT: AGENTIC_COMPATIBILITY</span>
                    <span>This raw README stream is exposed inside the portfolio. In Phase 4, the ORACLE system will build vector embeddings of these markdown nodes to permit natural language queries on repository codebase contexts.</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Repository Intelligence Analysis */}
            <Card hoverable={false} className="border-accent-purple/15 bg-bg-panel/60">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle/40 pb-2 select-none">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent-purple" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary">
                    DETERMINISTIC_REPOSITORIES_INTELLIGENCE
                  </h3>
                </div>
                <Badge color="purple" variant="outline" className="text-[8px]">STATIC_ANALYSIS</Badge>
              </div>

              <div className="space-y-4">
                {/* Type & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-bg-primary/30 border border-border-subtle p-3 rounded-lg text-xs">
                    <span className="text-text-secondary block font-mono text-[9px] uppercase mb-1">PROJECT_TYPE:</span>
                    <span className="text-text-primary font-bold">{intelligence.projectType}</span>
                  </div>
                  <div className="bg-bg-primary/30 border border-border-subtle p-3 rounded-lg text-xs">
                    <span className="text-text-secondary block font-mono text-[9px] uppercase mb-1">PROJECT_CATEGORY:</span>
                    <span className="text-accent-purple font-bold">{intelligence.projectCategory}</span>
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <span className="text-text-secondary block font-mono text-[9px] uppercase mb-1.5">DETECTED_TECHNOLOGIES:</span>
                  <div className="flex flex-wrap gap-1">
                    {intelligence.technologies.map(tech => (
                      <Badge key={tech} color="cyan" className="text-[9px]">{tech}</Badge>
                    ))}
                  </div>
                </div>

                {/* Key Concepts */}
                <div>
                  <span className="text-text-secondary block font-mono text-[9px] uppercase mb-1.5 font-bold">CORE_ARCHITECTURAL_CONCEPTS:</span>
                  <ul className="space-y-1 bg-bg-primary/20 p-3 border border-border-subtle/60 rounded-lg">
                    {intelligence.keyConcepts.map((concept, cidx) => (
                      <li key={cidx} className="flex items-center gap-2 text-xs text-text-secondary">
                        <Sparkles className="w-3.5 h-3.5 text-accent-purple flex-shrink-0" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Complexity Indicators */}
                <div>
                  <span className="text-text-secondary block font-mono text-[9px] uppercase mb-1.5 font-bold">COMPLEXITY_INDICATORS:</span>
                  <div className="space-y-1">
                    {intelligence.complexityIndicators.map((indicator, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-bg-primary/30 border border-border-subtle/60 rounded text-xs font-mono text-text-secondary">
                        <span>{indicator}</span>
                        <Badge color="purple" variant="outline" className="text-[8px] scale-90">VERIFIED</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity Level */}
                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30 text-xs font-mono">
                  <span className="text-text-secondary">REPO_ACTIVITY_METRIC:</span>
                  <span className={`font-bold ${
                    intelligence.activityLevel === 'High' 
                      ? 'text-success-green' 
                      : intelligence.activityLevel === 'Medium' 
                      ? 'text-accent-cyan' 
                      : 'text-text-secondary'
                  }`}>
                    {intelligence.activityLevel.toUpperCase()}
                  </span>
                </div>

                {/* AI integration point notice */}
                <div className="p-3 bg-accent-purple/5 border border-accent-purple/20 rounded-lg font-mono text-[9px] text-text-secondary leading-relaxed flex gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5 text-accent-purple" />
                  </div>
                  <div>
                    <span className="text-accent-purple font-bold block mb-0.5">EXTENSION_SLOT: NEURAL_COMPLEXITY_SCAN</span>
                    <span>Deterministic telemetry matched successfully. In Phase 4, the ORACLE core will query active model channels to run structural AST analyses and estimate total developer hours.</span>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Sidebar Area (1 Col) */}
          <div className="space-y-6">
            
            {/* Datetime Telemetry */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary mb-4 border-b border-border-subtle/40 pb-2 flex items-center gap-2 select-none">
                <Calendar className="w-4 h-4 text-accent-cyan" /> Datetime Telemetry
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-text-secondary block mb-0.5">CREATED_ON:</span>
                  <span className="text-text-primary font-bold">{createdDate}</span>
                </div>
                <div>
                  <span className="text-text-secondary block mb-0.5">LAST_PUSH_UPDATED:</span>
                  <span className="text-text-primary font-bold">{updatedDate}</span>
                </div>
              </div>
            </Card>

            {/* ORACLE Dialogue Console (Extension Point) */}
            <Card hoverable={false} className="border-border-bright/20 bg-bg-panel/90">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle/40 pb-2 select-none">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-text-primary animate-pulse" />
                  <h3 className="text-xs font-mono uppercase tracking-widest text-text-primary">
                    ORACLE_DIALOGUE_PORTAL
                  </h3>
                </div>
                <Badge color="default" variant="solid" className="text-[8px]">OFFLINE</Badge>
              </div>

              <form onSubmit={handleOracleSubmit} className="space-y-4">
                <span className="text-[10px] font-mono text-text-secondary block mb-1.5 uppercase leading-normal">
                  Inquire about this codebase (Extension Slot):
                </span>
                <input
                  type="text"
                  value={oracleQuery}
                  onChange={(e) => setOracleQuery(e.target.value)}
                  placeholder="Ask ORACLE about algorithms, imports..."
                  className="w-full bg-bg-primary border border-border-subtle p-2 rounded text-xs font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50"
                />
                <button
                  type="submit"
                  disabled={!oracleQuery.trim()}
                  className="w-full py-1.5 bg-bg-primary hover:bg-bg-panel border border-border-bright/25 hover:border-accent-cyan/40 text-text-primary font-mono text-[10px] rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  QUERY_ORACLE
                </button>

                {oracleResponse && (
                  <div className="p-3 bg-accent-cyan/5 border border-accent-cyan/25 rounded font-mono text-[10px] text-text-secondary leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 text-accent-cyan font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-accent-cyan" /> ORACLE_STATUS
                    </div>
                    <p className="whitespace-pre-line">{oracleResponse}</p>
                  </div>
                )}
              </form>
            </Card>

            {/* Local CLI Command Reference */}
            <Card hoverable={false}>
              <h3 className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-4 border-b border-border-subtle/40 pb-2 flex items-center gap-2 select-none">
                <Terminal className="w-4 h-4 text-accent-purple" /> Local CLI Console
              </h3>

              <div className="space-y-3.5 font-mono text-[10px]">
                <div>
                  <span className="text-text-secondary block mb-1">SHOW_DETAILS:</span>
                  <code className="text-accent-purple block bg-bg-primary/60 p-2 border border-border-subtle rounded">
                    multiverse repo show {repo.name}
                  </code>
                </div>
                <div>
                  <span className="text-text-secondary block mb-1">CLONE_REPOSITORY:</span>
                  <code className="text-accent-purple block bg-bg-primary/60 p-2 border border-border-subtle rounded">
                    multiverse repo clone {repo.name}
                  </code>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </Container>
    </div>
  );
}
