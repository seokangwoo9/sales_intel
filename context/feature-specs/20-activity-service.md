Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **activity-service** — the timeline/feed backbone. Posts are rich-text updates linked
to entities (contacts/companies), supporting comments, mentions, and attachments. Visible to
all org members.

## Scope of this unit

- Scaffold the `activity-service` NestJS app.
- Implement CRUD for posts (org-scoped timeline entries) with entity linking.
- Implement comments and mentions.
- Integrate with file-service (spec 19) for attachments.
- Emit history events for post/comment creation.
- Do not build frontend UI (spec 22).

## Prerequisite

Specs 04–19 done. `Post`, `Comment`, `Mention` models exist in Prisma (spec 06). File-service
active (spec 19). The gateway routes `/api/activity/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/activity-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client and RBAC guards.

### Post endpoints

All routes are org-scoped. Return `ApiResponse` envelope. Require at least `SALES_REP`.

- `POST /api/activity/posts` — create post. Body: `{ body, entityType?, entityId?, attachments? }`.
  `body` is rich text (Tiptap HTML or JSON; store as text/JSON). `entityType`/`entityId` link to
  contact/company. `attachments` is an array of file IDs (uploaded via file-service). Author is
  the calling user. Parse mentions from body (e.g. `@userId` or `data-mention` attributes in HTML)
  and create `Mention` records. Emit history.
- `GET /api/activity/posts` — list posts. Query params: `entityType`, `entityId` (filter by
  linked entity), `page`, `pageSize`. Include `author` (user name/avatar), `comments` (count or
  preview), `attachments` (metadata from file-service). Sort by `createdAt` desc.
- `GET /api/activity/posts/:id` — fetch one post with full comments.
- `PATCH /api/activity/posts/:id` — update post body/attachments. Only author or `ADMIN` can edit.
  Re-parse mentions if body changed. Emit history.
- `DELETE /api/activity/posts/:id` — soft-delete post. Only author or `ADMIN`. Emit history.

### Comment endpoints

- `POST /api/activity/posts/:postId/comments` — create comment. Body: `{ body }`. Parse mentions.
  Emit history.
- `GET /api/activity/posts/:postId/comments` — list comments for a post. Paginate if needed.
- `PATCH /api/activity/comments/:id` — edit comment. Only author or `ADMIN`.
- `DELETE /api/activity/comments/:id` — soft-delete comment. Only author or `ADMIN`.

### Mentions

- When creating/editing posts or comments, parse the body for mentions. Mentions can be inline
  `@username` or structured (Tiptap mention nodes with `data-id`). Extract user IDs and create
  `Mention` records linking to the post/comment.
- Notify mentioned users (enqueue a notification job; spec 34 will consume).

### Attachments

- Store attachment IDs (from file-service) in a `attachments` JSON array on the post, or use a
  proper relation if the schema has one. When fetching posts, resolve attachment metadata via
  `GET /api/files?entityType=POST&entityId=<postId>` (or include in the response if the relation
  is eager).

### Entity linking & filtering

- Posts link to `entityType` + `entityId` (e.g. `CONTACT:<id>` or `COMPANY:<id>`). When fetching
  a contact/company detail page (specs 16–17), the frontend will call
  `GET /api/activity/posts?entityType=CONTACT&entityId=<id>` to show the activity feed.

### History integration

- Emit history events for post/comment create/update/delete. Call `POST /api/history` or enqueue.

## Scope Limits

- No frontend UI (spec 22).
- No real-time updates yet (Socket.IO integration in a future iteration or spec 22 can add it).
- No reactions/likes (defer to post-MVP).
- No email-activity integration (Phase 5).

## Check When Done

- `services/activity-service/` runs in Docker Compose.
- Posts can be created, listed (with entity filtering), fetched, updated, and deleted.
- Comments work on posts; mentions are parsed and stored.
- Attachments (via file IDs) are linked to posts.
- History events are emitted. Org isolation enforced. Build passes.
