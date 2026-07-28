'use client';

import React, { useState, useEffect } from 'react';
import { useNavigation } from './NavigationProvider';
import { MobileHome } from './MobileHome';
import { 
  AboutAppContent, 
  ProjectsAppContent, 
  SkillsAppContent, 
  TimelineAppContent, 
  ResumeAppContent, 
  ContactAppContent, 
  ExplorerAppContent, 
  SettingsAppContent, 
  DashboardAppContent 
} from '@/desktop/WindowManager';
import CliTerminal from '@/components/CliTerminal';
import { ChevronLeft } from 'lucide-react';
import { Project } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export function HomeLayout() {
  const { activeTab, setActiveTab, activeAppId, closeApp } = useNavigation();
  
  // Dynamic stats telemetry states
  const [projects, setProjects] = useState<Project[]>([]);
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
        console.error("Failed to load projects dynamic data in mobile:", err);
      }
    };
    loadDynamicData();
    return () => {
      active = false;
    };
  }, []);

  // Back Button Header Wrapper for App Screen
  const renderAppWrapper = (title: string, content: React.ReactNode) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-bg-panel flex flex-col z-40 overflow-hidden"
      >
        {/* App Top Header Bar */}
        <header className="h-12 border-b border-border-subtle/30 px-4 flex items-center gap-2 select-none flex-shrink-0 bg-bg-panel/95 backdrop-blur-md">
          <button
            onClick={closeApp}
            className="p-1 -ml-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-panel-hover transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Go back to Home Screen"
          >
            <ChevronLeft className="w-5 h-5 text-accent-cyan" />
          </button>
          <span className="text-xs font-sans font-semibold tracking-tight text-text-primary">
            {title}
          </span>
        </header>

        {/* App Content Body */}
        <div className="flex-grow overflow-hidden flex flex-col relative bg-bg-panel">
          {content}
        </div>
      </motion.div>
    );
  };

  const renderActiveApp = () => {
    if (!activeAppId) return null;

    switch (activeAppId) {
      case 'about':
        return renderAppWrapper('About Suraj', <AboutAppContent />);
      case 'projects':
        return renderAppWrapper('Projects Explorer', <ProjectsAppContent projects={projects} />);
      case 'skills':
        return renderAppWrapper('Skills Matrix', <SkillsAppContent />);
      case 'timeline':
        return renderAppWrapper('Career Timeline', <TimelineAppContent />);
      case 'resume':
        return renderAppWrapper('Curriculum Vitae', <ResumeAppContent />);
      case 'contact':
        return renderAppWrapper('Contact Direct', <ContactAppContent />);
      case 'recruiter':
        return renderAppWrapper('Recruiter Dashboard', <DashboardAppContent projects={projects} />);
      case 'settings':
        return renderAppWrapper('Appearance Settings', <SettingsAppContent />);
      case 'explorer':
        return renderAppWrapper('File System Explorer', <ExplorerAppContent repos={repos} loading={loading} />);
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-text-secondary select-none font-mono">
            <span className="text-xs text-accent-cyan mb-2">{`[APP: ${activeAppId.toUpperCase()}]`}</span>
            <p className="text-xs">Under construction. Placeholders ready.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-grow w-full relative overflow-hidden bg-bg-primary flex flex-col">
      
      {/* 1. Terminal screen overlay (as tab) */}
      <AnimatePresence>
        {activeTab === 'terminal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#030407]"
          >
            <CliTerminal isOpen={true} onClose={() => setActiveTab('home')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Launcher & Apps Overlay switcher */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' && !activeAppId && (
          <motion.div
            key="mobile-home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col"
          >
            <MobileHome />
          </motion.div>
        )}

        {activeTab === 'home' && activeAppId && (
          <div key="mobile-app" className="absolute inset-0">
            {renderActiveApp()}
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

export default HomeLayout;
