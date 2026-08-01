'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

/**
 * StatusBar simulates phone status indicators (battery, connectivity, carrier details)
 */
export function StatusBar() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-bg-panel/80 border-b border-border-subtle/25 backdrop-blur-md px-5 py-1.5 flex justify-between items-center text-[10px] font-sans font-medium text-text-secondary select-none z-[100] h-9">
      {/* Clock */}
      <span className="font-semibold text-text-primary tracking-tight">
        {time}
      </span>

      {/* Carrier Name */}
      <span className="text-[9px] uppercase tracking-wider font-mono text-text-secondary/70">
        Suraj.OS Mobile
      </span>

      {/* Right Icons */}
      <div className="flex items-center gap-1.5 font-sans font-semibold">
        <Wifi className="w-3 h-3 text-text-secondary" />
        <span className="text-[9px] tracking-tight">5G</span>
        <span className="text-[9px] tracking-tight ml-0.5">98%</span>
        <Battery className="w-3.5 h-3.5 text-text-secondary -ml-0.5" />
      </div>
    </div>
  );
}

export default StatusBar;
