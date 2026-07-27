// Config variables and defaults for GSAP animations when integrated
export const gsapConfig = {
  defaults: {
    duration: 0.4,
    ease: 'power3.out',
  },
  terminalScan: {
    keyframes: [
      { opacity: 0.8 },
      { opacity: 1 },
      { opacity: 0.8 }
    ],
    duration: 0.15,
    repeat: -1,
    yoyo: true,
  },
  windowDockMinimize: {
    scale: 0.1,
    opacity: 0,
    y: 200,
    duration: 0.35,
    ease: 'back.in(1.5)',
  }
} as const;

export type GsapConfig = typeof gsapConfig;
