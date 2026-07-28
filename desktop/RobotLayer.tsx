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

export function RobotLayer() {
  const shouldReduceMotion = useReducedMotion();
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanNodes, setScanNodes] = useState<ScanNode[]>([]);

  // Robot reactions & immersion states
  const [companionStatus, setCompanionStatus] = useState<'idle' | 'scanning' | 'thinking' | 'excited'>('scanning');
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [blink, setBlink] = useState(false);

  // Periodical eye-blinking animation loops
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  // Safely initialize nodes coordinates on client-side mount
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

  // Cyclic traversal path
  useEffect(() => {
    if (shouldReduceMotion || scanNodes.length === 0 || !isScanning) {
      return;
    }

    const interval = setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % scanNodes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [shouldReduceMotion, scanNodes.length, isScanning]);

  // Global app launch & Oracle reactions hooks
  useEffect(() => {
    const handleLaunch = (e: Event) => {
      const appId = (e as CustomEvent).detail;
      setCompanionStatus('excited');
      setBubbleText(`Launching ${appId}... Loading assets!`);
      
      setTimeout(() => {
        setCompanionStatus('scanning');
        setBubbleText(null);
      }, 3500);
    };

    const handleOracleQuery = () => {
      setCompanionStatus('thinking');
      setBubbleText("Traversing knowledge graph...");
      
      setTimeout(() => {
        setCompanionStatus('scanning');
        setBubbleText(null);
      }, 4000);
    };

    window.addEventListener('launchApp', handleLaunch);
    window.addEventListener('oracleQuery', handleOracleQuery);

    return () => {
      window.removeEventListener('launchApp', handleLaunch);
      window.removeEventListener('oracleQuery', handleOracleQuery);
    };
  }, []);

  const currentNode = scanNodes[activeNodeIndex];

  // Do not render loop if reduced motion is active
  if (shouldReduceMotion) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
      
      {/* 1. STATEFUL SCANNING HIGHLIGHT TARGET BOUNDING BOX */}
      <AnimatePresence mode="wait">
        {isScanning && currentNode && (
          <motion.div
            key={activeNodeIndex}
            initial={{ opacity: 0, x: currentNode.x, y: currentNode.y, width: 50, height: 50 }}
            animate={{ 
              opacity: [0.15, 0.55, 0.25], 
              x: currentNode.x, 
              y: currentNode.y, 
              width: currentNode.width, 
              height: currentNode.height 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="absolute border border-accent-cyan/25 bg-accent-cyan/2 shadow-sm rounded-lg flex flex-col justify-between p-1.5 box-border pointer-events-none"
          >
            {/* Top corner targets crosshairs */}
            <div className="flex justify-between w-full">
              <span className="w-1.5 h-1.5 border-t border-l border-accent-cyan/35" />
              <span className="w-1.5 h-1.5 border-t border-r border-accent-cyan/35" />
            </div>

            {/* Traversed Node Text Labels */}
            <div className="font-mono text-[7px] text-accent-cyan uppercase tracking-widest bg-bg-panel/90 border border-border-subtle/40 px-1.5 py-0.5 rounded self-center max-w-full truncate shadow-sm">
              {currentNode.label}
            </div>

            {/* Bottom corner targets crosshairs */}
            <div className="flex justify-between w-full">
              <span className="w-1.5 h-1.5 border-b border-l border-accent-cyan/35" />
              <span className="w-1.5 h-1.5 border-b border-r border-accent-cyan/35" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. AGENT STATUS LIGHT BANNER (Bottom-Right Safe Area) */}
      <div className="absolute bottom-4 right-8 pointer-events-auto bg-bg-panel/90 border border-window-border backdrop-blur-md pl-3 pr-4 py-2.5 rounded-2xl flex items-center gap-3 select-none font-sans text-[10px] text-text-secondary shadow-lg z-50">
        
        {/* Animated Friendly Robot Companion SVG */}
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{
              y: [0, -2.5, 0],
              rotate: companionStatus === 'excited' ? [0, -5, 5, 0] : 0
            }}
            transition={{
              y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
              rotate: { duration: 0.5, repeat: 2 }
            }}
            className="relative"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="w-5.5 h-5.5 transform hover:scale-110 transition-transform">
              {/* Ears / Antennas */}
              <path d="M6 8L4 5.5M18 8L20 5.5" stroke="#6A6D70" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="4" cy="5.5" r="1" fill={companionStatus === 'excited' ? '#27c93f' : '#E06A3F'} />
              <circle cx="20" cy="5.5" r="1" fill={companionStatus === 'excited' ? '#27c93f' : '#E06A3F'} />
              
              {/* Head */}
              <rect x="5" y="7" width="14" height="11" rx="4" fill="#FFFFFF" stroke="#6A6D70" strokeWidth="1.5" />
              
              {/* Eyes Display Screen */}
              <rect x="8" y="10" width="8" height="4" rx="1.5" fill="#2B2D2F" />
              
              {/* Eye Left (ScaleY for Blinking) */}
              <motion.circle 
                cx="10" 
                cy="12" 
                r="0.75" 
                fill={companionStatus === 'thinking' ? '#a855f7' : '#E06A3F'}
                animate={{ scaleY: blink ? 0.1 : 1 }}
                transition={{ duration: 0.1 }}
              />
              {/* Eye Right (ScaleY for Blinking) */}
              <motion.circle 
                cx="14" 
                cy="12" 
                r="0.75" 
                fill={companionStatus === 'thinking' ? '#a855f7' : '#E06A3F'}
                animate={{ scaleY: blink ? 0.1 : 1 }}
                transition={{ duration: 0.1 }}
              />
              
              {/* Smile Mouth */}
              <path 
                d={companionStatus === 'thinking' 
                  ? "M10 15H14" 
                  : "M10 15C10.5 15.5 11.2 15.7 12 15.7C12.8 15.7 13.5 15.5 14 15"
                } 
                stroke="#6A6D70" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
              />
              
              {/* Neck */}
              <rect x="11" y="18" width="2" height="1.5" fill="#E06A3F" stroke="#6A6D70" strokeWidth="1.5" />
            </svg>
          </motion.div>

          {/* Connected state ping light */}
          <span className="absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5 rounded-full bg-success-green">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75" />
          </span>
        </div>

        {/* Speech Bubble popup */}
        <AnimatePresence>
          {bubbleText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: -38 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute left-0 px-2 py-1 rounded bg-[#0a0c16]/95 border border-accent-cyan/20 text-white text-[7px] font-mono whitespace-nowrap shadow-md pointer-events-none tracking-tight"
            >
              {bubbleText}
              <span className="absolute bottom-[-4px] left-4 border-4 border-transparent border-t-[#0a0c16]" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col select-none leading-none">
          <span className="text-[8px] font-mono text-text-secondary/70 uppercase tracking-wider">Telemetry Companion</span>
          <span className="text-text-primary font-semibold text-[10px] mt-0.5 flex items-center gap-1">
            OS Helper{' '}
            <span className={`animate-pulse ${
              companionStatus === 'thinking' ? 'text-accent-purple' : 
              companionStatus === 'excited' ? 'text-success-green' : 'text-accent-cyan'
            }`}>
              ● {companionStatus.toUpperCase()}
            </span>
          </span>
        </div>

        <span className="text-border-subtle">|</span>

        <button 
          title="Toggle companion scanner" 
          onClick={() => setIsScanning(!isScanning)} 
          className="pointer-events-auto cursor-pointer hover:text-text-primary text-text-secondary transition-colors focus:outline-none flex items-center justify-center p-0.5 rounded"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin-slow' : 'opacity-50'}`} />
        </button>
      </div>

    </div>
  );
}

export default RobotLayer;
