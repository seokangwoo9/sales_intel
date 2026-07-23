Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **history-service** — the immutable audit log. Every entity change (contact, company,
post, org, etc.) is recorded here with actor, action, timestamp, and diff. This provides full
transparency and compliance.

## Scope of this unit

- Scaffold the `history-service` NestJS app.
- Implement write-only history event ingestion (no updates/deletes; append-only).
- Provide read endpoints for entity history timelines.
- Do not build frontend UI (spec 23).

## Prerequisite

Specs 04–20 done. `HistoryEvent` (or `AuditLog`) model exists in Prisma (spec 06). Other services
already call/enqueue history writes. The gateway routes `/api/history/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/history-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client and RBAC guards.

### Write endpoint

- `POST /api/history` — create history event. Body:
  ```json
  {
    "organizationId": "<uuid>",
    "actorId": "<userId>",
    "action": "CREATE" | "UPDATE" | "DELETE" | "TRANSFER_OWNERSHIP" | "LINK" | "UNLINK",
    "entityType": "CONTACT" | "COMPANY" | "POST" | "COMMENT" | "ORGANIZATION" | "EMAIL",
    "entityId": "<uuid>",
    "diff": { /* before/after fields or structured change */ }
  }
  ```
- Validate required fields. Insert into `HistoryEvent` table with `createdAt = now()`. Return
  `201 Created`.
- This endpoint is **internal-only** (called by other services, not directly by the frontend).
  Optionally protect with a service auth token (shared secret in env) or trust the gateway
  (since only backend services call it).

### Read endpoints

All routes are org-scoped. Return `ApiResponse` envelope. Require at least `SALES_REP`.

- `GET /api/history` — list history for the active org. Query params: `entityType`, `entityId`
  (filter by entity), `actorId` (filter by actor), `page`, `pageSize`. Sort by `createdAt` desc.
  Return events with actor name (join `User`), action, timestamp, diff.
- `GET /api/history/:entityType/:entityId` — convenience endpoint: fetch history for a specific
  entity (e.g. `GET /api/history/CONTACT/<id>`). Returns the timeline for that contact.

### Event enrichment

- Join with `User` to include actor name/avatar in responses.
- Format `diff` for display: if `diff` is `{ before: {...}, after: {...} }`, the frontend can
  show "Changed name from X to Y."

### Retention & archival

- For MVP, store all events indefinitely. Document a future archival strategy (e.g. move events
  older than 2 years to cold storage).

## Scope Limits

- No updates or deletes (append-only log).
- No frontend UI (spec 23).
- No advanced analytics on history (defer to analytics-service, spec 32).
- No compliance exports yet (defer to post-MVP or spec 38 security hardening).

## Check When Done

- `services/history-service/` runs in Docker Compose.
- History events can be written via `POST /api/history` (called by other services).
- History can be read via `GET /api/history` (org-scoped, entity-filtered, paginated).
- Actor names are included in responses.
- Append-only: no update/delete endpoints. Org isolation enforced. Build passes.
