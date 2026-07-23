Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

**Performance optimization pass**: query tuning, caching, indexing, and frontend optimizations.
This unit ensures the app performs well under realistic load (100+ concurrent users, 10k+ records).

## Scope of this unit

- Database query optimization (indexes, N+1 fixes, pagination tuning).
- Redis caching for frequently-read data (org metadata, member lists).
- Frontend optimizations (code splitting, lazy loading, debouncing).
- Background job tuning (Bull concurrency, queue priorities).
- Do not implement advanced scaling (horizontal scaling, CDN) — defer to production (spec 39).

## Prerequisite

Specs 04–35 done. All services and frontend are functional. Redis is available (spec 04).

## Implementation

### Database indexing

Review and add missing indexes in Prisma (spec 06):

- Every foreign key (`userId`, `organizationId`, `ownerId`, `parentId`, `threadId`, etc.).
- Common filter columns (`email`, `domain`, `createdAt`, `deletedAt`).
- Composite indexes for frequent queries: `(organizationId, createdAt)`, `(organizationId, ownerId)`,
  `(entityType, entityId)`.
- Vector index on `Embedding.vector` (IVFFlat or HNSW; tune `lists` param for pgvector).

Generate and apply migration: `prisma migrate dev --name add-performance-indexes`.

### N+1 query fixes

Review service endpoints for N+1 patterns (e.g. fetching contacts, then looping to fetch owner
names). Fix with Prisma `include` or `select` to join relations in one query.

Example:
```ts
// Bad: N+1
const contacts = await prisma.contact.findMany({ where: { organizationId } });
for (const c of contacts) {
  c.owner = await prisma.user.findUnique({ where: { id: c.ownerId } });
}

// Good: join
const contacts = await prisma.contact.findMany({
  where: { organizationId },
  include: { owner: { select: { id: true, name: true, email: true } } },
});
```

Apply to contact-service, company-service, activity-service, email-service, and history-service.

### Redis caching

Add caching to frequently-read, rarely-changed data:

- **Org metadata**: `GET /api/organizations/:id` → cache for 5 minutes. Invalidate on `PATCH`.
- **Member lists**: `GET /api/organizations/:id/members` → cache for 2 minutes. Invalidate on
  member add/remove/role change.
- **Email templates**: cache the rendered template after first use (keyed by `templateId + contextHash`).

Use a caching abstraction (e.g. NestJS `@nestjs/cache-manager` or manual Redis client):
```ts
const cacheKey = `org:${orgId}`;
let org = await redis.get(cacheKey);
if (!org) {
  org = await prisma.organization.findUnique({ where: { id: orgId } });
  await redis.setex(cacheKey, 300, JSON.stringify(org));
}
```

### Pagination tuning

Ensure all list endpoints (`contacts`, `companies`, `emails`, `posts`, `history`) use cursor-based
pagination (if infinite scroll) or offset-based (if page-number UI). For large tables, offset
pagination is slow (Prisma `skip`); consider cursor (`cursor` + `take`) for better performance.

For MVP, offset is acceptable; document cursor pagination as a future optimization.

### Background job tuning

Tune Bull queue concurrency (spec 04 Docker Compose Redis + Bull):

- **Email sync**: low concurrency (1-2 per service instance; IMAP is slow).
- **AI indexing**: higher concurrency (5-10; embedding API is parallelizable).
- **Notifications**: high concurrency (10+; fast writes).

Set job priorities: critical jobs (notifications) > normal (indexing) > low (bulk operations).

### Frontend optimizations

- **Code splitting**: Next.js does this by default for pages. Ensure dynamic imports for heavy
  components (e.g. Tiptap editor, Recharts): `const Editor = dynamic(() => import('./editor'))`.
- **Lazy loading**: images (`loading="lazy"` on `<img>`), heavy lists (virtualization with
  `react-window` or `@tanstack/react-virtual` if lists exceed 100 items).
- **Debouncing**: search inputs already debounce (specs 16–17, 28); verify all are debounced (300ms).
- **React Query settings**: set `staleTime` (e.g. 1 minute) for stable data (org, members) to
  reduce refetches.

### API response trimming

Review endpoint responses; exclude large/unused fields (e.g. email body in list views; include
only in detail). Use Prisma `select` to fetch only needed columns.

### Monitoring (lightweight)

Add basic logging/metrics:

- Log slow queries (Prisma middleware to log queries >100ms).
- Log failed jobs (Bull event listeners for `failed`).
- Expose a `/metrics` endpoint (Prometheus format) with basic counts (requests, errors, job counts).

For MVP, console logs are acceptable; full observability is spec 40.

## Scope Limits

- No horizontal scaling (load balancers, replicas) — defer to spec 39.
- No CDN for static assets — defer to spec 39.
- No advanced caching (cache warming, stale-while-revalidate) — defer to post-MVP.
- No query profiling tools (pgAdmin, query analyzer) setup — manual for MVP.

## Check When Done

- All common queries have appropriate indexes; migrations applied.
- N+1 queries are fixed (joins used where applicable).
- Redis caching is active for org metadata and member lists.
- Background job concurrency is tuned; priorities set.
- Frontend lazy-loads heavy components; search inputs debounce.
- Page load time <2s, API response time <200ms (average, measured manually or via browser DevTools). Build passes.
