Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Implement **member management and invitations** in the organization-service. Admins/Managers
invite users by email; invitees accept and join the org with a chosen role.

## Scope of this unit

- Add member list, role update, and remove endpoints to the organization-service.
- Add invitation creation, listing, and revoke endpoints.
- Wire invitation acceptance into the auth-service (the stub from spec 08).
- Send invitation emails via a simple mechanism (full email-service integration is Phase 5).
- Do not build the frontend UI (spec 12).

## Prerequisite

Specs 04–10 done. `Membership` model exists; RBAC guards are active (spec 10). The auth-service
has an invitation-acceptance stub (spec 08).

## Implementation

### Member endpoints (organization-service)

Extend `services/organization-service/` with:

- `GET /api/organizations/:id/members` — list members (join `Membership` with `User`). Return
  user name/email + role. Any member can view; paginate if large orgs are expected.
- `PATCH /api/organizations/:id/members/:userId` — update a member's role. Require `ADMIN` or
  `MANAGER` (document role-change rules: e.g. only admins promote to admin).
- `DELETE /api/organizations/:id/members/:userId` — remove a member (delete `Membership`).
  Require `ADMIN`. Prevent removing the last admin (return `400`).

### Invitation model & endpoints

Add an `Invitation` model to Prisma (if not already in spec 06; otherwise update it now):
- Fields: `email`, `organizationId`, `role`, `token` (unique), `invitedBy`, `expiresAt`,
  `acceptedAt`, `revokedAt`.
- Index on `(token)` and `(organizationId, email)`.

Endpoints:

- `POST /api/organizations/:id/invitations` — create invitation. Body: `{ email, role }`.
  Require `ADMIN` or `MANAGER`. Generate a unique token, set expiry (e.g. 7 days). Send email
  with acceptance link. Return the invitation record.
- `GET /api/organizations/:id/invitations` — list pending invitations. Require `ADMIN`/`MANAGER`.
- `DELETE /api/organizations/:id/invitations/:invitationId` — revoke (set `revokedAt`). Require
  `ADMIN`/`MANAGER`.

### Invitation acceptance (auth-service)

Complete the stub from spec 08:

- `POST /api/auth/invitations/accept` — body: `{ token, userId? }`. If the user is logged in,
  attach their `userId`; if not, create a new user (coordinate with register flow). Validate
  the token (not expired/revoked). Create the `Membership` with the invitation's role. Mark
  `acceptedAt`.
- Return the user session/JWT with the new org as active.

### Email sending (simple for now)

- Use a lightweight email mechanism (Nodemailer with SMTP from env, or a transactional service
  like Resend/SendGrid). Full email-service (spec 24–27) will replace this.
- Send a plain-text or minimal HTML email with the invitation link:
  `https://<FRONTEND_URL>/accept-invitation?token=<token>`.
- Log email errors but do not block invitation creation (admin can resend or manually share).

### Validation & security

- Validate email format; prevent duplicate active invitations for the same email+org.
- Token must be cryptographically random and unique.
- Expired/revoked tokens return `400` or `410 Gone` on acceptance.

## Scope Limits

- No rich email templates (Phase 5).
- No frontend UI (spec 12).
- Do not implement bulk invite or CSV import yet (spec 18 covers import/export for contacts;
  defer member bulk import to a future iteration).

## Check When Done

- Admins/Managers can invite users via `POST /api/organizations/:id/invitations`.
- Invitation email is sent with an acceptance link.
- Accepting the invitation (via `POST /api/auth/invitations/accept`) creates a `Membership` and
  returns a session with the new org.
- Member list/update/remove work; can't remove the last admin.
- Expired/revoked invitations are rejected. Build passes.
