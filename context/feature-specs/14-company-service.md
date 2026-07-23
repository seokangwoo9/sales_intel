Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **company-service** — managing business entities (companies) with hierarchies,
domains, and ownership. Companies relate to contacts (spec 15) and support the same
CRUD/history/ownership patterns as contacts.

## Scope of this unit

- Scaffold the `company-service` NestJS app.
- Implement company CRUD with ownership, search/filter, pagination, and soft-delete.
- Support company hierarchies (parent/child via self-relation).
- Track domain/website; use for auto-linking emails (spec 26 will consume this).
- Integrate with history-service (deferred writes; spec 21 builds the receiver).
- Do not implement contact linking (spec 15), frontend UI (spec 17), or import/export (spec 18).

## Prerequisite

Specs 04–13 done. `Company` model exists in Prisma (spec 06) with `parentId` self-relation.
RBAC guards active (spec 10). The gateway routes `/api/companies/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/company-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client and RBAC guards.

### Endpoints

All routes are org-scoped (`organizationId` from `x-org-id`). Return `ApiResponse` envelope.
Require at least `SALES_REP` unless noted.

- `POST /api/companies` — create company. Body: `{ name, domain?, parentId?, ownerId?, customFields? }`.
  Default `ownerId` to creator. Emit history event.
- `GET /api/companies` — list companies for the active org. Support query params: `search` (name/
  domain fuzzy), `parentId` (filter children of a parent, or `null` for top-level), `ownerId`,
  `page`, `pageSize`. Return paginated.
- `GET /api/companies/:id` — fetch one company. Include `parent` and `children` relations
  (lightweight; just id+name, or full fetch on demand).
- `PATCH /api/companies/:id` — update fields. Detect ownership transfer; emit history.
- `DELETE /api/companies/:id` — soft-delete. Require `MANAGER`/`ADMIN` or owner. Do NOT cascade
  delete children (optionally re-parent them to null, or block delete if children exist). Emit
  history.

### Company hierarchies

- A company can have a `parentId` (FK to another Company in the same org). Enforce org match
  (parent must be in the same org).
- The hierarchy is display-only for now (org chart view in spec 17). No permission inheritance.
- Prevent cycles: validate `parentId` does not create a loop (recursive check or disallow
  multi-level nesting if simpler).

### Domain tracking

- Store `domain` (e.g. `acme.com`). Normalize (lowercase, strip protocol).
- Used by email-service (spec 26) to auto-create contacts/link emails when a known domain appears.

### Custom fields

- Same JSON column pattern as contacts (spec 13). No schema enforcement.

### Ownership & history

- Same ownership model as contacts: `ownerId`, transfer detection, history on all changes.
- Call `POST /api/history` or enqueue; may 404 if history-service not yet built (log and continue).

### Search & filter

- `search`: fuzzy match on `name` + `domain`.
- `parentId`: exact or `null` for top-level.
- Pagination: `skip`/`take`, return `Paginated<Company>`.

### Validation & errors

- Validate domain format (basic regex).
- `404` if company not found or not in user's org.
- Soft-delete: filter `deletedAt = null`.

## Scope Limits

- No contact linking (spec 15).
- No frontend UI (spec 17).
- No import/export (spec 18).
- History/notification calls may fail gracefully.

## Check When Done

- `services/company-service/` runs in Docker Compose.
- Companies can be created, listed (search/filter/pagination), fetched, updated, and deleted.
- Parent/child hierarchy is enforced (same org, no cycles).
- Domain is normalized and stored for later email auto-linking.
- Ownership and history integration work as in contact-service. Soft-delete and RBAC active. Build passes.
