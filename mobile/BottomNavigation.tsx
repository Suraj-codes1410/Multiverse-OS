'use client';

import React from 'react';
import { Home, Sparkles, Terminal } from 'lucide-react';
import { useNavigation } from './NavigationProvider';
import { motion } from 'framer-motion';

/**
 * BottomNavigation displays touch-optimized navigation controls for small screens
 */
export function BottomNavigation() {
  const { activeTab, setActiveTab, closeApp } = useNavigation();

  const navItems = [
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'home', label: 'Home', icon: Home },
    { id: 'oracle', label: 'Oracle', icon: Sparkles },
  ] as const;

  return (
    <nav className="w-full bg-bg-panel/90 border-t border-border-subtle/50 backdrop-blur-md pb-safe-bottom flex justify-around items-center select-none z-[100] h-16.5 shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (item.id === 'home') {
                closeApp();
              }
            }}
            className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none cursor-pointer group py-1"
            aria-label={`${item.label} screen`}
          >
            {/* Active background pill tracker */}
            {isActive && (
              <motion.div
                layoutId="mobileActiveTab"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="absolute inset-x-4 inset-y-1 bg-accent-cyan/8 rounded-xl z-0"
              />
            )}

            <div className="relative z-10 flex flex-col items-center gap-1 transition-transform group-active:scale-95 duration-100">
              <Icon
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive
                    ? 'text-accent-cyan'
                    : 'text-text-secondary group-hover:text-text-primary'
                }`}
              />
              <span
                className={`text-[9px] font-sans font-medium transition-colors duration-300 ${
                  isActive
                    ? 'text-accent-cyan'
                    : 'text-text-secondary group-hover:text-text-primary'
                }`}
              >
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNavigation;
