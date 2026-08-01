# Development Roadmap (Post-Phase 1) - Multiverse-OS

This document specifies the roadmap steps and migration guidelines to transition **Multiverse-OS** to its fully modular architecture.

---

## 📅 Roadmap Overview

```
┌─────────────────────────┐
│  Phase 1: Architecture  │  ◄── [COMPLETED]
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│   Phase 2: Activation   │  ◄── [NEXT STEP]
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│   Phase 3: Migration    │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│  Phase 4: Optimization  │
└─────────────────────────┘
```

---

## 🚀 Future Roadmap Phases

### Phase 2: Layout Shell & Viewport Activation
* **Objective**: Active loading of separate desktop and mobile layout shells using matchMedia query checks.
* **Tasks**:
  1. Update [layout/SharedLayout.tsx](file:///C:/Users/Suraj/multiverse-os/layout/SharedLayout.tsx) to listen for the desktop breakpoint (`min-width: 1024px`).
  2. Implement conditional rendering: load `DesktopShell` on matching desktop screens and `MobileShell` on smaller viewports.
  3. Mount original dashboard viewports (`HomeConsoleWidgets`, `CareerTimeline`) within the layout frameworks placeholders.

### Phase 3: Gradual Component Migration
* **Objective**: Safe decommissioning of the legacy `components/` folder by moving elements to their new locations.
* **Tasks**:
  1. Migrate specific heavy features (`RecruiterDashboard.tsx`, `CliTerminal.tsx`, `OracleWindow.tsx`) to `desktop/`.
  2. Update client import statements in page route directories (e.g. `app/recruiter/page.tsx` or `app/projects/page.tsx`) to consume from `@/shared`, `@/desktop`, and `@/layout`.
  3. Delete files from `components/` once all import routes are verified.

### Phase 4: Code-Splitting & Dynamic Imports
* **Objective**: Resolve landing page hydrate lock bottlenecks and split heavy client overlays from the primary page bundle.
* **Tasks**:
  1. Update shell providers to load the command CLI terminal overlay (`CliTerminal`) and chatbot window (`OracleWindow`) lazily using Next.js dynamic imports:
     ```typescript
     const CliTerminal = dynamic(() => import('@/desktop/CliTerminal'), { ssr: false });
     const OracleWindow = dynamic(() => import('@/desktop/OracleWindow'), { ssr: false });
     ```
  2. Implement skeleton loaders for windows to prevent layout shifts.

### Phase 5: Semantic CSS Cleanup
* **Objective**: Enforce the design tokens system by removing raw hex codes.
* **Tasks**:
  1. Grep and replace raw hex values (`#030407`, `#0a0c16`, etc.) in typescript styling templates with their corresponding tailwind custom color tokens (`bg-bg-primary`, `bg-bg-panel`).
  2. Enforce custom transition easing parameters from variables in Framer Motion configurations.

---

## 🧪 Testing and Validation Protocols

To prevent regressions during future refactoring phases, execute these verification checks:

1. **Compilation Check**:
   ```bash
   npx tsc --noEmit
   ```
2. **ESLint Verification**:
   ```bash
   npm run lint
   ```
3. **Next.js Production Build**:
   ```bash
   npm run build
   ```
4. **Oracle API Integration Check**:
   ```bash
   npm test
   ```
   *(Checks that direct routing parameters, resume downloads responses, caching matches, and OpenRouter API sync continue to pass validation checks)*.
5. **Responsive Visual Testing**:
   Open browser dev tools and toggle between device viewports (e.g. iPhone SE vs standard desktop monitors) to verify that the query listeners load the correct layout shell.
