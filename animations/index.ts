// Centralized animation presets and scrolls config wrappers
export { gsapConfig } from './gsap';
export type { GsapConfig } from './gsap';

export { lenisConfig } from './lenis';
export type { LenisConfig } from './lenis';

export { useReducedMotion } from './reducedMotion';

export {
  motionPresets,
  hoverPresets,
  windowAnimations,
  oracleAnimations,
  robotAnimations,
  pageTransitions,
  mobileGestures,
} from './presets';

// Backward compatibility helper
export const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 15 },
  transition: { duration: 0.5 }
} as const;

export const hoverScale = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.99 }
} as const;
