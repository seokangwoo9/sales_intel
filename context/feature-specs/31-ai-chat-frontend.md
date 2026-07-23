Read `AGENTS.md`, `context/project-overview.md`, `context/ui-context.md`, and `context/code-standards.md` before starting.

Build the **AI chat frontend**: a conversational interface where users ask questions about their
CRM data and get AI-powered answers (RAG-enhanced). The assistant can query contacts, companies,
emails, and suggest actions.

## Scope of this unit

- AI chat UI with message history, input field, and send button.
- Display user and assistant messages in a conversation format.
- Show loading state while waiting for AI response.
- Optionally: streaming responses for a better UX.
- Do not build advanced AI features (summarization, draft generation) yet (defer to post-MVP).

## Prerequisite

Specs 03, 10, 29–30 done. AI-service with RAG is active. The user is authenticated and has an
active org.

## Implementation

### AI chat page

Create `app/(workspace)/ai/page.tsx`:

- Fetch the user's chat (`GET /api/ai/chat`) with React Query. If no chat exists, show an empty
  state ("Start a conversation with your AI assistant").
- Display messages in a conversation format: user messages on the right (or left), assistant
  messages on the left (or right, depending on design). Use shadcn `Card` or custom message bubbles.
- Each message shows: sender (user or assistant icon), content (rendered as markdown if the
  assistant returns formatted text), timestamp.

### Message input

At the bottom of the page:

- A `Textarea` (or `Input` for single-line) with placeholder "Ask me anything about your CRM...".
- A "Send" button (or Enter key to submit).
- On submit: `POST /api/ai/chat/messages` with `{ content: userInput }`. Use `useMutation`. On
  success, append the user message and assistant response to the local message list (React Query
  cache update).

### Loading state

- While waiting for the AI response, show a loading indicator (e.g. a typing animation or spinner
  in the assistant message area: "Assistant is typing...").
- Disable the input field during loading to prevent multiple requests.

### Streaming responses (optional)

If desired for better UX:

- Modify the backend (spec 29) to support streaming: OpenAI SDK's `stream: true` option. Return
  a Server-Sent Events (SSE) stream or WebSocket.
- Frontend: use `fetch` with `response.body.getReader()` or a library like `eventsource` to
  consume the stream. Append chunks to the assistant message in real-time.
- For MVP, non-streaming is acceptable (simpler to implement).

### Message rendering

- User messages: plain text.
- Assistant messages: render as markdown (use `react-markdown` or a simple markdown renderer).
  Support bold, lists, code blocks (e.g. if the assistant returns structured data or code).

### Context awareness (implicit)

- The backend (spec 30) already injects RAG context based on the user's message. The frontend
  just sends the message; the assistant will answer with CRM-aware responses automatically.
- Optionally: add a "Context" toggle or indicator showing which entities the AI retrieved (e.g.
  "Used 3 contacts and 2 emails to answer"). Fetch this from the backend (extend the response to
  include `retrievedContext` metadata).

### New chat / reset

- "New Chat" button: `POST /api/ai/chat` (resets the user's saved chat). Confirm via dialog if
  the current chat has messages.

### Styling & UX

- Use shadcn components: `Card`, `Textarea`, `Button`, `ScrollArea`, `Avatar`.
- Follow `ui-context.md`: clean, readable typography (Inter for message text, Fira Code for any
  code blocks).
- Auto-scroll to the latest message when a new one arrives.
- Loading states, empty states ("No messages yet. Ask me a question!").

## Scope Limits

- No voice input (defer to post-MVP).
- No suggested prompts/quick actions (defer to post-MVP).
- No multi-chat history (one chat per user per spec; no chat list).
- No admin/analytics dashboard for AI usage (defer to spec 32).

## Check When Done

- AI chat page displays the user's conversation with the assistant.
- Users can send messages; the assistant responds with RAG-enhanced answers.
- Messages are displayed in a conversation format with proper styling.
- Loading state shows while waiting for the response.
- "New Chat" resets the conversation. `npm run build` passes.
