# ALETHEIA — Institutional Memory Graph

An **Intelligent Institutional Memory & Decision Traceability Platform**. This project solves organizational "institutional amnesia" by visually mapping Decisions, Evidence (Documents), and People in a graph structure.

## Features
- **Interactive Graph Timeline**: Powered by React Flow, visualizing how people, documents, and decisions relate to one another.
- **Curated Decision Ledger**: A high-signal list of tracked decisions.
- **"Why Chat" (RAG)**: Connects to the OpenAI API to allow natural language queries over the graph data, providing cited and hallucination-free answers. (Includes an offline fallback for missing API keys).
- **JWT Authentication**: Secure login flow.

## 🚀 Laptop Setup Guide (For New Environments)

If you are setting this up on a new laptop, you MUST complete these steps:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   OPENAI_API_KEY=sk-...  # Required for the live 'Why' Chat (RAG)
   DATABASE_URL=postgresql://postgres:password@localhost:5432/institutional_memory
   JWT_SECRET=super_secret_jwt_key_123
   ```

3. **Database (Optional but Recommended):**
   The app currently uses a mock data fallback if PostgreSQL is not available. To use the real database:
   - Install PostgreSQL or run it via Docker: `docker run --name pg-aletheia -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`
   - Ensure the connection string matches `DATABASE_URL`.

4. **Start the Server:**
   ```bash
   npm run dev
   ```
   *The default login password is `admin`.*

## 🤖 AI Agent Handoff

**ATTENTION CLAUDE / AI AGENTS:** 
To begin your workflow, you MUST read `CLAUDE.md` first. It contains the architectural roadmap, current bugs, and the exact continuation steps for this project.

## Tech Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS & Framer Motion
- `@xyflow/react` (Graph rendering)
- `openai` (AI API integration)
