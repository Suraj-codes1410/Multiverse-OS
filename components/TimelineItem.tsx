import React from 'react';

interface TimelineItemProps {
  year: string;
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
}

export default function TimelineItem({
  year,
  title,
  subtitle,
  description,
  bullets = [],
}: TimelineItemProps) {
  return (
    <div className="relative pl-8 pb-8 border-l border-border-subtle last:border-transparent last:pb-0">
      {/* Glowing timeline node */}
      <div className="absolute -left-[6.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-bg-primary border-2 border-accent-cyan shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
      
      {/* Timeline Metadata */}
      <div className="text-xs font-mono text-accent-cyan tracking-wider mb-1">
        {year}
      </div>
      
      {/* Header */}
      <h4 className="text-lg font-semibold text-text-primary">
        {title}
      </h4>
      <div className="text-xs font-mono text-accent-purple mb-3">
        {subtitle}
      </div>
      
      {/* Details */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3">
        {description}
      </p>
      
      {bullets.length > 0 && (
        <ul className="list-disc pl-5 text-xs text-text-secondary space-y-1.5">
          {bullets.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
