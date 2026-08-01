'use client';

import React, { createContext, useContext, useState } from 'react';
import { useNavigation } from './NavigationProvider';

export interface GestureState {
  swipeDirection: 'left' | 'right' | 'none';
}

const GestureContext = createContext<GestureState>({ swipeDirection: 'none' });

export function GestureProvider({ children }: { children: React.ReactNode }) {
  const { activeAppId, closeApp } = useNavigation();
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setStartY(touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - startX;
    const diffY = touch.clientY - startY;

    // Detect left-edge swipe back gesture (Swipe right from the left edge < 50px)
    if (activeAppId && startX < 50 && diffX > 80 && Math.abs(diffY) < 45) {
      closeApp();
    }
  };

  return (
    <GestureContext.Provider value={{ swipeDirection: 'none' }}>
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full"
      >
        {children}
      </div>
    </GestureContext.Provider>
  );
}

export const useGesture = () => {
  const context = useContext(GestureContext);
  return context;
};
