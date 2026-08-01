import React from 'react';

export interface ScrollbarProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function Scrollbar({
  children,
  className = '',
  maxHeight = '100%',
}: ScrollbarProps) {
  return (
    <div
      className={`overflow-y-auto overflow-x-hidden scrollbar-thin select-text ${className}`}
      style={{ maxHeight }}
    >
      {children}
    </div>
  );
}
export default Scrollbar;
