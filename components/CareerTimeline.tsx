'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Briefcase, 
  GraduationCap, 
  Flag, 
  ArrowRight,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import Card from './Card';
import Badge from './Badge';
import { TimelineMilestone } from '@/lib/types';

interface CareerTimelineProps {
  milestones: TimelineMilestone[];
}

export default function CareerTimeline({ milestones }: CareerTimelineProps) {
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Project', 'Hackathon', 'Achievement', 'Education'];

  // Sort milestones chronologically: newest to oldest
  const sortedMilestones = [...milestones].sort((a, b) => {
    return b.year.localeCompare(a.year) || b.id.localeCompare(a.id);
  });

  const filteredMilestones = selectedType === 'All'
    ? sortedMilestones
    : sortedMilestones.filter(m => m.type.toLowerCase() === selectedType.toLowerCase());

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'education':
        return <GraduationCap className="w-4.5 h-4.5 text-accent-cyan" />;
      case 'project':
        return <Briefcase className="w-4.5 h-4.5 text-success-green" />;
      case 'hackathon':
        return <Trophy className="w-4.5 h-4.5 text-warning-amber" />;
      case 'achievement':
        return <Award className="w-4.5 h-4.5 text-accent-purple" />;
      default:
        return <Flag className="w-4.5 h-4.5 text-text-primary" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'education':
        return 'cyan';
      case 'project':
        return 'green';
      case 'hackathon':
        return 'amber';
      case 'achievement':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-8">
      {/* Category/Type Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-4 select-none">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 text-xs font-mono rounded-lg transition-all focus:outline-none relative ${
              selectedType === type
                ? 'text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-panel/40 border border-transparent'
            }`}
          >
            {type.toUpperCase()}
            {selectedType === type && (
              <motion.span
                layoutId="activeTimelineTabGlow"
                className="absolute inset-0 rounded-lg shadow-[0_0_12px_rgba(0,242,254,0.15)] pointer-events-none"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-border-subtle/50 ml-4 pl-8 space-y-8 py-2">
        <AnimatePresence mode="popLayout">
          {filteredMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative group"
            >
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center shadow-sm group-hover:border-accent-cyan group-hover:shadow-[0_0_8px_rgba(0,242,254,0.3)] transition-all duration-300">
                {getIcon(milestone.type)}
              </div>

              {/* Card Container */}
              <Card hoverable={true} className="p-5 max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-text-secondary/60 font-semibold uppercase">
                      {milestone.date}
                    </span>
                    <Badge color={getBadgeColor(milestone.type)} variant="solid" className="text-[9px]">
                      {milestone.type.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-accent-purple font-semibold select-none">
                    {`// REF: ${milestone.id.toUpperCase()}`}
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-primary mb-2">
                  {milestone.title}
                </h3>
                
                <p className="text-sm text-text-secondary leading-relaxed font-sans font-light">
                  {milestone.description}
                </p>

                {milestone.relatedLink && (
                  <div className="mt-4 pt-3 border-t border-border-subtle/30 flex justify-end">
                    <Link
                      href={milestone.relatedLink}
                      className="inline-flex items-center gap-1 text-xs font-mono text-accent-cyan hover:text-text-primary transition-colors focus:outline-none"
                    >
                      EXPLORE_RECORD <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMilestones.length === 0 && (
        <div className="text-center py-12 text-text-secondary text-sm font-mono select-none">
          NO_TIMELINE_RECORDS_FOUND: {selectedType.toUpperCase()}
        </div>
      )}
    </div>
  );
}
