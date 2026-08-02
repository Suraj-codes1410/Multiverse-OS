# Phase 5 — Experience Layer

This document describes the interaction, motion, and immersion architecture added in **Phase 5** of Suraj.OS — transforming the OS from a functional portfolio into a **living operating system**.

---

## 1. Interaction Architecture

### Spotlight Search (`components/SpotlightSearch.tsx`)
A Raycast-inspired command palette accessible system-wide.

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl + K` | Open / close Spotlight |
| `↑ ↓` | Navigate results |
| `Enter` | Launch selected item |
| `Escape` | Dismiss |

**Search targets:** All 11 applications, all projects from `projects.json`, all skills from `skills.json`. Results cap at 9 for layout stability.

**Dispatch:** Launches apps via `window.dispatchEvent(new CustomEvent('launchApp', { detail: appId }))` — fully decoupled from any shell, works on both Desktop and Mobile.

---

### Context Menu (`components/ContextMenu.tsx`)
Right-click on the desktop surface (elements marked `data-context-menu="desktop"`) shows a custom OS-native context menu.

**Actions available:**
- Spotlight Search (`⌘K`)
- Open CLI Terminal (`Ctrl+\``)
- Toggle System Sound
- Refresh Desktop
- Clear Session Logs

Coordinates are clamped to viewport boundaries to prevent overflow.

---

### Keyboard Shortcuts (updated in `components/ShellProvider.tsx`)

| Shortcut | Action |
|---|---|
| `Ctrl + \`` | Toggle CLI Terminal |
| `Ctrl/Cmd + O` | Toggle Oracle |
| `Ctrl/Cmd + K` | Spotlight Search |
| `Escape` | Close active overlay |

---

## 2. Motion System

### Window Animations (`desktop/DesktopWindow.tsx`)
- **Open:** `scale(0.95) → 1`, `y: 15 → 0`, `opacity: 0 → 1` with spring ease `[0.16, 1, 0.3, 1]`
- **Close:** Reverse of open transition via `AnimatePresence` in `WindowManager.tsx`
- **Minimize (Genie Effect):** Windows animate to `scale(0.12)` and translate toward the dock center before disappearing — windows remain in the DOM so the transition is smooth in both directions.
- **Restore:** Reversing the minimize variant back to `open` state.

### Wallpaper Parallax (`desktop/Wallpaper.tsx`)
The default PastelOS theme fluid blobs now respond to mouse position. Each blob has a staggered parallax coefficient (`0.015 + idx * 0.01`) applied relative to the viewport center, creating a subtle depth illusion when the mouse moves.

---

## 3. Boot Experience (`components/BootSequence.tsx`)
Upgrades from Phase 1:
- **Richer messages:** 7 system-meaningful boot steps (theme loading, Oracle grounding, companion init).
- **Permanent bypass:** Boot now writes to `localStorage` (not just `sessionStorage`), so returning visitors skip it immediately.
- **Reduced Motion:** `useReducedMotion()` hook skips the boot sequence entirely for accessibility compliance.
- **Session + permanent check:** Both storage keys checked in the inline blocking `<script>` to prevent any flash before React hydrates.

---

## 4. Robot Companion (`desktop/RobotLayer.tsx`)
The companion robot is now **reactive**:

| Trigger | Robot Response |
|---|---|
| Idle | Gentle float animation (`y: 0 → -2.5 → 0`), 4s period |
| `launchApp` event | Status → `EXCITED`, antenna dots turn green, speech bubble appears |
| `oracleQuery` event | Status → `THINKING`, eye dots turn purple, speech bubble shows "Traversing knowledge graph..." |
| Every ~4–8 seconds | Eye blink animation (scaleY: `1 → 0.1 → 1`, 180ms) |
| Mouth | Shows a flat line when `thinking`, smile curve otherwise |

Oracle queries now dispatch `oracleQuery` from `OracleWindow.handleSend` so the robot reacts to every user query.

---

## 5. Notification System (`components/ShellProvider.tsx`)

A desktop notification layer mounted at `z-[9997]` above all shells.

**Types:** `success` | `error` | `warning` | `info`

**Behavior:**
- Slides in from top-right with `scale(0.95) → 1` spring animation
- Auto-dismisses after **4.5 seconds**
- Manual dismiss via `✕` button
- Stack multiple notifications

**Auto-triggers:**
- `launchApp` event → `info` notification with app name
- Boot complete → `success` welcome notification (1s delay)

**API (via `useShell()` hook):**
```ts
addNotification(message: string, type?: 'success' | 'error' | 'warning' | 'info')
dismissNotification(id: string)
```

---

## 6. Sound Architecture (`components/ShellProvider.tsx`)

Zero-asset Web Audio API synthesizer. No audio files required.

| Sound | Trigger | Description |
|---|---|---|
| `startup` | Boot complete (if unmuted) | C4→E4→G4→C5 ascending arpeggio, 1.3s |
| `notification` | Every notification push | C5→E5 two-note chime, 0.7s |
| `click` | Every `launchApp` event | Single 800Hz sine tone, 0.1s |

**Default:** Muted. User enables via the status bar toggle. Unmuting plays the startup chime as confirmation.

---

## 7. Dock Enhancements (`desktop/Dock.tsx`)
- **Notification badge:** Oracle icon shows a persistent `1` badge (purple dot) to encourage first interaction.
- **Running indicators:** Active app shows a pulsing cyan dot; open-but-unfocused shows a dim grey dot.
- **Hover tooltip:** App name appears above each icon on hover with spring entrance/exit animation.

---

## 8. Performance
- `AnimatePresence` now wraps all window renders in `WindowManager.tsx` — exit animations fire correctly on close without keeping stale DOM nodes.
- Windows that are **minimized** stay mounted (needed for genie animation) but set `pointerEvents: none` to prevent input capture.
- SpotlightSearch results are memoized with `useMemo` — no re-computation on re-renders unless query or pool changes.
- All audio synthesis uses `try/catch` — gracefully degrades if `AudioContext` is unavailable.

---

## 9. Accessibility
- **Reduced Motion:** `useReducedMotion()` disables boot sequence, wallpaper canvas animations, and respects `prefers-reduced-motion` media query.
- **ARIA labels:** All interactive elements have `aria-label` attributes.
- **Keyboard Navigation:** Full tab order on dock, spotlight search, context menu, and notification dismiss buttons.
- **Focus management:** Spotlight input receives `focus()` 50ms after opening.

---

## 10. Future Roadmap

| Feature | Status |
|---|---|
| Shortcut Registry UI (view all shortcuts) | Ready for Phase 6 |
| Notification history drawer | Planned |
| Robot dialogue scripting (personality engine) | Planned |
| Context menus per application (file explorer, project card) | Architecture ready via `data-context-menu` attribute |
| Sound theme selector (jazz, minimal, synthetic) | Architecture ready via `playSound()` |
| Spotlight fuzzy search (fuse.js integration) | Planned |
| Window snapping zones | Planned |
