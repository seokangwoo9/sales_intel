Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **contact-service** — the core of CRM contact management. Contacts are org-scoped,
owned, and support custom fields, linked companies, and full CRUD with history tracking.

## Scope of this unit

- Scaffold the `contact-service` NestJS app.
- Implement contact CRUD with ownership, search/filter, and pagination.
- Support custom fields (JSON column).
- Integrate with the history-service for audit trails (deferred writes; spec 21 builds history).
- Do not implement company linking (spec 15), frontend UI (spec 16), or import/export (spec 18).

## Prerequisite

Specs 04–12 done. `Contact` model exists in Prisma (spec 06). RBAC guards active (spec 10).
The gateway routes `/api/contacts/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/contact-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client (spec 06) and the RBAC guards (spec 10).

### Endpoints

All routes are org-scoped (filter by `organizationId` from `x-org-id` header). Return
`ApiResponse` envelope. Require at least `SALES_REP` role unless noted.

- `POST /api/contacts` — create contact. Body: `{ name, email?, phone?, customFields?, ownerId? }`.
  If `ownerId` omitted, default to the creating user. Emit a history event (call history-service
  or queue a job; spec 21 will implement the receiver).
- `GET /api/contacts` — list contacts for the active org. Support query params: `search` (name/
  email fuzzy), `ownerId`, `page`, `pageSize`. Return paginated results.
- `GET /api/contacts/:id` — fetch one contact. Verify org membership.
- `PATCH /api/contacts/:id` — update contact fields. Detect ownership change (if `ownerId`
  changed, emit history + notification event). Emit history for every field change.
- `DELETE /api/contacts/:id` — soft-delete (set `deletedAt`). Require `MANAGER` or `ADMIN`, or
  owner if ownership rules allow. Emit history.

### Custom fields

- Store as a JSON column (`customFields`). The frontend (spec 16) will define the schema; the
  backend treats it as opaque JSON. Validate it is valid JSON on write; no further schema
  enforcement here.

### Ownership

- Every contact has an `ownerId` (FK to User). The owner sees the contact by default; managers/
  admins see all contacts in their org (honor RBAC).
- On ownership transfer (PATCH changing `ownerId`), emit a history event and notify the new owner
  (queue a notification job; spec 34 implements notifications).

### History integration

- After create/update/delete, call `POST /api/history` (or enqueue a Bull job to the history
  queue) with: `{ organizationId, actorId, action, entityType: 'CONTACT', entityId, diff }`.
  The diff is the changed fields (before/after). Spec 21 will implement the history-service
  receiver; for now, the call may 404 — that is acceptable (log and continue).

### Search & filter

- `search` param: use Prisma `contains` on `name` + `email` (case-insensitive if possible).
- `ownerId` param: exact match.
- Pagination: use `skip`/`take`; return `{ data, pagination: { page, pageSize, total } }`.

### Validation & errors

- Validate email format if provided.
- `404` if contact not found or not in the user's org.
- Soft-delete: filter `deletedAt = null` in list/fetch.

## Scope Limits

- No company linking (spec 15).
- No frontend UI (spec 16).
- No import/export (spec 18).
- History/notification calls may fail if those services are not yet built — log and continue.

## Check When Done

- `services/contact-service/` runs in Docker Compose.
- Contacts can be created, listed (with search/filter/pagination), fetched, updated, and deleted.
- `ownerId` defaults to creator; ownership transfer is detected.
- Custom fields (JSON) are stored and returned.
- Soft-delete filters deleted contacts. RBAC enforces role requirements. Build passes.
