Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Implement **email sync and auto-contact creation**: periodically fetch emails from IMAP, store
them in the CRM, and automatically create contact records for known senders. Link emails to
existing contacts/companies by email domain.

## Scope of this unit

- Background job (Bull) to sync emails from IMAP for each enabled email account.
- Store incoming/outgoing emails in the `EmailMessage` table.
- Auto-create contacts when receiving emails from unknown senders.
- Auto-link emails to contacts/companies by email address or domain.
- Do not build frontend UI (spec 28).

## Prerequisite

Specs 04–25 done. IMAP client wrapper exists (spec 24). Email-service and contact/company
services are active. Bull queue is configured (spec 04 or a shared queue setup).

## Implementation

### Email sync job (Bull)

Create a Bull queue `email-sync` in the email-service:

- Job payload: `{ emailAccountId }`.
- Job handler:
  1. Fetch the `EmailAccount` record; decrypt credentials.
  2. Connect via the IMAP client (spec 24).
  3. Fetch messages since `lastSyncAt` (or all if first sync).
  4. For each message:
     - Store in `EmailMessage`: `organizationId` (from account), `accountId`, `direction` (incoming/
       outgoing based on account email in to/from), `from`, `to`, `cc`, `subject`, `body` (HTML +
       plain text), `date`, `threadId` (Message-ID or In-Reply-To), `read` (unread by default).
     - Download attachments, store via `POST /api/files`, link to the email.
     - Auto-link to contact/company (see below).
  5. Update `lastSyncAt` on the `EmailAccount`.
  6. Disconnect IMAP.

Schedule this job:
- On account creation/update if `syncEnabled`.
- Periodic cron (e.g. every 5 minutes for all enabled accounts). Use Bull's repeat option or a
  separate cron trigger.

### Auto-create contacts

When processing an incoming email from an unknown sender (`from` email not in `Contact` table):

- Create a new `Contact` in the sender's org (the account's org) with:
  - `name` extracted from the "From" header (e.g. "John Doe <john@example.com>" → name: "John Doe").
  - `email` from the "From" address.
  - `ownerId`: the email account owner (the user who owns the `EmailAccount`).
- Log the creation (history event).

### Auto-link emails to contacts

For every email (incoming/outgoing):

- Match `from` and each `to`/`cc` email against `Contact.email` in the org. If found, set
  `entityType=CONTACT`, `entityId=<contactId>` on the `EmailMessage`.
- If no exact contact match, try domain matching: extract domain from sender email (e.g.
  `@acme.com`), find a `Company` with that domain (spec 14 stores `domain`). If found, link to
  the company: `entityType=COMPANY`, `entityId=<companyId>`.
- If multiple matches (e.g. multiple contacts with the same email), pick the first or log a
  warning (defer conflict resolution to post-MVP).

### Thread grouping

- Use the email's `Message-ID` and `In-Reply-To` headers to group threads. Store a `threadId`
  (can be the root Message-ID or a hash of the conversation). Group emails by `threadId` in
  queries (spec 28 UI will display threads).

### Outgoing email tracking

When sending via `POST /api/email/send` (spec 25):

- After sending via SMTP, create an `EmailMessage` record with `direction=outgoing`, store the
  sent content, link to the contact/company if provided, and set `threadId` if it is a reply.

### Error handling

- If IMAP connection fails (invalid credentials, server down), log the error and mark the job as
  failed. Retry with exponential backoff (Bull's retry config).
- If a single message fails to parse/store, log and continue (do not fail the entire sync).

## Scope Limits

- No OAuth2 (use app passwords for MVP).
- No advanced threading (e.g. split threads by subject changes) — use Message-ID for MVP.
- No duplicate detection beyond Message-ID (if the same email syncs twice, it may duplicate;
  defer deduplication to post-MVP).
- No frontend UI (spec 28).

## Check When Done

- Email sync job fetches emails from IMAP, stores them in `EmailMessage`, and downloads attachments.
- Auto-contact creation works: receiving an email from an unknown sender creates a contact.
- Auto-linking works: emails are linked to contacts (by email) or companies (by domain).
- Sync runs periodically for enabled accounts; `lastSyncAt` is updated.
- Outgoing emails (sent via the CRM) are also stored. Build passes.
