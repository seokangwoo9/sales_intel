Wire **Better Auth** into the Next.js frontend. In this architecture Better Auth's server
lives in a dedicated NestJS `auth-service` (built later in spec 08). This spec covers the
**frontend client, auth pages, redirects, route protection, and the profile menu** only.

## Scope of this unit

- This is the **frontend** wiring for auth.
- The auth backend (Better Auth server, database, sessions, JWT issuance) is built in
  `08-auth-service.md`. Until then, point the client at the intended auth-service base URL via
  an env var and allow the flows to be developed against it.
- Do not build organizations, roles, or invitations here (those come in Phase 2).

## Design

Match the app theme. Use the existing CSS variables / design tokens in `globals.css`.
Do not hardcode colors.

Sign-in and sign-up pages:

- large screens: simple two-panel layout
- left: compact logo, tagline, short text-only feature list
- right: centered form
- small screens: form only
- no gradients
- no oversized hero sections
- no feature cards
- no scroll-heavy layouts

Keep the layout minimal and professional.

## Implementation

### Better Auth client

- Install the Better Auth client package in the frontend if not present (assist to install).
- Create `lib/auth-client.ts` exporting a configured Better Auth client.
- Read the auth-service base URL from an env var (e.g. `NEXT_PUBLIC_AUTH_URL`). Do not invent
  extra env var names beyond what Better Auth needs.
- Export typed helpers the UI will use: `signIn`, `signUp`, `signOut`, and a `useSession` hook.

### Auth pages

- Create sign-in and sign-up pages using **shadcn** components (Card, Input, Label, Button).
- Email + password fields, inline validation, and a clear error message area.
- Submit calls the Better Auth client. On success, redirect to `/workspace`.
- Link between sign-in and sign-up.

### Route protection

- Protect all app routes by default; allow only the public auth paths (`/sign-in`, `/sign-up`)
  and static assets.
- Use the Next.js recommended mechanism for the installed version (check
  `node_modules/next/dist/docs/` for the current middleware/interception convention before
  writing it). Read the session via the Better Auth client/server helper.
- Unauthenticated users hitting a protected route redirect to `/sign-in`.

### Root redirect

Update `/`:

- authenticated users redirect to `/workspace`
- unauthenticated users redirect to `/sign-in`

### Profile menu

- Add a user profile control (avatar + name) to the **top of the sidebar** (from spec 02) for
  profile settings and logout.
- Logout calls the Better Auth client `signOut` and redirects to `/sign-in`.

## Scope Limits

- Do not implement the Better Auth **server** here (that is spec 08).
- Do not add organizations, roles, permissions, or invitations.
- Do not create a local user table in the frontend.
- Do not hardcode colors or introduce new theme tokens.

## Check When Done

- `lib/auth-client.ts` exports a configured Better Auth client and session helpers.
- Sign-in and sign-up pages render using shadcn and CSS variables (no hardcoded colors).
- All routes are protected except the public auth paths.
- `/` redirects correctly based on auth state.
- Sidebar shows a profile control with working logout.
- `npm run build` passes.
