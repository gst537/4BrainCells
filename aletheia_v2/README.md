# ATHENIA V2 / ALETHEIA V2 — Institutional Memory & Decision Traceability

This standalone package contains the complete, production-ready frontend for **ATHENIA V2 / ALETHEIA V2**.

## Included Features (100% Faithful to Reference Screenshots)
1. **Knowledge Graph** (/knowledge-graph):
   - Dark dotted-grid canvas with interactive zoom/pan controls.
   - Central decision node with cyan glowing border, connected person, document, and event nodes.
   - Right slide-over context drawer (NODE_ID: DCSN-9942, Author, Timestamp, 82% confidence, dependencies, tags).
   - Animated **"Expand Trace"** revealing 2nd-hop nodes.
2. **Decision Ledger** (/decision-ledger):
   - High-density table with colored left-stripe indicators (Cyan for Approved, Amber for Pending, Red for Contested).
   - Dynamic filters, CSV export, and pagination.
   - Clickable rows opening the comprehensive Decision Detail drawer.
3. **Why Chat / Inquiry Mode & Evidence Viewer** (/why-chat):
   - Left Inquiry Mode chat with Session #994A header, Strong/Weak confidence badges, clickable citations, and red traceability gap warning box.
   - Right Evidence Viewer panel with Ref 1 & Ref 2 cards, highlighted excerpts, "View Full Document", and "View Thread" buttons.
4. **New Decision Trace Modal**:
   - 5-step wizard connected to the large cyan button that live-inserts records into Ledger, Graph, and Timeline without reload.
5. **Global Search**:
   - `Ctrl+K` shortcut querying decisions, people, documents, and events.

## Quick Start
`ash
npm install
npm run dev
`
Open http://localhost:3000 in your browser.
