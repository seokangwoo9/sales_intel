Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Implement **RAG (Retrieval-Augmented Generation)** for the AI chat: index CRM data (contacts,
companies, emails, posts) as embeddings in pgvector, and retrieve relevant context when the user
asks a question. This makes the AI aware of the user's CRM data.

## Scope of this unit

- Generate embeddings for CRM entities (contacts, companies, emails, posts) using OpenAI
  text-embedding-3-small or text-embedding-3-large.
- Store embeddings in the `Embedding` table (pgvector).
- Implement a background job to index new/updated entities.
- Retrieve relevant embeddings via vector similarity search when the user sends a chat message.
- Inject retrieved context into the AI prompt.
- Do not build frontend UI (spec 31).

## Prerequisite

Specs 04–29 done. `Embedding` model with a `vector` column exists in Prisma (spec 06). pgvector
extension is enabled. AI-service is active. OpenAI embedding API is accessible.

## Implementation

### Embedding generation

Extend the ai-service with an embedding utility:

- Use the OpenAI SDK to call the embeddings API: model `text-embedding-3-small` (1536 dimensions)
  or `text-embedding-3-large` (3072 dimensions; choose based on budget/performance).
- Input: a text string (e.g. contact name + email + custom fields, or email subject + body).
- Output: a vector array (e.g. `[0.1, -0.3, ...]`).

### Indexing job (Bull)

Create a Bull queue `ai-indexing` in the ai-service:

- Job types: `INDEX_CONTACT`, `INDEX_COMPANY`, `INDEX_EMAIL`, `INDEX_POST`.
- Job payload: `{ organizationId, entityType, entityId }`.
- Job handler:
  1. Fetch the entity (contact/company/email/post) from the database.
  2. Build a text representation (e.g. for a contact: `"Name: John Doe, Email: john@example.com, Company: Acme Inc, Notes: ..."`).
  3. Generate the embedding via OpenAI.
  4. Upsert into the `Embedding` table: `{ organizationId, entityType, entityId, chunkText, vector }`.
     If the entity is large (e.g. email body), chunk it (e.g. 500 words per chunk) and create
     multiple embeddings. For MVP, one embedding per entity is acceptable.
  5. Mark indexed (optional: add an `indexedAt` timestamp to the entity's table).

Trigger this job:
- When entities are created/updated (call from contact-service, company-service, email-service,
  activity-service). Queue the indexing job asynchronously (fire-and-forget).
- Optionally: a one-time bulk indexing endpoint `POST /api/ai/index-all` (admin-only) to index
  existing data.

### Vector similarity search

When the user sends a chat message (`POST /api/ai/chat/messages`, spec 29):

1. Embed the user's query (generate a vector for the user's message text).
2. Search the `Embedding` table for the top N (e.g. 5) most similar embeddings in the user's org
   via pgvector's `<=>` or `<->` operator (cosine similarity or L2 distance). Use Prisma raw SQL:
   ```sql
   SELECT entityType, entityId, chunkText, vector <=> $1 AS distance
   FROM "Embedding"
   WHERE organizationId = $2
   ORDER BY distance ASC
   LIMIT 5;
   ```
   `$1` is the query vector; `$2` is the user's org ID.
3. Fetch the full entities (contacts/companies/emails) referenced by the top results (call their
   services or query Prisma).
4. Build a context string (e.g. "Relevant contacts: John Doe (john@example.com), Jane Smith... Relevant emails: Subject 'Follow-up'...").
5. Inject this context into the system prompt or as a "context" message before the user's query
   when calling OpenAI.

### Context injection

Modify the OpenAI call in spec 29 to include RAG context:

- System prompt: "You are a helpful assistant for SalesIntel, a CRM system. Use the following context to answer the user's question: {context}. If the context is not relevant, answer generally."
- Call OpenAI with `[systemMessage, ...historicalMessages, userMessage]`.

### Embeddings table schema (reminder)

Ensure the `Embedding` model (spec 06) has:
- `vector` column (pgvector type, e.g. `vector(1536)` for text-embedding-3-small).
- Indexes: `organizationId` + a vector index (IVFFlat or HNSW for fast similarity search).

### Performance & scaling

- For MVP, sync embedding generation is acceptable (queue jobs, process sequentially). For scale,
  batch embeddings or use OpenAI batch API.
- Vector index tuning (IVFFlat `lists` param) is deferred to production optimization (spec 36).

## Scope Limits

- No frontend UI (spec 31).
- No hybrid search (keyword + vector) — pure vector search for MVP.
- No re-ranking (defer to post-MVP).
- No entity access control in RAG (all org data is searchable; RBAC filtering deferred to post-MVP).

## Check When Done

- Embeddings are generated and stored when entities are created/updated.
- Indexing jobs run in the background (Bull queue).
- Chat messages retrieve relevant context via vector similarity (pgvector query).
- RAG context is injected into the AI prompt; the assistant answers with CRM-aware responses.
- One-time bulk indexing endpoint works (optional). Build passes.
