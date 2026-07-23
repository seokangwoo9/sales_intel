Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **email frontend**: inbox/sent views, compose/reply UI, email threads, and account
management. Users read and send emails within the CRM, linked to contacts/companies.

## Scope of this unit

- Email inbox and sent pages with thread grouping.
- Compose and reply UI (rich text editor, recipient picker, attachments).
- Email account management page (add/remove accounts, trigger sync).
- Link emails to contacts/companies (manual or auto-suggested).
- Do not build advanced search or AI email features (defer to spec 31).

## Prerequisite

Specs 03, 10, 24–27 done. Email-service is active with sync and templates. The user is
authenticated and has an active org.

## Implementation

### Email inbox page

Create `app/(workspace)/email/inbox/page.tsx`:

- Fetch emails (`GET /api/email/messages?folder=inbox&page=1`) with React Query.
- Display as a list (or table): sender, subject, preview (first ~100 chars of body), timestamp,
  linked entity (contact/company, if any).
- Group by thread (`threadId`): show the thread subject once, with a count of messages. Clicking
  expands to show all messages in the thread.
- Filter by account (if multi-account), unread status.
- Pagination or infinite scroll.

### Email detail/thread view

Create `app/(workspace)/email/[id]/page.tsx` (or modal overlay):

- Fetch the email and its thread (`GET /api/email/messages/:id` and `GET /api/email/messages?threadId=<threadId>`).
- Display the full thread: each message shows sender, timestamp, full body (HTML or plain text),
  attachments (download links).
- "Reply" button opens a compose form pre-filled with `to` (sender), `subject` (Re: ...), and
  quoted body.
- If the email is linked to a contact/company, show a badge/link. If not linked, show a "Link to..."
  button opening a picker (search contacts/companies, select one, `PATCH /api/email/messages/:id`
  with `{ entityType, entityId }`).

### Compose email

Create `components/email/compose-email.tsx` (modal or page):

- Fields: `to` (multi-email input with autocomplete from contacts), `cc`, `bcc`, `subject`, `body`
  (Tiptap rich text), attachments (file upload via file-service, same as posts).
- Template dropdown (optional): "Use template..." opens a list of org email templates (spec 27).
  Selecting one fills subject + body with merge fields resolved (e.g. `{{contactName}}`).
- Send button: `POST /api/email/send` with `{ to, cc, bcc, subject, body, attachments, templateId?, entityType?, entityId? }`.
  Use `useMutation`. On success, close compose and show toast.

### Reply/forward

- Reply: pre-fill `to` with the original sender, subject with "Re: ...", body with quoted original.
- Forward: pre-fill subject with "Fwd: ...", body with quoted original, clear `to`.

### Sent page

Create `app/(workspace)/email/sent/page.tsx`:

- Fetch sent emails (`GET /api/email/messages?direction=outgoing&page=1`).
- Display list similar to inbox.

### Email account management

Create `app/(workspace)/settings/email-accounts/page.tsx`:

- Fetch accounts (`GET /api/email/accounts`).
- Display each: email, provider, sync status (enabled/disabled, last sync time).
- "Add Account" button opens a form: email, provider (dropdown: Gmail/Outlook/Custom), IMAP/SMTP
  host/port, password. Submit: `POST /api/email/accounts`. On success, refetch accounts and show
  toast.
- "Sync Now" button on each account: `POST /api/email/accounts/:id/sync`. Show a loading state;
  on complete, show toast with sync result (e.g. "Synced 12 new emails").
- "Remove" button: confirm via dialog, `DELETE /api/email/accounts/:id`.

### Recipient autocomplete

- When typing in the `to`/`cc`/`bcc` fields, debounce and fetch contacts
  (`GET /api/contacts?search=<input>`). Display name + email in a dropdown. On select, add as a
  chip/tag. Use a library like `react-select` or build a custom input with shadcn `Popover`.

### Attachments

- Compose: "Attach file" uploads via `POST /api/files`, get file ID, include in the send request.
- Viewing: show filename, size, download link (`GET /api/files/:id`).

### Styling & UX

- Use shadcn components: `Table`, `Dialog`, `Input`, `Textarea`, `Button`, `Badge`, `Select`,
  `Popover`, `toast`.
- Follow `ui-context.md`: clean, readable typography, neutral palette.
- Loading states, empty states ("No emails yet"), error handling.

## Scope Limits

- No advanced search (defer to post-MVP or spec 31 AI indexing).
- No email rules/filters (defer to post-MVP).
- No AI email features (summarization, draft generation — spec 31).
- No OAuth2 account setup (use app passwords for MVP; OAuth can be added in a future iteration).

## Check When Done

- Inbox page lists emails (grouped by thread), with search and pagination.
- Clicking an email opens the thread view with full body and attachments.
- Compose/reply/forward work; emails are sent via `POST /api/email/send`.
- Email account management page lets users add/remove accounts and trigger sync.
- Emails can be manually linked to contacts/companies. Recipient autocomplete works. `npm run build` passes.
