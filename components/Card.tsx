'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  hoverable = true,
  glowOnHover = false,
  onClick,
}: CardProps) {
  const baseStyles =
    'bg-card-bg border border-border-subtle rounded-xl p-6 overflow-hidden transition-all duration-300 relative group shadow-sm';
  const hoverStyles = hoverable
    ? 'hover:border-border-bright hover:-translate-y-0.5 hover:shadow-md'
    : '';
  const glowStyles = glowOnHover
    ? 'hover:shadow-[0_0_20px_rgba(0,242,254,0.1)]'
    : '';

  const combinedStyles = `${baseStyles} ${hoverStyles} ${glowStyles} ${className}`;

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

  return <div className={combinedStyles}>{children}</div>;
}
