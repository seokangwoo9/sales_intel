Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **notifications frontend**: notification bell/dropdown in the navbar, notification list,
and real-time updates (if WebSocket is enabled). Users see ownership assignments, mentions,
invitations, and system alerts.

## Scope of this unit

- Notification bell icon in the navbar with unread count badge.
- Notification dropdown listing recent notifications.
- Notification list page (full history).
- Mark as read, mark all as read, and delete actions.
- Optionally: real-time push via Socket.IO (if spec 34 implemented it).
- Do not build notification preferences (defer to post-MVP).

## Prerequisite

Specs 03, 10, 34 done. Notification-service is active. The user is authenticated and has an
active org.

## Implementation

### Notification bell (navbar)

Update `components/workspace/workspace-navbar.tsx`:

- Add a bell icon (`Bell` from lucide-react) with a badge showing unread count.
- Fetch unread count (`GET /api/notifications/unread-count`) with React Query. Poll every 30s
  (or use WebSocket for real-time updates; see below).
- Clicking the bell opens a dropdown (shadcn `DropdownMenu` or `Popover`) showing the latest 5
  notifications (preview mode).

### Notification dropdown

Inside the dropdown:

- Fetch recent notifications (`GET /api/notifications?page=1&pageSize=5`) with React Query.
- Display each notification: icon (based on type: `UserPlus` for ownership, `AtSign` for mention,
  `Mail` for invitation), short message (e.g. "You were assigned Contact: John Doe by Alice"),
  timestamp (relative, e.g. "2 hours ago" via `date-fns`).
- Clicking a notification marks it as read (`PATCH /api/notifications/:id`) and navigates to the
  relevant entity (e.g. `/contacts/:id` for a contact ownership notification). Extract entity ID
  and type from `payload`.
- "View All" link at the bottom navigates to `/notifications`.

### Notification list page

Create `app/(workspace)/notifications/page.tsx`:

- Fetch all notifications (`GET /api/notifications?page=1&pageSize=20`) with React Query.
- Display as a list (shadcn `Card` or custom list): icon, full message, timestamp, read status
  (badge or styling: unread is bold or highlighted).
- "Mark as Read" button on each unread notification: `PATCH /api/notifications/:id`.
- "Mark All as Read" button at the top: `PATCH /api/notifications/mark-all-read`.
- "Delete" button on each notification: `DELETE /api/notifications/:id`, confirm via dialog.
- Pagination controls.

### Notification message formatting

Based on `type` and `payload`:

- `OWNERSHIP_ASSIGNED`: "You were assigned {entityType}: {entityName} by {actorName}".
- `MENTION`: "{actorName} mentioned you in a {post/comment}: {preview}".
- `INVITATION_RECEIVED`: "You were invited to join {orgName} by {actorName}".
- `SYSTEM_ALERT`: display `payload.message` directly.

Parse `payload` JSON to extract fields.

### Real-time updates (optional, if spec 34 implemented WebSocket)

If Socket.IO is enabled:

- Connect to the notification-service Socket.IO server when the app loads (in a global context or
  layout). Authenticate with the JWT.
- Listen for `notification` events. On receive, increment the unread count badge, show a toast
  (sonner), and refetch the notification list (React Query's `invalidateQueries`).
- Disconnect on unmount.

For MVP, polling (`refetchInterval: 30000` in React Query) is acceptable if WebSocket is not
implemented.

### Styling & UX

- Use shadcn components: `DropdownMenu`, `Badge`, `Button`, `Card`, `Dialog`, `toast`.
- Follow `ui-context.md`: neutral palette, Inter font, clean spacing.
- Unread notifications: bolder text or a colored dot/background.
- Loading states, empty states ("No notifications yet").

## Scope Limits

- No notification preferences (mute types, email digest) — defer to post-MVP.
- No bulk delete (delete all) — defer to post-MVP.
- No notification grouping (e.g. "3 mentions") — defer to post-MVP.

## Check When Done

- Notification bell in navbar shows unread count and a dropdown with recent notifications.
- Clicking a notification marks it as read and navigates to the relevant entity.
- Notification list page displays all notifications with mark-as-read, mark-all-as-read, and delete.
- Real-time updates work (if WebSocket enabled) or polling updates the count. `npm run build` passes.
