# Design Tokens System Documentation

This directory houses the strongly typed **Design Token System** for the Multiverse-OS user interface. All visual declarations (colors, layout spacing, typographies, transitions, shadows, radius scales, responsive breakpoints, and z-index layout layers) are formalized as JavaScript constants, ensuring no magic values are hardcoded in components going forward.

---

## 📂 Design Tokens Index

### 1. Colors (`theme/colors.ts`)
Maps exact design color codes to variables declared inside [app/globals.css](file:///C:/Users/Suraj/multiverse-os/app/globals.css).

* **`bg`**:
  * `primary`: `#030407` — Root background color of the workspace.
  * `panel`: `#0a0c16` — Flat navy container background.
  * `panelHover`: `#111424` — Muted hover highlight card backgrounds.
* **`accent`**:
  * `cyan`: `#00f2fe` — Interactive buttons, border highlights, focus rings, and main active states.
  * `purple`: `#a855f7` — Secondary branding elements, achievements labels, and timeline metrics.
* **`feedback`**:
  * `success`: `#10b981` — Healthy status indicators (emerald green).
  * `warning`: `#f59e0b` — Service degradation, rate-limits, and warn indicators (amber yellow).
* **`text`**:
  * `primary`: `#ffffff` — Regular body headings and focus labels copy.
  * `secondary`: `#94a3b8` — Muted labels, descriptive text, and metadata.
* **`border`**:
  * `subtle`: `#1e293b` — Divider borders.
  * `bright`: `#334155` — Input borders and focus state borders.

---

### 2. Spacing (`theme/spacing.ts`)
Defines the layout spacing grid scale corresponding to Tailwind's default layout grid.

* `xs`: `4px` — Mini margins.
* `sm`: `8px` — Element borders spacing gaps.
* `md`: `16px` — Standard card elements padding size.
* `lg`: `24px` — Card margins and internal block gaps.
* `xl`: `32px` — Section block margins and content separation.
* `xxl`: `48px` — Major division layout gaps.
* `xxxl`: `64px` — Page layout spacing.
* **`layout`**:
  * `containerGap`: `24px` — Grid layouts grid separation gap.
  * `paddingMobile`: `16px` — Horizontal padding inside mobile screens.
  * `paddingDesktop`: `32px` — Horizontal padding inside desktop screen containers.

---

### 3. Typography (`theme/typography.ts`)
Standardizes typography scale, font weight mappings, and heights.

* **`fontFamily`**:
  * `sans`: `Inter` — Body layouts, recruiter panels, copy texts.
  * `mono`: `JetBrains Mono` — Terminal CLI overlays, logs, analytics dashboards.
* **`fontSize`**:
  * `xs`: `12px` — Muted captions.
  * `sm`: `14px` — Compact listings.
  * `base`: `16px` — Standard body copy text reading size.
  * `lg`: `18px` — Sub-headings.
  * `xl`: `20px` — Standard widget titles.
  * `xxl`: `24px` — Card headings.
  * `xxxl`: `32px` — Page header titles.
  * `display`: `48px` — Hero dashboard headers.
  * `hero`: `64px` — Main landing centerpiece name text.
* **`fontWeight`**:
  * `light`: `300`
  * `normal`: `400`
  * `medium`: `500`
  * `bold`: `700`
  * `black`: `900`
* **`lineHeight`**:
  * `none`: `1`
  * `tight`: `1.25`
  * `snug`: `1.375`
  * `normal`: `1.5`
  * `relaxed`: `1.625`

---

### 4. Motion (`theme/motion.ts`)
Defines standardized Framer Motion timings, bezier ease curves, and spring variables.

* **`duration`**:
  * `fast`: `0.2` — Interactive scale changes, tooltip overlays.
  * `normal`: `0.3` — Card hover overlays, layout slides.
  * `slow`: `0.5` — Backdrop fades, overlay transitions.
  * `boot`: `0.8` — Bios boot screen fade phases.
* **`ease`**:
  * `easeOut`: `[0.16, 1, 0.3, 1]` — Custom ease cubic-bezier for smooth visual triggers.
  * `easeInOut`: `[0.65, 0, 0.35, 1]` — Acceleration and deceleration curves.
  * `linear`: `linear` — Standard loop rotations.
* **`spring`**:
  * `type`: `'spring'`
  * `stiffness`: `300`
  * `damping`: `30`

---

### 5. Shadow & Glow System (`theme/shadow.ts`)
Visual elevation shadows and colored cyber glows.

* **`elevation`**: Standard shadows mapping standard light behaviors.
  * `sm` / `md` / `lg` / `xl`
* **`glow`**: High-tech colored glows mapping system feedback.
  * `cyan`: `0 0 10px rgba(0, 242, 254, 0.15)`
  * `purple`: `0 0 12px rgba(168, 85, 247, 0.35)`
  * `success`: `0 0 10px rgba(16, 185, 129, 0.2)`
  * `warning`: `0 0 10px rgba(245, 158, 11, 0.2)`

---

### 6. Glassmorphism (`theme/glass.ts`)
Translucent overlay system parameters combining color opacities, borders, and backdrops.

* **`blur`**:
  * `sm`: `blur(4px)`
  * `md`: `blur(8px)`
  * `lg`: `blur(16px)`
* **`bg`**:
  * `thin`: `rgba(10, 12, 22, 0.3)` — 30% alpha for interactive cards.
  * `medium`: `rgba(10, 12, 22, 0.5)` — 50% alpha for layouts.
  * `thick`: `rgba(10, 12, 22, 0.85)` — 85% alpha for solid admin dashboards.
  * `primaryThin`: `rgba(3, 4, 7, 0.75)` — 75% alpha for backing page overlay blocks.
* **`presets`**:
  * `panel`: Pre-composed panel styles (50% background, 8px blur, subtle border).
  * `panelHover`: Pre-composed hover panel styles (60% hover background, 8px blur, bright border).
  * `overlay`: Blocker page backdrop overlay.

---

### 7. Radius Corner (`theme/radius.ts`)
Standardizes border radius corner curves.

* `none`: `0px`
* `sm`: `4px` — Tiny toggles.
* `md`: `8px` — Buttons, tag labels, input borders.
* `lg`: `12px` — Standard cards.
* `xl`: `16px` — Large containers.
* `full`: `9999px` — Avatars, floating controls.

---

### 8. Layout Z-Index Layering (`theme/zIndex.ts`)
Enforces strict z-index hierarchies to prevent render overlapping.

* `base`: `0`
* `sticky`: `50` — Page layouts stick columns.
* `footer`: `100` — Layout footer.
* `navbar`: `200` — Layout header navigation bar.
* `overlayBackground`: `1000` — Backdrop filters.
* `floatControls`: `9980` — Floating action button utilities (CLI & Oracle toggles).
* `fullscreenOverlay`: `9990` — CLI terminal window and Oracle drawer.
* `bootSequenceBlocker`: `9999` — Bios full-screen boot-loader.

---

### 9. Breakpoints (`theme/breakpoints.ts`)
Maps screen dimensions queries for layouts responsiveness.

* `sm`: `640px`
* `md`: `768px`
* `lg`: `1024px`
* `xl`: `1280px`
* `xxl`: `1536px`
* **`queries`**: Stores full string expressions (e.g. `(min-width: 1024px)`).
