'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface WindowFrameProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple' | 'none';
  isOpen?: boolean;
}

export function WindowFrame({
  children,
  className = '',
  glowColor = 'none',
  isOpen = true,
}: WindowFrameProps) {
  if (!isOpen) return null;

  const glowStyles = {
    cyan: 'shadow-[0_0_20px_rgba(0,242,254,0.15)] border-accent-cyan/20',
    purple: 'shadow-[0_0_24px_rgba(168,85,247,0.25)] border-accent-purple/20',
    none: 'shadow-2xl border-border-subtle',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 15 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col bg-bg-panel/95 border rounded-xl overflow-hidden pointer-events-auto h-[550px] max-h-[85vh] ${glowStyles[glowColor]} ${className}`}
      role="dialog"
    >
      {children}
    </motion.div>
  );
}
