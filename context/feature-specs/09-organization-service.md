Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **organization-service** — the tenant management core. This service owns
organization CRUD, settings, and is the source of truth for which organizations exist.

## Scope of this unit

- Scaffold the `organization-service` NestJS app.
- Implement organization CRUD (create, read, update, soft-delete).
- Provide org-switching and org-list endpoints for multi-tenant user flows.
- Do not implement member/invitation logic (spec 11) or frontend UI (spec 12).

## Prerequisite

Specs 04–08 done. The `Organization` and `Membership` models exist in Prisma (spec 06). The
gateway routes `/api/organizations/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/organization-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client from spec 06.

### Endpoints

Authenticate all routes via the gateway-injected user context (`x-user-id` from spec 07).
Return the standard `ApiResponse` envelope (from `shared/types`).

- `POST /api/organizations` — create a new organization. The calling user becomes the
  `ADMIN` (create the initial `Membership` record). Generate a unique slug from the name.
- `GET /api/organizations` — list all organizations the authenticated user belongs to
  (join `Membership` where `userId` matches). Return lightweight org records.
- `GET /api/organizations/:id` — fetch one org. Require the user is a member (check
  `Membership`).
- `PATCH /api/organizations/:id` — update org name/settings. Require `ADMIN` role (check
  `Membership.role`).
- `DELETE /api/organizations/:id` — soft-delete (set `deletedAt`). Require `ADMIN` role.
- `POST /api/organizations/:id/switch` — (optional helper) return a refreshed JWT with the
  new active org, or coordinate with the auth-service to update the session org context.

### Validation & security

- Validate org name length/format; ensure slugs are unique.
- Soft-delete: filter out `deletedAt != null` in list/fetch queries.
- Multi-tenant isolation: every read/write verifies the user is a member of the org.

### Error handling

- `404` if org not found or user lacks membership.
- `403` if the operation requires a role the user does not hold.
- Use a global exception filter to wrap errors in `ApiResponse`.

## Scope Limits

- No member management or invitations (spec 11).
- No frontend UI (spec 12).
- Do not implement billing, usage tracking, or advanced settings yet (future phase).

## Check When Done

- `services/organization-service/` runs in Docker Compose.
- A user can create an org via `POST /api/organizations` and becomes an `ADMIN` member.
- `GET /api/organizations` lists only orgs the user belongs to.
- Org update/delete enforce `ADMIN` role; non-members get `403`/`404`.
- All responses use the `ApiResponse` envelope. Soft-delete filters deleted orgs. Build passes.
