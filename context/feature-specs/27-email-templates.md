Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Implement **email templates** with merge fields: reusable email drafts for common outreach
(intro, follow-up, etc.). Admins/Managers create templates; users apply them when composing.

## Scope of this unit

- Template CRUD in the email-service.
- Merge field rendering (replace `{{field}}` placeholders with contact/company/user data).
- Do not build frontend UI (spec 28).

## Prerequisite

Specs 04–26 done. `EmailTemplate` model exists in Prisma (spec 06). Email-service is active.

## Implementation

### Template endpoints (email-service)

Extend `services/email-service/`:

- `POST /api/email/templates` — create template. Body: `{ name, subject, body }`. Subject and
  body contain merge fields: `{{contactName}}`, `{{companyName}}`, `{{userName}}`, etc. Require
  `ADMIN` or `MANAGER`. Return the template record.
- `GET /api/email/templates` — list org templates. Any member can view.
- `GET /api/email/templates/:id` — fetch one template.
- `PATCH /api/email/templates/:id` — update. Require `ADMIN`/`MANAGER`.
- `DELETE /api/email/templates/:id` — soft-delete. Require `ADMIN`/`MANAGER`.

### Merge field rendering

Create a utility function `renderTemplate(template, context)`:

- `template`: the `EmailTemplate` record (subject + body).
- `context`: an object with data sources: `{ contact?, company?, user }`. Each is a full record
  (name, email, etc.).
- Replace placeholders: `{{contactName}}` → `context.contact.name`, `{{companyName}}` →
  `context.company.name`, `{{userName}}` → `context.user.name`, etc.
- Use a simple regex replace or a template engine (e.g. `handlebars`, `mustache`). Keep it
  lightweight.
- Return the rendered subject and body.

### Template application (send endpoint)

When `POST /api/email/send` includes `templateId`:

- Fetch the template.
- Resolve context: if `entityType`/`entityId` are provided, fetch the contact/company. Fetch the
  current user.
- Render the template with `renderTemplate(template, { contact, company, user })`.
- Merge the rendered subject/body into the email (if the request also includes subject/body,
  decide precedence — template first, then user overrides; or template only).
- Send the email as usual.

### Validation

- Validate template name length, body not empty.
- Document supported merge fields (list in the API docs or in-app help). For MVP: `contactName`,
  `contactEmail`, `companyName`, `companyDomain`, `userName`, `userEmail`.

## Scope Limits

- No frontend UI (spec 28).
- No conditional logic in templates (e.g. `{{#if}}`) — defer to post-MVP.
- No multi-language templates (defer to post-MVP).
- No template versioning (defer to post-MVP).

## Check When Done

- Templates can be created, listed, fetched, updated, and deleted.
- Merge fields are replaced with actual data when rendering a template.
- Sending an email with `templateId` applies the template and sends. Build passes.
