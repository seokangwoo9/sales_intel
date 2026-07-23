Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

**Security hardening pass**: audit and lock down authentication, authorization, data protection,
and network security before production. This unit ensures the app is secure for self-hosted
deployment.

## Scope of this unit

- Review and harden auth (JWT, Better Auth config, session security).
- Enforce HTTPS, CORS, rate limiting, and CSRF protection.
- Review RBAC enforcement across all endpoints.
- Encrypt sensitive data at rest (email credentials, API keys).
- Input validation and SQL injection prevention.
- Dependency audits and updates.
- Do not implement advanced security (WAF, DDoS protection, pen testing) — defer to post-MVP.

## Prerequisite

Specs 04–37 done. All services and frontend are functional and tested.

## Implementation

### Authentication hardening

- **JWT security**:
  - Use strong signing keys (256-bit secrets; store in env, never commit).
  - Set short expiry (15 min access token, 7 day refresh token).
  - Validate issuer/audience claims.
  - Review the auth-service (spec 08) JWT generation; ensure no weak algorithms (only HS256/RS256).

- **Better Auth config**:
  - Enable HTTPS-only cookies (`secure: true`, `sameSite: 'lax'` or `'strict'`).
  - Set `httpOnly: true` for session cookies (prevent XSS).
  - Review session expiry (align with JWT expiry or longer for refresh).

- **Password policies**:
  - Enforce min length (12 chars), complexity (mix of letters/numbers/symbols) in the auth-service.
  - Use Better Auth's built-in hashing (bcrypt/argon2); verify no plaintext storage.

### Authorization (RBAC) audit

- **Endpoint review**: audit every service endpoint to ensure:
  - Protected routes require auth (JWT validation via the gateway).
  - RBAC guards (`@Roles()`, spec 10) are applied where needed (admin-only, manager-only).
  - Tenant isolation: every query filters by `organizationId` (review the tenant-scoping utility
    from spec 10).

- **Test forbidden access**: write tests (or manual checks) verifying:
  - A `VIEWER` cannot update/delete contacts.
  - A user from org A cannot access org B's data (even with a valid JWT).

### Data protection

- **Encryption at rest**:
  - Email credentials (`EmailAccount.encryptedPassword`, spec 24) are encrypted (AES-256-GCM).
  - OpenAI API key, SMTP passwords in env are never logged or returned in API responses.
  - Review: no plaintext secrets in the database.

- **Encryption in transit**:
  - Enforce HTTPS in production (Nginx/Traefik termination or app-level TLS).
  - Database connections use SSL (`DATABASE_URL` with `?sslmode=require`).
  - Redis connections use TLS if exposed (local Docker doesn't need it; production does).

### Input validation

- **Backend**: every endpoint validates input (NestJS `class-validator` + DTOs). Review:
  - Email format, domain format, string length limits.
  - Reject SQL injection patterns (Prisma parameterizes queries, but review raw SQL if any).
  - Reject script tags in rich-text fields (sanitize Tiptap HTML server-side; use a library
    like `isomorphic-dompurify` or `sanitize-html`).

- **Frontend**: validate before submit (React Hook Form + Zod), but never trust client validation
  (server always validates).

### CORS, CSRF, rate limiting

- **CORS** (API gateway, spec 07):
  - Allowlist only the frontend origin(s) (`FRONTEND_URL` from env).
  - Credentials: `credentials: true` (for cookies).
  - Review: no `Access-Control-Allow-Origin: *` in production.

- **CSRF** (Better Auth handles this for its own routes; for custom endpoints):
  - Use `sameSite: 'lax'` or `'strict'` cookies (prevents CSRF).
  - Optionally add a CSRF token middleware (NestJS `csurf` or custom).

- **Rate limiting** (API gateway, spec 07):
  - Verify global rate limiter is active (e.g. 100 req/min per IP).
  - Add stricter limits on auth endpoints (10 login attempts/min per IP).
  - Use Redis-backed rate limiter (not in-memory; doesn't scale).

### Dependency audit

- Run `npm audit` (frontend + backend). Fix high/critical vulnerabilities:
  ```sh
  npm audit fix
  ```
- Review `package.json` for outdated deps: `npm outdated`. Update where safe (test after).

- Pin major versions in `package.json` (use `^` or `~` conservatively; lock exact versions for
  security-critical deps like `jsonwebtoken`, `bcrypt`).

### Logging and secrets

- **No secrets in logs**: review all `console.log`, `logger.log` calls. Redact passwords, tokens,
  API keys.
- **Structured logging**: use a logger (e.g. `winston`, `pino`) with JSON output (easier to parse
  in production). Log request IDs, user IDs, but not sensitive data.

### Environment variables

- Review `.env.example` (spec 04): ensure all secrets are documented as placeholders, never real values.
- Verify `.env` is gitignored.
- Document secret rotation strategy (e.g. rotate JWT keys, DB passwords quarterly).

### Security headers

Add security headers to API responses (NestJS global middleware or Nginx):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy` (frontend; restrict script sources).

Use a library like `helmet` (Express/NestJS):
```ts
app.use(helmet());
```

### Soft-delete and audit trails

- Verify soft-delete is enforced (filter `deletedAt = null` in all queries; spec 06 models).
- Verify history events (spec 21) are immutable (no update/delete endpoints).

## Scope Limits

- No penetration testing (defer to post-MVP or hire a security firm).
- No WAF, DDoS protection (defer to infrastructure; Cloudflare or similar).
- No compliance certifications (SOC2, GDPR) — defer to post-MVP.
- No secrets management service (Vault, AWS Secrets Manager) — use env vars for MVP.

## Check When Done

- JWT uses strong keys, short expiry; Better Auth cookies are `httpOnly` + `secure`.
- RBAC is enforced on all endpoints; tenant isolation verified.
- Email credentials and API keys are encrypted at rest.
- CORS, CSRF, rate limiting active; input validation on all endpoints.
- `npm audit` shows no high/critical vulnerabilities.
- Security headers (`helmet`) are applied. Secrets are never logged. Build passes.
