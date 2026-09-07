# RESEARCH PROMPT — PS1: Intelligent Institutional Memory & Decision Traceability Platform

## 1. Problem Validation (Real-World Grounding)

*   **The Financial Cost of "Organizational Amnesia"**: Research indicates U.S. businesses lose approximately $1.3 trillion annually due to voluntary turnover among knowledge workers. When employees leave, replacing them can cost between 50% and 200% of their annual salary, driven largely by the loss of unwritten context and tacit knowledge.
*   **The Productivity Drain**: On an individual level, institutional memory loss and inefficient knowledge retrieval costs companies $4,700–$15,000 per employee annually as teams "re-litigate" past decisions or rebuild lost context. 
*   **Existing Product Categories & Adjacent Solutions**:
    *   *Knowledge Management (KM) Tools (e.g., Guru, Glean, Notion)*: Focus on finding files and indexing wikis, but lack structured workflows connecting a specific decision to its underlying evidence.
    *   *Governance, Risk, and Compliance (GRC) Software (e.g., ServiceNow, AuditBoard)*: Highly process-oriented and rigid, often requiring manual, tedious logging rather than leveraging natural language to piece together context.
    *   *Legal E-Discovery Tools (e.g., Relativity, Everlaw)*: Built for post-facto investigation during lawsuits; too heavy and expensive for everyday operational decision traceability.
*   **Target Industries**: Highly regulated sectors such as **Finance, Healthcare, Government/Defense, and Large Enterprise Infrastructure**. These industries face severe penalties for compliance failures, have long-lifecycle projects, and must frequently justify past decisions during audits.

---

## 2. Technical Grounding for the 4 Core Features

*   **Feature 1: Curated Decision Ledger**
    *   **Standard Pattern**: Full-stack CRUD (Create, Read, Update, Delete) architecture with a relational or document database.
    *   **Tools/Frameworks**: PostgreSQL (using JSONB for flexible metadata), Node.js/Express or Next.js API routes, Prisma ORM.
    *   **Failure Mode/Risk**: Schema inflexibility as different decisions require vastly different metadata (e.g., a technical decision vs. a hiring decision). 
    *   **Mitigation**: Use a semi-structured database approach (e.g., JSONB columns) to allow diverse metadata while keeping core fields (Status, Date, Author) strict.

*   **Feature 2: "Why" Chat with Citations**
    *   **Standard Pattern**: Retrieval-Augmented Generation (RAG) with source-attributed chunking.
    *   **Tools/Frameworks**: LangChain or LlamaIndex, OpenAI API (e.g., GPT-4o-mini), Vector Databases like Pinecone or ChromaDB.
    *   **Failure Mode/Risk**: "Hallucination" (the AI inventing a reason for a decision that isn't in the text).
    *   **Mitigation**: Implement strict prompt grounding ("Answer only using the provided context") and force the system to return specific chunk IDs/source links alongside every claim.

*   **Feature 3: Decision Timeline**
    *   **Standard Pattern**: Chronological event streaming/visualization powered by small LLMs for summarization.
    *   **Tools/Frameworks**: Frontend libraries like `vis.js` (Timeline), React Flow, or D3.js. Lightweight LLM prompts to compress long documents into 1-2 sentence event nodes.
    *   **Failure Mode/Risk**: Visual clutter making the timeline unreadable for complex decisions with dozens of events.
    *   **Mitigation**: Implement semantic zooming (collapsing minor events) and limiting the default view to major milestones.

*   **Feature 4: Confidence-Aware Answers**
    *   **Standard Pattern**: Similarity score thresholding and LLM self-reflection/evaluation.
    *   **Tools/Frameworks**: Vector distance thresholds (e.g., cosine similarity < 0.70 triggers a fallback), or a secondary "Judge" LLM prompt (using LangSmith or TruLens concepts) to rate context sufficiency.
    *   **Failure Mode/Risk**: "Silent failures" where the system confidently returns an irrelevant or partially true answer.
    *   **Mitigation**: Explicitly code a fallback UI state. If the similarity threshold is not met, the application must display "I don't have enough information to answer this based on the current dataset" instead of passing a weak context to the LLM.

---

## 3. Dataset Requirements

To make the demo convincing and realistic, the synthetic dataset must include:
*   **Variety of Document Types**: A mix of email threads, official policy documents, meeting transcripts/notes, and approval forms.
*   **A Contradiction**: E.g., an early email stating a project is delayed, followed by a later meeting note confirming it was expedited. (This shows the AI can navigate changing facts).
*   **A Reversed Decision**: A decision that was approved and later revoked, to properly demonstrate the timeline and event progression.
*   **Realistic Metadata**: 
    *   *Author*: Name, Job Title, Department (e.g., Legal vs. Engineering).
    *   *Timestamp*: Dates logically spanning several weeks or months.
    *   *Decision Status*: Proposed, Approved, Rejected, Reversed.

---

## 4. Comparative Positioning (For the Pitch/PPT)

### Comparison Table

| Feature / Approach | Generic AI Chatbot over Docs | Enterprise KM (e.g., SharePoint) | **Our Scoped Platform** |
| :--- | :--- | :--- | :--- |
| **Primary Focus** | Answering arbitrary questions | Storing and finding files | **Tracing the "Why" behind decisions** |
| **Information Source** | Noisy, auto-indexed data | Rigid folder structures | **Curated, high-signal ledger** |
| **Evidence Quality** | Often hallucinates without citations | Relies on keyword search | **Mandatory citations for every claim** |
| **Timeline View** | Non-existent | Manual version history only | **Automated chronological visualization** |
| **Uncertainty Handling** | Confidently guesses | Returns "No results found" | **Explicit confidence-aware fallback** |

### Key Differentiators (Why our scoped build is better)
1.  **Evidence-First, Not Just Answers**: Mandatory source citation prevents the black-box effect of generic AI tools.
2.  **Explicit Low-Confidence Fallback**: It builds user trust by acknowledging what it *doesn't* know, rather than hallucinating.
3.  **High Signal-to-Noise Ratio**: Using a curated ledger instead of naive auto-extraction ensures the system is tracing actual decisions, not random chat noise.

---

## 5. Judge-Facing Framing Material

*   **Problem Statement (For Title Slide)**
    Organizations continuously lose critical operational context due to employee turnover and fragmented communication channels. This "institutional amnesia" leads to repeated mistakes, costly re-litigation of past decisions, and severe compliance risks. Existing knowledge management tools organize documents but completely fail to capture the "why" behind critical decisions.

*   **Why This Matters**
    With knowledge worker turnover costing the U.S. economy an estimated $1.3 trillion annually, the loss of unwritten context is a massive financial drain. By ensuring that every decision is instantly traceable to its foundational evidence, organizations can safeguard their history, streamline onboarding, and confidently defend their choices during audits.

*   **Q&A for Judges**
    1.  *Q: How does this differ from just searching an enterprise wiki?* 
        **A:** Our platform connects a specific decision directly to its underlying evidence and timeline, rather than just dumping a list of related documents onto the user.
    2.  *Q: How do you prevent the AI from making up a justification?* 
        **A:** We use strict Retrieval-Augmented Generation (RAG) constraints with mandatory source citations and a low-confidence fallback that explicitly states when information is missing.
    3.  *Q: Why rely on a curated ledger instead of auto-extracting all decisions from Slack or email?* 
        **A:** Auto-extraction introduces massive noise; a curated ledger ensures a high signal-to-noise ratio, establishing a trusted source of truth for critical items.
    4.  *Q: What industries would actually pay for this?* 
        **A:** Highly regulated sectors like finance, healthcare, and government, where the cost of failing to trace a decision's origin during an audit is exceptionally high.
    5.  *Q: How scalable is the timeline feature as decisions pile up?* 
        **A:** The timeline utilizes hierarchical grouping and LLM-generated summaries to provide high-level overviews while allowing users to drill down into specifics without visual clutter.
