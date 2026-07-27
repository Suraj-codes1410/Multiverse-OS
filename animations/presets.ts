import { Variants } from 'framer-motion';

// 1. Motion Presets
export const motionPresets: Record<string, Variants> = {
  fadeUp: {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.25 } }
  },
  fadeScale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }
  },
  listStagger: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  }
};

// 2. Hover Presets
export const hoverPresets = {
  scaleUp: {
    whileHover: { scale: 1.015, y: -2 },
    whileTap: { scale: 0.99 }
  },
  glowCyan: {
    whileHover: { boxShadow: '0 0 15px rgba(0, 242, 254, 0.25)', borderColor: 'rgba(0, 242, 254, 0.8)' },
    whileTap: { scale: 0.995 }
  },
  glowPurple: {
    whileHover: { boxShadow: '0 0 15px rgba(168, 85, 247, 0.25)', borderColor: 'rgba(168, 85, 247, 0.8)' },
    whileTap: { scale: 0.995 }
  }
} as const;

// 3. Window Frame Animations
export const windowAnimations: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.25, ease: 'easeInOut' } }
};

// 4. Oracle Sidebar Chat Animations
export const oracleAnimations = {
  chatBubble: {
    initial: { opacity: 0, scale: 0.85, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } }
  },
  drawerSlide: {
    initial: { x: '100%' },
    animate: { x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    exit: { x: '100%', transition: { duration: 0.25, ease: 'easeIn' } }
  },
  typingDot: {
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 0.6,
        repeat: -1,
        ease: 'easeInOut'
      }
    }
  }
} as const;

// 5. Active Agent Robot Visual Layers Animations
export const robotAnimations = {
  activeScan: {
    y: ['0%', '100%', '0%'],
    transition: {
      duration: 3,
      repeat: -1,
      ease: 'linear'
    }
  },
  statusPulse: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 2,
      repeat: -1,
      ease: 'easeInOut'
    }
  }
} as const;

// 6. Router Page Transitions
export const pageTransitions: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// 7. Mobile Viewports Touch Gestures Dragging Bounds
export const mobileGestures = {
  bottomSheetDrag: {
    drag: 'y' as const,
    dragConstraints: { top: 0, bottom: 400 },
    dragElastic: 0.1,
    dragMomentum: false
  },
  carouselSwipe: {
    drag: 'x' as const,
    dragConstraints: { left: -600, right: 0 },
    dragElastic: 0.15
  }
} as const;
