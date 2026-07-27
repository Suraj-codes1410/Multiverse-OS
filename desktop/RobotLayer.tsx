'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, RefreshCw } from 'lucide-react';
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
              opacity: [0.3, 0.9, 0.6], 
              x: currentNode.x, 
              y: currentNode.y, 
              width: currentNode.width, 
              height: currentNode.height 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="absolute border border-accent-purple/65 bg-accent-purple/5 shadow-[0_0_15px_rgba(168,85,247,0.15)] rounded-lg flex flex-col justify-between p-1.5 box-border"
          >
            {/* Top corner targets crosshairs */}
            <div className="flex justify-between w-full">
              <span className="w-1.5 h-1.5 border-t border-l border-accent-purple" />
              <span className="w-1.5 h-1.5 border-t border-r border-accent-purple" />
            </div>

            {/* Traversed Node Text Labels */}
            <div className="font-mono text-[7px] text-accent-purple uppercase tracking-widest bg-bg-primary/75 px-1.5 py-0.5 rounded self-center max-w-full truncate">
              {currentNode.label}
            </div>

            {/* Bottom corner targets crosshairs */}
            <div className="flex justify-between w-full">
              <span className="w-1.5 h-1.5 border-b border-l border-accent-purple" />
              <span className="w-1.5 h-1.5 border-b border-r border-accent-purple" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AGENT STATUS LIGHT BANNER (Bottom-Right Safe Area) */}
      <div className="absolute bottom-4 right-6 pointer-events-auto bg-bg-panel/40 border border-border-subtle/30 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 select-none font-mono text-[9px] text-text-secondary shadow-lg z-50">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-purple opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-purple" />
        </span>
        <Eye className="w-3.5 h-3.5 text-accent-purple" />
        <span className="text-[8px] uppercase tracking-wider hidden sm:inline">Agent Loop:</span>
        <span className="text-accent-purple font-bold uppercase tracking-wider animate-pulse">Running</span>
        <span className="text-text-secondary/30">|</span>
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
