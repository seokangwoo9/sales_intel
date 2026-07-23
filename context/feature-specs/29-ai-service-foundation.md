Read `AGENTS.md`, `context/architecture-context.md`, and `context/code-standards.md` before starting.

Build the **AI service foundation**: OpenAI GPT-5.4 integration via custom proxy, conversation
management, and token tracking. This unit establishes the AI backbone for chat (spec 31) and
future AI features.

## Scope of this unit

- Scaffold the `ai-service` NestJS app.
- Integrate with the custom OpenAI proxy server (GPT-5.4).
- Implement conversation CRUD (`AiChat`, `AiMessage` models).
- Track token usage per conversation.
- Do not implement RAG/embeddings (spec 30) or frontend UI (spec 31) yet.

## Prerequisite

Specs 04–28 done. `AiChat` and `AiMessage` models exist in Prisma (spec 06). The custom OpenAI
proxy server is running (or use OpenAI API directly with a GPT-5.4 model key if available). The
gateway routes `/api/ai/*` here.

## Implementation

### Scaffold

- Scaffold NestJS in `services/ai-service/`, with a `Dockerfile`, wired into
  `docker-compose.dev.yml`. Reads env for port, `DATABASE_URL`, and OpenAI config: `OPENAI_API_KEY`,
  `OPENAI_BASE_URL` (your custom proxy), `OPENAI_MODEL` (gpt-5.4).
- Share the Prisma client and RBAC guards.

### OpenAI client wrapper

Create a client wrapper around the OpenAI SDK (`openai` npm package):

- Initialize with the custom base URL and API key from env.
- Expose a method: `chat(messages, options?)` → `{ response, usage: { promptTokens, completionTokens, totalTokens } }`.
- `messages` is an array of `{ role: 'system' | 'user' | 'assistant', content: string }`.
- Use streaming or non-streaming based on options; return the full response.

### Chat endpoints

All routes are user-scoped (one saved chat per user per `architecture-context.md`). Return
`ApiResponse` envelope.

- `GET /api/ai/chat` — fetch the user's saved chat (if exists). Include all messages. Return
  `{ chat: { id, userId, createdAt, updatedAt }, messages: [...] }`.
- `POST /api/ai/chat` — create a new chat for the user (or reset existing). Clear old messages
  if one exists.
- `POST /api/ai/chat/messages` — send a message. Body: `{ content, context? }`. Context is
  optional metadata (e.g. current entity the user is viewing; spec 31 will use this for RAG).
  1. Fetch the user's chat (create if missing).
  2. Save the user's message (`role: user`, `content`).
  3. Build the message history (system prompt + all saved messages).
  4. Call OpenAI via the wrapper.
  5. Save the assistant's response (`role: assistant`, `content`, `tokenUsage` JSON).
  6. Return the assistant's message.

### System prompt

- Define a system prompt for the CRM assistant (e.g. "You are a helpful assistant for SalesIntel,
  a CRM system. Answer questions about contacts, companies, and sales workflows.").
- Include in the first message when calling OpenAI.

### Token tracking

- Store token usage in each `AiMessage` record (a JSON field: `{ promptTokens, completionTokens, totalTokens }`).
- Provide an endpoint `GET /api/ai/usage` returning the user's total token usage (sum across all
  messages). Optional for MVP; useful for monitoring.

### Error handling

- If OpenAI call fails (rate limit, API error), return a clear error in `ApiResponse`.
- Log errors for debugging (include request ID if OpenAI provides one).

## Scope Limits

- No RAG/embeddings (spec 30).
- No frontend UI (spec 31).
- No multi-turn conversation limits (defer token/message count limits to post-MVP).
- No streaming responses yet (defer to spec 31 if desired).

## Check When Done

- `services/ai-service/` runs in Docker Compose.
- Users can start a chat (`POST /api/ai/chat`) and send messages (`POST /api/ai/chat/messages`).
- OpenAI GPT-5.4 is called via the custom proxy; responses are saved.
- Token usage is tracked per message. Only one chat per user (per spec). Build passes.
