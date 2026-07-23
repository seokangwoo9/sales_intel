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

- 05-shared-libraries: Established shared type library for cross-service consistency
  - Created `shared/` directory at repo root with `types/`, `constants/`, `utils/`, and barrel `index.ts`
  - Implemented core types:
    - `types/api.ts`: `ApiResponse<T>` envelope, `Pagination`, `Paginated<T>` wrapper
    - `types/enums.ts`: `Role`, `EntityType`, `EmailDirection`, `NotificationType`, `ActivityType`
    - `types/entities.ts`: Minimal DTOs for `User`, `Organization`, `OrganizationMember`, `Contact`, `Company`
  - Implemented constants:
    - Default/max pagination sizes (20/100)
    - Role hierarchy for permission checks
    - Fine-grained permission keys (PERMISSIONS object)
    - API version, token expiration, rate limits, file upload constraints
  - Implemented utilities (pure functions, frontend + backend safe):
    - `slugify`, `isEmail`, `assertNever`, `formatFileSize`, `truncate`, `deepClone`, `isEmpty`, `randomString`, `delay`, `capitalize`, `getInitials`
  - Added TypeScript path aliases to `tsconfig.json`: `@shared` and `@shared/*`
  - Created `shared/README.md` documenting structure, usage, and guidelines
  - Created `shared/test-imports.ts` verifying import patterns work correctly
  - Verified: `tsc --noEmit` passes with strict mode, `npm run build` passes without errors
  - All types compile cleanly and are consumable by both frontend and future backend services

- 06-prisma-schema: Complete database schema with Prisma
  - Created `prisma/` directory at repo root as shared database schema location
  - Installed Prisma CLI (`prisma@7.9.0`) and client (`@prisma/client@7.9.0`)
  - Created `prisma.config.js` for Prisma 7 datasource configuration
  - Implemented comprehensive `schema.prisma` with all core models:
    - **Authentication & Multi-tenancy**: User, Organization, Membership (with Role enum)
    - **CRM Entities**: Contact, Company, ContactCompany (with ownership tracking and soft deletes)
    - **Activity System**: Post, Comment, Mention, Attachment (polymorphic entity linking)
    - **Email System**: EmailAccount, EmailMessage (with threading), EmailTemplate
    - **AI System**: AiChat, AiMessage, Embedding (with pgvector support)
    - **Audit & Notifications**: HistoryEvent (immutable audit log), Notification
  - Defined enums matching `shared/types/enums.ts`: Role, EntityType, EmailDirection, ActivityType, NotificationType
  - Applied multi-tenant isolation: all org-scoped models include indexed `organizationId`
  - Implemented ownership model: Contact and Company track `ownerId`, `previousOwnerId`, and `transferredAt`
  - Created initial migration (`20260723134137_init`) with pgvector extension enabled
  - Created vector migration (`20260723134612_add_vector_dimensions_and_index`):
    - Set vector column dimensions to 1536 (OpenAI text-embedding-3-small/ada-002)
    - Added HNSW index for efficient cosine similarity search on embeddings
  - Generated Prisma client successfully
  - Verified database setup:
    - pgvector extension v0.8.2 installed and active
    - All tables created with proper indexes and foreign keys
    - Vector column configured as `vector(1536)` with HNSW index
    - All enums match shared types exactly
  - Created comprehensive `prisma/README.md` documenting schema structure, usage patterns, and security notes
  - Verified TypeScript compilation passes with generated Prisma client
  - All models include strategic indexes for performance (organizationId, ownerId, composite indexes)
  - Soft delete support via `deletedAt` for contacts and companies
  - Email credentials marked for encryption at rest (enforced by email-service)

- 07-api-gateway: NestJS API Gateway with routing, JWT validation, CORS, rate limiting, and logging
  - Scaffolded NestJS application in `services/api-gateway/` with TypeScript support
  - Installed core dependencies: @nestjs/core, @nestjs/platform-express, @nestjs/config, @nestjs/jwt, @nestjs/throttler, http-proxy-middleware
  - Implemented configuration module reading from environment variables (port, CORS origins, JWT secret, downstream service URLs, rate limits)
  - Created service registry mapping route prefixes to downstream services:
    - `/api/auth/*` → auth-service (public)
    - `/api/organizations/*` → organization-service
    - `/api/contacts/*` → contact-service
    - `/api/companies/*` → company-service
    - `/api/activity/*` → activity-service
    - `/api/email/*` → email-service
    - `/api/ai/*` → ai-service
    - `/api/analytics/*` → analytics-service
    - `/api/notifications/*` → notification-service
    - `/api/files/*` → file-service
    - `/api/history/*` → history-service
  - Implemented JWT authentication guard validating tokens on all non-public routes
  - Auth guard attaches user context (userId, organizationId, email, role) and forwards via trusted headers (x-user-id, x-organization-id, x-user-email, x-user-role)
  - Configured CORS with allowedOrigins from environment, credentials support, and exposed X-Request-ID header
  - Implemented rate limiting (60 req/min default) with proxy-aware IP detection via X-Forwarded-For
  - Created logging interceptor generating UUID request IDs and structured request/response logs with timing
  - Implemented global exception filter returning standard ApiResponse error envelope
  - Created health check endpoint (`GET /health`) monitoring gateway uptime/memory and downstream service reachability
  - Implemented proxy service with http-proxy-middleware forwarding requests and preserving headers
  - Proxy service handles unavailable downstream services gracefully with 503 SERVICE_UNAVAILABLE errors
  - Created Dockerfile with multi-stage build (builder + production) and health check
  - Added service to docker-compose.dev.yml with environment configuration and health check
  - Updated root `.env` with API Gateway configuration (port 4000, JWT secret, CORS origins, rate limits, service URLs)
  - Created comprehensive README.md documenting architecture, features, routes, development setup, and Docker usage
  - Verified build: TypeScript compilation passes without errors
  - Verified Docker: image builds successfully and container runs
  - Verified endpoints: root returns gateway info, health check reports gateway status and downstream service health (currently unavailable as expected)
  - Gateway logs show successful initialization with service registry and route mapping

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
