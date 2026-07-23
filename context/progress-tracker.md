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
  - Created `components/workspace/workspace-sidebar.tsx`: Collapsible left sidebar that slides in/out without pushing content, shows icon+label when open or icon-only when collapsed, includes Search and Settings navigation with profile menu at top
  - Profile menu includes user avatar, name, email, and logout functionality
  - Both components accept props for sidebar state management
  - Verified: `tsc --noEmit` and `npm run lint` pass without errors

- 03-auth: Frontend authentication with Better Auth client
  - Installed `better-auth` package
  - Created `lib/auth-client.ts`: Configured Better Auth client with `NEXT_PUBLIC_AUTH_URL` env var, exported `signIn`, `signUp`, `signOut`, and `useSession` helpers
  - Created auth pages using shadcn components (Card, Input, Label, Button) with email + password fields, inline validation, and error messages:
    - `app/(auth)/sign-in/page.tsx`: Sign-in page with link to sign-up
    - `app/(auth)/sign-up/page.tsx`: Sign-up page with name field and link to sign-in
    - `app/(auth)/layout.tsx`: Passthrough layout (pages handle their own layout)
  - Created `proxy.ts`: Route protection using Next.js 16 proxy pattern - protects all routes except `/sign-in` and `/sign-up`, redirects unauthenticated users to sign-in
  - Updated `app/page.tsx`: Root redirect based on session state (authenticated → `/workspace`, unauthenticated → `/sign-in`)
  - Updated `components/workspace/workspace-sidebar.tsx`: Added profile control at top with avatar (showing initials), name, email, and dropdown menu with logout
  - 50/50 split layout: left panel with `bg-muted` background (logo, tagline, feature list with primary-colored bullets), right panel with centered form card
  - Responsive design: left panel hidden on mobile, form-only view
  - Proper spacing: `space-y-4` between form fields per UI guidelines (Form sections pattern)
  - All styling uses CSS variables from `globals.css` - no hardcoded colors
  - Typography: Inter (UI text), consistent with UI context standards
  - Border radius: `rounded-lg` for cards per UI guidelines
  - Created `.env.local` with `NEXT_PUBLIC_AUTH_URL` pointing to future auth-service (spec 08)
  - Verified: `npm run build` and `npm run lint` pass without errors

- 04-monorepo-docker: Backend monorepo structure and containerized infrastructure
  - Created `services/` directory with 12 microservice folders: api-gateway, auth-service, organization-service, contact-service, company-service, activity-service, email-service, ai-service, analytics-service, notification-service, file-service, history-service
  - Added README.md to each service folder documenting its responsibility from architecture-context.md
  - Created `services/README.md` explaining microservices layout and communication patterns
  - Created `docker-compose.dev.yml` with PostgreSQL (pgvector/pgvector:pg16) and Redis 7 containers
  - PostgreSQL container configured with named volume, health checks, and exposed on port 5432
  - Redis container configured with named volume, health checks, and exposed on port 6379
  - Updated `.env.example` with comprehensive environment variable documentation covering all services, database, Redis, auth, AI, email, file storage, rate limiting, logging, and CORS
  - Verified `.env` is gitignored (covered by `.env*` pattern)
  - Verified Docker Compose starts successfully: both containers healthy
  - Verified `npm run build` still passes without errors
  - Service containers commented out in docker-compose.dev.yml with TODO for later specs

## In Progress

- None.

## Next Up

- Continue with next Phase 1 foundation features.

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
