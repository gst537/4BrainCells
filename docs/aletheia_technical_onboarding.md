# ALETHEIA — Technical & Pitch Onboarding Document

**Purpose:** ground the founding team in exactly what the code does, so nothing said to judges outruns what's actually built. Every claim below cites a real file and, where useful, a real function or line. Where the docs (`CLAUDE.md`, `docs/solution_pitch.md`, `docs/hackathon_research_and_solution.md`) say something the code doesn't do, that's called out explicitly rather than smoothed over.

Terms are defined in plain English the first time they appear — some teammates on this build are more technical than others, and everyone needs to be able to answer the same questions.

---

## 1. System Map

### The five layers

1. **Pages** (`src/app/**/page.tsx`) — what the browser renders. Built on **Next.js App Router**, meaning routes are defined by folder structure (`src/app/graph/page.tsx` → the `/graph` URL) rather than a separate routing config file.
2. **Shared state** (`src/context/MemoryContext.tsx`, `src/context/AuthContext.tsx`) — a **React Context** is a way for many components to read and write the same piece of state without passing it down through every parent component by hand. `MemoryContext` holds the currently-loaded graph, decisions, evidence, and chat history. `AuthContext` holds the logged-in user's role.
3. **API routes** (`src/app/api/**/route.ts`) — server-side endpoints, also defined by folder structure. `src/app/api/search/route.ts` is the handler for `GET /api/search`.
4. **Data access layer** (`src/lib/db.ts`) — the only file allowed to talk to the database or the in-memory fallback. No component and no API route touches storage directly; they all call functions exported from here.
5. **The AI layer** (`src/app/api/chat/route.ts`) — retrieval, the confidence gate, and the OpenAI call.

### One request, traced end to end

**Scenario: a user types a question into Why Chat.**

1. The user is on `InquiryChatView` (`src/components/chat/InquiryChatView.tsx`), which is mounted by `src/app/page.tsx` when `activeTab === 'why-chat'`, and also by `src/app/chat/page.tsx` and `src/app/why-chat/page.tsx` directly.
2. Typing and submitting the form calls `handleSend` (`InquiryChatView.tsx:44`), which calls `sendChatMessage(q)` — a function pulled from `useMemory()`, i.e. from `MemoryContext`.
3. `sendChatMessage` (`MemoryContext.tsx:443`) immediately pushes the user's message into local chat state, then does `fetch('/api/chat?stream=true', { method: 'POST', ... })` with the full message history as the body (`MemoryContext.tsx:471`).
4. That request hits `src/app/api/chat/route.ts`'s `POST` handler (line 228). It:
   - Checks the `Authorization` header and, if missing or invalid, treats the caller as a rate-limited guest (`checkGuestRateLimit`, line 14).
   - Calls `retrieveContext(lastUserMessage)` (line 94), which calls `searchNodes()` and `getRelatedSubgraph()` — both **exported from `src/lib/db.ts`**, not defined locally in the route file.
   - If zero nodes matched, returns a hard-coded refusal immediately — **the confidence gate**. This is the single most important branch in the file and gets its own section (§3) below.
   - If nodes matched, either calls OpenAI's `gpt-4o-mini` model with the retrieved context as a bounded system prompt, or — if `OPENAI_API_KEY` isn't set, or the OpenAI call itself throws — falls back to `buildRetrievalOnlyAnswer()` (line 165), which composes an answer directly from the retrieved records with no generation at all.
5. `searchNodes()` and `getRelatedSubgraph()` (`src/lib/db.ts:202` and `:283`) check whether a Postgres connection pool exists and is reachable. If yes, they run real SQL against Postgres. If no, they run equivalent logic against an in-memory array (`mem.nodes`, `mem.edges`) that was seeded from `src/data/seedData.ts` when the server process started.
6. The response streams back over **SSE** (Server-Sent Events — a one-way, text-based streaming protocol built on plain HTTP, simpler than a WebSocket because the server only ever pushes, never receives, over that connection). `sendChatMessage` reads the stream chunk by chunk (`MemoryContext.tsx:484`), appending each `content` chunk to the assistant's message as it arrives, and applying a final `meta` event that carries the confidence score, citations, and which graph nodes to focus.
7. `InquiryChatView` re-renders as `chatMessages` updates, showing the streaming text live, the confidence badge, and citation chips per `msg.citations` (`InquiryChatView.tsx:180`).

That's the real, verified path. Two things about it are worth flagging honestly up front (both covered in full in §5 and §8):

- **The chat conversation is never saved.** A full chat-history persistence system exists — `chat_sessions`/`chat_messages` tables in `setup.sql`, and `createChatSession`/`addChatMessage`/`getChatMessages` in `db.ts`, with working API routes at `/api/chat/sessions` and `/api/chat/sessions/[id]/messages` — but nothing in the code path above calls them. The component that *does* call them (`src/components/WhyChat.tsx`) is not mounted by any route in the app anymore.
- **The right-hand "Evidence Viewer" panel** in `InquiryChatView` renders two hard-coded demo evidence cards (a "Q2 Scalability Assessment" and a "ProcureIT" thread) regardless of what was actually retrieved for the live query. Only a third card is conditional on real state (`evidence['DOC-RISK-V2']`, line 360). The live citation chips inline in the chat bubble *are* real and clickable; the side panel mostly is not.

### Second trace: the Knowledge Graph search-to-render path

1. User types a query into the search bar and it calls `performSearch(query)` on `MemoryContext` (line 239).
2. That calls `runSearch`, which does `fetch('/api/search?q=...')`.
3. `src/app/api/search/route.ts`'s `getHandler` (line 20) calls, in order: `searchNodes()` → `getRelatedSubgraph()` → `getDecisionsByIds()` → `getTimelineEvents()` → `getEvidence()`, all from `db.ts`, and assembles one JSON payload of nodes, edges, decisions, timeline, and evidence.
4. `MemoryContext` stores that payload in `graphNodes`, `graphEdges`, `decisions`, `timelineEvents`, `evidence` state.
5. `KnowledgeGraphView` (`src/components/graph/KnowledgeGraphView.tsx`) reads `graphNodes`/`graphEdges` straight from `useMemory()` and renders them — absolutely-positioned `<div>` elements for nodes (line 248), an `<svg>` with `<line>` elements for edges (line 201). If `graphNodes.length === 0`, it renders `SearchEmptyState` instead (line 171) — the graph is empty until a search resolves something, by design.

---

## 2. Every Technical Term, Defined — and Where This Repo Uses It

| Term | Plain-English definition | Where/how used here |
|---|---|---|
| **Next.js App Router** | A web framework where the folder structure under `src/app/` *is* the routing — a folder with a `page.tsx` becomes a URL, a folder with a `route.ts` becomes an API endpoint. | `src/app/graph/page.tsx` → `/graph`; `src/app/api/search/route.ts` → `GET /api/search`. Confirmed via `next: "16.3.4"` in `package.json`. |
| **Turbopack** | A faster alternative to Webpack for bundling JavaScript during development, built into Next.js. | `package.json`'s `dev` script is plain `"next dev"` with no explicit bundler flag. Next.js 16 defaults to Turbopack in this configuration, but the repo doesn't explicitly pin it — worth saying "the framework's current default," not "we chose Turbopack," if asked. |
| **React Server/Client Components** | In the App Router, components are server-rendered by default; a file must start with `'use client'` to run in the browser and use state/effects. | Every file that touches `useState`/`useEffect`/`useMemory` in this repo (e.g. `KnowledgeGraphView.tsx`, `MemoryContext.tsx`) starts with `'use client';` — confirmed at line 1 of each. API routes (`route.ts` files) are server-only by construction; they never carry that directive. |
| **TypeScript strict mode** | A compiler setting that catches more categories of type errors (e.g. forbids implicit `any`, requires null-checks) than default TypeScript. | `tsconfig.json` line 7: `"strict": true`. |
| **Tailwind CSS v4** | A utility-class CSS framework where styling is done via class names (`px-4`, `text-cyan-400`) instead of separate stylesheet files. | `package.json` lists `tailwindcss: "^4"` and `@tailwindcss/postcss` (v4's new PostCSS-plugin architecture, replacing v3's config-file approach); `src/app/globals.css` line 1 is `@import "tailwindcss";`. |
| **JWT (JSON Web Token)** | A signed, tamper-evident string that encodes claims (like a username and role) so a server can verify "who is this" without a database lookup on every request. | `src/lib/auth.ts`: `generateToken()` signs `{ username, role }` with `jsonwebtoken`; `verifyToken()` checks the signature. |
| **RBAC (Role-Based Access Control)** | Restricting actions based on a user's assigned role rather than per-user permissions. | Three roles — `viewer < contributor < admin` — defined in `auth.ts:36`. `requireRole('contributor', handler)` wraps route handlers like `POST /api/graph/edges` (`edges/route.ts:70`) so only contributor+ can mutate the graph. |
| **JSONB** | A PostgreSQL column type that stores JSON data in a binary format that can still be indexed and queried, unlike a plain text column. | `setup.sql` line 10: `nodes.data JSONB` — each node's type-specific fields (label, description, rationale, position, etc.) live in one flexible column rather than dozens of typed columns. |
| **RAG (Retrieval-Augmented Generation)** | Feeding a language model retrieved documents/records as context, and instructing it to answer only from that context, instead of relying purely on what it learned during training. | The whole design of `src/app/api/chat/route.ts`: `retrieveContext()` builds a context string, which is injected into the system prompt (line 293) before the model ever runs. |
| **SSE (Server-Sent Events)** | A streaming protocol where the server pushes a sequence of `data: ...` text chunks over one HTTP response, and the browser reads them incrementally — one-directional, simpler than a WebSocket. | `chat/route.ts`'s `streamAnswer()` (line 55) and the `isStream` branch (line 308) both set `Content-Type: text/event-stream` and write `data: {...}\n\n` frames; `MemoryContext.tsx:478` reads them with `res.body.getReader()`. |
| **Embeddings / cosine similarity / vector search** | Converting text into numeric vectors so "meaning-similar" passages can be found by measuring the angle between vectors, even if they share no exact words. | **Not used anywhere in this codebase.** `docs/hackathon_research_and_solution.md` proposes this as a *possible* pattern (Pinecone, ChromaDB, "cosine similarity < 0.70") — that file is pre-build research, not as-built documentation. The actual retrieval in `db.ts` is lexical: Postgres full-text search via `to_tsvector`/`websearch_to_tsquery` (`db.ts:209-231`), or a keyword-overlap scorer in the in-memory fallback (`db.ts:250-274`). |
| **Dual-mode data layer** | A data-access design where every read/write function tries the primary backend first and falls back to a secondary one on failure, without the caller knowing which one served the request. | Every exported function in `db.ts` follows the same `try { if (pool) {...} } catch { ...fallback... }` shape — e.g. `getGraph()` at line 167, `addEdge()` at line 505. |
| **Confidence gate** | A check that runs *before* generation and refuses to proceed if there isn't enough retrieved evidence, rather than trusting the model to decline on its own. | `chat/route.ts:271` — `if (!ctx) { ...return NO_EVIDENCE_TEXT... }` — this runs before `process.env.OPENAI_API_KEY` is even checked. Full trace in §3. |
| **GIN index / tsvector** | PostgreSQL-specific full-text search machinery: `tsvector` converts text into a searchable, stemmed token list; a `GIN` index makes searching that token list fast. | `setup.sql:98-123` creates three GIN indexes (`nodes_fts_idx`, `decisions_fts_idx`, `evidence_fts_idx`) over generated `tsvector` expressions. |
| **Single-hop neighbor expansion** | Given a set of matched records, pulling in only the records directly connected to them by one edge — not records two or more relationships away. | `db.ts:283` `getRelatedSubgraph()` — its SQL joins `edges` exactly once (`WHERE n.id = ANY($1) OR n.id IN (SELECT target FROM edges WHERE source = ANY($1)) OR ...`). There is no recursive CTE (a SQL query that repeatedly re-joins itself to walk arbitrary depth) anywhere in this file. |
| **SWR** | A React data-fetching library that handles caching, revalidation, and loading states for you. "SWR" stands for "stale-while-revalidate," a caching strategy. | Used in exactly three files: `src/app/vault/page.tsx`, `src/components/AddNodeModal.tsx`, `src/components/Navbar.tsx`. The main graph/chat/ledger flow does **not** use SWR — it uses plain `fetch` inside `MemoryContext`, because that state needs custom logic (subgraph merging, streaming) SWR doesn't provide out of the box. |

---

## 3. The Confidence / Anti-Hallucination Mechanism — Full Trace

This is `src/app/api/chat/route.ts`, walked in the order the code actually executes.

### Layer 1 — Guest rate limiting (line 250)
Before anything else, if the caller has no valid JWT, their IP is checked against an in-memory counter (`guestHits`, line 12): 20 requests per hour. **What this catches:** unauthenticated demo abuse driving up OpenAI spend. It is not part of the hallucination story — it's cost control — but it's the first gate the request passes through.

### Layer 2 — Retrieval, bounded by construction (line 264, calling `retrieveContext` at line 94)
`retrieveContext()` calls `searchNodes(queryText, 18)` — capped at 18 matches — then `getRelatedSubgraph()` to pull in direct neighbors of those 18. **This is the bound**: the LLM will only ever see nodes that either matched the query lexically or sit one edge away from a match. There's no path in this function for an arbitrary, unrelated node to end up in context.

### Layer 3 — THE GATE ITSELF (line 271)
```
if (!ctx) {
  const meta = { ... confidenceScore: 8, confidenceLevel: 'not_found', degraded: false,
                  fallbackReason: `Confidence gate: no institutional records connected to "${lastUserMessage}".` };
  const text = NO_EVIDENCE_TEXT(lastUserMessage);
  return isStream ? streamAnswer(text, meta) : NextResponse.json(...);
}
```
`ctx` is `null` when `searchNodes()` returned zero matches (`retrieveContext` line 96: `if (matched.length === 0) return null;`). **This check happens before the code even looks at whether `OPENAI_API_KEY` is set** (that check is at line 284, further down). That ordering is the entire claim: a query with no matching graph records **never reaches OpenAI**. There's no `openai.chat.completions.create()` call anywhere upstream of this branch. This is a structural guarantee enforced by control flow, not a prompt instruction a model could choose to ignore.

**What failure mode this catches:** a model confidently inventing a plausible-sounding decision history for something that was never recorded — the classic RAG hallucination, where thin or absent retrieval still produces fluent, confident prose.

### Layer 4 — System prompt constraints (line 293, only reached if `ctx` exists and an API key is set)
```
`You are ALETHEIA's "Why Chat". You answer questions ... using ONLY the retrieved institutional records below.
${ctx.contextText}
RULES:
1. Never invent facts, names, dates, or numbers that are not in the records above.
2. Cite supporting documents inline using their [Ref n] labels.
3. Name the specific record ids (e.g. DEC-...) that ground each claim.
4. If the records do not actually answer the question, say so plainly...
5. Be concise and precise. No marketing language.`
```
**What this catches:** answers that technically stay within retrieved facts but pad them with generic filler, or fail to say when the retrieved records are actually insufficient for the specific question asked (as opposed to zero records, which Layer 3 already caught).

**Honest limitation:** this layer *is* a prompt instruction, and a model can in principle ignore or misapply it. It's a second line of defense, not a structural one like Layer 3.

### Layer 5 — Temperature setting (line 312, 366)
`temperature: 0.1` on both the streaming and non-streaming `openai.chat.completions.create()` calls. **Plain English:** temperature controls how "creative" vs. deterministic the model's word choices are; near 0 makes it pick the most likely next token almost every time, minimizing invented specifics. **What this catches:** stylistic embellishment and creative paraphrasing that could drift from the source records, not fabrication of entire facts (that's Layers 3–4's job).

### Layer 6 — Post-hoc hedging-language check (line 332)
```
const lowConfidence = /not enough evidence|do not have enough|cannot find|no evidence|insufficient|does not answer|not recorded/i.test(fullText);
```
After the full streamed response is collected, a regex scans the model's own words for phrases indicating it thinks it couldn't actually answer. If matched, the confidence score reported to the UI drops to 22 (`confidenceLevel: 'not_found'`) even though `ctx` had matches and the model *did* generate text. **What this catches:** the case where retrieval found something but the model itself, following Rule 4 above, honestly says "the records don't answer this" — the UI should reflect that low confidence rather than show a generic "strong" badge just because generation succeeded technically.

**Honest limitation:** this is a keyword regex against natural-language output, not a semantic check. A model phrasing its uncertainty in a way that doesn't match one of those seven patterns would slip through as "confident." This is a known, coarse heuristic — worth saying so if asked, rather than describing it as a robust confidence measure.

### Layer 7 — Retrieval-only fallback (line 165, `buildRetrievalOnlyAnswer`)
Triggered in three places: no `OPENAI_API_KEY` configured (line 284), the OpenAI streaming call itself throws (line 314), or the stream is interrupted mid-flight (line 344). This function **never calls a language model**. It takes the best-ranked directly-matched node (`ctx.matched`, prioritized over mere neighbors — line 167), and assembles a templated summary: the record's label, status, description, rationale, owner, connected decisions, and linked people, all pulled verbatim from retrieved fields via string concatenation. **What this catches:** the "LLM provider is down" failure mode. It guarantees the no-hallucination property holds even with zero access to any language model, because there is no generation step to hallucinate in.

### Summary of what each layer actually catches

| Layer | Guards against |
|---|---|
| Rate limit | Cost abuse from unauthenticated traffic |
| Bounded retrieval | Irrelevant nodes entering context at all |
| **The gate (line 271)** | **Answering when there is zero supporting evidence — structural, pre-generation** |
| System prompt rules | Fluent-but-padded or overconfident answers when evidence is thin |
| Temperature 0.1 | Creative/stylistic drift from source wording |
| Hedging regex | UI overstating confidence when the model itself signaled doubt |
| Retrieval-only fallback | Total LLM unavailability — the no-hallucination guarantee survives even then |

---

## 4. Data Model (`setup.sql`)

| Table | Purpose | Key relationships | Why JSONB where it's used |
|---|---|---|---|
| `nodes` | Every graph entity — person, document, decision, or event — as one row. | `id TEXT PRIMARY KEY`; referenced by `edges.source`/`edges.target`. | `data JSONB` holds every type-specific field (label, description, rationale, x/y canvas position, tags, status, evidenceCount...). Different node types genuinely need different fields, and the field set changed repeatedly during development — JSONB avoids a migration every time a new attribute is added, at the cost of losing column-level type constraints. |
| `edges` | A directed, labeled relationship between two nodes (e.g. `SUPPORTS`, `CONTRADICTS`, `REVERSES`). | `source`/`target` both `REFERENCES nodes(id) ON DELETE CASCADE` — deleting a node deletes its edges automatically. | No JSONB here; edges have a small, stable, well-typed field set (`label`, `confidence NUMERIC`, `description`). |
| `decisions` | A richer, ledger-specific projection of a decision — everything the Decision Ledger UI needs that doesn't belong on the graph node itself. | `id` matches the corresponding `nodes.id` by convention (not a formal foreign key in this schema). | `confidence_breakdown JSONB` and `warnings JSONB` — the five-factor confidence breakdown and the list of traceability warnings are both structured-but-variable-shaped data, not worth a table each at this scale. `alternatives_considered TEXT[]` and `tags TEXT[]` use Postgres array columns, not JSONB, since those are just flat string lists. |
| `timeline_events` | A chronological record used to reconstruct "what was known when" for a given decision or node. | `related_node_id`, `related_decision_id`, `related_evidence_id` — all plain `TEXT`, not enforced foreign keys. | No JSONB — every field is a flat string/enum. |
| `evidence_documents` | The Evidence Vault: source documents (RFCs, ADRs, postmortems, emails...) with provenance. | `related_decision_id` links a document to the decision it supports. | No JSONB — `hash`, `verified`, `content` etc. are all simple typed columns. |
| `chat_sessions` / `chat_messages` | Persisted Why Chat conversations. | `chat_messages.session_id REFERENCES chat_sessions(id) ON DELETE CASCADE`. | `citations JSONB` on `chat_messages` — a citation array has a fixed shape per message but a variable count, so it's stored as a JSON blob rather than a join table. |

**Indexing:** three GIN indexes over generated `tsvector` expressions (`nodes_fts_idx`, `decisions_fts_idx`, `evidence_fts_idx`, lines 98–123) are what `searchNodes()` in `db.ts` actually queries against, plus plain B-tree indexes on `edges.source`, `edges.target`, and `nodes.type` for the neighbor-expansion joins.

**Bootstrap:** the schema is not applied via a separate migration tool — `db.ts`'s `ensureSchema()` (line 55) reads `setup.sql` off disk and runs it verbatim (`CREATE TABLE IF NOT EXISTS...`, safe to re-run) the first time any query executes against a real Postgres connection.

---

## 5. Data Integration — What's Actually Live

**On the seed data itself:** it's a synthetic, self-authored corpus (`src/data/seedData.ts`) modeling Aletheia's own decision history — that is intentional dogfooding, not a weakness, and shouldn't be pitched apologetically. The question worth answering carefully is the *integration*, not the data's origin.

### Which mode is actually active right now

Checked directly, not assumed:
- `.env.local` contains `OPENAI_API_KEY` and `JWT_SECRET` — **no `DATABASE_URL`**.
- `db.ts` line 17: `if (process.env.DATABASE_URL) { pool = new Pool(...) }` — with no `DATABASE_URL`, `pool` stays `null` for the life of the process.
- `pgLive()` (line 84) short-circuits `if (!pool) return false;` before attempting any connection.
- A direct check of local port 5432 also came back closed/unreachable.

**Conclusion, from the code path, not a guess: this app currently runs entirely on the in-memory fallback store.** `getDbStatus()` (line 94) would report `'in-memory'`, which is exactly what `/api/health` (`src/app/api/health/route.ts`) surfaces to the frontend. `docker-compose.yml` exists in the repo for standing up a real Postgres instance, but it isn't running.

### Tier classification per route

Using the taxonomy from the prompt — (a) fully wired against a real store, (b) wired but only exercised against in-memory, (c) UI-only with no backing route — **plus a fourth, real category this codebase actually has: backend fully wired, but the mounted UI never calls it.**

| Route / feature | Tier | Evidence |
|---|---|---|
| `/api/search` | **(b)** — real code path, currently exercised against the in-memory store only, because that's what's running. Would be tier (a) the moment `DATABASE_URL` points at a live Postgres instance; nothing in the route or in `db.ts` would need to change. | `search/route.ts` calls `searchNodes`, `getRelatedSubgraph`, `getDecisionsByIds`, `getTimelineEvents`, `getEvidence` — all real `db.ts` exports, not stubs. |
| `/api/chat` | **(b)**, same reasoning — retrieval hits the same `db.ts` functions. | `chat/route.ts:94-98`. |
| `/api/graph`, `/api/graph/nodes`, `/api/graph/edges`, `/api/graph/nodes/[id]` | **(b)** for reads and writes. Edge creation is genuinely wired end-to-end: `KnowledgeGraphView`'s "Link Nodes" flow → `createEdge()` in `MemoryContext` → `POST /api/graph/edges` → `addEdge()` in `db.ts`. | `edges/route.ts:22-53`; `MemoryContext.tsx:386-406`; `KnowledgeGraphView.tsx:81-94`. |
| `/api/admin/nodes`, `/api/admin/decisions`, `/api/admin/evidence` | **(b)** — `src/app/admin/page.tsx` exists and calls all three, each backed by real `db.ts` reads/writes, admin-role-gated. | Confirmed all three route files and the admin page exist and import from `db.ts`. |
| Chat history persistence (`/api/chat/sessions`, `/api/chat/sessions/[id]/messages`) | **The fourth category — backend fully wired, frontend never calls it.** The routes and `db.ts` functions (`createChatSession`, `addChatMessage`, `getChatMessages`) work correctly in isolation and would persist real conversations if invoked. But the component that calls them, `src/components/WhyChat.tsx`, is not imported by any currently-routed page — `src/app/why-chat/page.tsx`, `src/app/chat/page.tsx`, and `src/app/page.tsx` all render `InquiryChatView` instead, and `InquiryChatView`'s send path (`MemoryContext.sendChatMessage`) never calls the session endpoints. **User-visible result: conversations are not saved today**, for a more specific reason than "not built" — it's built and disconnected. |
| Evidence Vault uploads | **(b)** — `EvidenceUploadModal.tsx` is imported and rendered by `src/app/vault/page.tsx`, and `/api/evidence` + `/api/evidence/suggest` both exist as real routes. This directly contradicts `CLAUDE.md`'s claim that the vault is "currently read-only" (see below). | `vault/page.tsx:6,43`; route files present under `src/app/api/evidence/`. |
| Graph canvas rendering (nodes/edges as divs+SVG) | **(a)** in the sense that it's real, working, hand-built rendering code with no missing wiring — there's no separate "backend" for this to be wired to. | `KnowledgeGraphView.tsx:180-232`. |
| Right-panel "Evidence Viewer" inside Why Chat | **(c)** — genuinely UI-only demo content for two of its three cards, regardless of the live query. | `InquiryChatView.tsx:246-357` — two cards are hard-coded JSX with static copy; only the `evidence['DOC-RISK-V2']` block (line 360) reads from real state. |
| `msg.id === 'MSG-2'` / `'MSG-4'` branches in `InquiryChatView` | **Dead code** — unreachable given how message ids are actually generated (`MSG-USER-${Date.now()}`, `MSG-AI-${Date.now()}` in `MemoryContext.tsx:447,454`). Not a lie to judges, just cruft worth a cleanup pass before a live demo, since it makes the file read as more hardcoded than the active path actually is. | `InquiryChatView.tsx:133,151`. |

### Cross-check against `CLAUDE.md`'s claimed "current state"

`CLAUDE.md` is a stale handoff document from an earlier point in this project. Specific disagreements with the current code:

1. **"We have an `AddNodeModal`... but we still need the ability to... create Edges"** — **outdated.** Edge creation is fully built: the "Link Nodes" UI in `KnowledgeGraphView`, the relationship-type picker modal, `POST /api/graph/edges` with label validation, contributor-role gating.
2. **"Chat history... does not persist"** — **directionally still true today, but for a different reason than the doc implies.** The doc frames this as "not yet designed." In reality it *was* designed and built (schema, `db.ts` functions, two working API routes) — it's just not called from the currently-mounted chat UI. Worth fixing either by wiring `InquiryChatView`/`MemoryContext` to those endpoints, or deleting the orphaned `WhyChat.tsx` + its routes if the team decides not to pursue persistence right now.
3. **"The Evidence Vault page is currently read-only"** — **outdated.** An upload modal with LLM-assisted entity suggestion (`/api/evidence/suggest`) exists and is wired into the vault page.
4. **The "Great Queries to Test the Why Chat" section** (Neo4j+Qdrant, ADR-089, "Marcus Vance," "Black Friday 2021," "Dr. Elena Rostova," RFC-042) — **these entities do not exist in the current seed data.** `src/data/seedData.ts` models Aletheia's own decisions (Tarun, Sanjay, Rithvik, Mukesh; decisions like `postgres-over-mongo`, `sso-saml-enterprise`, etc.). Running any of `CLAUDE.md`'s suggested test queries today would return the confidence-gate refusal, not the "expected output" the doc describes — **do not use these as demo queries; they will trip the gate the doc claims should return rich answers.**
5. **Env setup instructions** (`DATABASE_URL` optional, `JWT_SECRET`, login password `admin`) — these are accurate and match `auth.ts`/`db.ts` behavior.

### Cross-check against `docs/solution_pitch.md` and `docs/hackathon_research_and_solution.md`

- `solution_pitch.md` lists **"Graph Visualization: React Flow (`@xyflow/react`)"** as the tool used. **This is not what the code does.** `@xyflow/react` is a listed dependency in `package.json` but has zero imports anywhere under `src/` (verified by grep). The actual canvas is hand-built: absolutely-positioned `<div>` nodes and raw `<svg><line>` edges in `KnowledgeGraphView.tsx`. This should be corrected in the pitch, not repeated — see §6 and §8.
- `solution_pitch.md` describes the data layer as **"An In-Memory JSON Graph structure (which scales cleanly to Neo4j or PostgreSQL JSONB in production)"** — this **undersells what's already built.** The dual-mode Postgres/in-memory layer described in §1 and §5 above exists *now*, not as a future scaling plan.
- `hackathon_research_and_solution.md` is explicitly a pre-build research document (LangChain/LlamaIndex, Pinecone/ChromaDB, cosine-similarity thresholding, an LLM-based "Judge" for confidence). **None of these were used.** The actual build uses Postgres full-text search with no vector database and no LLM-as-judge step — the gate is a hard zero-match check, not a similarity threshold. If a judge has read this file, be ready to say plainly that it was the team's research pass before deciding on the simpler, more defensible approach that shipped.

---

## 6. Tool Choice Rationale

| Dependency | What it does | Why this over the obvious alternative |
|---|---|---|
| `next` (16.3.4) | Full-stack React framework: pages, API routes, and server rendering in one project. | Avoids standing up a separate backend (Express/Fastify) and frontend as two deployables for a hackathon timeline — one framework, one deploy target. |
| `pg` | Node.js PostgreSQL client. | Used directly with hand-written SQL rather than an ORM (Prisma, Drizzle) — the query patterns (full-text search, single-hop neighbor joins) are specific enough that hand-written SQL was more direct than fighting an ORM's query builder for them. |
| `@xyflow/react` (React Flow) | A ready-made library for interactive node/edge graph canvases. | **Listed but not actually used** — see §5. The honest answer, if asked, is that this was pulled in during an earlier iteration and the team built a custom canvas instead for tighter control over interaction feel (pan/zoom, node styling by confidence/type) than a general-purpose library's defaults gave out of the box; the dependency should be removed rather than defended. |
| `jsonwebtoken` | Signs and verifies JWTs. | Standard, minimal library for exactly this one job — no need for a heavier auth framework (NextAuth, Auth0 SDK) when the requirement is "sign a role claim, verify it server-side." |
| `openai` | Official OpenAI Node SDK. | Direct API access rather than an abstraction layer like LangChain — the actual usage (one system prompt, one completion call, optionally streamed) doesn't need LangChain's chain/agent abstractions, and avoiding it keeps the retrieval logic in `db.ts` fully inspectable as plain SQL rather than hidden behind a framework's retriever interface. |
| `swr` | Client-side data fetching with caching/revalidation. | Used only where a component just needs "fetch this and refetch on demand" (evidence list in the vault, `AddNodeModal`, `Navbar`) — lighter than pulling in a heavier state library (Redux, Zustand) for what's a handful of read-mostly fetches; the main graph/chat state lives in `MemoryContext` instead because it needs custom merge/streaming logic SWR's cache model doesn't fit. |
| `framer-motion` | Animation library for React. | Used for UI polish (transitions, modals) — a deliberate "premium feel" investment for a hackathon demo where first impressions matter. |
| `clsx`, `tailwind-merge` | Small utilities for conditionally combining CSS class strings without collisions. | Standard companions to Tailwind for components with many conditional style branches (e.g. status-colored badges in the Decision Ledger). |
| **Dual-mode data layer instead of a hard Postgres dependency** | (This is a design decision, not a package.) | A hackathon demo that hard-crashes if the judges' wifi or a cloud Postgres instance hiccups mid-pitch is a real risk. Every `db.ts` function degrades to identical in-memory logic on failure rather than throwing, and `/api/health` reports which mode is live — so the demo survives a database outage visibly rather than silently or fatally. |

---

## 7. Pitch-Ready Talking Points

Each of these is one sentence, traceable to a specific mechanism, safe to say out loud without a technical follow-up exposing a gap.

1. "The confidence gate runs before the language model is ever called — if zero graph records match your question, we return a refusal at 8% confidence and OpenAI's API is never invoked. That's enforced by control flow in the route handler, not a prompt the model could ignore."
2. "Retrieval is two real SQL steps: Postgres full-text search against GIN-indexed columns, then one SQL join that pulls in directly-connected neighbor nodes — no vector database, no embeddings, no recursive traversal."
3. "Every write — creating an edge, editing a node, uploading evidence — goes through the same data-access layer, which tries Postgres first and falls back to an identical in-memory dataset on failure, so a database outage during a demo degrades visibly instead of crashing."
4. "Role permissions are enforced server-side in API middleware, not just hidden in the UI — a viewer-role token gets an HTTP 403 from the edge-creation endpoint even if they somehow reached the button."
5. "The knowledge graph canvas is hand-built — divs for nodes, raw SVG lines for edges — not a pulled-in graph library, because we wanted direct control over how confidence and relationship type get expressed visually."
6. "If the OpenAI API is completely unavailable, the system still answers — by composing a summary directly from the retrieved records with zero text generation, so the no-hallucination guarantee holds even with the model fully absent."
7. "Citations are ranked so evidence tied to a directly-matched record always outranks evidence merely tied to a neighbor — the graph structure, not just word overlap, decides what's most relevant."
8. "The schema uses JSONB for node attributes specifically because node types have genuinely different fields and that field set was still changing during the build — it's a real tradeoff for iteration speed, not a shortcut we didn't understand."
9. "We're honest about depth today: retrieval expands exactly one hop from a match. Multi-hop 'why chains' are the next thing we're building, not something we're claiming already works."
10. "Every mutation re-runs the active search after writing, so what you see on screen always reflects what's actually in the store — there's no separate 'preview' state that can drift from the database."

---

## 8. Hardest Likely Judge Questions

**1. "Your solution pitch doc says you use React Flow for the graph. Are you?"**
No — and that's worth saying plainly rather than hedging. `@xyflow/react` is a leftover dependency from an earlier iteration; it's listed in `package.json` but has zero imports anywhere in the codebase. The graph canvas is hand-built with absolutely-positioned divs and raw SVG lines (`KnowledgeGraphView.tsx`). The pitch doc is out of date on this point and should be corrected before it's shown to anyone else — the actual approach is a stronger claim ("we built our own renderer for tighter control"), not a weaker one, so this isn't a claim to soften, just one to fix in the doc.

**2. "Is retrieval really graph traversal, or one SQL join?"**
One hop, honestly. `getRelatedSubgraph()` in `db.ts` runs a single join to pull in nodes directly connected by an edge to a matched node — no recursive CTE, no N-hop walk. Multi-hop traversal for deeper "why chains" is on the roadmap, not built. Don't let "graph-grounded" get rounded up into "graph traversal" in conversation — the honest phrase is "bounded, single-hop neighbor expansion."

**3. "Does chat history actually persist? Your schema has the tables."**
Not currently, end-to-end. The persistence backend is fully built and functional in isolation — `chat_sessions`/`chat_messages` tables, working `db.ts` functions, working API routes — but the component that calls those endpoints (`WhyChat.tsx`) isn't mounted anywhere in the current routing; the live chat UI (`InquiryChatView`) never calls them. This is a wiring gap, not a missing design, and it's a small fix: either point `InquiryChatView`'s send path at the existing session endpoints, or remove the orphaned component if persistence isn't a priority right now.

**4. "Is the database connection actually live, or is this running on mock data?"**
Right now, in-memory fallback — verifiably, not by assumption. There's no `DATABASE_URL` in `.env.local`, so `db.ts`'s connection pool is never created, and every data function falls through to its in-memory branch. That's not mock data in the sense of hardcoded fixtures, though — it's the same code path, the same seeded dataset, and the same query logic that would run against real Postgres; only the storage backend differs. Point a real `DATABASE_URL` at a running Postgres instance (a `docker-compose.yml` is already in the repo for this) and every route listed in §5 becomes tier (a) with no code changes.

**5. "Your research doc mentions Pinecone, LangChain, and cosine-similarity thresholds — are you using any of that?"**
No. `docs/hackathon_research_and_solution.md` is explicitly a pre-build research pass surveying standard RAG patterns before deciding what to actually implement. What shipped is simpler and more defensible: Postgres full-text search (no vector database), a hand-written system prompt (no LangChain chain abstraction), and a hard zero-match gate (no similarity-threshold judgment call, no secondary "judge" LLM). If pressed on why not vector search: lexical full-text search made the retrieval bound provable and auditable — every match can be explained by which words overlapped — where a cosine-similarity threshold is a tuned number with no obvious "correct" value and no way to show a skeptical auditor exactly why a document matched.
