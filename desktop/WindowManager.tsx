'use client';

import React from 'react';

export interface WindowManagerProps {
  children?: React.ReactNode;
}

export function WindowManager({ children }: WindowManagerProps) {
  return (
    <div className="relative w-full h-full overflow-hidden pointer-events-none">
      {children}
    </div>
  );
}
