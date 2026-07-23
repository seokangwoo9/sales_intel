Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Establish **RBAC and multi-tenant enforcement** across the backend. This unit creates reusable
guards, decorators, and utilities that every service uses to protect resources and isolate
tenant data.

## Scope of this unit

- Create shared auth guards and decorators for role/permission checks.
- Create a tenant-isolation utility enforcing `organizationId` scoping in queries.
- Document the permission model and integrate it into existing services.
- Do not implement new service endpoints; retrofit existing services (org, future contact/etc.).

## Prerequisite

Specs 04–09 done. The `Membership` model with `role` exists (spec 06). The gateway injects
`x-user-id` and `x-org-id` (spec 07).

## Implementation

### Shared RBAC library

Create in `shared/auth` (or a NestJS shared module if preferred):

- **RolesGuard**: a NestJS guard extracting `x-user-id` and `x-org-id` from headers, loading
  the user's `Membership` for the org, and attaching the role to the request context.
- **@Roles(...)** decorator: marks route handlers with required roles (`ADMIN`, `MANAGER`, etc.).
  The guard checks the user's role against this list; `403` if insufficient.
- **Permission matrix**: document which role can do what (CRUD on contacts/companies/posts,
  manage members, etc.). Keep this aligned with `context/architecture-context.md`. For now,
  simple role hierarchy: `ADMIN > MANAGER > SALES_REP > VIEWER`. Viewer is read-only.

### Multi-tenant query utility

- **TenantService / scoped Prisma client wrapper**: a utility ensuring every query auto-filters
  by the active `organizationId`. For tenant-scoped models, inject the org id into every
  `where` clause; reject queries missing it.
- Alternatively, use Prisma middleware or row-level-security patterns if preferred; document
  the approach clearly.

### Retrofit existing services

- Add `RolesGuard` and `@Roles()` to the organization-service (spec 09). Admin-only routes
  (update/delete org) already check role, but now use the shared guard.
- Document that every future service must apply `RolesGuard` globally or per-controller and
  mark role requirements explicitly.

### Error responses

- `403 Forbidden` with a message when role check fails.
- `404 Not Found` when tenant filtering hides a resource (never leak existence to non-members).

## Scope Limits

- No new business endpoints; this is infrastructure only.
- Do not implement attribute-based or fine-grained permissions yet (RBAC roles are sufficient
  for MVP).
- Do not build a permissions UI (spec 12 covers frontend org settings).

## Check When Done

- `shared/auth` (or equivalent) exports `RolesGuard`, `@Roles()`, and tenant-scoping helpers.
- Organization-service routes enforce role requirements via the shared guard.
- The permission matrix is documented (inline or in architecture-context.md).
- A `VIEWER` cannot update/delete; an `ADMIN` can. Non-members get `404`.
- All queries on tenant-scoped models filter by `organizationId`. Build passes.
