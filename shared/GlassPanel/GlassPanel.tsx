'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'thin' | 'medium' | 'thick';
  hoverable?: boolean;
  onClick?: () => void;
}

export function GlassPanel({
  children,
  className = '',
  intensity = 'medium',
  hoverable = false,
  onClick,
}: GlassPanelProps) {
  const intensityBgs = {
    thin: 'bg-bg-panel/30 border-border-subtle/30 backdrop-blur-sm',
    medium: 'bg-bg-panel/50 border-border-subtle/40 backdrop-blur-md',
    thick: 'bg-bg-panel/85 border-border-subtle/60 backdrop-blur-lg',
  };

  const hoverStyles = hoverable 
    ? 'hover:border-border-bright/80 hover:bg-bg-panel-hover/60 hover:-translate-y-0.5' 
    : '';

  const combinedStyles = `rounded-xl p-6 border transition-all duration-300 ${intensityBgs[intensity]} ${hoverStyles} ${className}`;

  if (onClick) {
    return (
      <motion.button
        whileHover={hoverable ? { scale: 1.01 } : undefined}
        whileTap={hoverable ? { scale: 0.99 } : undefined}
        onClick={onClick}
        className={`${combinedStyles} w-full text-left cursor-pointer`}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <div className={combinedStyles}>
      {children}
    </div>
  );
}
