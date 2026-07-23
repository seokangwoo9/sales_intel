Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **analytics-service** — aggregating CRM metrics and insights: contact/company counts,
activity summaries, email stats, and AI usage. This service pre-computes or queries data for
the dashboard (spec 33).

## Scope of this unit

- Scaffold the `analytics-service` NestJS app.
- Implement endpoints for key metrics (contacts, companies, activity, emails, AI).
- Support time-range filtering (last 7 days, last 30 days, all time).
- Do not build frontend UI (spec 33) or advanced BI features (defer to post-MVP).

## Prerequisite

Specs 04–31 done. All services are active. The gateway routes `/api/analytics/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/analytics-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client and RBAC guards.

### Metrics endpoints

All routes are org-scoped. Return `ApiResponse` envelope. Require at least `SALES_REP` (viewing
own metrics) or `MANAGER`/`ADMIN` (viewing org-wide).

- `GET /api/analytics/overview` — dashboard overview. Query params: `range` (7d/30d/all). Return:
  ```json
  {
    "contacts": { "total": 120, "new": 12, "byOwner": [...] },
    "companies": { "total": 45, "new": 5 },
    "activity": { "posts": 89, "comments": 234 },
    "emails": { "sent": 56, "received": 78, "avgResponseTime": "2 hours" },
    "aiUsage": { "messages": 34, "tokensUsed": 12000 }
  }
  ```
  Compute counts via Prisma aggregations (`count`, `groupBy`). Filter by `createdAt` for `new`.

- `GET /api/analytics/contacts` — detailed contact metrics. Return counts by owner, by creation
  date (time series), by source (if tracked).

- `GET /api/analytics/activity` — activity metrics: posts per day, comments per day, top contributors.

- `GET /api/analytics/emails` — email metrics: sent/received over time, top senders, avg response
  time (time between receiving an email and sending a reply in the same thread).

- `GET /api/analytics/ai` — AI usage: messages per day, tokens used, top users (if org-wide
  view is permitted).

### Performance

- For MVP, real-time queries (Prisma aggregations) are acceptable. For scale, pre-compute metrics
  in a background job (Bull, e.g. nightly) and cache in Redis or a `Metrics` table. Defer this
  optimization to spec 36.

### Time-range filtering

- Accept a `range` param: `7d` (last 7 days), `30d`, `all`. Compute `since = now() - range` and
  filter `createdAt >= since`.

### RBAC

- Users see only their own metrics by default (filter by `ownerId` or `userId`).
- `MANAGER`/`ADMIN` can request org-wide metrics (omit user filter).

## Scope Limits

- No frontend UI (spec 33).
- No advanced BI (custom reports, pivot tables) — defer to post-MVP.
- No data exports (CSV/Excel) — defer to post-MVP or spec 38.
- No real-time dashboards (refresh on load; no WebSocket updates).

## Check When Done

- `services/analytics-service/` runs in Docker Compose.
- Overview endpoint returns key metrics (contacts, companies, activity, emails, AI) filtered by
  time range.
- Detailed metrics endpoints return breakdowns (by owner, by date, etc.).
- RBAC enforces user vs. org-wide views. Build passes.
