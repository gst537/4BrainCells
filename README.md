# Institutional Memory Graph

An **Intelligent Institutional Memory & Decision Traceability Platform**. This project solves organizational "institutional amnesia" by visually mapping Decisions, Evidence (Documents), and People in a graph structure.

## Features
- **Interactive Graph Timeline**: Powered by React Flow, visualizing how people, documents, and decisions relate to one another.
- **Curated Decision Ledger**: A high-signal list of tracked decisions.
- **"Why Chat" (RAG)**: Connects to the OpenAI API to allow natural language queries over the graph data, providing cited and hallucination-free answers.

## Tech Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS & Framer Motion (Glassmorphic styling, animations)
- `@xyflow/react` (Graph rendering)
- `openai` (AI API integration)

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-...
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Documentation
See the `/docs` folder for detailed research and solution pitches regarding this project.
