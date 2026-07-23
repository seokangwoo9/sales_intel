Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **NestJS API gateway** — the single public entry point. All frontend traffic hits
the gateway, which authenticates requests and forwards them to the right microservice.

## Scope of this unit

- Scaffold the `api-gateway` NestJS app.
- Implement routing/proxying to downstream services, CORS, rate limiting, JWT validation, and
  request logging.
- Do not implement business logic for any downstream service.

## Prerequisite

Specs 04–06 done. Downstream services may not exist yet — that is fine; route to their
intended URLs and fail gracefully with a clear error when a target is unavailable.

## Implementation

### Scaffold

- Scaffold a NestJS app in `services/api-gateway/`.
- Add a `Dockerfile` and wire the service into `docker-compose.dev.yml` (uncomment/add the
  gateway container). It should read config from env.

### Configuration

- Central config module reading env: port, allowed origins, JWT public key/secret, downstream
  service base URLs (one per service), rate-limit settings.
- Service registry: a typed map of service name → base URL, sourced from env.

### Routing / proxying

- Define route prefixes that map to services, e.g.:
  - `/api/auth/*` → auth-service
  - `/api/organizations/*` → organization-service
  - `/api/contacts/*` → contact-service
  - `/api/companies/*` → company-service
  - `/api/activity/*` → activity-service
  - `/api/email/*` → email-service
  - `/api/ai/*` → ai-service
  - `/api/analytics/*` → analytics-service
  - `/api/notifications/*` → notification-service
  - `/api/files/*` → file-service
  - `/api/history/*` → history-service
- Forward method, headers (minus hop-by-hop), body, and query. Preserve status codes and
  stream responses where practical.

### Auth (JWT validation)

- Validate the JWT issued by the auth-service (spec 08) on every non-public route.
- Public routes: the auth endpoints and health check.
- On valid token, attach the user/org context and forward identity to downstream services via
  trusted headers (e.g. `x-user-id`, `x-org-id`). Downstream services trust the gateway only.
- Reject invalid/expired tokens with `401` in the standard `ApiResponse` error shape.

### Cross-cutting concerns

- **CORS**: allow the frontend origin(s) from env; credentials as needed for Better Auth.
- **Rate limiting**: global limiter (per-IP and/or per-user) with sane defaults; configurable.
- **Logging**: structured request/response logging with a request id; propagate the request id
  downstream.
- **Errors**: a global exception filter returning the standard `ApiResponse` error envelope.
- **Health**: `GET /health` returning gateway + downstream reachability summary.

## Scope Limits

- No downstream business logic; the gateway only routes, authenticates, and observes.
- Do not implement auth login/register here (that is the auth-service, spec 08).
- Do not add service-specific validation beyond what routing requires.

## Check When Done

- `services/api-gateway/` runs as a NestJS app in Docker Compose.
- Requests to `/api/<service>/...` proxy to the correct downstream base URL.
- JWT validation protects non-public routes; invalid tokens return `401` in `ApiResponse` shape.
- CORS, rate limiting, structured logging with request id, and a global exception filter are active.
- `GET /health` returns gateway status. Unavailable downstreams fail gracefully with a clear error.
