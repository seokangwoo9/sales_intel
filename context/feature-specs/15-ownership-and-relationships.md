Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Establish **relationships between contacts and companies**, and complete the ownership-transfer
notification flow. Contacts can belong to multiple companies (with roles/titles); ownership
changes trigger real-time notifications.

## Scope of this unit

- Implement the many-to-many contact↔company relationship via the `ContactCompany` join model.
- Add endpoints to link/unlink contacts and companies, and list relationships.
- Wire ownership-transfer notifications (queue a job the notification-service will consume).
- Do not build frontend UI (specs 16–17) or import/export (spec 18).

## Prerequisite

Specs 04–14 done. `ContactCompany` join model exists in Prisma (spec 06). Notification-service
is planned (spec 34) but may not exist yet; queue jobs that will be consumed later.

## Implementation

### Contact↔Company linking (contact-service or company-service)

Choose where to host these endpoints (either service; contact-service is natural). Extend with:

- `POST /api/contacts/:contactId/companies` — link a contact to a company. Body:
  `{ companyId, role?, title? }`. Validate both contact and company exist in the active org.
  Create a `ContactCompany` record. Emit history (contact gained a company association).
- `DELETE /api/contacts/:contactId/companies/:companyId` — unlink. Emit history.
- `GET /api/contacts/:contactId/companies` — list companies linked to this contact. Include
  role/title from the join.
- `GET /api/companies/:companyId/contacts` — list contacts linked to this company (inverse).
  Include role/title.

### Ownership-transfer notifications

When `PATCH /api/contacts/:id` or `PATCH /api/companies/:id` changes `ownerId`, after emitting
the history event:

- Enqueue a notification job (Bull queue `notifications`, or call the notification-service
  directly if it exists). Payload:
  ```json
  {
    "recipientId": "<new ownerId>",
    "type": "OWNERSHIP_ASSIGNED",
    "entityType": "CONTACT" | "COMPANY",
    "entityId": "<id>",
    "payload": { "previousOwnerId": "<old>", "entityName": "<name>" }
  }
  ```
- The notification-service (spec 34) will consume this and create a `Notification` record. If
  the service does not exist yet, the job will sit in the queue or log an error (acceptable;
  no blocking).

### Validation & errors

- Prevent duplicate contact↔company links (unique constraint on `(contactId, companyId)`).
- `404` if contact or company not found or not in the active org.

### History integration

- Link/unlink events: `{ action: 'LINK_COMPANY' | 'UNLINK_COMPANY', entityType: 'CONTACT', entityId, diff: { companyId, role?, title? } }`.

## Scope Limits

- No frontend UI (specs 16–17).
- No import/export (spec 18).
- Notification-service may not consume jobs yet (spec 34 builds it).

## Check When Done

- Contacts can be linked to companies with optional role/title; relationships are bidirectional
  (fetch from either side).
- Unlinking works; duplicate links are prevented.
- Ownership transfer on contacts/companies enqueues a notification job (Bull or direct call).
- History events are emitted for link/unlink and ownership changes. Build passes.
