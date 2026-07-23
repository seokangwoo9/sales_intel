Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **companies management frontend**: list, create, edit, view company details, link to
contacts, and display hierarchies. This brings the company-service (spec 14) and relationships
(spec 15) to life in the Next.js app.

## Scope of this unit

- Companies list page with search, filter, pagination, and create.
- Company detail page with edit, contact links, hierarchy display, and activity placeholder.
- Company form with custom fields and parent selection.
- Ownership display and transfer UI (admin/manager only).
- Do not build activity/history UI (Phase 4), email UI (Phase 5), or import/export (spec 18).

## Prerequisite

Specs 03, 10, 14–16 done. Company-service and RBAC are active. The user is authenticated and
has an active org.

## Implementation

### Companies list page

Create `app/(workspace)/companies/page.tsx`:

- Fetch companies (`GET /api/companies?page=1&pageSize=20`) with React Query.
- Display in a shadcn `Table` or card grid: name, domain, owner, parent (if any), last updated.
- Search input: debounced, triggers refetch with `search` param.
- Filter dropdown: "All companies" | "My companies" (owner filter). Optionally: "Top-level only"
  (filter `parentId=null`).
- Pagination controls.
- "+ New Company" button opens a dialog or navigates to `/companies/new`.

### Company create/edit form

Create `app/(workspace)/companies/new/page.tsx` and `app/(workspace)/companies/[id]/edit/page.tsx`:

- Fields: name (required), domain, parent (select from companies in the org; optional), owner
  (select from members; default to current user), custom fields (key-value pairs as in spec 16).
- Use React Hook Form + Zod.
- On submit: `POST /api/companies` (create) or `PATCH /api/companies/:id` (edit). Use
  `useMutation`. On success, redirect to detail or list; show toast.
- Parent field: shadcn `Select` with a "None (top-level)" option. Fetch `GET /api/companies`
  (exclude the current company to prevent self-loop; backend also validates).

### Custom fields & ownership

- Same JSON key-value UI as contacts (spec 16).
- Owner assignment same pattern: visible to `MANAGER`/`ADMIN` or owner.

### Company detail page

Create `app/(workspace)/companies/[id]/page.tsx`:

- Fetch the company (`GET /api/companies/:id`).
- Display name, domain, owner, parent (link to parent detail if exists), custom fields, dates.
- "Edit" and "Delete" buttons (same RBAC as contacts).
- **Hierarchy section**: if the company has a parent, show breadcrumb or parent card. If it has
  children, fetch them (`GET /api/companies?parentId=<id>`) and display as a list or tree.
- **Contacts section**: fetch linked contacts (`GET /api/companies/:id/contacts`). Display as
  cards or list with role/title. "Link Contact" button opens a dialog with a contact select
  (fetch `GET /api/contacts`, filterable). On select, `POST /api/contacts/:contactId/companies`
  with this company. "Unlink" button: `DELETE /api/contacts/:contactId/companies/:companyId`.
- Activity feed placeholder (Phase 4, spec 22).

### Hierarchy display

- On the detail page, show parent (if any) as a clickable link.
- Show children (if any) as a collapsible list or inline section. Keep it simple (no deep tree
  for MVP; one level is enough).
- Optionally add a "Company Hierarchy" page (`/companies/hierarchy`) with a visual tree (use a
  library like `react-d3-tree` or a simple nested list). This is optional for MVP; defer if time
  is limited.

### Ownership transfer

Same pattern as contacts (spec 16): "Assign Owner" dialog for `ADMIN`/`MANAGER`.

### Styling & UX

- Use shadcn components: `Table`, `Dialog`, `Select`, `Input`, `Button`, `Badge`, `Pagination`,
  `toast`.
- Follow `ui-context.md`.
- Loading states, empty states, error handling.

## Scope Limits

- No activity/history UI (specs 22–23).
- No email UI (Phase 5).
- No import/export (spec 18).
- No deep tree visualization (defer to post-MVP if one-level hierarchy suffices).

## Check When Done

- Companies list page displays companies with search, filter (owner, top-level), and pagination.
- Creating/editing companies works; form validates and saves.
- Company detail page shows all fields, linked contacts (with link/unlink), parent, and children.
- Owner assignment works. Hierarchy is displayed (parent link, children list).
- Custom fields and RBAC enforcement work. `npm run build` passes.
