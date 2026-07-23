Read `AGENTS.MD`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **activity feed and file UI** in the frontend: display posts, comments, mentions, and
attachments on entity detail pages (contacts/companies). Users can create posts, comment, and
upload files.

## Scope of this unit

- Activity feed component (list of posts with comments, rich text, mentions, attachments).
- Post composer (Tiptap editor, mention picker, file upload).
- Comment composer (simpler: plain text or minimal rich text).
- Display attachments with download links.
- Integrate into contact and company detail pages (specs 16–17).
- Do not build history UI (spec 23) or email UI (Phase 5).

## Prerequisite

Specs 03, 10, 19–21 done. Activity-service and file-service are active. The user is authenticated
and has an active org.

## Implementation

### Activity feed component

Create `components/activity/activity-feed.tsx`:

- Fetch posts (`GET /api/activity/posts?entityType=<type>&entityId=<id>&page=1`) with React Query.
- Display each post as a card: author (name, avatar), timestamp, body (rendered rich text), and
  attachments (file names with download links).
- For each post, show a comments section. Initially collapsed ("3 comments" link); expand to show
  all comments. Fetch via `GET /api/activity/posts/:postId/comments` if not included in the post
  response.
- Sort posts by `createdAt` desc (newest first). Paginate with "Load more" or infinite scroll.

### Post composer

Create `components/activity/post-composer.tsx`:

- Use **Tiptap** (spec depends on it) for the rich-text editor. Initialize with basic formatting
  (bold, italic, lists, links). Add a **mention extension** for `@username` autocomplete.
- Mention picker: when typing `@`, fetch org members (`GET /api/organizations/:id/members`),
  show a dropdown (filter by name), insert a mention node with `data-id=<userId>`. On submit,
  extract mentions and send with the post.
- File upload: "Attach file" button opens a file input. On select, `POST /api/files` (multipart),
  get the file ID, and include in `attachments` array when submitting the post.
- Submit button: `POST /api/activity/posts` with `{ body, entityType, entityId, attachments }`.
  Use `useMutation`. On success, refetch the feed; show toast.

### Comment composer

Create `components/activity/comment-form.tsx`:

- Simpler than post composer: a `Textarea` or minimal Tiptap (optional: support mentions in
  comments too). Submit button: `POST /api/activity/posts/:postId/comments` with `{ body }`.
  On success, refetch comments for the post; show toast.

### Attachments display

- For each attachment in a post, show filename, size, and a "Download" link
  (`GET /api/files/:id`). Use an icon based on mimeType (e.g. `FileText`, `Image`, `File` from
  lucide-react).
- Optionally preview images inline (if mimeType is `image/*`, render an `<img>` tag with the
  file URL).

### Mentions rendering

- In post/comment body (Tiptap HTML), mentions are `<span data-mention data-id="<userId>">@Name</span>`.
  Style them (e.g. blue bg, bold) via CSS or Tiptap's mention node rendering. On click, optionally
  navigate to the user's profile (if a profile page exists; defer to post-MVP).

### Integration into entity detail pages

Update `app/(workspace)/contacts/[id]/page.tsx` and `app/(workspace)/companies/[id]/page.tsx`:

- Add an "Activity" tab or section below the entity details.
- Render `<ActivityFeed entityType="CONTACT" entityId={id} />` (or `COMPANY`).
- Render `<PostComposer entityType="CONTACT" entityId={id} />` above the feed.

### Styling & UX

- Use shadcn components: `Card`, `Avatar`, `Button`, `Textarea`, `Dialog` (for file picker or
  expanded comment forms).
- Follow `ui-context.md`: clean, readable typography (Inter), neutral palette.
- Loading states (React Query's `isLoading`), empty states ("No activity yet. Be the first to post!").
- Optimistic updates: when creating a post/comment, add it to the local cache immediately
  (React Query's `optimisticUpdate`).

### Tiptap setup

- Install Tiptap: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-mention`.
- Configure mention extension with a suggestion plugin: fetch members on `@` trigger, render a
  dropdown with `react-tippy` or custom positioning.

## Scope Limits

- No real-time updates (defer Socket.IO live feed to post-MVP or a future spec).
- No reactions/likes (defer to post-MVP).
- No history UI (spec 23).
- No email activity (Phase 5).

## Check When Done

- Contact and company detail pages show an activity feed with posts, comments, and attachments.
- Post composer works: rich text (Tiptap), mentions (`@username`), file upload.
- Comments can be added to posts.
- Attachments are displayed with download links; mentions are styled.
- Org members can be mentioned; mentioned users will receive notifications (once spec 34 is built). `npm run build` passes.
