# Prisma Database Schema

This directory contains the Prisma schema and migrations for the SalesIntel CRM system.

## Overview

The Prisma schema defines the entire database structure shared across all microservices. It includes:

- **Multi-tenant architecture**: All tenant-scoped models include `organizationId` for strict isolation
- **Comprehensive CRM entities**: Users, Organizations, Contacts, Companies, Posts, Comments, Emails, and more
- **AI/RAG support**: Embeddings table with pgvector for semantic search
- **Audit trails**: Complete history tracking with ownership transfer events
- **Soft deletes**: Key entities support `deletedAt` for data retention

## Database Setup

### Prerequisites

- Docker Compose running PostgreSQL with pgvector extension
- Node.js and npm installed
- `.env` file with `DATABASE_URL`

### Initial Setup

```bash
# Install Prisma
npm install -D prisma
npm install @prisma/client

# Apply migrations to database
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## Schema Structure

### Core Models

- **User** — Global identity (managed with Better Auth)
- **Organization** — Tenant root for multi-tenancy
- **Membership** — User ↔ Organization join table with roles
- **Contact** — Customer/lead entities (org-scoped, with ownership)
- **Company** — Business entities (org-scoped, with ownership, supports hierarchy)
- **ContactCompany** — Many-to-many relationship between contacts and companies

### Activity & Communication

- **Post** — Timeline entries for contacts/companies
- **Comment** — Comments on posts
- **Mention** — User mentions in posts/comments
- **Attachment** — File metadata for posts/comments/emails
- **EmailAccount** — User email account configuration
- **EmailMessage** — Sent/received emails (org-scoped, with threading)
- **EmailTemplate** — Reusable email templates

### AI & Analytics

- **AiChat** — Persistent chat session per user
- **AiMessage** — Individual chat messages
- **Embedding** — pgvector embeddings for RAG (1536 dimensions for OpenAI)
- **HistoryEvent** — Immutable audit log (org-scoped)
- **Notification** — Per-user notifications

### Enums

All enums match `shared/types/enums.ts`:
- `Role`: ADMIN, MANAGER, SALES_REP, VIEWER
- `EntityType`: CONTACT, COMPANY
- `EmailDirection`: INBOUND, OUTBOUND
- `ActivityType`: POST, EMAIL, OWNERSHIP_CHANGE, CONTACT_CREATED, COMPANY_CREATED, CONTACT_UPDATED, COMPANY_UPDATED
- `NotificationType`: MENTION, OWNERSHIP_TRANSFER, COMMENT, EMAIL, SYSTEM

## Vector Search (pgvector)

The `embeddings` table uses pgvector for semantic search:

- **Extension**: `vector` (v0.8.2+)
- **Dimensions**: 1536 (OpenAI text-embedding-3-small / ada-002)
- **Index**: HNSW with cosine distance for efficient similarity search
- **Usage**: Store embeddings for contacts, companies, and other entities for AI-powered RAG

### Example Query (via Prisma raw SQL)

```typescript
const results = await prisma.$queryRaw`
  SELECT id, "entityType", "entityId", "chunkText",
         1 - (vector <=> ${embedding}::vector) as similarity
  FROM embeddings
  WHERE "organizationId" = ${orgId}
  ORDER BY vector <=> ${embedding}::vector
  LIMIT 10
`;
```

## Migrations

### Create a New Migration

```bash
# After changing schema.prisma
npx prisma migrate dev --name description_of_changes
```

### Apply Migrations (Production)

```bash
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

## Prisma Client Usage

### Import in Services

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example: Fetch contacts for an organization
const contacts = await prisma.contact.findMany({
  where: {
    organizationId: 'org_123',
    deletedAt: null, // exclude soft-deleted
  },
  include: {
    owner: true,
    companies: {
      include: {
        company: true,
      },
    },
  },
});
```

### Multi-Tenancy Pattern

**Always filter by `organizationId`** for tenant isolation:

```typescript
// ✅ Correct
const contacts = await prisma.contact.findMany({
  where: { organizationId: orgId },
});

// ❌ Wrong - security vulnerability!
const contacts = await prisma.contact.findMany();
```

## Configuration (Prisma 7)

Prisma 7 uses `prisma.config.js` for datasource configuration instead of `url` in the schema:

```javascript
// prisma.config.js
const config = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

module.exports = config;
```

## Security Notes

- **Email credentials**: MUST be encrypted by email-service before storage (marked in schema comments)
- **Password hashing**: Handled by Better Auth, not Prisma
- **Soft deletes**: Use `deletedAt` for contacts and companies to preserve history
- **Audit logs**: `HistoryEvent` records are immutable

## Indexes

All models include strategic indexes for:
- `organizationId` (multi-tenancy filtering)
- `ownerId` (ownership queries)
- Composite indexes for common query patterns (e.g., `organizationId + createdAt`)
- Foreign key relationships
- Vector similarity search (HNSW index on embeddings)

## Schema Validation

```bash
# Validate schema without database connection
npx prisma validate

# Check schema formatting
npx prisma format
```

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run: `npx prisma generate`

### Migration Fails

1. Check Docker Compose PostgreSQL is running: `docker-compose -f docker-compose.dev.yml ps`
2. Verify DATABASE_URL in `.env`
3. Check migration logs in `prisma/migrations/`

### Vector Index Errors

Ensure pgvector extension is installed: `docker exec salesintel-postgres psql -U salesintel -d salesintel_dev -c "\dx"`
