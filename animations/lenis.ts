// Config parameters for Lenis smooth scrolling integrations
export const lenisConfig = {
  duration: 1.1,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard fast-out-exponential-decay
  direction: 'vertical' as const,
  gestureDirection: 'vertical' as const,
  smooth: true,
  mouseMultiplier: 0.95,
  touchMultiplier: 1.5,
  infinite: false,
} as const;

export type LenisConfig = typeof lenisConfig;
