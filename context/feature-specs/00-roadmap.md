# SalesIntel CRM — Feature Spec Roadmap

This is the master index of every feature spec in this folder. Each spec is a self-contained
instruction file for Claude (in VS Code) to build **one increment** of the app. Feed them to
Claude **one at a time, in numerical order**. Do not skip ahead — later specs assume earlier
ones are complete.

## How to use this folder

1. Open a fresh Claude session in VS Code inside the project root.
2. Tell Claude to read the spec file for the current step (e.g. `context/feature-specs/04-...md`).
3. Let Claude implement it. Verify the "Check when done" section passes.
4. Update `context/progress-tracker.md`.
5. Move to the next file.

Every spec instructs Claude to read the relevant `context/*.md` files first. Always keep
`AGENTS.md`, `architecture-context.md`, `code-standards.md`, and `ui-context.md` accurate.

## Architecture summary (read before starting)

- **Frontend:** Next.js (App Router) at the repo **root** (`app/`, `components/`, `lib/`).
- **Backend:** NestJS **microservices** under **`services/`** at the repo root.
- **Database:** PostgreSQL + Prisma, with the `pgvector` extension for AI embeddings.
- **Auth:** Better Auth runs inside a dedicated **`auth-service`**; the Next.js frontend uses
  the Better Auth client; JWTs are validated at the API gateway.
- **Communication:** HTTP/REST between services, through an **API gateway**.
- **Infra:** Docker + Docker Compose. Redis for cache/queues. Bull for background jobs.
  Socket.IO for realtime.

The current directory already contains a scaffolded Next.js app (shadcn/ui installed, Better
Auth chosen). The backend `services/` folder does not exist yet and is created in Phase 1.

---

## Spec sequence

### Phase 0 — Frontend foundation (already started)

| #  | File | Purpose |
| -- | ---- | ------- |
| 01 | `01-design-system.md` | Install/configure shadcn/ui, `lucide-react`, `cn()` helper, theme. |
| 02 | `02-workspace.md` | Base app chrome: top navbar + collapsible left sidebar shell. |
| 03 | `03-auth.md` | Wire Better Auth client into Next.js: auth pages, redirects, route protection, profile menu. (Backend auth-service is built in 08.) |

### Phase 1 — Backend foundation & infrastructure

| #  | File | Purpose |
| -- | ---- | ------- |
| 04 | `04-monorepo-docker.md` | Add `services/` structure, Docker Compose (Postgres + pgvector, Redis), env strategy. |
| 05 | `05-shared-libraries.md` | Shared types/utils/constants consumed by all services and the frontend. |
| 06 | `06-prisma-schema.md` | Full Prisma schema: all core models, multi-tenant keys, enums, indexes, pgvector, first migration. |
| 07 | `07-api-gateway.md` | NestJS API gateway: routing to services, CORS, rate limiting, JWT validation, request logging. |
| 08 | `08-auth-service.md` | NestJS auth-service hosting Better Auth: register/login/logout, sessions, JWT issuance, invitations hook. |

### Phase 2 — Organizations, users & access control

| #  | File | Purpose |
| -- | ---- | ------- |
| 09 | `09-organization-service.md` | Org CRUD, org settings, multi-tenancy boundary, org membership records. |
| 10 | `10-rbac-and-tenancy.md` | Roles/permissions (Admin/Manager/Sales Rep/Viewer), guards, tenant-isolation middleware. |
| 11 | `11-members-invitations.md` | Invite users, accept/join, role assignment, remove members. |
| 12 | `12-org-frontend.md` | Org switcher, org settings pages, team management UI, wire to services via gateway. |

### Phase 3 — Contacts & companies

| #  | File | Purpose |
| -- | ---- | ------- |
| 13 | `13-contact-service.md` | Contact CRUD, custom fields, search/filter, pagination. |
| 14 | `14-company-service.md` | Company CRUD, hierarchy (parent→subsidiaries), search/filter. |
| 15 | `15-ownership-and-relationships.md` | Ownership + transfer (with notification + history hooks), contact↔company many-to-many. |
| 16 | `16-contacts-frontend.md` | Contact list, detail page, create/edit forms, ownership transfer UI. |
| 17 | `17-companies-frontend.md` | Company list, detail page, forms, hierarchy view, link contacts. |
| 18 | `18-import-export.md` | CSV/Excel import (field mapping) and export for contacts and companies. |

### Phase 4 — Activity feed, files & history

| #  | File | Purpose |
| -- | ---- | ------- |
| 19 | `19-file-service.md` | File upload/storage (filesystem, S3-ready), access control, thumbnails. |
| 20 | `20-activity-service.md` | Posts, comments, @mentions, attachments, activity feed aggregation. |
| 21 | `21-history-service.md` | Audit logging + change tracking across entities; ownership-history retrieval. |
| 22 | `22-activity-frontend.md` | Timeline feed UI, post composer (rich text), comments, mention autocomplete, file upload. |
| 23 | `23-history-frontend.md` | History tab on contact/company pages; admin audit-log viewer. |

### Phase 5 — Email system

| #  | File | Purpose |
| -- | ---- | ------- |
| 24 | `24-email-infrastructure.md` | Org-level SMTP/IMAP config (encrypted), user email linking, connection handling. |
| 25 | `25-email-service-core.md` | Send/receive/store emails, threading, attachments, link to contacts/companies. |
| 26 | `26-email-sync-autocontact.md` | IMAP polling (Bull), dedupe, auto-create contact/company from known senders. |
| 27 | `27-email-templates.md` | Template CRUD with merge fields/variables. |
| 28 | `28-email-frontend.md` | Inbox UI, composer, thread view, reply/forward, link emails into timelines. |

### Phase 6 — AI, analytics & notifications

| #  | File | Purpose |
| -- | ---- | ------- |
| 29 | `29-ai-service-foundation.md` | AI-service = custom OpenAI (GPT-5.4) proxy: key mgmt, rate limits, cost tracking, logging. |
| 30 | `30-ai-indexing-rag.md` | Embeddings pipeline (Bull), pgvector storage, semantic retrieval (RAG), chat persistence model. |
| 31 | `31-ai-chat-frontend.md` | AI chat UI, resume chat, context indicators, email-draft preview + send-on-approval actions. |
| 32 | `32-analytics-service.md` | Metrics engines, dashboard aggregation, report generation. |
| 33 | `33-analytics-dashboard.md` | Dashboard UI (charts), sales/engagement/team/email metrics, PDF/Excel export. |
| 34 | `34-notification-service.md` | Notification creation/delivery, Socket.IO realtime broadcast, org rooms. |
| 35 | `35-notifications-frontend.md` | Notification center, realtime activity/feed updates, presence, preferences. |

### Phase 7 — Polish, hardening & deployment

| #  | File | Purpose |
| -- | ---- | ------- |
| 36 | `36-performance-optimization.md` | Caching (Redis), query/index tuning, pagination sweep, frontend code-splitting/lazy load. |
| 37 | `37-testing.md` | Unit/integration/E2E strategy, critical-flow tests, tenant-isolation tests. |
| 38 | `38-security-hardening.md` | Input validation, encryption, CSRF/XSS, rate-limit tuning, secrets, security audit checklist. |
| 39 | `39-production-deployment.md` | Production Docker Compose, Nginx/SSL, backups, env config, CI/CD, rollback. |
| 40 | `40-monitoring-launch.md` | Prometheus/Grafana/Loki, error tracking, uptime, onboarding, launch checklist. |

---

## Conventions used in every spec

- Starts with **Read** instructions (which context files to load first).
- Focused **scope**: one service or one feature slice.
- Explicit **Scope Limits** to stop Claude from over-building.
- A **Check when done** checklist ending with a build/verify step.
- References the finalized stack: Next.js, NestJS, Prisma, PostgreSQL+pgvector, Better Auth,
  OpenAI GPT-5.4, Redis, Bull, Socket.IO, Docker.

> Total: **40 spec files** (01–40). Feed in order. Update `progress-tracker.md` after each.
