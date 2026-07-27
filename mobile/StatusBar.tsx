'use client';

import React from 'react';

/**
 * StatusBar simulates phone status indicators (battery, connectivity, carrier details)
 */
export function StatusBar() {
  return (
    <div className="w-full bg-bg-panel/85 border-b border-border-subtle/30 px-4 py-1.5 flex justify-between items-center text-[10px] font-mono text-text-secondary select-none">
      <span>MULTIVERSE MOBILE</span>
      <div className="flex items-center gap-2">
        <span>5G</span>
        <span>100%</span>
      </div>
    </div>
  );
}
export default StatusBar;
