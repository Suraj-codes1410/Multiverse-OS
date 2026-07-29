# BOOT_EXPERIENCE.md — Multiverse OS Phase 6.5

## Overview

The boot experience is not a loading screen. It is the operating system waking up.

The user should feel like they are powering on a beautifully designed OS for the first time — calm, elegant, intentional.

Design references: Nothing OS · Apple VisionOS · macOS Startup · Linear

---

## Design Philosophy

> "The desktop already exists. The boot screen simply reveals it."

- The actual desktop wallpaper is used as the boot background
- It begins blurred, darkened, and desaturated
- CSS filters are gradually removed so the wallpaper naturally becomes the desktop
- No separate loading graphic. No neon. No lens flare. No cyberpunk.
- Everything is editorial, warm, minimal.

---

## Component Hierarchy

```
app/layout.tsx
└── BootSequence              ← Overlay (z-9999), dissolves when done
    ├── Wallpaper layer        ← CSS filter-blurred reproduction of desktop bg
    ├── Logo                   ← "MULTIVERSE // OS" in Inter thin/bold
    ├── Subtitle               ← "Personal Operating System"
    ├── Divider                ← 1px warm gray line
    ├── Init message           ← Single fading message (aria-live)
    └── Progress line          ← Thin 1px terracotta fill, bottom-center

SharedLayout
└── DesktopShell
    ├── MenuBar                ← Fades in at ~2.5s (100ms after 'reveal')
    ├── Wallpaper              ← Always rendered underneath overlay
    ├── WidgetLayer            ← Fades in at ~3.0s (500ms after 'reveal')
    ├── WindowManager          ← Home window opens at ~4.2s ('done' + 200ms)
    ├── Dock                   ← Slides up 20px + fades at ~2.8s (300ms after 'reveal')
    ├── OracleLayer            ← Not part of boot sequence
    └── RobotLayer             ← Fades in last at ~3.5s (1000ms after 'reveal')
```

---

## State Machine

```
'idle'      → Component mounted, not yet started
'logo'      → Logo fades in, wallpaper begins revealing  (0.3s)
'progress'  → Progress line appears                       (0.7s)
'messages'  → Initialization messages cycling            (1.0s)
'reveal'    → Desktop shell components animate in        (2.5s)
'dissolve'  → Overlay fades out                          (4.2s)
'done'      → BootSequence returns null, Home opens      (4.9s)
```

Phase is broadcast via `lib/bootPhase.ts` using native `CustomEvent` on `window`.

---

## Animation Timeline

| Time  | Event |
|-------|-------|
| 0.0s  | Wallpaper visible but blurred (blur: 20px, brightness: 0.72, saturation: 0.35) |
| 0.3s  | Logo + subtitle fade in (opacity + translateY 8px → 0) |
| 0.7s  | Progress line appears |
| 1.0s  | Initialization messages begin cycling |
| 2.5s  | `bootPhase → 'reveal'` dispatched |
| 2.6s  | MenuBar fades in (100ms offset) |
| 2.8s  | Dock slides up + fades in (300ms offset) |
| 3.0s  | WidgetLayer fades in (500ms offset) |
| 3.5s  | RobotLayer fades in (1000ms offset) |
| 3.8s  | Progress snaps to 100% |
| 4.2s  | Overlay dissolves (700ms fade) |
| 4.4s  | `bootPhase → 'done'` dispatched |
| 4.6s  | Home window opens (200ms after 'done') |

---

## Returning Visitor Optimization

Detected via `sessionStorage.getItem('multiverse_boot_completed') === 'true'`.

Shortened timeline (800–1200ms total):

```
0.1s  → Logo appears
0.4s  → Progress begins
0.6s  → "Initializing..." message
0.9s  → "Workspace Ready."
1.2s  → Dissolve + desktop reveals instantly
```

All component delays set to 0ms for returning visitors.

---

## Motion Specifications

| Property | Value |
|----------|-------|
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` (easeOutCubic) |
| Logo entrance | opacity 0→1, translateY 8px→0, 600ms |
| MenuBar reveal | opacity 0→1, 500ms |
| Dock reveal | opacity 0→1, translateY 20px→0, 500–600ms |
| WidgetLayer reveal | opacity 0→1, 600ms |
| RobotLayer reveal | opacity 0→1, 700ms |
| Wallpaper filter | blur 20px→0, brightness 0.72→1, saturation 0.35→1, 1400ms |
| Overlay dissolve | opacity 1→0, 700ms |

No rotation. No bounce. No exaggerated easing.

---

## Accessibility

- `prefers-reduced-motion`: All animations skipped. BootSequence returns null immediately.
- `aria-label="Multiverse OS starting up"` on overlay root
- `aria-live="polite"` on initialization message paragraph
- `role="status"` on overlay container
- Click or keydown anywhere skips the sequence immediately

---

## Performance

- Desktop shell initializes in parallel (BootSequence is only a visual overlay)
- No heavy assets loaded during boot (CSS gradients + grain SVG only)
- No WebGL, no canvas during boot (removed Strands / LetterGlitch from this overlay)
- bootPhase.ts uses native `CustomEvent` — zero library overhead
- Message cycling via `setTimeout` chains — minimal React re-renders

---

## File Structure

```
lib/
  bootPhase.ts             ← Shared phase state (CustomEvent singleton)

components/
  BootSequence.tsx         ← Overlay component (Phase 6.5 redesign)

desktop/
  MenuBar.tsx              ← Boot-aware: fades in at reveal
  Dock.tsx                 ← Boot-aware: slides up at reveal
  WidgetLayer.tsx          ← Boot-aware: fades in at reveal
  RobotLayer.tsx           ← Boot-aware: fades in last at reveal
  DesktopShell.tsx         ← Auto-opens Home window on 'done'
```

---

## Sound (Reserved)

Sound is not implemented. The hook is ready in `lib/useOsAudio.ts`.

To add a startup chime, call from `BootSequence.tsx` at the `'logo'` phase:

```ts
// Future: playStartupChime() — muted by default, respects user audio prefs
```

---

## Future Enhancements

- [ ] Startup chime (subtle, ~1s, muted by default)
- [ ] Per-theme boot wallpaper (e.g., dark base for Obsidian theme)
- [ ] Boot logo animation (letterpress stamp effect)
- [ ] Version number display during boot
- [ ] Network status indicator during initialization
- [ ] Configurable boot duration via user preferences
