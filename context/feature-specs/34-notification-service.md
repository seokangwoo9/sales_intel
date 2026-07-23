Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **notification-service** — real-time and stored notifications for users: ownership
assignments, mentions, invitations, and system alerts. Notifications are displayed in-app and
(optionally) pushed via WebSocket.

## Scope of this unit

- Scaffold the `notification-service` NestJS app.
- Implement notification CRUD (create, list, mark as read, delete).
- Consume notification jobs queued by other services (ownership transfer, mentions, invitations).
- Optionally: WebSocket push for real-time delivery.
- Do not build frontend UI (spec 35).

## Prerequisite

Specs 04–33 done. `Notification` model exists in Prisma (spec 06). Bull queue is configured.
Other services already enqueue notification jobs (specs 15, 20, 11). The gateway routes
`/api/notifications/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/notification-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client and RBAC guards.

### Notification model (reminder)

The `Notification` model (spec 06) should have:
- `recipientId` (userId), `type` (enum: `OWNERSHIP_ASSIGNED`, `MENTION`, `INVITATION_RECEIVED`,
  `SYSTEM_ALERT`), `payload` (JSON with context: entity name, actor, etc.), `read` (bool),
  `createdAt`.

### Endpoints

All routes are user-scoped (recipient = calling user). Return `ApiResponse` envelope.

- `GET /api/notifications` — list notifications for the user. Query params: `unread` (bool),
  `page`, `pageSize`. Sort by `createdAt` desc. Include `type`, `payload`, `read`, `createdAt`.
- `GET /api/notifications/unread-count` — return `{ count: <number> }` (quick endpoint for badge).
- `PATCH /api/notifications/:id` — mark as read. Body: `{ read: true }`.
- `PATCH /api/notifications/mark-all-read` — mark all user's notifications as read.
- `DELETE /api/notifications/:id` — delete notification (or soft-delete if preferred).

### Job consumer (Bull)

Listen to the `notifications` queue (created/enqueued by other services):

- Job payload: `{ recipientId, type, payload }`.
- Job handler:
  1. Create a `Notification` record.
  2. (Optional) If WebSocket is enabled, push to the user's active WebSocket connection.

Job types (examples from other specs):

- `OWNERSHIP_ASSIGNED` (spec 15): when a contact/company is assigned to a new owner.
- `MENTION` (spec 20): when a user is mentioned in a post/comment.
- `INVITATION_RECEIVED` (spec 11): when a user is invited to an org.
- `SYSTEM_ALERT`: generic system notifications (e.g. "Your email sync failed").

### WebSocket push (optional)

Use Socket.IO (planned in the stack):

- Set up a Socket.IO server in the notification-service (or in the API gateway).
- When a user connects, authenticate them (verify JWT, store `userId` → `socketId` mapping).
- When creating a notification, if the recipient is online (has an active socket), emit:
  `socket.emit('notification', { id, type, payload, createdAt })`.
- Frontend (spec 35) will listen and show a toast or update the notification list.

For MVP, WebSocket is optional; polling (`GET /api/notifications/unread-count` every 30s) is
acceptable.

## Scope Limits

- No frontend UI (spec 35).
- No email/SMS notifications (defer to post-MVP).
- No notification preferences (user settings to mute types) — defer to post-MVP.
- No batching/digesting (e.g. daily summary emails) — defer to post-MVP.

## Check When Done

- `services/notification-service/` runs in Docker Compose.
- Notifications are created when jobs are consumed (enqueued by other services).
- Users can list, mark as read, and delete notifications.
- Unread count endpoint works.
- (Optional) WebSocket push delivers real-time notifications to online users. Build passes.
