# ⚠️ DEPRECATION NOTICE: components/

This folder represents the **legacy flat components structure** and is now **deprecated**.

## Architectural Transition (Phase 1.2)
To support clean code-splitting, layout segregation, and reusable atomic design systems, components have been mapped to the new modular architecture directories:
* **`layout/`**: Navbar, Footer, Container, Section.
* **`desktop/`**: Complex dashboards, overlays, and live views (e.g. RecruiterDashboard, CliTerminal, OracleWindow).
* **`shared/`**: Generic, presentation-focused UI widgets (e.g. Buttons, Cards, Badges, Icons).
* **`providers/`**: ShellProvider.

## Next Steps for Development
1. **Bridging Phase**: For backward-compatibility and zero-breakage builds during phase deployments, original files have been left in `components/`. The new folders contain bridge export layers inside their respective `index.ts` files that export directly from the old paths.
2. **Transition Path**: In future feature iterations, code imports should migrate from:
   ```typescript
   import Button from '@/components/Button';
   ```
   to:
   ```typescript
   import { Button } from '@/shared';
   ```
3. **Decommissioning**: Once all route files in the `app/` directory are fully updated to consume the new structured paths, this legacy folder will be decommissioned.
