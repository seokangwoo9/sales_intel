Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

**Testing strategy and implementation**: unit tests, integration tests, and E2E tests to ensure
reliability. This unit establishes the testing foundation and covers critical paths.

## Scope of this unit

- Set up testing frameworks (Jest for backend, Vitest or Jest for frontend, Playwright for E2E).
- Write unit tests for core services (contact, company, email, AI).
- Write integration tests for API endpoints (key flows: auth, CRUD, email send).
- Write E2E tests for critical user journeys (signup, create contact, send email, AI chat).
- Do not aim for 100% coverage (MVP goal: 60%+ for services, E2E for top 3 flows).

## Prerequisite

Specs 04–36 done. All services and frontend are functional.

## Implementation

### Backend testing (NestJS services)

Set up Jest (comes with NestJS):

- Each service has a `test/` folder with `*.spec.ts` files.
- Unit tests: test service methods in isolation (mock Prisma, external APIs).
- Integration tests: test controllers with a test database (use Docker Compose or an in-memory
  Postgres for speed; or a separate test DB).

**Unit test examples** (one per service; expand coverage as needed):

- **contact-service**: test `createContact`, `listContacts`, `updateContact` methods. Mock Prisma.
- **auth-service**: test JWT generation, session validation. Mock Better Auth internals.
- **email-service**: test SMTP send wrapper, template rendering. Mock Nodemailer.
- **ai-service**: test OpenAI call wrapper, context injection. Mock OpenAI SDK.

**Integration test examples** (E2E for endpoints):

- `POST /api/contacts` → creates contact, returns 201, stores in DB.
- `POST /api/email/send` → sends email via SMTP (mock SMTP or use a test server like Mailhog),
  stores in `EmailMessage`.
- `POST /api/ai/chat/messages` → calls OpenAI (mock), saves messages.

Use `supertest` for HTTP testing in NestJS.

### Frontend testing (Next.js)

Set up Vitest or Jest:

- Unit tests for utility functions (`lib/utils.ts`, validation helpers).
- Component tests for key components (`workspace-navbar`, `contact-form`, `post-composer`). Use
  React Testing Library.

**Component test examples**:

- **ContactForm**: renders fields, validates input, calls `POST /api/contacts` on submit (mock fetch).
- **PostComposer**: Tiptap editor renders, mention picker works (mock mentions API).

Run with `npm run test`.

### E2E testing (Playwright)

Set up Playwright:

- `playwright.config.ts` with a test base URL (e.g. `http://localhost:3000`).
- Test database: use a separate Postgres instance or reset the dev DB before each test run.

**E2E test scenarios** (critical user journeys):

1. **Signup and login**:
   - Visit `/sign-up`, fill form, submit.
   - Verify redirect to `/workspace`.
   - Logout, login again, verify session.

2. **Create contact and link to company**:
   - Login, navigate to `/contacts`, click "+ New Contact".
   - Fill form, submit.
   - Verify contact appears in list.
   - Open contact detail, click "Link Company", select company, submit.
   - Verify company is linked.

3. **Send email**:
   - Navigate to `/email/inbox`, click "Compose".
   - Fill recipient, subject, body, click "Send".
   - Verify email appears in `/email/sent`.

4. **AI chat**:
   - Navigate to `/ai`, type a message, send.
   - Verify assistant response appears.

Run with `npx playwright test`.

### Test database strategy

- Use a separate test DB (`DATABASE_URL_TEST` env var).
- Before each test suite, run migrations (`prisma migrate deploy`).
- After each test, truncate tables or roll back transactions (or use a fresh DB per test).

### CI integration (optional for MVP)

Document how to run tests in CI (GitHub Actions, GitLab CI):
```yaml
# .github/workflows/test.yml
- run: docker compose -f docker-compose.test.yml up -d
- run: npm run test
- run: npx playwright test
```

Defer full CI setup to spec 39 if time-constrained; for MVP, run tests manually before deployment.

### Coverage goals

- Backend services: 60%+ coverage (focus on business logic, not boilerplate).
- Frontend: 40%+ coverage (focus on forms, key interactions).
- E2E: 3 critical journeys pass.

Run coverage: `npm run test:cov` (Jest) or `npx vitest --coverage` (Vitest).

## Scope Limits

- No load testing (defer to post-MVP or spec 39).
- No visual regression testing (defer to post-MVP).
- No mutation testing (defer to post-MVP).
- No 100% coverage goal (MVP is functional coverage of critical paths).

## Check When Done

- Jest/Vitest setup runs unit and integration tests for backend and frontend.
- Playwright E2E tests cover signup/login, contact creation, email send, and AI chat.
- All tests pass; coverage is 60%+ for services, 40%+ for frontend.
- Test database strategy is documented. Build and test pass in sequence.
