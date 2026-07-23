Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **history UI** in the frontend: display the full audit trail for contacts, companies,
and other entities. Shows who did what, when, and what changed.

## Scope of this unit

- History timeline component displaying events with actor, action, timestamp, and diff.
- Integrate into entity detail pages (contacts, companies) as a "History" tab or section.
- Do not build advanced analytics or exports (defer to specs 32–33 or post-MVP).

## Prerequisite

Specs 03, 10, 21, 22 done. History-service is active. The user is authenticated and has an
active org.

## Implementation

### History timeline component

Create `components/history/history-timeline.tsx`:

- Fetch history events (`GET /api/history/<entityType>/<entityId>`) with React Query.
- Display as a vertical timeline (or simple list): each event shows:
  - Actor (user name + avatar).
  - Action (badge or icon: "Created", "Updated", "Deleted", "Transferred ownership", etc.).
  - Timestamp (relative: "2 hours ago", or absolute: "Jan 23, 2026 at 3:45 PM"). Use `date-fns`
    (already in package.json).
  - Diff (human-readable change summary). If `diff` contains `before`/`after`, render:
    "Changed **name** from 'Old Name' to 'New Name'." For create: "Created contact." For delete:
    "Deleted contact."
- Sort by `createdAt` desc (newest first). Paginate with "Load more" if events are many.

### Diff rendering

- Parse the `diff` object. For simple field changes, show: "**field**: old → new".
- For ownership transfer: "Transferred ownership from **Old Owner** to **New Owner**."
- For link/unlink (contact↔company): "Linked to **Company Name**" or "Unlinked from **Company Name**."
- Keep it readable and concise.

### Integration into entity detail pages

Update `app/(workspace)/contacts/[id]/page.tsx` and `app/(workspace)/companies/[id]/page.tsx`:

- Add a "History" tab or section (alongside Activity).
- Render `<HistoryTimeline entityType="CONTACT" entityId={id} />` (or `COMPANY`).

### Optional: org-wide history

Create `app/(workspace)/history/page.tsx` (optional for MVP):

- Fetch all history for the active org (`GET /api/history?page=1&pageSize=50`).
- Display as a timeline with entity links (click "Contact: John Doe" to navigate to the contact
  detail). Filter by entity type or actor (dropdowns).

### Styling & UX

- Use shadcn components: `Card`, `Avatar`, `Badge`, `Button`, timeline styling (custom or a
  library like `react-vertical-timeline-component`; keep it simple for MVP).
- Follow `ui-context.md`: neutral palette, Inter font, clean spacing.
- Loading states, empty states ("No history yet").

## Scope Limits

- No advanced analytics (spec 32).
- No compliance exports (defer to post-MVP or spec 38).
- No real-time history updates (defer to post-MVP).

## Check When Done

- Contact and company detail pages show a "History" tab displaying all events for that entity.
- Events show actor, action, timestamp, and a human-readable diff.
- The timeline is sorted newest-first and paginated.
- Optionally, an org-wide history page lists all events. `npm run build` passes.
