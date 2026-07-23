# SalesIntel CRM - Architecture Context

## Stack

| Layer            | Technology              | Role                                                           |
| ---------------- | ----------------------- | -------------------------------------------------------------- |
| Frontend         | Next.js 15 + TypeScript | React-based UI with App Router and Server Components           |
| UI               | Tailwind + shadcn/ui    | Component library and styling system                           |
| Auth             | BetterAuth              | User authentication and session management                     |
| Backend          | NestJS + TypeScript     | Microservices framework for API services                       |
| Database         | Prisma + PostgreSQL     | ORM and relational database for all CRM data                   |
| Vector DB        | pgvector                | PostgreSQL extension for AI embeddings and semantic search     |
| AI               | OpenAI GPT-5.4          | Language model for chat assistant and email drafting           |
| Caching          | Redis                   | Session storage, rate limiting, and data caching               |
| Queue            | Bull                    | Background job processing (email sync, AI indexing)            |
| Real-time        | Socket.IO               | WebSocket connections for notifications and live updates       |
| File Storage     | Local Filesystem        | File uploads and attachments (abstracted for future S3)        |
| Containerization | Docker + Docker Compose | Development and production deployment                          |

## System Boundaries

### Backend Microservices (`/services`)

- `api-gateway/` — Entry point for all requests: routing, rate limiting, and CORS
- `auth-service/` — User authentication, registration, JWT management (BetterAuth integration)
- `organization-service/` — Multi-tenancy: organizations, members, roles, and permissions
- `contact-service/` — Contact CRUD, ownership, search, and relationships
- `company-service/` — Company CRUD, hierarchies, ownership, and contact relationships
- `activity-service/` — Posts, comments, mentions, attachments, and activity feeds
- `email-service/` — SMTP/IMAP integration, email send/receive/sync, threading
- `ai-service/` — OpenAI API proxy, embeddings, RAG, and chat management
- `analytics-service/` — Metrics calculation, dashboard data, and report generation
- `notification-service/` — Notifications, WebSocket broadcasting, and real-time updates
- `file-service/` — File upload, storage, access control, and retrieval
- `history-service/` — Audit logs, change tracking, and ownership history

### Frontend (`/frontend`)

- `app/` — Next.js App Router pages and layouts
- `components/` — React components (app-specific logic)
- `components/ui/` — shadcn/ui base components (do not modify)
- `lib/` — Utilities, API clients, and shared helpers
- `hooks/` — Custom React hooks
- `types/` — TypeScript type definitions

### Shared (`/shared`)

- `types/` — Shared TypeScript interfaces and types across services
- `utils/` — Shared utility functions
- `constants/` — Shared constants and enums

### Infrastructure (`/`)

- `docker-compose.dev.yml` — Development environment
- `docker-compose.prod.yml` — Production environment
- `prisma/schema.prisma` — Database schema definition

## Storage Model

### PostgreSQL Database
- **Organizations**: tenant isolation, settings, mail server configs
- **Users**: authentication, profiles, multi-org membership
- **Contacts**: customer data, ownership, custom fields
- **Companies**: business entities, hierarchies, relationships
- **Posts & Comments**: activity feed content, mentions
- **Emails**: sent/received emails, threads, attachments
- **Files**: metadata, paths, ownership (actual files on filesystem)
- **Audit Logs**: change history, ownership transfers
- **AI Embeddings**: vector storage via pgvector extension
- **AI Chats**: conversation history per user

### Redis Cache
- User sessions and JWT tokens
- Rate limiting counters
- Frequently accessed data (user permissions, org settings)
- AI embedding cache

### Local Filesystem
- Uploaded files at `/uploads/{organizationId}/{entityType}/{entityId}/`
- Organized by organization for multi-tenancy isolation
- File metadata stored in database, actual files on disk

## Auth and Multi-Tenancy Model

### Authentication
- BetterAuth handles user registration, login, and sessions
- JWT tokens issued for API authentication
- Token validation at API Gateway level
- Refresh token rotation for security

### Multi-Tenancy
- Every resource belongs to an organization (`organization_id`)
- Users can belong to multiple organizations
- Organization switching via frontend UI
- All database queries filtered by `organization_id`
- Strict tenant isolation enforced at service level

### Authorization (RBAC)
- Roles: Admin, Manager, Sales Rep, Viewer (customizable)
- Permissions checked at API Gateway and service level
- Ownership model: contacts/companies have an `owner_id`
- Only owner or authorized users can mutate owned resources
- Admin can override ownership restrictions

## Email System Model

### Architecture
- Admin configures organization-wide SMTP/IMAP credentials
- Users link their individual email addresses to the org mail server
- Email Service polls IMAP every 1-5 minutes for new messages
- Outbound emails sent via organization SMTP server
- All emails stored in PostgreSQL with full content

### Email Processing
- Incoming emails parsed and stored in database
- Automatic contact/company creation for unknown senders
- Email threading based on `In-Reply-To` and `References` headers
- Emails linked to contacts/companies automatically
- Email activity appears in activity feed timeline

### Storage
- Email metadata and body stored in PostgreSQL
- Attachments stored in filesystem, metadata in database
- Email threads tracked via `thread_id` foreign key

## AI System Model

### Custom OpenAI Proxy
- NestJS service wraps OpenAI API calls
- Centralized API key management
- Request/response logging for debugging
- Token usage tracking per organization
- Rate limiting per user/organization
- Cost monitoring and alerting

### RAG (Retrieval-Augmented Generation)
- All CRM data indexed as embeddings in pgvector
- User questions trigger semantic search for relevant context
- Top-K relevant documents retrieved
- Context + chat history sent to GPT-5.4
- Responses grounded in actual CRM data

### AI Chat Persistence
- One chat session per user per organization
- All messages stored in database (JSONB column)
- Chat resumable across sessions
- Context window managed by truncating old messages if needed

### AI Indexing
- Background job (Bull queue) indexes new/updated data
- Embeddings generated via OpenAI API
- Stored in pgvector with metadata for filtering
- Real-time updates on data changes

## Background Jobs Model

### Bull Queue
- Email synchronization (poll IMAP every 1-5 min)
- AI embedding generation for new data
- Report generation (PDF/Excel exports)
- Bulk operations (import/export)
- Notification dispatch

### Job Processing
- Each service can register job processors
- Jobs persisted in Redis
- Retry logic with exponential backoff
- Failed jobs logged for manual intervention

## Real-Time Updates Model

### Socket.IO
- WebSocket connections per user
- Rooms organized by `organization_id`
- Events: new notifications, new emails, activity feed updates
- Presence indicators (who's online)
- Real-time activity feed updates

### Event Broadcasting
- Services publish events to Notification Service
- Notification Service broadcasts to connected WebSocket clients
- Guaranteed delivery via fallback to database notifications

## Invariants

1. **Multi-tenancy isolation**: All queries MUST filter by `organization_id` — no cross-tenant data leakage
2. **Authentication required**: All API endpoints except auth routes require valid JWT
3. **Authorization enforced**: Permission checks at API Gateway and service boundaries
4. **Microservice independence**: Services communicate only via HTTP APIs, no direct database access across services
5. **Database migrations only**: Schema changes MUST go through Prisma migrations, never manual SQL
6. **Idempotent operations**: Background jobs must handle retries gracefully
7. **Audit trail**: All mutations to contacts, companies, and ownership MUST create audit log entries
8. **Email security**: Email credentials MUST be encrypted at rest in database
9. **File access control**: File access MUST verify organization membership before serving
10. **AI rate limiting**: AI requests MUST respect per-user and per-organization rate limits
11. **Server Components first**: Use Next.js Server Components by default, Client Components only when needed
12. **Type safety**: All API contracts MUST have TypeScript interfaces in `/shared/types`
