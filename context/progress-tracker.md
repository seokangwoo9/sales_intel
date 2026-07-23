# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Foundation & Infrastructure

## Current Goal

- Workspace base components complete; ready for next foundation feature

## Completed

- 01-design-system: Installed and configured shadcn/ui (base-nova style, `@base-ui/react`) via CLI
  - Added UI primitives to `components/ui/`: accordion, avatar, badge, button, calendar, card, checkbox, command, dialog, dropdown-menu, input, input-group, label, popover, radio-group, select, sheet, skeleton, sonner (toast), switch, table, tabs, textarea
  - Installed `lucide-react` for icons
  - Created `lib/utils.ts` with `cn()` (clsx + tailwind-merge)
  - Replaced shadcn's default neutral palette in `app/globals.css` with the theme tokens from `ui-context.md` (slate base, blue brand, semantic + component-specific tokens in HSL)
  - Wired Inter (`--font-sans`) and Fira Code (`--font-mono`) via `next/font/google` in `app/layout.tsx`, replacing default Geist fonts
  - Verified: `tsc --noEmit` and `next build` both pass; all components import without errors; no default styling remains

- 02-workspace: Created base workspace layout components
  - Created `components/workspace/workspace-navbar.tsx`: Fixed-height top navbar with sidebar toggle (PanelLeftOpen/PanelLeftClose icons), centered search bar, and help button (question mark icon)
  - Created `components/workspace/workspace-sidebar.tsx`: Collapsible left sidebar that slides in/out without pushing content, shows icon+label when open or icon-only when collapsed, includes Search and Settings navigation with empty placeholder state
  - Both components accept props for sidebar state management
  - Verified: `tsc --noEmit` and `npm run lint` pass without errors

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Design system uses shadcn/ui with the `base-nova` style, which is built on `@base-ui/react` (not Radix) — confirmed compatible with React 19 / Next.js 16 / Tailwind v4.
- Theme tokens live in `app/globals.css` as the single source of truth, matching `ui-context.md`. Components reference tokens via Tailwind utilities (`bg-background`, `text-foreground`, etc.) — no hardcoded colors.
- `components/ui/*` are treated as generated foundation components and must not be modified.

## Session Notes

- To add more shadcn primitives later: `npx shadcn@latest add <component>`.
- Toasts use `sonner` (shadcn's current Toast implementation); mount `<Toaster />` from `components/ui/sonner` in a layout when notifications are needed.
- DatePicker is composed from `calendar` + `popover` (no standalone registry component).
