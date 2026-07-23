Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **file-service** — managing file uploads, storage, and metadata. Files are
attachments on posts/emails/entities, stored on disk (or S3-compatible) with metadata in Postgres.

## Scope of this unit

- Scaffold the `file-service` NestJS app.
- Implement file upload, download, delete with org/entity scoping.
- Store metadata in Postgres; files on disk (or S3 for production).
- Integrate with activity-service (spec 20) for post attachments.
- Do not build frontend UI (spec 22) or email attachments yet (Phase 5).

## Prerequisite

Specs 04–18 done. `Attachment` model exists in Prisma (spec 06). The gateway routes `/api/files/*`
here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/file-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port, `DATABASE_URL`, and storage config (local path
  or S3 credentials).
- Share the Prisma client and RBAC guards.

### Storage strategy

Choose one (document via env):

- **Local disk** (dev/simple deployments): store in a volume (`/uploads` in container), indexed
  by a unique filename (e.g. `<uuid>.<ext>`). Serve via the file-service.
- **S3-compatible** (production): use `@aws-sdk/client-s3` or a storage abstraction (e.g.
  `@nestjs/storage`). Upload to a bucket; store the S3 key in the `Attachment` model. Generate
  presigned URLs for downloads.

For MVP, local disk is acceptable; S3 can be a configuration swap later.

### Endpoints

All routes are org-scoped. Return `ApiResponse` envelope.

- `POST /api/files` — upload file. Multipart form: `file`, `entityType?`, `entityId?` (polymorphic
  link to contact/company/post/email). Store file, create `Attachment` record with metadata:
  filename, size, mimeType, organizationId, uploadedBy, entityType/Id. Return the attachment record.
- `GET /api/files/:id` — download file. Verify the user's org matches the file's org. Stream the
  file or redirect to a presigned URL (if S3).
- `GET /api/files` — list attachments. Query params: `entityType`, `entityId`, `page`, `pageSize`.
  Return metadata only (not the file content).
- `DELETE /api/files/:id` — delete file. Require `ADMIN`/`MANAGER` or uploader. Remove from
  storage and delete the `Attachment` record (or soft-delete).

### Metadata model

The `Attachment` model (spec 06) should have:
- `id`, `filename`, `size`, `mimeType`, `storageKey` (path or S3 key), `organizationId`,
  `uploadedBy`, `entityType`, `entityId`, `createdAt`, `deletedAt?`.

### Security

- Validate file size (limit: 10MB for MVP; configurable via env).
- Validate mimeType against an allowlist (images, PDFs, common docs; block executables).
- Serve downloads with correct `Content-Type` and `Content-Disposition` headers.
- Prevent directory traversal if using local disk (sanitize filenames).

### Integration with activity-service

- Posts (spec 20) can reference attachment IDs. The activity-service calls `POST /api/files` to
  upload, then stores the returned `id` in the post's `attachments` JSON field (or a relation
  if the schema uses one).

## Scope Limits

- No frontend file-picker UI (spec 22).
- No email attachments (Phase 5, spec 26).
- No virus scanning or advanced content validation (defer to post-MVP).
- No thumbnail generation (defer to post-MVP).

## Check When Done

- `services/file-service/` runs in Docker Compose.
- Files can be uploaded via `POST /api/files` and downloaded via `GET /api/files/:id`.
- Metadata is stored in Postgres; files are stored locally (or S3 if configured).
- File size and mimeType validation works. Org isolation enforced. Build passes.
