'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  label: string;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  active?: boolean;
}

export function Chip({
  label,
  onClick,
  onDelete,
  className = '',
  active = false,
}: ChipProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono select-none transition-all duration-200 border';
  const stateStyles = active
    ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/45 shadow-[0_0_8px_rgba(0,242,254,0.1)]'
    : 'bg-bg-panel/40 text-text-secondary border-border-subtle hover:text-text-primary hover:border-border-bright hover:bg-bg-panel/85';

  const interactiveStyles = onClick ? 'cursor-pointer' : '';

  return (
    <span
      onClick={onClick}
      className={`${baseStyles} ${stateStyles} ${interactiveStyles} ${className}`}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-text-secondary hover:text-text-primary focus:outline-none p-0.5 rounded-full hover:bg-bg-primary/50 cursor-pointer"
          aria-label={`Remove tag ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
export default Chip;
