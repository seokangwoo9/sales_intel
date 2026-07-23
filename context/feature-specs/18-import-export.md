Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Add **CSV import and export** for contacts and companies. Users can bulk-import from spreadsheets
and export filtered lists for offline work or migration.

## Scope of this unit

- Export contacts/companies to CSV.
- Import contacts/companies from CSV with validation and duplicate detection.
- Show import results (success count, errors).
- Do not implement advanced mapping/transformation (strict CSV columns for MVP).

## Prerequisite

Specs 04–17 done. Contact-service and company-service are active. Frontend list pages exist.

## Implementation

### Export (backend)

Extend contact-service and company-service:

- `GET /api/contacts/export` — query params: same filters as list (search, ownerId). Return a
  CSV file (content-type `text/csv`, content-disposition attachment). Include columns: id, name,
  email, phone, ownerId, customFields (JSON string), createdAt.
- `GET /api/companies/export` — same pattern. Columns: id, name, domain, parentId, ownerId,
  customFields, createdAt.

Use a CSV library (e.g. `fast-csv` or built-in `csv-stringify`). Stream if the dataset is large.

### Import (backend)

Extend contact-service and company-service:

- `POST /api/contacts/import` — multipart upload. Body: CSV file. Parse rows; validate required
  fields (name). For each row:
  - If `id` matches an existing contact in the org, update it (merge/overwrite; document the
    strategy).
  - If no `id` or not found, create a new contact.
  - Validate email format, resolve `ownerId` (lookup by email or id), parse `customFields` JSON.
- Return a summary: `{ imported: number, updated: number, errors: Array<{ row, message }> }`.
- Same for `POST /api/companies/import`. Resolve `parentId` by id or name (if name, find the
  matching company in the org; ambiguous matches → error for that row).

Require `MANAGER`/`ADMIN` role for import (bulk write is sensitive).

### Export (frontend)

On the contacts list page (`/contacts`) and companies list page (`/companies`):

- Add an "Export" button. On click, trigger `GET /api/contacts/export` (or `/companies/export`)
  with current filters (search, owner). Use `fetch` with blob response and download via a hidden
  anchor (`<a download>`).

### Import (frontend)

On the contacts and companies list pages:

- Add an "Import" button opening a dialog.
- File input (accept `.csv`). On select, show a preview (first few rows) if desired.
- "Upload" button: `POST /api/contacts/import` (or `/companies/import`) with the file as
  FormData. Use `useMutation`.
- On response, show a summary toast or dialog: "Imported 42 contacts, updated 3, 1 error." If
  errors, display them in a list (row number + message).

### Validation & errors

- Backend: reject files over a size limit (e.g. 5MB for MVP; adjust as needed).
- Reject malformed CSV (missing required columns).
- Per-row errors (invalid email, missing owner, ambiguous parent) → skip that row, continue, and
  report in the summary.

### CSV format documentation

- Document the expected CSV columns in a help dialog or link. Provide a sample CSV template
  (download a blank CSV with headers).

## Scope Limits

- No advanced field mapping UI (strict columns for MVP).
- No background processing (import is synchronous; if too slow, defer to a Bull job and poll/
  webhook for results in a future iteration).
- No conflict resolution UI (strategy is hardcoded: update if id matches, create otherwise).

## Check When Done

- Contacts and companies can be exported to CSV (respects filters).
- CSV import works; contacts/companies are created or updated based on id presence.
- Import summary is returned and displayed in the frontend (success count, errors).
- Role enforcement: only `MANAGER`/`ADMIN` can import. Export is available to all. Build passes.
