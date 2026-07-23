Read the Prisma section of any relevant docs. This spec defines the **entire database
schema** — the shared data foundation every service builds on.

## Scope of this unit

- Define the full Prisma schema for all core entities.
- Set up Prisma client generation and the first migration.
- Enable the `pgvector` extension.
- Do not build any service endpoints or business logic here.

## Prerequisite

Spec 04 (Docker Postgres with pgvector) and spec 05 (shared libraries) must be done. The
compose Postgres must be running.

## Implementation

### Prisma setup

- Choose the Prisma location per `architecture-context.md`. Since the schema is shared across
  services, place it in a shared/central location (e.g. `prisma/` at the repo root or a
  `database/` package) and document how services consume the generated client.
- Install Prisma + client where the schema lives.
- Configure `datasource` for PostgreSQL reading `DATABASE_URL`.
- Enable the `postgresqlExtensions` preview feature and declare `vector` (pgvector).

### Models

Define all core models with multi-tenant isolation. **Every tenant-scoped model carries an
`organizationId`** and is indexed on it. Use `cuid()`/`uuid()` ids, `createdAt`/`updatedAt`
timestamps, and soft-delete (`deletedAt`) where records must retain history.

Core models (expand fields sensibly; keep aligned with `shared/types`):

- **User** — global identity (managed with Better Auth). Basic profile fields.
- **Organization** — tenant root. Name, slug, settings.
- **Membership** — join of User↔Organization with a `role` enum. Unique on
  `(userId, organizationId)`.
- **Contact** — org-scoped. Name, emails, phones, custom fields (JSON), `ownerId`.
- **Company** — org-scoped. Name, domain, `parentId` (self-relation for hierarchy), `ownerId`.
- **ContactCompany** — many-to-many join (a contact in multiple companies; roles/titles).
- **Post / Activity** — org-scoped timeline entries linked to an entity
  (`entityType` + `entityId`), author, body (rich text), type.
- **Comment** — on posts; author, body; supports mentions.
- **Mention** — links a comment/post to a mentioned user.
- **Attachment** — file metadata (links to file-service records), polymorphic parent.
- **HistoryEvent / AuditLog** — org-scoped, immutable. Actor, action, entity ref, diff (JSON),
  timestamp. Includes ownership-transfer events.
- **EmailAccount** — per-user or per-org mail config (store secrets encrypted — see security
  standards; do not store plaintext credentials).
- **EmailMessage** — org-scoped. Direction, from/to, subject, body, threadId, linked entity.
- **EmailTemplate** — org-scoped. Name, subject, body with merge fields.
- **Notification** — per-user. Type, payload (JSON), read state.
- **AiChat** — one saved chat per user (per `architecture-context.md`). Messages relation.
- **AiMessage** — role, content, token usage, chat relation.
- **Embedding** — pgvector column for RAG. Source entity ref, chunk text, `vector` column.
  Add the appropriate vector index (e.g. IVFFlat/HNSW) via migration SQL.

Define **enums**: `Role`, `EntityType`, `EmailDirection`, `ActivityType`, `NotificationType`.
Keep enum values identical to `shared/constants`.

### Indexes & constraints

- Index every `organizationId`, every `ownerId`, and common filter/sort columns.
- Add composite indexes for frequent queries (e.g. `(organizationId, createdAt)`).
- Foreign keys with sensible `onDelete` behavior; prefer soft-delete over cascade where
  history matters.

### Migration

- Create the initial migration.
- Add a migration step that runs `CREATE EXTENSION IF NOT EXISTS vector;` before the embedding
  table, and creates the vector index.
- Generate the Prisma client.

## Scope Limits

- No service endpoints, controllers, or resolvers.
- No seed data beyond an optional minimal dev seed (clearly marked, dev-only).
- Do not implement encryption logic here — only mark which fields are encrypted-at-rest and
  leave the actual encryption to the owning service.

## Check When Done

- `prisma/schema.prisma` (or chosen location) contains all models and enums above.
- `prisma migrate dev` applies cleanly against the compose Postgres.
- The `vector` extension is enabled and the `Embedding` vector index exists.
- Prisma client generates without errors.
- Enums match `shared/constants`; tenant models all carry indexed `organizationId`.
