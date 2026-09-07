# AI Agent Handoff Guide for Claude Code Pro

Welcome to the ALETHEIA Institutional Memory project! If you are Claude (or another AI agent) picking up this project on a new machine, this file contains the architectural roadmap, current state, and your next tasks.

## 🚀 Environment Setup (For the User)

If the user just cloned this repository onto a new laptop, you MUST help them set up their environment first:
1. Run `npm install`
2. Create a `.env.local` file with:
   - `OPENAI_API_KEY`: A valid `sk-...` OpenAI key (required for the RAG chat).
   - `DATABASE_URL`: `postgresql://postgres:password@localhost:5432/institutional_memory` (if using PostgreSQL).
   - `JWT_SECRET`: `super_secret_jwt_key_123`
3. Optional but recommended: Ask the user if they want to spin up a local PostgreSQL instance (e.g., via Docker: `docker run --name pg-aletheia -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`).
4. Remind them the login password is `admin`.

## 🛠 Current State & Next Steps

We just finished Phase 2 (Multi-page Routing & Auth Integration). The app is currently using mock data for the graph and chat if PostgreSQL is not connected. 

### Best Updates & Continuations (Your Next Tasks):
1. **Graph CRUD Operations (Edges):** We have an `AddNodeModal` for creating new nodes, but we still need the ability to visually or programmatically create **Edges** (relationships) between nodes and persist them to the database.
2. **Chat History Persistence:** The "Why Chat" currently streams responses successfully but does not persist the conversation history to the database. You should design a schema and implement chat history persistence.
3. **Evidence Vault Uploads:** The Evidence Vault page is currently read-only. Implement a feature allowing users to upload new PDFs, parse them, and automatically extract new nodes/edges.

### Current Bugs & Quirks to Fix:
1. **The 0% Confidence "API Error" Bug:** If the user provides an invalid OpenAI key, the `WhyChat` component gracefully catches the API error and falls back to offline precalculated mock answers. However, if they type a query that *isn't* in the mock data while having a bad API key, it throws a 0% confidence error. You should improve the offline fallback to handle dynamic queries more gracefully if the API fails.
2. **Hydration / Next.js Fast Refresh Quirks:** Sometimes, the `next/navigation` hooks inside the `AuthContext` cause Fast Refresh to perform a full reload during active development. Be mindful of Next.js 16 server/client component boundaries when adding new hooks.

## 💬 Great Queries to Test the "Why" Chat

To verify the RAG system is working and citing the Institutional Graph correctly, run the app and ask the "Why Chat" these detailed queries:

1. **"What was the technical and financial justification for combining Neo4j graph with Qdrant vector search instead of using a pure vector database?"**
   *(Expected output: It should cite ADR-089, Marcus Vance, and explain how it reduced hallucination rates from 28.4% to 0.8% to satisfy compliance).*

2. **"Can you trace the events that triggered the pivot to Cloud-Native Kubernetes in 2022? Who signed off on the architecture change?"**
   *(Expected output: It should trace back to the Black Friday 2021 Server Overload Incident (EVT-401) and confirm Dr. Elena Rostova authored RFC-042 for the fix).*

3. **"Why is the Dual-Key Encryption decision currently marked as contested? What were the alternatives considered?"**
   *(Expected output: It should explain the conflict between European data residency (GDPR) and the increased Mean-Time-To-Recovery (MTTR) during disaster recovery).*

4. **"Who decided to acquire Acme Analytics in 2020?"**
   *(Expected output: It MUST trigger the Anti-Hallucination Confidence Gate (0-12% confidence) and explicitly state that there is no verified institutional evidence in the graph regarding this acquisition).*

---
**FINAL DIRECTIVE FOR AGENT:** 
Start your workflow by reading `README.md` and this `CLAUDE.md` file. Once you are oriented, ask the user which of the "Next Steps" they would like you to tackle first!
