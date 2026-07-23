Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **contacts management frontend**: list, create, edit, view contact details, link to
companies, and display ownership. This brings the contact-service (spec 13) and relationships
(spec 15) to life in the Next.js app.

## Scope of this unit

- Contacts list page with search, filter, pagination, and create.
- Contact detail page with edit, company links, and activity feed placeholder.
- Contact form with custom fields support.
- Ownership display and transfer UI (admin/manager only).
- Do not build activity/history UI (Phase 4), email UI (Phase 5), or import/export (spec 18).

## Prerequisite

Specs 03, 10, 13, 15 done. Contact-service and RBAC are active. The user is authenticated and
has an active org.

## Implementation

### Contacts list page

Create `app/(workspace)/contacts/page.tsx`:

- Fetch contacts (`GET /api/contacts?page=1&pageSize=20`) with React Query.
- Display in a shadcn `Table` or custom list: name, email, owner, company (first linked company),
  last updated.
- Search input: debounced, triggers refetch with `search` param.
- Filter dropdown (shadcn `Select`): "All contacts" | "My contacts" (filter by current user as
  owner). Optionally add owner filter (select from team members).
- Pagination controls (shadcn `Pagination` or custom prev/next buttons).
- "+ New Contact" button opens a dialog or navigates to `/contacts/new`.

### Contact create/edit form

Create `app/(workspace)/contacts/new/page.tsx` and `app/(workspace)/contacts/[id]/edit/page.tsx`
(or use a single form component with create/edit modes):

- Fields: name (required), email, phone, owner (select from org members; default to current user),
  custom fields (dynamic JSON editor or simple key-value pairs; see below).
- Use React Hook Form + Zod for validation.
- On submit: `POST /api/contacts` (create) or `PATCH /api/contacts/:id` (edit). Use `useMutation`
  from React Query. On success, redirect to contact detail or list; show toast.
- Owner field: shadcn `Select` populated from `GET /api/organizations/:id/members` (or a cached
  member list in global state). Only show for `MANAGER`/`ADMIN` or owner (respect RBAC).

### Custom fields

- Store custom fields as a JSON object. For MVP, provide a simple "Add Field" UI: pairs of
  (field name, field value) inputs. Serialize to `{ [key]: value }` and send in `customFields`.
- Display custom fields in the detail view as a key-value list.

### Contact detail page

Create `app/(workspace)/contacts/[id]/page.tsx`:

- Fetch the contact (`GET /api/contacts/:id`).
- Display name, email, phone, owner (with avatar/name), custom fields, created/updated dates.
- "Edit" button (navigate to `/contacts/[id]/edit` or open inline edit mode). Visible to
  `MANAGER`/`ADMIN` or owner.
- "Delete" button (danger; confirm via dialog). `DELETE /api/contacts/:id`. Redirect to list on
  success. Visible to `MANAGER`/`ADMIN`.
- **Companies section**: fetch linked companies (`GET /api/contacts/:id/companies`). Display as
  cards or list with role/title. "Link Company" button opens a dialog with a company select
  (fetch `GET /api/companies`, filterable). On select, `POST /api/contacts/:id/companies`. "Unlink"
  button on each company: `DELETE /api/contacts/:id/companies/:companyId`.
- Activity feed placeholder: empty state saying "Activity feed coming soon" (Phase 4, spec 22).

### Ownership transfer

On the contact detail page (or edit form), if the user is `ADMIN`/`MANAGER`:

- Show an "Assign Owner" button opening a dialog with a member select.
- On confirm, `PATCH /api/contacts/:id` with the new `ownerId`. Show toast. The new owner will
  receive a notification (once spec 34 is built).

### Styling & UX

- Use shadcn components: `Table`, `Dialog`, `Select`, `Input`, `Textarea`, `Button`, `Badge`,
  `Pagination`, `toast`.
- Follow `ui-context.md`: neutral palette, Inter font, clean spacing.
- Loading states, empty states (no contacts, no companies linked), and error handling.

## Scope Limits

- No activity/history UI (specs 22–23).
- No email UI (Phase 5).
- No import/export (spec 18).
- No advanced custom field schema (dropdown, date picker, etc.) — plain key-value for MVP.

## Check When Done

- Contacts list page displays contacts with search, filter (owner), and pagination.
- Creating/editing contacts works; form validates and saves.
- Contact detail page shows all fields, linked companies (with link/unlink), and an edit/delete
  flow.
- Owner assignment works for admins/managers; ownership is displayed.
- Custom fields are editable and displayed. RBAC enforced (non-owners/non-admins cannot edit/delete). `npm run build` passes.
