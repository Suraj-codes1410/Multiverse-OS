import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'cyan' | 'purple' | 'green' | 'amber' | 'default';
  variant?: 'solid' | 'outline';
  className?: string;
}

export default function Badge({
  children,
  color = 'default',
  variant = 'outline',
  className = '',
}: BadgeProps) {
  const colorStyles = {
    cyan: {
      solid: 'bg-accent-cyan/15 text-accent-cyan border border-transparent',
      outline: 'border border-accent-cyan/30 text-accent-cyan bg-accent-cyan/5',
    },
    purple: {
      solid: 'bg-accent-purple/15 text-accent-purple border border-transparent',
      outline: 'border border-accent-purple/30 text-accent-purple bg-accent-purple/5',
    },
    green: {
      solid: 'bg-success-green/15 text-success-green border border-transparent',
      outline: 'border border-success-green/30 text-success-green bg-success-green/5',
    },
    amber: {
      solid: 'bg-warning-amber/15 text-warning-amber border border-transparent',
      outline: 'border border-warning-amber/30 text-warning-amber bg-warning-amber/5',
    },
    default: {
      solid: 'bg-border-subtle text-text-secondary border border-transparent',
      outline: 'border border-border-subtle text-text-secondary bg-bg-panel/40',
    },
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono tracking-wide ${colorStyles[color][variant]} ${className}`}>
      {children}
    </span>
  );
}
