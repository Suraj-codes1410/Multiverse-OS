'use client';

import React from 'react';

/**
 * BottomNavigation displays touch-optimized navigation controls for small screens
 */
export function BottomNavigation() {
  return (
    <div className="w-full bg-bg-panel/90 border-t border-border-subtle/40 py-2.5 px-6 flex justify-around items-center select-none z-[100] h-16">
      <span className="text-xs font-mono text-accent-cyan font-bold cursor-pointer">CONSOLE</span>
      <span className="text-xs font-mono text-text-secondary hover:text-text-primary cursor-pointer">HOME</span>
      <span className="text-xs font-mono text-text-secondary hover:text-text-primary cursor-pointer">ORACLE</span>
    </div>
  );
}
export default BottomNavigation;
