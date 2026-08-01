// Centralized animation timings, Cubic-Bezier easings, and standard spring models
export const motion = {
  duration: {
    fast: 0.2, // Tooltip toggles, visual state changes
    normal: 0.3, // Card hovers, slide-in transitions
    slow: 0.5, // Background layout fades, major transitions
    boot: 0.8, // Multi-step sequential overlay fades
  },
  ease: {
    easeOut: [0.16, 1, 0.3, 1], // Smooth UI responsiveness (custom cubic-bezier)
    easeInOut: [0.65, 0, 0.35, 1], // Slower acceleration/deceleration transitions
    linear: 'linear', // Rotating spinners or terminal scanners
  },
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  },
} as const;

export type MotionToken = typeof motion;
