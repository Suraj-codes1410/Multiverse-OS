'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface WindowHeaderProps {
  title: string;
  statusText?: string;
  statusColor?: 'cyan' | 'purple' | 'green' | 'amber' | 'default';
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function WindowHeader({
  title,
  statusText,
  statusColor = 'default',
  onClose,
  children,
  className = '',
}: WindowHeaderProps) {
  const colorClasses = {
    cyan: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    purple: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
    green: 'text-success-green bg-success-green/10 border-success-green/20',
    amber: 'text-warning-amber bg-warning-amber/10 border-warning-amber/20',
    default: 'text-text-secondary bg-bg-panel/40 border-border-subtle/50',
  };

  return (
    <div className={`border-b border-border-subtle bg-bg-panel/90 px-4 py-3 flex items-center justify-between font-mono text-xs select-none ${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-text-primary tracking-wide">{title}</span>
        {statusText && (
          <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[9px] uppercase tracking-tighter ${colorClasses[statusColor]}`}>
            <span className="flex h-1 w-1 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
              <span className="relative inline-flex rounded-full h-1 w-1 bg-current" />
            </span>
            {statusText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors focus:outline-none p-1 rounded-md hover:bg-bg-primary/50 cursor-pointer"
            aria-label="Close panel window"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
