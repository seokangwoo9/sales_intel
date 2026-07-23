# SalesIntel CRM - Code Standards

## General

- Keep modules small and single-purpose.
- Fix root causes — do not layer workarounds.
- Do not mix unrelated concerns in one component, service, or route.
- Respect the system boundaries defined in `architecture-context.md`.
- Write self-documenting code; add comments only for complex business logic.
- Follow the DRY principle — extract shared logic to utilities or shared modules.

## TypeScript

- Strict mode is required throughout the project (frontend and backend).
- Avoid `any`; use explicit interfaces or narrowly scoped types.
- Validate unknown external input at system boundaries before trusting it.
- Use `interface` for object contracts, `type` for unions and complex types.
- Leverage TypeScript's type inference — don't over-annotate obvious types.
- Share types between frontend and backend via `/shared/types`.
- Use `const` by default; `let` only when reassignment is needed.

## Next.js (Frontend)

- Default to React Server Components.
- Add `"use client"` only when the component needs:
  - Browser interactivity (onClick, onChange)
  - React hooks (useState, useEffect, custom hooks)
  - Real-time state (Socket.IO listeners)
  - Browser-only APIs (window, localStorage)
- Keep route handlers focused on a single responsibility.
- Use Server Actions for simple mutations when appropriate.
- Leverage Next.js caching strategies (fetch cache, React cache).
- Use dynamic imports for heavy client components.

## NestJS (Backend Microservices)

- Use dependency injection for all service dependencies.
- Keep controllers thin — delegate business logic to services.
- Use DTOs (Data Transfer Objects) for request validation with `class-validator`.
- Use Pipes for validation and transformation.
- Use Guards for authentication and authorization checks.
- Use Interceptors for logging, response transformation, and error handling.
- One controller per resource/entity (e.g., ContactController, CompanyController).
- Services should be stateless and testable in isolation.

## Prisma & Database

- All schema changes MUST go through Prisma migrations.
- Never write raw SQL for schema changes.
- Use Prisma migrations for version control: `prisma migrate dev` (development), `prisma migrate deploy` (production).
- Always include `organization_id` in queries for multi-tenant isolation.
- Use Prisma's type-safe query builder — avoid raw SQL unless absolutely necessary.
- Index frequently queried fields (owner_id, organization_id, email, created_at).
- Use transactions for operations that modify multiple tables.

## Styling

- Use CSS custom property tokens defined in `globals.css` — no raw Tailwind color classes like `zinc-*` or hardcoded hex values.
- Reference tokens through their Tailwind utility names: `bg-background`, `text-foreground`, `border-border`, `text-primary`, etc.
- Follow shadcn/ui conventions for consistency.
- Maintain the border radius scale: `rounded-lg` for small elements, `rounded-xl` for cards, `rounded-2xl` for modals.
- Use Tailwind's responsive utilities for mobile-first design.
- Keep component-specific styles in the component file; shared styles in `globals.css`.

## API Design

### REST Conventions
- Use standard HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE (remove).
- Use proper HTTP status codes:
  - 200 (OK), 201 (Created), 204 (No Content)
  - 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)
  - 500 (Internal Server Error)
- Consistent response structure:
  ```typescript
  {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  ```
- Versioned APIs: `/api/v1/contacts`, `/api/v1/companies`.

### Validation
- Validate and parse request input before any logic runs.
- Use class-validator decorators in DTOs.
- Return clear, actionable error messages.

### Authentication & Authorization
- Enforce JWT validation at API Gateway level.
- Check organization membership and permissions at service level.
- Verify resource ownership before mutations.
- Use Guards for role-based access control.

### Documentation
- Document all API endpoints with Swagger/OpenAPI decorators.
- Include request/response examples.
- Document required permissions for each endpoint.

## Data and Storage

### PostgreSQL (via Prisma)
- All structured data: users, organizations, contacts, companies, emails, posts, audit logs.
- Relational data with foreign keys and constraints.
- Multi-tenant isolation via `organization_id`.

### Redis
- Session data (JWT blacklist, refresh tokens).
- Rate limiting counters.
- Cache for frequently accessed data (user permissions, org settings).
- Bull queue job data.

### Filesystem
- Uploaded files organized by organization: `/uploads/{org_id}/{entity_type}/{entity_id}/{filename}`.
- Store file metadata in PostgreSQL, actual files on disk.
- Abstraction layer for future S3 migration.

### pgvector
- AI embeddings stored alongside metadata in PostgreSQL.
- Indexed for fast similarity search.
- Updated via background jobs when data changes.

## Security

### Input Validation
- Validate all user input at service boundaries.
- Sanitize HTML content to prevent XSS.
- Use parameterized queries (Prisma handles this).
- Validate file uploads (type, size, content).

### Authentication
- Hash passwords with bcrypt (BetterAuth handles this).
- Use secure, httpOnly cookies for sessions.
- Implement JWT with short expiration + refresh tokens.
- Rotate refresh tokens on use.

### Authorization
- Always check organization membership before data access.
- Verify resource ownership before mutations.
- Implement RBAC with granular permissions.

### Data Protection
- Encrypt sensitive data at rest (email credentials, API keys).
- Use environment variables for secrets, never hardcode.
- Log security events (failed logins, ownership transfers).

## Error Handling

### Backend
- Use NestJS exception filters for consistent error responses.
- Log errors with context (user_id, organization_id, request_id).
- Don't expose internal errors to clients — return sanitized messages.
- Use custom exceptions for business logic errors.

### Frontend
- Show user-friendly error messages.
- Log errors to console in development.
- Use error boundaries for React component errors.
- Handle network errors gracefully (retry logic).

## Testing

### Backend Tests
- Unit tests for services and utilities.
- Integration tests for API endpoints.
- Use Jest and Supertest.
- Mock external dependencies (OpenAI API, SMTP).
- Aim for >80% code coverage on critical paths.

### Frontend Tests
- Component tests with React Testing Library.
- E2E tests for critical user flows (login, create contact, send email).
- Test accessibility (a11y) with axe-core.

## File Organization

### Backend (`/services/{service-name}`)
```
src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── dtos/           # Data Transfer Objects (validation)
├── entities/       # Prisma models (if needed)
├── guards/         # Auth and permission guards
├── interceptors/   # Request/response transformation
├── pipes/          # Validation and transformation
├── decorators/     # Custom decorators
├── utils/          # Helper functions
├── main.ts         # Application entry point
└── app.module.ts   # Root module
```

### Frontend (`/frontend`)
```
app/
├── (auth)/         # Auth-related pages (login, register)
├── (dashboard)/    # Main app pages
├── api/            # API route handlers (if needed)
├── layout.tsx      # Root layout
└── page.tsx        # Home page

components/
├── ui/             # shadcn/ui components (DO NOT MODIFY)
├── contacts/       # Contact-specific components
├── companies/      # Company-specific components
├── email/          # Email-specific components
├── ai/             # AI chat components
└── shared/         # Shared app components

lib/
├── api/            # API client functions
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
└── constants/      # Constants and enums
```

### Shared (`/shared`)
```
types/              # Shared TypeScript types
utils/              # Shared utility functions
constants/          # Shared constants
```

## Naming Conventions

- **Files**: kebab-case (`contact-service.ts`, `email-controller.ts`)
- **Components**: PascalCase (`ContactList.tsx`, `EmailComposer.tsx`)
- **Functions/Variables**: camelCase (`getUserById`, `organizationId`)
- **Interfaces/Types**: PascalCase (`User`, `ContactDto`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_VERSION`)
- **CSS classes**: kebab-case (following Tailwind conventions)

## Git Commit Messages

Follow conventional commits:
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring (no functional changes)
- `docs:` — Documentation changes
- `test:` — Test additions or changes
- `chore:` — Build, config, or tooling changes
- `style:` — Code style changes (formatting, no logic changes)

Example: `feat(contact-service): add contact ownership transfer endpoint`

## Background Jobs (Bull)

- Jobs should be idempotent (safe to retry).
- Handle failures gracefully with retry logic.
- Log job start, success, and failure.
- Set appropriate timeouts.
- Use Bull's built-in concurrency control.
- Clean up completed jobs periodically.

## AI Integration Best Practices

- Always use the custom OpenAI proxy (never call OpenAI directly).
- Implement exponential backoff for retries.
- Cache responses when appropriate.
- Track token usage per organization.
- Sanitize user input before sending to AI.
- Validate AI responses before using them.
- Set reasonable max tokens limits.
- Handle rate limiting gracefully.

## Performance

- Use database indexes on frequently queried fields.
- Implement pagination for list endpoints (default: 20 items per page).
- Use Redis caching for expensive queries.
- Optimize database queries (avoid N+1 queries).
- Use connection pooling for database connections.
- Lazy load heavy components on frontend.
- Optimize images and assets.

## Logging

- Use structured logging (JSON format).
- Include context: `user_id`, `organization_id`, `request_id`.
- Log levels: `error`, `warn`, `info`, `debug`.
- Don't log sensitive data (passwords, tokens, API keys).
- Log important business events (ownership transfers, email sends).
- Use correlation IDs to trace requests across services.

## Documentation

- Document complex business logic with inline comments.
- Use JSDoc for public functions and classes.
- Keep README.md updated with setup instructions.
- Document API endpoints with Swagger.
- Update context files when architecture changes.
- Document environment variables in `.env.example`.
