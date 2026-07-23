Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.
Also revisit `03-auth.md` — this spec builds the **server** side the frontend client points at.

Build the **NestJS auth-service** hosting **Better Auth**. This service owns identity:
registration, login/logout, sessions, and JWT issuance for the gateway to validate.

## Scope of this unit

- Scaffold the `auth-service` NestJS app.
- Host Better Auth with email+password (and the mechanisms the frontend client expects).
- Issue JWTs the API gateway can validate; expose session endpoints.
- Provide the **invitation acceptance hook** surface (full invitation flow is spec 11).
- Do not implement organizations, roles, or member management logic here (Phase 2).

## Prerequisite

Specs 04–07 done. The `User` model exists in the Prisma schema (spec 06). The gateway (spec 07)
routes `/api/auth/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/auth-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port, `DATABASE_URL`, JWT keys, and the frontend URL.

### Better Auth server

- Install and configure Better Auth on the server side.
- Use the shared Prisma/Postgres database (spec 06) as Better Auth's store — reuse the `User`
  model; add Better Auth's required tables via its adapter/migration without duplicating the
  user identity.
- Enable email + password. Configure session handling.
- Mount Better Auth's handler under the route path the gateway forwards (`/api/auth/*`), and
  ensure the base URL matches `NEXT_PUBLIC_AUTH_URL` from spec 03.

### JWT issuance

- On successful authentication, issue a JWT containing at least `userId` and (once orgs exist)
  the active `organizationId`. Sign with the key the gateway validates against (spec 07).
- Provide a session/refresh strategy consistent with Better Auth. Keep tokens short-lived with
  refresh where appropriate.
- Expose an endpoint the gateway/frontend can call to resolve the current session/user.

### Invitation hook (surface only)

- Provide an endpoint stub for **accepting an invitation token** at signup/login time that the
  full flow (spec 11) will complete. For now: validate the token shape and create/link the
  user, leaving org/role assignment as a documented TODO delegated to the organization-service.

### Security

- Hash credentials via Better Auth's mechanism; never store plaintext.
- Rate-limit auth endpoints (defense in depth even though the gateway also limits).
- Return the standard `ApiResponse` envelope for custom endpoints; let Better Auth's own routes
  keep their expected contract.

## Scope Limits

- No organization CRUD, roles, or permissions (Phase 2).
- No email templates/sending for verification beyond what Better Auth needs; integrate real
  email later via email-service.
- Do not re-implement session logic Better Auth already provides.

## Check When Done

- `services/auth-service/` runs in Docker Compose and connects to the shared Postgres.
- Register, login, logout, and session retrieval work end-to-end through the gateway
  (`/api/auth/*`) and from the frontend client (spec 03).
- A valid login yields a JWT the API gateway accepts on protected routes.
- Invitation-acceptance endpoint stub exists with a documented handoff to spec 11.
- Credentials are hashed; auth endpoints are rate-limited. `npm run build` passes for the service.
