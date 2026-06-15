'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '@/components/Container';
import SkillCard from '@/components/SkillCard';
import { Skill } from '@/lib/types';

interface SkillsDashboardProps {
  skills: Skill[];
  projectMap: Record<string, string>;
}

export default function SkillsDashboard({ skills, projectMap }: SkillsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Backend',
    'AI / ML',
    'Database',
    'Cloud',
    'Tools',
    'Frontend'
  ];

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter(skill => skill.category === selectedCategory);

  return (
    <div className="flex-grow py-8">
      <Container>
        {/* Page Header */}
        <div className="border-b border-border-subtle pb-6 mb-10">
          <p className="text-xs font-mono text-accent-cyan tracking-widest uppercase mb-2">
            CAPABILITY_DIRECTORY
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Technical Skills
          </h1>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-border-subtle pb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-all focus:outline-none relative ${
                selectedCategory === category
                  ? 'text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel/40 border border-transparent'
              }`}
            >
              {category.toUpperCase()}
              {selectedCategory === category && (
                <motion.span
                  layoutId="activeTabGlow"
                  className="absolute inset-0 rounded-lg shadow-[0_0_12px_rgba(0,242,254,0.15)] pointer-events-none"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                key={skill.name}
              >
                <SkillCard skill={skill} projectMap={projectMap} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-20 text-text-secondary text-sm font-mono">
            NO_SKILLS_FOUND_FOR_CATEGORY: {selectedCategory.toUpperCase()}
          </div>
        )}
      </Container>
    </div>
  );
}
