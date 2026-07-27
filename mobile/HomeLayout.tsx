'use client';

import React from 'react';

export interface HomeLayoutProps {
  children?: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-4">
      {children}
    </div>
  );
}
export default HomeLayout;
