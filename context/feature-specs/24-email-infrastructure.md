Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **email infrastructure foundation**: IMAP/SMTP client wrappers, account configuration
model, and credential encryption. This unit provides the low-level email connectivity the
email-service (specs 25–26) will consume.

## Scope of this unit

- Create reusable IMAP and SMTP client wrappers (Node libraries: `node-imap` or `imap-simple`,
  `nodemailer`).
- Store and encrypt email account credentials (user/org mail server configs).
- Do not implement sync logic (spec 26), templates (spec 27), or frontend UI (spec 28) yet.

## Prerequisite

Specs 04–23 done. `EmailAccount` model exists in Prisma (spec 06). The encryption library/strategy
is chosen (e.g. `@node-rs/argon2` for hashing, AES for symmetric encryption via Node `crypto`
module with a key from env).

## Implementation

### Email account model & encryption

The `EmailAccount` model (spec 06) should store:
- `userId`, `organizationId`, `email`, `provider` (gmail/outlook/custom), `imapHost`, `imapPort`,
  `smtpHost`, `smtpPort`, `encryptedPassword`, `syncEnabled`, `lastSyncAt`, `createdAt`.

Encrypt passwords:
- Use a symmetric key stored in env (`EMAIL_ENCRYPTION_KEY`; 32-byte base64). Never commit it.
- Encrypt with AES-256-GCM (Node `crypto.createCipheriv`). Store the IV and auth tag with the
  ciphertext (e.g. `iv:authTag:ciphertext` as a single string).
- Create utility functions: `encryptPassword(plaintext)` → `encrypted`, `decryptPassword(encrypted)` → `plaintext`.

### IMAP client wrapper

Create `shared/email/imap-client.ts` (or in email-service, if tightly coupled):

- Wrapper around `imap-simple` or `node-imap`. Connect using account credentials.
- Expose methods: `connect()`, `fetchMessages(since?: Date)`, `markAsRead(uid)`, `disconnect()`.
- Return messages as structured objects: `{ uid, from, to, subject, body, date, attachments }`.
- Handle connection errors gracefully (log, retry logic).

### SMTP client wrapper

Create `shared/email/smtp-client.ts`:

- Wrapper around `nodemailer`. Create a transporter from account credentials.
- Expose methods: `sendEmail({ to, subject, body, attachments? })`.
- Support HTML and plain-text bodies.
- Return sent message ID or throw on error.

### Configuration endpoint (email-service stub)

Create a minimal email-service scaffold if it doesn't exist yet (spec 25 will expand it):

- `POST /api/email/accounts` — add email account. Body: `{ email, provider, imapHost, imapPort, smtpHost, smtpPort, password }`.
  Encrypt the password, store the `EmailAccount` record. Only the user or `ADMIN` can add accounts.
- `GET /api/email/accounts` — list the user's email accounts (or org-wide, depending on requirements;
  defer org-wide to spec 25). Decrypt passwords only when needed (never return plaintext to the
  frontend).
- `DELETE /api/email/accounts/:id` — remove email account.

## Scope Limits

- No sync logic (spec 26).
- No template rendering (spec 27).
- No frontend UI (spec 28).
- No OAuth2 for Gmail/Outlook yet (use app passwords for MVP; OAuth can be added later).

## Check When Done

- `EmailAccount` model stores encrypted credentials.
- IMAP and SMTP client wrappers can connect and perform basic operations (fetch, send).
- Email accounts can be added via `POST /api/email/accounts` (password is encrypted at rest).
- Utility functions encrypt/decrypt passwords correctly. Build passes.
