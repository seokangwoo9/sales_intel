# SalesIntel CRM - Development Workflow

## Approach

Build this CRM system incrementally using a spec-driven workflow. Context files define what to build, how to build it, and what the current state of progress is. Always implement against these specs — do not infer or invent behavior from scratch.

## Scoping Rules

- Work on one feature unit or microservice at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated service boundaries in a single implementation step.
- Complete one microservice endpoint before moving to the next.

## When To Split Work

Split an implementation step if it combines:

- Frontend UI changes and backend microservice changes (unless tightly coupled for a single feature)
- Multiple microservices modifications
- Database schema changes and complex business logic
- Multiple unrelated API endpoints
- Email system changes and contact management changes
- AI service changes and data service changes
- Behavior that is not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior that is not defined in the context files or DEVELOPMENT_PLAN.md.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.
- Refer to DEVELOPMENT_PLAN.md for feature specifications and acceptance criteria.

## Protected Foundation Components

Do not modify generated third-party foundation components unless explicitly instructed.

This includes:

- `frontend/components/ui/*` (shadcn/ui components)
- `frontend/node_modules/*` (third-party libraries)
- BetterAuth internals
- Prisma generated client code
- NestJS decorators and core modules

These should remain default and reusable.

Project-specific styling, layout changes, and feature logic must be implemented in app-level components instead of modifying foundation components.

Only modify these files when a task explicitly requires it or when extending functionality through proper patterns (composition, inheritance, wrappers).

## Microservices Architecture Guidelines

- Each microservice should be independently deployable.
- Services communicate via HTTP/REST APIs.
- Shared types and utilities go in `/shared` directory.
- Database access within each service uses Prisma schema.
- Authentication/authorization checked at API Gateway level.
- Each service has its own testing suite.

## Keeping Docs In Sync

Update the relevant context file whenever implementation changes:

- Microservice boundaries or communication patterns
- Database schema or Prisma model changes
- API endpoint contracts
- Authentication/authorization flow
- Storage model decisions
- Code conventions or standards
- Feature scope or behavior
- AI integration patterns

Progress state must reflect the actual state of the implementation, not the intended state.

## Before Moving To The Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture-context.md` was violated.
3. API endpoints are documented and tested.
4. Database migrations are created and applied successfully.
5. `progress-tracker.md` reflects the completed work.
6. The feature is verified in the development environment.
7. No breaking changes introduced to other services without updates.

## Development Phase Progression

Follow the phases defined in DEVELOPMENT_PLAN.md:

- **Phase 1:** Foundation & Infrastructure
- **Phase 2:** Core User & Organization Management
- **Phase 3:** Contact & Company Management
- **Phase 4:** Activity Feed & Post System
- **Phase 5:** Email System
- **Phase 6:** Analytics & Reporting
- **Phase 7:** AI Chat Assistant
- **Phase 8:** Notifications & Real-time Features
- **Phase 9:** Polish & Optimization
- **Phase 10:** Deployment & Launch

Do not skip phases. Complete all deliverables in a phase before moving to the next.

## AI-Assisted Development Best Practices

- Write clear, descriptive commit messages.
- Test each change immediately after implementation.
- Document complex logic with inline comments.
- Keep functions focused and single-purpose.
- Follow TypeScript best practices for type safety.
- Use Prisma migrations for all database changes.
- Validate all user inputs at service boundaries.
- Handle errors gracefully with proper error messages.
- Log important operations for debugging.
- Keep security in mind for all data operations (multi-tenancy isolation).
