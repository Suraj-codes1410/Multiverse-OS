'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  Star, 
  GitFork, 
  ExternalLink, 
  Calendar, 
  Cpu, 
  BookOpen, 
  Terminal,
  AlertCircle
} from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { GitHubRepository } from '@/lib/types';

interface GithubRepoCardProps {
  repo: GitHubRepository;
}

export default function GithubRepoCard({ repo }: GithubRepoCardProps) {
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showReadmeSlot, setShowReadmeSlot] = useState(false);

  // Format the last updated date
  const updatedDate = new Date(repo.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Simple language color helper
  const getLanguageColor = (lang: string | null) => {
    if (!lang) return 'bg-text-secondary';
    switch (lang.toLowerCase()) {
      case 'java': return 'bg-red-500';
      case 'python': return 'bg-blue-500';
      case 'go': return 'bg-cyan-500';
      case 'rust': return 'bg-orange-500';
      case 'typescript': return 'bg-indigo-500';
      case 'javascript': return 'bg-yellow-500';
      case 'html': return 'bg-rose-500';
      case 'css': return 'bg-purple-500';
      case 'c++': return 'bg-pink-500';
      case 'c': return 'bg-gray-500';
      default: return 'bg-accent-cyan';
    }
  };

  return (
    <Card hoverable={true} className="flex flex-col justify-between h-full p-5 border border-border-subtle bg-bg-panel/40">
      <div>
        {/* Repo Header */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-accent-cyan flex-shrink-0" />
            <h3 className="text-sm font-bold text-text-primary hover:text-accent-cyan transition-colors truncate max-w-[200px]" title={repo.name}>
              {repo.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-text-secondary select-none">
            <span className="flex items-center gap-0.5" title={`${repo.starsCount} stars`}>
              <Star className="w-3.5 h-3.5" /> {repo.starsCount}
            </span>
            <span className="flex items-center gap-0.5" title={`${repo.forksCount} forks`}>
              <GitFork className="w-3.5 h-3.5" /> {repo.forksCount}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-3 min-h-[48px]">
          {repo.description || 'No description provided.'}
        </p>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {repo.topics.slice(0, 4).map((topic) => (
              <Badge key={topic} color="default" className="text-[9px] py-0">
                {topic}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        {/* Languages, Date, Link */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle/30 text-[10px] font-mono text-text-secondary select-none">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
            <span className="text-text-primary">{repo.language || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Updated: {updatedDate}</span>
          </div>
        </div>

        {/* Extension Points Row */}
        <div className="mt-3 pt-3 border-t border-border-subtle/20 flex flex-col gap-2">
          {/* CLI equivalent integration slot */}
          <div className="flex items-center justify-between text-[9px] font-mono text-text-secondary/70">
            <span>CLI_COMMAND:</span>
            <code className="text-accent-purple">multiverse repo {repo.name}</code>
          </div>

          <div className="flex gap-2">
            {/* README inspection extension slot */}
            <button
              onClick={() => {
                setShowReadmeSlot(!showReadmeSlot);
                setShowIntelligence(false);
              }}
              className={`flex-1 py-1 px-1.5 rounded border border-border-subtle transition-all font-mono text-[9px] flex items-center justify-center gap-1 focus:outline-none ${
                showReadmeSlot
                  ? 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan'
                  : 'bg-bg-primary/20 hover:bg-bg-panel hover:text-accent-cyan text-text-secondary'
              }`}
            >
              <BookOpen className="w-3 h-3" /> README_PREVIEW
            </button>

            {/* AI intelligence extension slot */}
            <button
              onClick={() => {
                setShowIntelligence(!showIntelligence);
                setShowReadmeSlot(false);
              }}
              className={`flex-1 py-1 px-1.5 rounded border border-border-subtle transition-all font-mono text-[9px] flex items-center justify-center gap-1 focus:outline-none ${
                showIntelligence
                  ? 'bg-accent-purple/10 border-accent-purple/30 text-accent-purple'
                  : 'bg-bg-primary/20 hover:bg-bg-panel hover:text-accent-cyan text-text-secondary'
              }`}
            >
              <Cpu className="w-3 h-3" /> AI_METRICS
            </button>

            {/* External Repo Link */}
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-2 rounded border border-border-subtle bg-bg-primary/20 hover:bg-bg-panel hover:text-accent-cyan text-text-secondary transition-all flex items-center justify-center flex-shrink-0"
              title="Open GitHub Repository"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Interactive Extension Content (mocked / offline warnings) */}
          {showReadmeSlot && (
            <div className="p-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded font-mono text-[9px] text-text-secondary leading-normal space-y-1">
              <div className="flex items-center gap-1 text-accent-cyan font-bold">
                <Terminal className="w-3 h-3" /> README_PARSER_OFFLINE
              </div>
              <p>Markdown parsing pipeline ready. Extension point enabled in <code>lib/github/readme.ts</code>. Local cache file slot prepared.</p>
            </div>
          )}

          {showIntelligence && (
            <div className="p-2 bg-accent-purple/5 border border-accent-purple/20 rounded font-mono text-[9px] text-text-secondary leading-normal space-y-1">
              <div className="flex items-center gap-1 text-accent-purple font-bold">
                <AlertCircle className="w-3 h-3" /> COGNITIVE_ANALYSIS_LOCKED
              </div>
              <p>Complexity index, code health audits, and developer metrics will load via LLM embeddings in the next phase.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
