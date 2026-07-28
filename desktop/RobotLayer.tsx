'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { useReducedMotion } from '@/animations';

interface ScanNode {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

/**
 * RobotLayer renders active background web-agent interaction highlights overlays.
 * Simulates autonomous browser agents traversing coordinates and indexing telemetry assets.
 */
export function RobotLayer() {
  const shouldReduceMotion = useReducedMotion();
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanNodes, setScanNodes] = useState<ScanNode[]>([]);

  // Safely initialize nodes coordinates only on client-side mount to prevent SSR errors
  useEffect(() => {
    const calculateNodes = () => {
      setScanNodes([
        { x: 16, y: 16, width: 220, height: 40, label: 'INDEXING: branding_identity' },
        { x: window.innerWidth - 340, y: 80, width: 320, height: 75, label: 'SCANNING: telemetry_clock_widget' },
        { x: window.innerWidth - 340, y: 170, width: 320, height: 75, label: 'MONITORING: node_cpu_stats_widget' },
        { x: window.innerWidth / 2 - 190, y: window.innerHeight - 80, width: 380, height: 70, label: 'VALIDATING: app_shortcuts_dock' },
      ]);
    };

    calculateNodes();
    window.addEventListener('resize', calculateNodes);
    return () => window.removeEventListener('resize', calculateNodes);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion || scanNodes.length === 0) {
      if (shouldReduceMotion) setIsScanning(false);
      return;
    }

    // Cycle traversed targets every 4.5 seconds
    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % scanNodes.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, scanNodes.length]);

  const currentNode = scanNodes[activeNodeIndex];

  // Do not render loop if reduced motion is active or on server-side pre-render
  if (shouldReduceMotion || !isScanning || scanNodes.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
      
      {/* 1. STATEFUL SCANNING HIGHLIGHT TARGET BOUNDING BOX */}
      <AnimatePresence mode="wait">
        {currentNode && (
          <motion.div
            key={activeNodeIndex}
            initial={{ opacity: 0, x: currentNode.x, y: currentNode.y, width: 50, height: 50 }}
            animate={{ 
              opacity: [0.2, 0.7, 0.4], 
              x: currentNode.x, 
              y: currentNode.y, 
              width: currentNode.width, 
              height: currentNode.height 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="absolute border border-accent-cyan/30 bg-accent-cyan/2 shadow-sm rounded-lg flex flex-col justify-between p-1.5 box-border pointer-events-none"
          >
            {/* Top corner targets crosshairs */}
            <div className="flex justify-between w-full">
              <span className="w-1.5 h-1.5 border-t border-l border-accent-cyan/40" />
              <span className="w-1.5 h-1.5 border-t border-r border-accent-cyan/40" />
            </div>

            {/* Traversed Node Text Labels */}
            <div className="font-mono text-[7px] text-accent-cyan uppercase tracking-widest bg-bg-panel/90 border border-border-subtle/40 px-1.5 py-0.5 rounded self-center max-w-full truncate shadow-sm">
              {currentNode.label}
            </div>

            {/* Bottom corner targets crosshairs */}
            <div className="flex justify-between w-full">
              <span className="w-1.5 h-1.5 border-b border-l border-accent-cyan/40" />
              <span className="w-1.5 h-1.5 border-b border-r border-accent-cyan/40" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AGENT STATUS LIGHT BANNER (Bottom-Right Safe Area) */}
      <div className="absolute bottom-4 right-8 pointer-events-auto bg-bg-panel/85 border border-window-border backdrop-blur-md pl-2 pr-4 py-2 rounded-2xl flex items-center gap-3 select-none font-sans text-[10px] text-text-secondary shadow-lg z-50">
        
        {/* Animated Friendly Robot Companion SVG */}
        <div className="relative flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 transform hover:scale-110 transition-transform">
            {/* Ears / Antennas */}
            <path d="M6 8L4 5.5M18 8L20 5.5" stroke="#6A6D70" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="4" cy="5.5" r="1" fill="#E06A3F" />
            <circle cx="20" cy="5.5" r="1" fill="#E06A3F" />
            
            {/* Head */}
            <rect x="5" y="7" width="14" height="11" rx="4" fill="#FFFFFF" stroke="#6A6D70" strokeWidth="1.5" />
            
            {/* Eyes Display Screen */}
            <rect x="8" y="10" width="8" height="4" rx="1.5" fill="#2B2D2F" />
            <circle cx="10" cy="12" r="0.75" fill="#E06A3F" className="animate-pulse" />
            <circle cx="14" cy="12" r="0.75" fill="#E06A3F" className="animate-pulse" />
            
            {/* Smile Mouth */}
            <path d="M10 15C10.5 15.5 11.2 15.7 12 15.7C12.8 15.7 13.5 15.5 14 15" stroke="#6A6D70" strokeWidth="1.2" strokeLinecap="round" />
            
            {/* Neck */}
            <rect x="11" y="18" width="2" height="1.5" fill="#E06A3F" stroke="#6A6D70" strokeWidth="1.5" />
          </svg>

          {/* Connected state ping light */}
          <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5 rounded-full bg-success-green">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75" />
          </span>
        </div>

        <div className="flex flex-col select-none leading-none">
          <span className="text-[8px] font-mono text-text-secondary/70 uppercase tracking-wider">Telemetry Companion</span>
          <span className="text-text-primary font-semibold text-[10px] mt-0.5 flex items-center gap-1">
            OS Helper <span className="text-accent-cyan animate-pulse">● Online</span>
          </span>
        </div>

        <span className="text-border-subtle">|</span>

        <button 
          title="Click to toggle scanner" 
          onClick={() => setIsScanning(!isScanning)} 
          className="pointer-events-auto cursor-pointer hover:text-text-primary text-text-secondary transition-colors focus:outline-none flex items-center justify-center p-0.5 rounded"
        >
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
        </button>
      </div>

    </div>
  );
}
export default RobotLayer;
