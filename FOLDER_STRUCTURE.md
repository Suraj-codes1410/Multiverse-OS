# Folder Structure Specification - Multiverse-OS

This document specifies the updated directory topology of the **Multiverse-OS** project root workspace, detailing the files added and modified during the Phase 1 refactoring process.

---

## 1. Directory Tree Diagram

Below is the complete architectural directory tree mapping the new structured folders:

```
multiverse-os/
├── animations/              # Standardized animations timings, spring presets, and hooks
│   ├── gsap.ts
│   ├── lenis.ts
│   ├── presets.ts
│   ├── reducedMotion.ts
│   ├── index.ts             # Animations export gate
│   └── README.md
├── app/                     # Next.js App Router pages and API routes
│   └── globals.css          # Modified: Redirects to styles/globals.css
├── assets/                  # Local build-time graphics & SVGs
│   ├── index.ts
│   └── README.md
├── components/              # Deprecated legacy components folder (kept for safety)
│   └── DEPRECATED.md        # Migration roadmap notice
├── contexts/                # React Context definition structures
│   ├── index.ts
│   └── README.md
├── data/                    # JSON configurations & strongly typed TS databases
│   ├── portfolio.json       # Original static config
│   ├── projects.ts          # TS Data Placeholder
│   ├── skills.ts            # TS Data Placeholder
│   ├── timeline.ts          # TS Data Placeholder
│   ├── experience.ts        # TS Data Placeholder
│   ├── education.ts         # TS Data Placeholder
│   ├── socials.ts           # TS Data Placeholder
│   └── README.md            # Data layer document
├── desktop/                 # Desktop Shell layouts and workstation window layers
│   ├── DesktopContext.ts
│   ├── DesktopProvider.tsx
│   ├── DesktopShell.tsx
│   ├── DockProvider.tsx
│   ├── OracleLayer.tsx
│   ├── RobotLayer.tsx
│   ├── Wallpaper.tsx
│   ├── WidgetLayer.tsx
│   ├── WindowManager.tsx
│   ├── WindowRegistry.ts
│   ├── index.ts             # Desktop exports gate
│   └── README.md
├── docs/                    # Architectural documents & reports
│   ├── application-shell-architecture.md
│   └── frontend-design-system.md
├── hooks/                   # Custom React state custom hooks
│   ├── index.ts
│   └── README.md
├── layout/                  # Page split structural layout elements
│   ├── SharedLayout.tsx
│   ├── index.ts             # Layouts export gate
│   └── README.md
├── mobile/                  # Mobile swipe overlays and gesture provider shells
│   ├── AppRegistry.ts
│   ├── BottomNavigation.tsx
│   ├── GestureProvider.tsx
│   ├── HomeLayout.tsx
│   ├── MobileShell.tsx
│   ├── NavigationProvider.tsx
│   ├── OracleLayer.tsx
│   ├── StatusBar.tsx
│   ├── index.ts             # Mobile exports gate
│   └── README.md
├── providers/               # Root context state providers
│   ├── LayoutProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── index.ts             # Providers export gate
│   └── README.md
├── shared/                  # Reusable, atomic UI visual components
│   ├── Avatar/              # Avatar folder
│   ├── Badge/               # Badge folder
│   ├── Button/              # Button folder
│   ├── Card/                # Card folder
│   ├── Chip/                # Chip folder
│   ├── Container/           # Container folder
│   ├── GlassPanel/          # GlassPanel folder
│   ├── Icon/                # Icon folder
│   ├── Panel/               # Panel folder
│   ├── Scrollbar/           # Scrollbar folder
│   ├── Section/             # Section folder
│   ├── Tooltip/             # Tooltip folder
│   ├── WindowFrame/         # WindowFrame folder
│   ├── WindowHeader/        # WindowHeader folder
│   ├── Typography/          # Typography folder
│   ├── index.ts             # Re-exports gate
│   └── README.md
├── styles/                  # Central CSS theme custom properties sheets
│   ├── globals.css
│   ├── theme.css
│   ├── variables.css
│   ├── index.ts
│   └── README.md
├── theme/                   # JS design token constants mapping CSS variables
│   ├── breakpoints.ts
│   ├── colors.ts
│   ├── glass.ts
│   ├── motion.ts
│   ├── radius.ts
│   ├── shadow.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── zIndex.ts
│   ├── index.ts             # Theme exports gate
│   └── README.md
├── utils/                   # Stateless helper formatter utilities
│   ├── index.ts
│   └── README.md
├── tsconfig.json            # Mapping paths config
├── package.json             # Core dependency manifest
└── eslint.config.mjs        # ESLint configuration
```

---

## 2. Refactor Changes Logs

### 2.1. Files Added
* **Documentation Reports**:
  * [PHASE_1_1_REPORT.md](file:///C:/Users/Suraj/multiverse-os/PHASE_1_1_REPORT.md)
  * [PHASE_1_2.md](file:///C:/Users/Suraj/multiverse-os/PHASE_1_2.md)
  * [PHASE_1_5.md](file:///C:/Users/Suraj/multiverse-os/PHASE_1_5.md)
  * [PHASE_1_7.md](file:///C:/Users/Suraj/multiverse-os/PHASE_1_7.md)
  * [docs/frontend-design-system.md](file:///C:/Users/Suraj/multiverse-os/docs/frontend-design-system.md)
  * [docs/application-shell-architecture.md](file:///C:/Users/Suraj/multiverse-os/docs/application-shell-architecture.md)
* **Global Styles Centralization**:
  * [styles/variables.css](file:///C:/Users/Suraj/multiverse-os/styles/variables.css)
  * [styles/theme.css](file:///C:/Users/Suraj/multiverse-os/styles/theme.css)
  * [styles/globals.css](file:///C:/Users/Suraj/multiverse-os/styles/globals.css)
* **Design Token Consts**:
  * `theme/colors.ts`, `theme/spacing.ts`, `theme/typography.ts`, `theme/motion.ts`, `theme/shadow.ts`, `theme/glass.ts`, `theme/radius.ts`, `theme/zIndex.ts`, `theme/breakpoints.ts`, `theme/index.ts`
* **Layout and Provider Shells**:
  * `layout/SharedLayout.tsx`, `providers/LayoutProvider.tsx`, `providers/ThemeProvider.tsx`
  * `desktop/DesktopShell.tsx`, `desktop/DesktopProvider.tsx`, `desktop/DesktopContext.ts`, `desktop/WindowManager.tsx`, `desktop/DockProvider.tsx`, `desktop/Wallpaper.tsx`, `desktop/WindowRegistry.ts`, `desktop/RobotLayer.tsx`, `desktop/OracleLayer.tsx`, `desktop/WidgetLayer.tsx`
  * `mobile/MobileShell.tsx`, `mobile/NavigationProvider.tsx`, `mobile/GestureProvider.tsx`, `mobile/StatusBar.tsx`, `mobile/BottomNavigation.tsx`, `mobile/HomeLayout.tsx`, `mobile/OracleLayer.tsx`, `mobile/AppRegistry.ts`
* **Atomic Shared Components**:
  * folders under `shared/` (`Button`, `Card`, `Panel`, `GlassPanel`, `WindowFrame`, `WindowHeader`, `Typography`, `Section`, `Avatar`, `Badge`, `Chip`, `Icon`, `Tooltip`, `Container`, `Scrollbar`) complete with implementation files and sub-export gates.
* **Animation Presets & Hooks**:
  * `animations/gsap.ts`, `animations/lenis.ts`, `animations/presets.ts`, `animations/reducedMotion.ts`
* **Static Content Layers**:
  * `data/projects.ts`, `data/skills.ts`, `data/timeline.ts`, `data/experience.ts`, `data/education.ts`, `data/socials.ts`

### 2.2. Files Modified
* **`app/globals.css`**: Completely redirected to import the centralized `@/styles/globals.css` style block, deprecating local overrides while retaining visual identity.
* **`layout/index.ts`, `desktop/index.ts`, `mobile/index.ts`, `providers/index.ts`, `shared/index.ts`, `theme/index.ts`, `animations/index.ts`**: Populated with bridging exports and new token/component re-exports.

---

## 3. Deprecated Structures Management

The old flat components organization (`components/`) is now **deprecated**. A deprecation warning notice has been created in:
**[components/DEPRECATED.md](file:///C:/Users/Suraj/multiverse-os/components/DEPRECATED.md)**

This ensures:
1. Existing import references from pages compile seamlessly without breakages.
2. In Phase 2, developers can safely migrate files from `@/components` to `@/shared`, `@/desktop`, `@/layout`, or `@/providers` progressively.
