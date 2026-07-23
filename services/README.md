# SalesIntel CRM - Microservices

This directory contains all backend microservices for the SalesIntel CRM system.

## Architecture

The system uses a microservices architecture where each service is independently deployable and communicates via HTTP/REST APIs. All external requests are routed through the API Gateway.

## Services

- **api-gateway** — Entry point for all requests: routing, rate limiting, and CORS
- **auth-service** — User authentication, registration, JWT management (BetterAuth integration)
- **organization-service** — Multi-tenancy: organizations, members, roles, and permissions
- **contact-service** — Contact CRUD, ownership, search, and relationships
- **company-service** — Company CRUD, hierarchies, ownership, and contact relationships
- **activity-service** — Posts, comments, mentions, attachments, and activity feeds
- **email-service** — SMTP/IMAP integration, email send/receive/sync, threading
- **ai-service** — OpenAI API proxy, embeddings, RAG, and chat management
- **analytics-service** — Metrics calculation, dashboard data, and report generation
- **notification-service** — Notifications, WebSocket broadcasting, and real-time updates
- **file-service** — File upload, storage, access control, and retrieval
- **history-service** — Audit logs, change tracking, and ownership history

## Communication Pattern

- **Frontend → API Gateway** — All client requests go through the gateway
- **API Gateway → Services** — Gateway routes requests to appropriate services
- **Service → Service** — Services communicate via HTTP/REST when needed
- **Services → Database** — Each service accesses PostgreSQL via Prisma
- **Services → Redis** — Shared cache and session storage
- **Services → Queue** — Background jobs via Bull queue

## Multi-Tenancy

All services enforce tenant isolation via `organization_id`. Every database query must filter by organization to prevent cross-tenant data leakage.

## Development

Each service will be a standalone NestJS application with its own dependencies, though they share the same Prisma schema and database instance in development.

See `docker-compose.dev.yml` at the repo root for the local development environment setup.
