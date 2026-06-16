'use client';

import React, { useState, useMemo } from 'react';
import GithubRepoCard from './GithubRepoCard';
import { GitHubRepository } from '@/lib/types';
import { Search, SlidersHorizontal, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface GithubExplorerProps {
  repositories: GitHubRepository[];
}

type SortField = 'stars' | 'forks' | 'updated' | 'name';

export default function GithubExplorer({ repositories }: GithubExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [sortBy, setSortBy] = useState<SortField>('stars');
  const [semanticSearchActive, setSemanticSearchActive] = useState(false);
  const [showSemanticNotice, setShowSemanticNotice] = useState(false);

  // Compute languages dynamically from repos
  const languages = useMemo(() => {
    const list = new Set<string>();
    repositories.forEach(repo => {
      if (repo.language) {
        list.add(repo.language);
      }
    });
    return ['All', ...Array.from(list)];
  }, [repositories]);

  // Filter and sort repositories
  const filteredAndSortedRepos = useMemo(() => {
    let result = [...repositories];

    // Filter by Language
    if (selectedLanguage !== 'All') {
      result = result.filter(r => r.language?.toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Filter by Search Query (simple text search)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) || 
        (r.description && r.description.toLowerCase().includes(query)) ||
        r.topics.some(t => t.toLowerCase().includes(query))
      );
    }

    // Sort Repositories
    result.sort((a, b) => {
      if (sortBy === 'stars') {
        return b.starsCount - a.starsCount;
      }
      if (sortBy === 'forks') {
        return b.forksCount - a.forksCount;
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [repositories, selectedLanguage, searchQuery, sortBy]);

  const toggleSemanticSearch = () => {
    setSemanticSearchActive(!semanticSearchActive);
    if (!semanticSearchActive) {
      setShowSemanticNotice(true);
    } else {
      setShowSemanticNotice(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters Control Center */}
      <div className="flex flex-col gap-4 bg-bg-panel border border-border-subtle p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Search Bar Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={semanticSearchActive ? "Describe features, code patterns, or algorithms..." : "Search repositories by name, description, or topics..."}
              className="w-full bg-bg-primary border border-border-subtle p-2 pl-9 rounded-lg text-xs font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50"
            />
          </div>

          <div className="flex gap-2">
            {/* Semantic Search AI Toggle */}
            <button
              onClick={toggleSemanticSearch}
              className={`py-2 px-3 text-xs font-mono rounded-lg border flex items-center gap-1.5 transition-all focus:outline-none ${
                semanticSearchActive
                  ? 'text-accent-purple bg-accent-purple/10 border-accent-purple/30 font-bold shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                  : 'text-text-secondary border-border-subtle bg-bg-primary hover:text-text-primary'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              SEMANTIC_AI {semanticSearchActive ? '[ON]' : '[OFF]'}
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="bg-bg-primary border border-border-subtle p-2 pl-9 pr-8 rounded-lg text-xs font-mono text-text-primary appearance-none focus:outline-none focus:border-accent-cyan/50 cursor-pointer min-w-[150px]"
              >
                <option value="stars">SORT: STARS</option>
                <option value="forks">SORT: FORKS</option>
                <option value="updated">SORT: UPDATED</option>
                <option value="name">SORT: NAME</option>
              </select>
            </div>
          </div>
        </div>

        {/* Semantic Search Offline Notice */}
        {semanticSearchActive && showSemanticNotice && (
          <div className="p-3 bg-accent-purple/5 border border-accent-purple/20 rounded-lg font-mono text-xs text-text-secondary leading-relaxed flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-accent-purple" />
            </div>
            <div className="space-y-1">
              <div className="text-accent-purple font-bold">SEMANTIC_SEARCH_ENGINE_OFFLINE</div>
              <p>
                Embedding indices are not loaded. Standard textual filtration is currently active as a fallback. 
              </p>
              <p className="text-[10px] text-text-secondary/70">
                In Phase 4, this search gate will translate your prompt into vector embedding coordinates and run similarity scans against github repositories code trees.
              </p>
            </div>
          </div>
        )}

        {/* Language Category Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-subtle/30 select-none">
          <span className="text-[10px] font-mono text-text-secondary mr-2 uppercase">LANGUAGES:</span>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 text-[10px] font-mono rounded-md border transition-all focus:outline-none ${
                selectedLanguage === lang
                  ? 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary border-transparent'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results Telemetry Header */}
      <div className="flex items-center justify-between text-xs font-mono text-text-secondary select-none">
        <span>FETCHED_REPOSITORIES_STREAM: <strong className="text-accent-cyan">{filteredAndSortedRepos.length}</strong></span>
        <span>INDEXING_STATUS: <span className="text-success-green font-bold">STABLE</span></span>
      </div>

      {/* Grid of Repository Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedRepos.map((repo) => (
          <GithubRepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {filteredAndSortedRepos.length === 0 && (
        <div className="text-center py-20 bg-bg-panel border border-border-subtle/40 rounded-2xl text-text-secondary text-sm font-mono select-none">
          NO_REPOSITORIES_FOUND_MATCHING_CRITERIA
        </div>
      )}
    </div>
  );
}
