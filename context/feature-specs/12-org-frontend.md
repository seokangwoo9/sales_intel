Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **organization management frontend**: org switcher, org settings, member management,
and invitation UI. This brings the Phase 2 backend (specs 09–11) to life in the Next.js app.

## Scope of this unit

- Org switcher in the navbar (workspace-navbar.tsx).
- Org settings page (name, delete).
- Members list with role update and removal.
- Invitation creation, list, and revoke UI.
- Do not build contact/company pages (Phase 3) or activity/email UI (Phases 4–5).

## Prerequisite

Specs 03, 09–11 done. The organization-service and RBAC are active. The user is authenticated
(spec 03) and has at least one org membership.

## Implementation

### Org switcher (navbar)

Update `components/workspace/workspace-navbar.tsx`:

- Fetch the user's orgs (`GET /api/organizations`) with React Query.
- Display the active org name with a dropdown (shadcn `DropdownMenu` or `Popover`).
- List all orgs; clicking one switches context. Store the active `orgId` in a global state
  (Zustand or React Context) and include it in API requests via a custom React Query default
  or axios interceptor.
- Provide a "+ New Organization" option opening a dialog (`Dialog` from shadcn) with a form to
  create an org (`POST /api/organizations`). On success, refetch orgs and switch to the new one.

### Org settings page

Create `app/(workspace)/settings/organization/page.tsx`:

- Fetch the active org (`GET /api/organizations/:id`).
- Display the org name in an editable input (controlled, with save button).
- Show a "Delete Organization" button (danger zone). Require confirmation via a dialog. Only
  visible to `ADMIN` (check the user's role in the active org membership; fetch from an endpoint
  or include in the org response). On confirm, call `DELETE /api/organizations/:id` and redirect
  to org switcher or a "no orgs" state.
- Use `useMutation` from React Query for update/delete; show toast notifications (sonner) on
  success/error.

### Members page

Create `app/(workspace)/settings/members/page.tsx`:

- Fetch members (`GET /api/organizations/:id/members`). Display in a table or list (shadcn
  `Table`): name, email, role.
- For `ADMIN`/`MANAGER`: each row has a role dropdown (shadcn `Select`) and a "Remove" button.
- Role change: `PATCH /api/organizations/:id/members/:userId` with the new role; optimistic
  update via React Query.
- Remove: confirm via dialog, `DELETE /api/organizations/:id/members/:userId`. Prevent removing
  self if last admin (disable the button or show an error).
- Show role badges (shadcn `Badge`) styled per role.

### Invitations section

Add an "Invitations" tab or section in the members page (or a separate route):

- Fetch pending invitations (`GET /api/organizations/:id/invitations`). Show email, role, invited
  date, and a "Revoke" button.
- "Invite Member" button opens a dialog with a form: email input, role select, submit.
  `POST /api/organizations/:id/invitations`. On success, refetch invitations and show a toast.
- Revoke: `DELETE /api/organizations/:id/invitations/:id`, confirm via dialog.

### Invitation acceptance (public route)

Create `app/(auth)/accept-invitation/page.tsx` (outside the workspace layout):

- Read `?token=...` from the URL.
- If the user is logged in, call `POST /api/auth/invitations/accept` with the token and current
  session. On success, redirect to `/workspace` with the new org active.
- If not logged in, show a message: "Sign in or create an account to accept this invitation."
  Link to `/sign-in?token=<token>` (the sign-in page should accept the token and auto-accept
  after login). Or provide inline register/login forms that pass the token through.

### Role-based UI

- Hide/disable admin-only actions (delete org, role changes, remove members) for non-admins.
- Fetch the user's role for the active org (include in the org context or a separate endpoint)
  and use it to gate UI elements.

### Styling & UX

- Use shadcn components: `Dialog`, `Table`, `Select`, `DropdownMenu`, `Badge`, `Button`, `Input`,
  `Label`, `toast` (via sonner).
- Follow `ui-context.md`: neutral palette, Inter font, clean spacing.
- Loading states (React Query's `isLoading`) and empty states (no members, no invitations).

## Scope Limits

- No contact/company/activity UI (later phases).
- No billing or usage tracking UI.
- No bulk member import (defer to a future spec).

## Check When Done

- Org switcher in navbar lists all user orgs; switching changes the active org context.
- Creating a new org via the navbar dialog works and switches to it.
- Org settings page lets admins edit the name and delete the org (with confirmation).
- Members page lists members; admins/managers can update roles and remove members.
- Invitations section lets admins/managers invite by email, view pending invites, and revoke.
- Invitation acceptance link (`/accept-invitation?token=...`) works for logged-in users and
  redirects to workspace with the new org active.
- Non-admins see read-only views where appropriate. `npm run build` passes.
