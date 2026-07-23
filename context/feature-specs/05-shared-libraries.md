Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Create the **shared libraries** consumed by all microservices and the frontend: shared types,
constants, and small utilities. This keeps API contracts consistent across service boundaries.

## Scope of this unit

- Establish a single source of truth for cross-service types and constants.
- Do not implement service logic or database models here.

## Implementation

### Shared package location

Create `shared/` at the repo root with:

```
shared/
  types/
  constants/
  utils/
  index.ts
```

Decide and document the consumption method (path alias / local package). Follow whatever the
project already uses for TypeScript path resolution; keep it simple and buildable by both the
Next.js frontend and the NestJS services.

### Types (`shared/types`)

Define TypeScript interfaces/types that later specs will rely on. At minimum:

- `ApiResponse<T>` — the standard response envelope: `{ success, data?, error?, message? }`.
- `Role` — enum/union: `ADMIN | MANAGER | SALES_REP | VIEWER`.
- `EntityType` — union used by activity/history/email links: `CONTACT | COMPANY`.
- `Pagination` — `{ page, pageSize, total }` and a `Paginated<T>` wrapper.
- Placeholder DTO interfaces for the core entities (`User`, `Organization`, `Contact`,
  `Company`) — minimal fields now; expanded as services are built.

Keep these aligned with the models planned in `06-prisma-schema.md`. Do not duplicate Prisma's
generated types — these are the transport/contract shapes.

### Constants (`shared/constants`)

- Role/permission keys.
- Default pagination size.
- Shared enums (email direction, notification types, activity/post types).

### Utils (`shared/utils`)

- Small pure helpers safe for both frontend and backend (e.g. `slugify`, `isEmail`,
  `assertNever`). No Node-only or browser-only APIs.

### Barrel export

`shared/index.ts` re-exports types, constants, and utils.

## Scope Limits

- No service endpoints, no Prisma, no network calls.
- No Node-specific or browser-specific code in `shared/utils`.
- Keep DTOs minimal — later specs expand them alongside their services.

## Check When Done

- `shared/` exists with `types/`, `constants/`, `utils/`, and a barrel `index.ts`.
- The frontend can import from `shared` without build errors.
- Types compile cleanly (`tsc --noEmit` or equivalent) with strict mode.
- `npm run build` passes for the frontend.
