'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Terminal,
  Sparkles,
  User,
  Briefcase,
  Compass,
  Calendar,
  FileText,
  Mail,
  Settings,
  ShieldAlert,
  Folder,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Static Search Target Data
import projectsData from '@/data/projects.json';
import skillsData from '@/data/skills.json';

interface SearchResultItem {
  id: string;
  type: 'app' | 'project' | 'skill' | 'action';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function SpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle state
  const toggleSearch = () => {
    setIsOpen((prev) => !prev);
    setQuery('');
    setActiveIndex(0);
  };

  // Keyboard shortcut hook
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Toggle on Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Dispatches global app launch events to decouple Desktop vs Mobile handlers
  const triggerAppLaunch = (appId: string) => {
    window.dispatchEvent(new CustomEvent('launchApp', { detail: appId }));
    setIsOpen(false);
  };

  // Registry of Search Targets
  const searchPool = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Applications
    const apps = [
      {
        id: 'home',
        title: 'Profile Home',
        subtitle: 'View core biography and greeting panel',
        icon: User,
      },
      {
        id: 'projects',
        title: 'Projects Explorer',
        subtitle: 'Search and inspect software projects',
        icon: Briefcase,
      },
      {
        id: 'skills',
        title: 'Skills Matrix',
        subtitle: 'Inspect tech stack relationships',
        icon: Compass,
      },
      {
        id: 'timeline',
        title: 'Career Timeline',
        subtitle: 'Browse history milestones',
        icon: Calendar,
      },
      {
        id: 'resume',
        title: 'Curriculum Vitae',
        subtitle: "Download Suraj's technical resume",
        icon: FileText,
      },
      {
        id: 'contact',
        title: 'Contact Direct',
        subtitle: 'Send a message to Suraj',
        icon: Mail,
      },
      {
        id: 'recruiter',
        title: 'Recruiter Dashboard',
        subtitle: 'Availability and HR match tools',
        icon: ShieldAlert,
      },
      {
        id: 'explorer',
        title: 'File System Explorer',
        subtitle: 'Browse codebase folders',
        icon: Folder,
      },
      {
        id: 'terminal',
        title: 'CLI Terminal',
        subtitle: 'Open standard Unix command terminal',
        icon: Terminal,
      },
      {
        id: 'oracle',
        title: 'Oracle AI Chat',
        subtitle: 'Initiate narrative conversation',
        icon: Sparkles,
      },
      {
        id: 'settings',
        title: 'System Settings',
        subtitle: 'Change themes and appearance settings',
        icon: Settings,
      },
    ];

    apps.forEach((app) => {
      items.push({
        id: app.id,
        type: 'app',
        title: app.title,
        subtitle: app.subtitle,
        icon: app.icon,
        action: () => triggerAppLaunch(app.id),
      });
    });

    // 2. Projects Data
    projectsData.forEach((proj) => {
      items.push({
        id: proj.id,
        type: 'project',
        title: proj.title,
        subtitle: `Project // ${proj.subtitle}`,
        icon: Briefcase,
        action: () => {
          triggerAppLaunch('projects');
          // Dispatch micro project open transition
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent('openProjectDetail', { detail: proj.id })
            );
          }, 150);
        },
      });
    });

    // 3. Skills Data
    skillsData.forEach((skill) => {
      items.push({
        id: skill.name,
        type: 'skill',
        title: skill.name,
        subtitle: `Skill // Category: ${skill.category}`,
        icon: Compass,
        action: () => {
          triggerAppLaunch('skills');
          // Optional search hook
        },
      });
    });

    return items;
  }, []);

  // Filter Results
  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchPool.slice(0, 7); // Show top 7 default apps if input empty

    const cleanQuery = query.toLowerCase().trim();
    return searchPool
      .filter(
        (item) =>
          item.title.toLowerCase().includes(cleanQuery) ||
          item.subtitle.toLowerCase().includes(cleanQuery)
      )
      .slice(0, 9); // Cap at 9 results for layout stability
  }, [query, searchPool]);

  // Navigate index
  useEffect(() => {
    if (activeIndex >= filteredResults.length) {
      setActiveIndex(Math.max(0, filteredResults.length - 1));
    }
  }, [filteredResults, activeIndex]);

  // Handle keyboard list selectors
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + filteredResults.length) % filteredResults.length
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[activeIndex]) {
        filteredResults[activeIndex].action();
      }
    }
  };

  // Close when clicking outside modal bounds
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9995] flex items-start justify-center pt-24 px-4 bg-black/35 backdrop-blur-sm pointer-events-auto select-none">
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg bg-window-bg border border-window-border rounded-2xl shadow-2xl flex flex-col overflow-hidden box-border"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle/40 bg-bg-panel/20 select-none flex-shrink-0">
              <Search className="w-4 h-4 text-text-secondary/70 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search apps, projects, skills..."
                className="flex-grow bg-transparent border-none text-text-primary placeholder:text-text-secondary/40 text-xs focus:outline-none font-sans"
              />
              <span className="text-[8px] font-mono bg-bg-panel-hover border border-border-subtle/50 px-2 py-0.5 rounded text-text-secondary/60">
                ESC CLOSE
              </span>
            </div>

            {/* Results Grid List */}
            <div className="max-h-[320px] overflow-y-auto p-2 flex flex-col gap-0.5 scrollbar-thin select-none">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeIndex === idx;

                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border select-none ${
                        isActive
                          ? 'bg-accent-cyan/10 border-accent-cyan/15 text-accent-cyan'
                          : 'bg-transparent border-transparent text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`p-1.5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                            isActive
                              ? 'bg-accent-cyan/10 border-accent-cyan/20'
                              : 'bg-bg-panel/30 border-border-subtle/50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col truncate leading-tight">
                          <span
                            className={`text-xs font-sans font-medium ${isActive ? 'text-accent-cyan' : 'text-text-primary'}`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono opacity-65 truncate mt-0.5">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Right selection badge indicator */}
                      {isActive && (
                        <span className="text-[8px] font-mono bg-accent-cyan/15 border border-accent-cyan/20 px-1.5 py-0.5 rounded uppercase font-semibold flex-shrink-0 tracking-wider">
                          Execute ↵
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center font-mono text-[10px] text-text-secondary select-none">
                  NO_RECORDS_FOUND // CLASSIFIED
                </div>
              )}
            </div>

            {/* Bottom Keyboard Guide */}
            <footer className="px-4 py-2 border-t border-border-subtle/20 bg-bg-panel/10 flex justify-between items-center text-[8px] font-mono text-text-secondary/50 select-none">
              <span>↑↓ NAVIGATE</span>
              <span>ENTER SELECT</span>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SpotlightSearch;
