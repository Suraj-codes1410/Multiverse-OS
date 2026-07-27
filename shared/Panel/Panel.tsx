import React from 'react';

export interface PanelProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export function Panel({
  children,
  className = '',
  border = true,
}: PanelProps) {
  const borderStyles = border ? 'border border-border-subtle' : '';
  return (
    <div className={`bg-bg-panel rounded-xl p-6 ${borderStyles} ${className}`}>
      {children}
    </div>
  );
}
