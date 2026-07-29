/**
 * Boot Phase State
 *
 * A lightweight module-level singleton that coordinates boot phase signals
 * across BootSequence (the overlay) and desktop shell components (MenuBar,
 * Dock, WidgetLayer, RobotLayer). Uses native CustomEvent so components can
 * subscribe without any global state library.
 *
 * Phase timeline (approximate):
 *   'idle'       - Before boot begins
 *   'logo'       - Logo visible, wallpaper blurred        ~0.3s
 *   'progress'   - Progress bar begins                    ~0.7s
 *   'messages'   - Initialization messages cycling        ~1.0s
 *   'reveal'     - Desktop elements animate in            ~2.5s
 *   'done'       - Overlay dissolved, desktop interactive ~4.2s
 */

export type BootPhase = 'idle' | 'logo' | 'progress' | 'messages' | 'reveal' | 'done';

const EVENT_NAME = 'multiverse-boot-phase';

let _currentPhase: BootPhase = 'idle';

/** Emit a new phase to all subscribers */
export function setBootPhase(phase: BootPhase) {
  _currentPhase = phase;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: phase }));
  }
}

/** Read the current phase synchronously */
export function getBootPhase(): BootPhase {
  return _currentPhase;
}

/** Subscribe to phase changes. Returns an unsubscribe function. */
export function onBootPhase(handler: (phase: BootPhase) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const listener = (e: Event) => handler((e as CustomEvent<BootPhase>).detail);
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

/** Check if a session boot has already occurred */
export function isReturningVisitor(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('multiverse_boot_completed') === 'true';
}

/** Mark this session as having completed the boot sequence */
export function markBootCompleted(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('multiverse_boot_completed', 'true');
  }
}

let _landingChoice: 'home' | 'terminal' = 'home';

export function getLandingChoice(): 'home' | 'terminal' {
  return _landingChoice;
}

export function setLandingChoice(choice: 'home' | 'terminal') {
  _landingChoice = choice;
}
