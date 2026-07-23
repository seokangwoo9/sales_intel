Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **email-service core**: send/receive endpoints, inbox/sent queries, and thread
management. This service orchestrates SMTP sending (spec 24) and exposes email data to the
frontend (spec 28).

## Scope of this unit

- Scaffold the `email-service` NestJS app (or expand the stub from spec 24).
- Implement email send endpoint (SMTP via the wrapper from spec 24).
- Implement inbox/sent/search queries over the `EmailMessage` table.
- Do not implement sync (spec 26), templates (spec 27), or frontend UI (spec 28) yet.

## Prerequisite

Specs 04–24 done. SMTP client wrapper exists (spec 24). `EmailMessage` model exists in Prisma
(spec 06). The gateway routes `/api/email/*` here.

## Implementation

### Scaffold

- Scaffold (or expand) NestJS in `services/email-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port and `DATABASE_URL`.
- Share the Prisma client, RBAC guards, and email client wrappers (spec 24).

### Send endpoint

- `POST /api/email/send` — send an email. Body:
  ```json
  {
    "to": ["email1", "email2"],
    "cc": [],
    "bcc": [],
    "subject": "...",
    "body": "...",  // HTML or plain text
    "attachments": ["<fileId1>", "<fileId2>"],  // file-service IDs
    "accountId": "<emailAccountId>",  // which account to send from
    "templateId": "<templateId>",  // optional; spec 27 will use this
    "entityType": "CONTACT" | "COMPANY",  // optional link
    "entityId": "<uuid>"
  }
  ```
- Fetch the `EmailAccount` (validate user owns it or is in the org); decrypt credentials.
- If `templateId` is provided, render the template (spec 27 will implement this; for now, ignore
  or throw "not implemented").
- Fetch attachments from file-service (`GET /api/files/:id`), download, and attach to the email.
- Send via the SMTP client wrapper. On success, store the sent email in `EmailMessage` with
  `direction=outgoing`, `threadId` (if replying, inherit from the parent; else generate new).
- Return `{ success: true, messageId }`.

### Inbox/sent query endpoints

- `GET /api/email/messages` — list emails. Query params: `folder` (inbox/sent; map to `direction`
  incoming/outgoing), `accountId`, `threadId`, `entityType`, `entityId`, `unread` (bool), `page`,
  `pageSize`. Sort by `date` desc. Return paginated.
- `GET /api/email/messages/:id` — fetch one email with full body and attachments.
- `PATCH /api/email/messages/:id` — update (e.g. mark as read, link to entity). Body:
  `{ read?, entityType?, entityId? }`.

### Thread grouping

- Group messages by `threadId` in queries. Return thread metadata (subject, participant list,
  message count) if requested.

### Entity linking

- Allow manual linking via `PATCH /api/email/messages/:id` with `{ entityType, entityId }`.
  Validate the entity exists in the org (call contact-service or company-service, or query
  Prisma directly).

### Validation & errors

- Validate `to` emails format.
- `404` if email message not found or not in user's org.
- `400` if SMTP send fails (invalid credentials, network error); return the error message.

## Scope Limits

- No sync (spec 26).
- No templates (spec 27).
- No frontend UI (spec 28).
- No advanced search (defer to post-MVP or spec 31 AI indexing).

## Check When Done

- `services/email-service/` runs in Docker Compose.
- Emails can be sent via `POST /api/email/send` (SMTP wrapper used; attachments work).
- Inbox/sent emails can be queried (paginated, filtered by account/thread/entity).
- Emails can be marked as read or linked to contacts/companies. Build passes.
