Set up the **backend monorepo structure and containerized infrastructure**. This unit creates
the `services/` layout and Docker Compose — no service business logic yet.

## Scope of this unit

- Create the folder structure for NestJS microservices.
- Add Docker Compose for local development (PostgreSQL with pgvector, Redis).
- Establish the environment-variable strategy.
- Do not implement any service endpoints, Prisma models, or auth yet.

## Implementation

### Backend folder structure

Create a `services/` directory at the repo root (the Next.js app stays at the root as the
frontend). Add empty, clearly-named service folders that later specs will fill:

```
services/
  api-gateway/
  auth-service/
  organization-service/
  contact-service/
  company-service/
  activity-service/
  email-service/
  ai-service/
  analytics-service/
  notification-service/
  file-service/
  history-service/
```

Each service folder gets a placeholder `README.md` stating its responsibility (copy the
one-line purpose from `architecture-context.md`). Do not scaffold NestJS apps yet unless a
later spec requires it — keep this to structure + infra.

### Docker Compose (development)

Create `docker-compose.dev.yml` at the repo root with:

- **postgres**: use a Postgres image that supports the `pgvector` extension (e.g. the
  `pgvector/pgvector` image pinned to a Postgres 16 tag). Expose `5432`, set db/user/password
  via env, persist a named volume.
- **redis**: Redis 7 alpine, expose `6379`.

Leave service containers commented out with a clear TODO noting later specs will add them.

### Environment strategy

- Create `.env.example` at the repo root documenting every variable the system will need
  (database URL, Redis URL, auth URL, OpenAI key placeholder, etc.). Use placeholders, never
  real secrets.
- Document that each service reads its own env, and that `DATABASE_URL` points at the compose
  Postgres in development.
- Ensure `.env` is gitignored (check the existing `.gitignore`; add if missing).

### Root scripts / docs

- Add a short `services/README.md` explaining the microservices layout and how services talk
  through the API gateway.
- Update `context/progress-tracker.md` to mark the backend structure as started.

## Scope Limits

- Do not scaffold NestJS applications or install backend dependencies yet.
- Do not define Prisma models (that is spec 06).
- Do not add the API gateway logic (spec 07) or auth (spec 08).
- Do not modify the existing Next.js frontend.

## Check When Done

- `services/` exists with all 12 named folders, each with a purpose README.
- `docker-compose.dev.yml` starts Postgres (pgvector-capable) and Redis successfully
  (`docker compose -f docker-compose.dev.yml up -d`).
- `.env.example` documents all needed variables; `.env` is gitignored.
- No changes to the frontend build; `npm run build` still passes.
