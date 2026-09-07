/**
 * ALETHEIA — Institutional Seed Dataset
 * =====================================
 * The real institutional history of Aletheia (the startup building this product),
 * spanning Sep 2024 → Aug 2026. This is the single source of truth that populates
 * PostgreSQL (via /api/seed) and the in-memory fallback store.
 *
 * Content is authored here as compact specs; ids, coordinates, confidence scores,
 * evidence records, timeline entries and graph edges are DERIVED deterministically
 * so the dataset stays internally consistent and stable across reloads.
 */

import {
  GraphNode,
  GraphEdge,
  DecisionItem,
  EvidenceDocument,
  TimelineEvent,
  DecisionStatus,
  ImpactTier,
  ConfidenceBreakdown
} from '@/types';

// ============================================================
// PEOPLE
// ============================================================

export interface SeedPerson {
  id: string;
  key: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  tags: string[];
}

export const PEOPLE: SeedPerson[] = [
  {
    id: 'PER-TARUN', key: 'tarun', name: 'Tarun', role: 'CEO & Co-founder', department: 'Executive',
    bio: 'Co-founder and Chief Executive. Owns fundraising, company strategy, and final sign-off on all Critical-impact decisions.',
    tags: ['founder', 'executive', 'signatory']
  },
  {
    id: 'PER-SANJAY', key: 'sanjay', name: 'Sanjay', role: 'CTO & Co-founder', department: 'Engineering',
    bio: 'Co-founder and Chief Technology Officer. Owns architecture, infrastructure, security posture, and the engineering roadmap.',
    tags: ['founder', 'engineering', 'architecture']
  },
  {
    id: 'PER-RITHVIK', key: 'rithvik', name: 'Rithvik', role: 'CPO & Co-founder', department: 'Product',
    bio: 'Co-founder and Chief Product Officer. Owns product direction, user research, roadmap prioritisation, and design partnership.',
    tags: ['founder', 'product', 'research']
  },
  {
    id: 'PER-MUKESH', key: 'mukesh', name: 'Mukesh', role: 'CFO & Co-founder', department: 'Finance',
    bio: 'Co-founder and Chief Financial Officer. Owns runway modelling, pricing, vendor spend, and all procurement approvals.',
    tags: ['founder', 'finance', 'procurement']
  },
  {
    id: 'PER-PRIYA', key: 'priya', name: 'Priya Nandakumar', role: 'Founding Engineer', department: 'Engineering',
    bio: 'First engineering hire. Built the graph traversal layer and the confidence-gating pipeline that anchors the RAG system.',
    tags: ['engineering', 'backend', 'rag']
  },
  {
    id: 'PER-ARJUN', key: 'arjun', name: 'Arjun Deshpande', role: 'Design Lead', department: 'Design',
    bio: 'Design lead responsible for the ALETHEIA design system, the graph canvas interaction model, and the evidence viewer.',
    tags: ['design', 'design-system', 'ux']
  },
  {
    id: 'PER-MEERA', key: 'meera', name: 'Meera Subramanian', role: 'Head of Go-To-Market', department: 'Go-To-Market',
    bio: 'Leads pilots, design-partner relationships, pricing experiments, and the compliance-led enterprise sales motion.',
    tags: ['gtm', 'sales', 'pricing']
  },
  {
    id: 'PER-DANIEL', key: 'daniel', name: 'Daniel Okonkwo', role: 'Fractional General Counsel', department: 'Legal',
    bio: 'Fractional counsel covering incorporation, customer contracts, DPAs, IP assignment, and privacy compliance.',
    tags: ['legal', 'compliance', 'contracts']
  },
  {
    id: 'PER-LAKSHMI', key: 'lakshmi', name: 'Lakshmi Venkatesan', role: 'ML / Data Engineer', department: 'Engineering',
    bio: 'Owns retrieval quality, embedding pipelines, hallucination benchmarking, and the evaluation harness.',
    tags: ['ml', 'retrieval', 'evaluation']
  },
  {
    id: 'PER-GEORGE', key: 'george', name: 'George Alvarez', role: 'Seed Investor & Board Advisor', department: 'Board',
    bio: 'Lead seed investor and board observer. Advises on governance, hiring bar, and enterprise go-to-market sequencing.',
    tags: ['board', 'investor', 'governance']
  }
];

const personByKey = (key: string): SeedPerson =>
  PEOPLE.find(p => p.key === key) || PEOPLE[0];

// ============================================================
// DECISION SPECS
// ============================================================

export type DecisionCategory =
  | 'Engineering'
  | 'Product'
  | 'Design'
  | 'Business'
  | 'Hiring'
  | 'Legal'
  | 'Partnerships';

interface DecisionSpec {
  slug: string;
  title: string;
  cat: DecisionCategory;
  date: string;
  owner: string;
  status: DecisionStatus;
  impact: ImpactTier;
  summary: string;
  rationale: string;
  alts: string[];
  tags: string[];
}

const d = (
  slug: string,
  title: string,
  cat: DecisionCategory,
  date: string,
  owner: string,
  status: DecisionStatus,
  impact: ImpactTier,
  summary: string,
  rationale: string,
  alts: string[],
  tags: string[]
): DecisionSpec => ({ slug, title, cat, date, owner, status, impact, summary, rationale, alts, tags });

export const DECISION_SPECS: DecisionSpec[] = [
  // ---------- 2024 Q3/Q4 — Founding & first architecture ----------
  d('incorporate-entity', 'Incorporated Aletheia as a Delaware C-Corp', 'Legal', '2024-09-02', 'daniel', 'Approved', 'Critical',
    'Registered the company as a Delaware C-Corporation with a four-way founder split and standard four-year vesting with a one-year cliff.',
    'Delaware C-Corp is the only structure institutional seed investors will fund without renegotiation; the four-year/one-year vesting protects against early founder churn.',
    ['LLC — cheaper to run but blocks priced equity rounds', 'Indian Pvt Ltd — better for local hiring, worse for US fundraising'],
    ['incorporation', 'equity', 'governance']),

  d('founder-equity-split', 'Set founder equity at 4-way near-equal split', 'Legal', '2024-09-04', 'tarun', 'Approved', 'Critical',
    'Allocated equity across the four co-founders at 26/26/24/24 with a shared 12% option pool carved out pre-seed.',
    'Near-equal split reflects comparable risk and full-time commitment from all four founders; a pre-carved pool avoids re-diluting at the seed round.',
    ['Weighted split by tenure — created resentment risk with no material fairness gain', 'Defer split until seed — investors treat unsplit cap tables as a red flag'],
    ['equity', 'cap-table', 'founders']),

  d('nextjs-frontend', 'Chose Next.js + Tailwind over React + MUI for the frontend', 'Engineering', '2024-09-12', 'sanjay', 'Approved', 'High',
    'Adopted Next.js App Router with Tailwind CSS as the frontend foundation rather than a Vite + Material UI stack.',
    'Server components let us stream RAG responses without a separate BFF, and Tailwind avoided the theme-override tax MUI imposes on a bespoke dark design system.',
    ['Vite + React + MUI — faster local dev, but component overrides fought the design language', 'Remix — comparable DX, smaller ecosystem for our auth and streaming needs'],
    ['frontend', 'nextjs', 'tailwind', 'tech-stack']),

  d('postgres-over-mongo', 'Adopted PostgreSQL over MongoDB as the system of record', 'Engineering', '2024-09-18', 'sanjay', 'Approved', 'Critical',
    'Selected PostgreSQL with JSONB node payloads and relational edge tables as the primary datastore for the institutional graph.',
    'Recursive CTEs give us multi-hop graph traversal without a second database, while JSONB keeps node schemas flexible during rapid iteration.',
    ['MongoDB — flexible documents but no native join for edge traversal', 'Neo4j — best traversal semantics, but a second operational dependency at pre-seed headcount'],
    ['database', 'postgres', 'architecture', 'tech-stack']),

  d('jsonb-node-payload', 'Store node attributes as JSONB rather than wide columns', 'Engineering', '2024-09-20', 'priya', 'Approved', 'Medium',
    'Node records carry id and type as columns with all remaining attributes in a JSONB data payload.',
    'Node shape changed eleven times in the first six weeks; JSONB let the schema move without a migration on every product iteration.',
    ['Wide typed columns — better constraints, migration cost too high at this stage', 'EAV tables — fully flexible but unreadable queries'],
    ['database', 'schema', 'postgres']),

  d('monorepo-single-app', 'Kept a single Next.js app instead of a monorepo', 'Engineering', '2024-09-24', 'sanjay', 'Approved', 'Medium',
    'Rejected an early Turborepo split of web/api/shared packages in favour of one Next.js application with route handlers.',
    'With four engineers, monorepo tooling overhead exceeded the modularity benefit; route handlers already give us API isolation.',
    ['Turborepo with three packages — premature for the team size', 'Separate Express API — extra deploy target and CORS surface'],
    ['architecture', 'repo', 'tooling']),

  d('confidence-gate-core', 'Made the confidence gate a core product primitive, not a warning banner', 'Product', '2024-10-01', 'rithvik', 'Approved', 'Critical',
    'Every answer surfaces a numeric confidence score and refuses to answer below threshold, rather than answering with a disclaimer.',
    'Design-partner interviews showed a hedged answer is treated as a confident answer; refusing outright is the only behaviour that changed user trust.',
    ['Disclaimer banner above answers — tested, users ignored it entirely', 'Confidence shown only on hover — hid the single most differentiating signal'],
    ['confidence', 'trust', 'core-product', 'anti-hallucination']),

  d('jwt-auth-before-beta', 'Added JWT auth before opening the public beta', 'Engineering', '2024-10-08', 'sanjay', 'Approved', 'High',
    'Shipped JWT-based authentication with role claims ahead of the first external beta rather than after.',
    'Beta accounts would contain real customer decision records; shipping an unauthenticated beta would have made every later SOC 2 conversation harder.',
    ['Ship beta behind a shared password — no per-user audit trail', 'Auth0 from day one — $$ per MAU before we had revenue'],
    ['auth', 'security', 'jwt', 'beta']),

  d('gpt4o-mini-over-llama', 'Chose OpenAI gpt-4o-mini over a self-hosted LLaMA deployment', 'Engineering', '2024-10-14', 'lakshmi', 'Approved', 'High',
    'Standardised the RAG answer layer on gpt-4o-mini via API instead of self-hosting an open-weights model.',
    'Self-hosting cost ~$1,900/mo in GPU spend before a single customer; gpt-4o-mini delivered comparable grounded-answer quality at $60/mo at our volume.',
    ['Self-hosted LLaMA 3 8B — data residency win, unjustifiable burn pre-revenue', 'Claude via API — strong quality, deferred to a later multi-provider decision'],
    ['llm', 'cost', 'rag', 'vendor']),

  d('sse-streaming', 'Streamed answers over SSE instead of websockets', 'Engineering', '2024-10-16', 'priya', 'Approved', 'Medium',
    'Answer streaming uses Server-Sent Events through a Next.js route handler rather than a websocket channel.',
    'The stream is strictly one-directional; SSE avoided a persistent connection layer and works through corporate proxies our pilots sit behind.',
    ['Websockets — bidirectional capability we do not use', 'Long polling — simplest, but visibly worse perceived latency'],
    ['streaming', 'sse', 'api']),

  d('anti-hallucination-benchmark', 'Built an internal hallucination benchmark before adding features', 'Engineering', '2024-10-22', 'lakshmi', 'Approved', 'High',
    'Created a 240-question evaluation set with known-answer and known-absent queries, gating every retrieval change on it.',
    'Without a measured baseline, every retrieval "improvement" was an opinion; the harness caught three regressions in its first month.',
    ['Manual spot-checks — cheap but non-reproducible', 'Third-party eval vendor — cost and data-sharing friction'],
    ['evaluation', 'benchmark', 'quality', 'rag']),

  d('graph-bounded-retrieval', 'Bounded vector retrieval to 2-hop graph neighbourhoods', 'Engineering', '2024-10-29', 'lakshmi', 'Approved', 'Critical',
    'Candidate passages must sit within two graph hops of an entity matched in the query before they can be cited.',
    'Unbounded cosine similarity returned superseded drafts that read almost identically to ratified policy; graph bounding cut false citations from 28.4% to 0.8% on the benchmark.',
    ['Pure vector search with a recency boost — still cited superseded drafts', 'Reranker model — improved ordering but did not eliminate wrong-document citations'],
    ['retrieval', 'graph', 'rag', 'anti-hallucination']),

  d('evidence-hash-provenance', 'Required SHA-256 provenance hashes on every evidence document', 'Product', '2024-11-04', 'rithvik', 'Approved', 'High',
    'Every ingested document is hashed at upload and the hash is displayed alongside any citation drawn from it.',
    'Compliance buyers need to prove the cited document is byte-identical to the one filed; the hash makes that a one-second check instead of a discovery request.',
    ['Version numbers only — does not detect silent edits', 'Full document signing — stronger guarantee, needs PKI we do not have yet'],
    ['provenance', 'evidence', 'compliance', 'hashing']),

  d('confidence-scoring-differentiator', 'Positioned confidence scoring as the primary competitive differentiator', 'Business', '2024-11-08', 'tarun', 'Approved', 'Critical',
    'All positioning, demos, and the pitch narrative lead with verifiable confidence scoring rather than search quality.',
    'Every competitor claims better search; none will state a number and refuse to answer below it. That refusal is the only claim buyers could not get elsewhere.',
    ['Lead with search speed — undifferentiated against incumbents', 'Lead with integrations breadth — a feature race we would lose on headcount'],
    ['positioning', 'strategy', 'differentiation']),

  d('per-org-seat-pricing', 'Pivoted from per-user pricing to per-org seat bands', 'Business', '2024-11-15', 'mukesh', 'Approved', 'High',
    'Replaced $29/user/month with organisation-level seat bands starting at $1,200/month for up to 25 seats.',
    'Per-user pricing punished the exact behaviour we want — inviting the whole team; three of four pilots said seat counting would cap adoption.',
    ['Usage-based per query — unpredictable bills, buyers rejected in pricing interviews', 'Flat unlimited — leaves enterprise budget on the table'],
    ['pricing', 'revenue', 'gtm']),

  d('design-system-tokens', 'Committed to a token-driven dark-first design system', 'Design', '2024-11-19', 'arjun', 'Approved', 'Medium',
    'Defined a single token set for surfaces, ink, and accent colours, dark-first with light mode derived from the same ramps.',
    'The product is used in long analytical sessions and screen-shared in audit reviews; a dark-first token set kept contrast predictable in both contexts.',
    ['Light-first with a dark override — dark mode read as an afterthought in testing', 'Untokenised per-component colours — drifted within two sprints'],
    ['design-system', 'tokens', 'dark-mode']),

  d('graph-canvas-svg', 'Built the graph canvas in bespoke SVG rather than adopting a library', 'Engineering', '2024-11-26', 'arjun', 'Contested', 'High',
    'The knowledge graph canvas is hand-built with SVG paths and DOM nodes instead of using react-flow or cytoscape.',
    'Library defaults fought our confidence-weighted edge styling and evidence-linked node cards, but the maintenance cost is now a recurring engineering complaint.',
    ['react-flow — faster start, heavy customisation to express confidence styling', 'cytoscape.js — strong layouts, imperative API clashed with React state'],
    ['graph', 'canvas', 'frontend', 'technical-debt']),

  d('yc-w25-application', 'Applied to Y Combinator W25 batch', 'Business', '2024-12-02', 'tarun', 'Approved', 'High',
    'Submitted a YC W25 application with the confidence-gated institutional memory thesis and two signed design partners.',
    'A YC batch would compress enterprise credibility timelines that a four-person unknown team cannot otherwise buy.',
    ['Raise a pure angel round — less dilution, far less distribution', 'Bootstrap to revenue first — slower than the market window allows'],
    ['fundraising', 'yc', 'milestone']),

  d('two-design-partners', 'Signed two unpaid design partners before charging anyone', 'Partnerships', '2024-12-06', 'meera', 'Approved', 'High',
    'Committed to two structured unpaid design partnerships with weekly feedback sessions in exchange for deep access.',
    'Paid pilots at this maturity would have bought us feedback filtered through buyer politeness; unpaid partners told us what was broken.',
    ['Charge a discounted pilot fee — smaller feedback surface', 'Five partners — beyond our capacity to serve well'],
    ['design-partners', 'gtm', 'validation']),

  d('ip-assignment-agreements', 'Executed IP assignment agreements for all founders and contractors', 'Legal', '2024-12-10', 'daniel', 'Approved', 'Critical',
    'All four founders and every contractor signed IP assignment and confidentiality agreements covering work from the first commit.',
    'Unassigned IP from the pre-incorporation period is the most common diligence blocker; backdating coverage closed it before it appeared.',
    ['Assign at seed close — leaves a diligence gap investors always find', 'Founders only — contractors wrote production retrieval code'],
    ['ip', 'legal', 'diligence']),

  // ---------- 2025 Q1 — Beta, hardening, first revenue ----------
  d('audit-log-immutable', 'Made the audit log append-only at the database level', 'Engineering', '2025-01-08', 'sanjay', 'Approved', 'High',
    'Audit entries are insert-only with database-level revocation of UPDATE and DELETE for the application role.',
    'An audit trail the application can rewrite is not an audit trail; enforcing this in the database made the claim defensible to auditors.',
    ['Application-level immutability — a single bad migration defeats it', 'External append-only log service — extra vendor and cost'],
    ['audit', 'security', 'compliance', 'postgres']),

  d('rbac-three-roles', 'Settled on three roles: viewer, contributor, admin', 'Product', '2025-01-14', 'rithvik', 'Approved', 'Medium',
    'Access control ships as exactly three roles rather than granular per-resource permissions.',
    'Every design partner mapped cleanly onto read / write / administer; granular ACLs would have added configuration burden with no requested capability.',
    ['Per-resource ACLs — flexible, nobody asked for it', 'Two roles — no way to separate data stewards from ordinary editors'],
    ['rbac', 'permissions', 'auth']),

  d('drop-slack-connector-v1', 'Dropped the Slack connector from the v1 scope', 'Product', '2025-01-21', 'rithvik', 'Approved', 'High',
    'Cut Slack ingestion from the first release despite it being the most-requested integration.',
    'Slack threads are the noisiest evidence source we tested; ingesting them before the confidence gate matured would have degraded our headline metric.',
    ['Ship Slack with a low-confidence flag — pollutes the graph with weak evidence', 'Ship Slack read-only for search — half the value, full the ingestion cost'],
    ['scope', 'integrations', 'slack', 'roadmap']),

  d('first-paid-pilot', 'Converted the first design partner to a paid pilot', 'Business', '2025-02-03', 'meera', 'Approved', 'Critical',
    'Signed a $18,000 six-month paid pilot with our first design partner, a 400-person fintech.',
    'The partner asked to pay in order to get contractual SLAs; refusing revenue to preserve the "design partner" label would have been ideology over signal.',
    ['Stay unpaid through the full partnership — forgoes proof of willingness to pay', 'Push for an annual contract — partner would not commit before SOC 2'],
    ['revenue', 'pilot', 'milestone', 'gtm']),

  d('soc2-type1-commitment', 'Committed to SOC 2 Type I before enterprise outbound', 'Legal', '2025-02-11', 'daniel', 'Approved', 'Critical',
    'Started a SOC 2 Type I readiness programme, gating all enterprise outbound until the report is in hand.',
    'Three of five enterprise conversations stalled at the security questionnaire; Type I unblocks the questionnaire without waiting a full observation window.',
    ['Skip to Type II — six-month window we could not wait out', 'Answer questionnaires ad hoc — burned two weeks of founder time per deal'],
    ['soc2', 'compliance', 'enterprise', 'security']),

  d('vendor-dpa-standardisation', 'Standardised on a single DPA template for all subprocessors', 'Legal', '2025-02-18', 'daniel', 'Approved', 'Medium',
    'All subprocessor relationships route through one reviewed Data Processing Agreement template.',
    'Bespoke DPAs per vendor made the subprocessor list impossible to attest to; one template made the SOC 2 evidence a table lookup.',
    ['Negotiate each DPA individually — legal spend scaled with vendor count', 'Accept vendor paper as-is — inconsistent breach notification windows'],
    ['dpa', 'legal', 'subprocessors', 'compliance']),

  d('hire-founding-engineer', 'Hired Priya as founding engineer over two senior candidates', 'Hiring', '2025-02-24', 'sanjay', 'Approved', 'Critical',
    'Extended the first non-founder offer to a founding engineer with graph-database depth over two more senior generalists.',
    'The bottleneck was multi-hop traversal performance, not general seniority; hiring for the specific bottleneck beat hiring for the resume.',
    ['Senior full-stack generalist — broader, no traversal depth', 'Contract-to-hire — the strongest candidate declined non-permanent terms'],
    ['hiring', 'engineering', 'founding-team']),

  d('interview-work-sample', 'Replaced whiteboard interviews with a paid work sample', 'Hiring', '2025-03-03', 'sanjay', 'Approved', 'Medium',
    'Technical hiring uses a paid four-hour work sample on a realistic retrieval problem instead of live algorithm interviews.',
    'Our best two candidates interviewed poorly on the whiteboard and excelled on the work sample; the signal correlation was worth the cost.',
    ['Standard algorithm loop — cheap, poor correlation with the actual job', 'Take-home unpaid — strong candidates declined on principle'],
    ['hiring', 'process', 'interviews']),

  d('remote-first-policy', 'Adopted remote-first with a quarterly in-person week', 'Hiring', '2025-03-10', 'tarun', 'Approved', 'Medium',
    'The company operates fully remote with one funded in-person week per quarter for planning and design work.',
    'Our hiring pool for graph and retrieval specialists is global; the quarterly week recovers the architecture conversations that remote work loses.',
    ['Hybrid three days in office — collapses the hiring pool to one metro', 'Fully remote with no offsites — architecture debates stalled in text'],
    ['culture', 'remote', 'hiring']),

  d('rate-limit-guest-chat', 'Rate-limited unauthenticated demo chat instead of blocking it', 'Product', '2025-03-17', 'priya', 'Approved', 'Medium',
    'Guest visitors get 20 grounded queries per hour instead of an authentication wall on the public demo.',
    'The auth wall cost us the "aha" moment in demos; a rate limit preserved the moment while capping abuse and inference spend.',
    ['Require sign-up to try — measurable drop-off before the value moment', 'Unlimited guest access — unbounded inference cost exposure'],
    ['demo', 'rate-limiting', 'growth']),

  d('graceful-llm-degradation', 'Required graceful degradation whenever the LLM provider fails', 'Engineering', '2025-03-24', 'priya', 'Approved', 'High',
    'Provider outages, quota exhaustion, and auth failures fall back to grounded offline answers rather than surfacing an error.',
    'A raw API error during a live customer demo reads as product failure; an honest low-confidence answer reads as the product working as designed.',
    ['Show an error banner and retry — breaks the demo narrative', 'Queue and retry silently — leaves the user staring at a spinner'],
    ['reliability', 'fallback', 'llm', 'resilience']),

  d('drop-mobile-app', 'Deferred a native mobile app indefinitely', 'Product', '2025-04-01', 'rithvik', 'Approved', 'Medium',
    'Removed native mobile from the roadmap in favour of a responsive web experience.',
    'Session analytics showed 96% of usage on desktop during working hours; a native app would have consumed a quarter for a 4% surface.',
    ['React Native app — one codebase, still a full quarter of work', 'Mobile-optimised PWA — smaller cost, still unjustified by usage'],
    ['roadmap', 'mobile', 'scope']),

  d('open-source-eval-harness', 'Open-sourced the hallucination evaluation harness', 'Business', '2025-04-08', 'lakshmi', 'Approved', 'Medium',
    'Released the evaluation harness (not the dataset) under Apache 2.0 as a public repository.',
    'Publishing the measurement method made our 0.8% claim checkable, which converted more technical buyers than any marketing asset we produced.',
    ['Keep it fully internal — claim stays unverifiable', 'Publish harness and dataset — leaks partner-derived question content'],
    ['open-source', 'marketing', 'evaluation', 'trust']),

  d('seed-round-close', 'Closed a $2.4M seed round led by an enterprise-software fund', 'Business', '2025-04-21', 'tarun', 'Approved', 'Critical',
    'Raised $2.4M on a post-money SAFE at a $16M cap, led by a fund specialising in enterprise infrastructure.',
    'The lead brought three warm enterprise introductions in the first month; a higher cap from a generalist fund would have cost us that distribution.',
    ['$3.5M from a generalist fund at a higher cap — more money, no domain distribution', 'Bridge on angels only — insufficient runway for the SOC 2 programme'],
    ['fundraising', 'seed', 'milestone']),

  d('runway-24-months', 'Set an 24-month minimum runway floor as a spending constraint', 'Business', '2025-04-28', 'mukesh', 'Approved', 'High',
    'All hiring and vendor commitments must leave at least 24 months of runway at the time of signature.',
    'The 2024 enterprise sales cycle averaged nine months for our segment; anything under two years of runway forces fundraising from weakness.',
    ['18-month floor — standard advice, too tight for our sales cycle length', 'No formal floor — spending decisions became re-litigated case by case'],
    ['finance', 'runway', 'governance']),

  // ---------- 2025 Q2/Q3 — Scaling the product ----------
  d('pgvector-over-qdrant', 'Kept embeddings in pgvector instead of adding Qdrant', 'Engineering', '2025-05-06', 'sanjay', 'Approved', 'High',
    'Vector storage stays inside PostgreSQL via pgvector rather than introducing a dedicated vector database.',
    'At 1.8M vectors our p95 retrieval latency was 74ms in pgvector — well inside budget — and one datastore means one backup and one access model.',
    ['Qdrant — better at 50M+ vectors, a scale we will not reach this year', 'Pinecone — managed convenience, data leaves our compliance boundary'],
    ['vectors', 'pgvector', 'postgres', 'architecture']),

  d('reranker-cross-encoder', 'Added a cross-encoder reranker to the retrieval pipeline', 'Engineering', '2025-05-13', 'lakshmi', 'Approved', 'Medium',
    'Retrieved candidates pass through a cross-encoder reranker before entering the answer context window.',
    'Reranking lifted answer-level precision by 11 points on the benchmark for 40ms of added latency, which stayed within the interaction budget.',
    ['No reranking — cheaper, measurably worse citation ordering', 'LLM-as-reranker — better quality, 6x the cost per query'],
    ['retrieval', 'reranking', 'quality']),

  d('citation-click-to-source', 'Made every citation click through to the exact source passage', 'Product', '2025-05-20', 'rithvik', 'Approved', 'High',
    'Citations are interactive and open the evidence viewer scrolled and highlighted at the cited passage.',
    'Watching partners verify answers, the friction was never finding the document — it was finding the sentence inside it.',
    ['Link to the document only — leaves the user searching within a 40-page PDF', 'Show the snippet inline only — no path to surrounding context'],
    ['citations', 'evidence', 'ux']),

  d('timeline-view', 'Shipped the chronological timeline as a first-class view', 'Product', '2025-06-02', 'rithvik', 'Approved', 'Medium',
    'Added a dedicated timeline view reconstructing how a decision developed over time from its linked evidence.',
    'Auditors do not ask "what was decided" — they ask "what was known when"; the graph could not answer that without a temporal projection.',
    ['Timeline as a graph filter — the temporal reading was lost in the layout', 'Export to a spreadsheet — answered the question outside the product'],
    ['timeline', 'audit', 'product']),

  d('contested-status', 'Introduced a Contested status for disputed decisions', 'Product', '2025-06-09', 'rithvik', 'Approved', 'High',
    'Decisions with conflicting supporting evidence are marked Contested rather than forced into approved or rejected.',
    'The most valuable records in every pilot were the disputed ones; collapsing them to a binary status destroyed exactly the nuance buyers wanted.',
    ['Binary approved/rejected — forces a false resolution', 'Free-text status — unqueryable, drifted immediately across teams'],
    ['status', 'contested', 'data-model']),

  d('drop-auto-extraction', 'Rejected fully automatic entity extraction from uploads', 'Product', '2025-06-16', 'rithvik', 'Approved', 'Critical',
    'Uploaded documents produce suggested entities that a human must confirm before anything is written to the graph.',
    'Unattended extraction wrote plausible-but-wrong nodes into the graph in testing, corrupting the exact record buyers trust us to keep clean.',
    ['Fully automatic extraction — fastest ingestion, unacceptable error rate', 'No extraction at all — pushes all structuring work onto the customer'],
    ['extraction', 'human-in-the-loop', 'quality', 'ingestion']),

  d('bulk-import-csv', 'Shipped CSV bulk import for existing decision registers', 'Product', '2025-06-23', 'priya', 'Approved', 'Medium',
    'Added a mapped CSV importer so teams can seed the graph from existing decision spreadsheets.',
    'Every pilot already kept a decision spreadsheet; making them retype it was the single largest onboarding drop-off point.',
    ['Manual entry only — measured as the top onboarding abandonment cause', 'Build connectors first — longer path to the same starting data'],
    ['import', 'onboarding', 'csv']),

  d('sso-saml-enterprise', 'Added SAML SSO for enterprise accounts', 'Engineering', '2025-07-07', 'sanjay', 'Approved', 'High',
    'Enterprise plans authenticate through SAML SSO with just-in-time user provisioning.',
    'SSO appeared as a hard requirement in four of four enterprise security questionnaires; it was blocking contracts, not merely requested.',
    ['SCIM provisioning first — asked for less often than SSO itself', 'OIDC only — two target customers run SAML-only identity providers'],
    ['sso', 'saml', 'enterprise', 'auth']),

  d('data-residency-eu', 'Committed to an EU data residency option', 'Legal', '2025-07-14', 'daniel', 'Approved', 'High',
    'Offered an EU-hosted deployment region for customers with data residency obligations.',
    'Two enterprise deals in the pipeline could not proceed without EU residency; the infrastructure cost was materially smaller than the pipeline it unblocked.',
    ['US-only hosting — forfeits the EU enterprise segment', 'Full on-premise deployment — support burden we cannot staff yet'],
    ['gdpr', 'residency', 'infrastructure', 'compliance']),

  d('hire-design-lead', 'Hired a dedicated design lead instead of contracting design', 'Hiring', '2025-07-21', 'rithvik', 'Approved', 'High',
    'Brought design in-house as a full-time lead rather than continuing with an agency retainer.',
    'The graph canvas interaction model needed continuous iteration against user sessions, which a project-scoped agency contract could not support.',
    ['Continue agency retainer — same monthly cost, no continuity between projects', 'Founder-led design — Rithvik was the product bottleneck already'],
    ['hiring', 'design', 'team']),

  d('dark-mode-default', 'Made dark mode the default and only shipped theme at launch', 'Design', '2025-07-28', 'arjun', 'Approved', 'Low',
    'Launched with a single dark theme rather than shipping light and dark simultaneously.',
    'Supporting two themes doubled visual QA at a stage where the design system was still moving weekly; 87% of beta users kept dark mode anyway.',
    ['Ship both themes — doubled QA surface for a minority preference', 'Light-only — contradicted observed user preference in the beta'],
    ['design', 'theme', 'scope']),

  d('accessibility-contrast-audit', 'Ran a WCAG AA contrast audit before the public launch', 'Design', '2025-08-04', 'arjun', 'Approved', 'Medium',
    'Audited and corrected all text and interactive elements to meet WCAG AA contrast on the dark surface.',
    'Two pilot organisations have public-sector customers with accessibility procurement requirements; failing AA would have disqualified us from those deals.',
    ['Audit after launch — remediation cost rises once the design system is depended on', 'Target AAA — visually flattened the confidence colour semantics'],
    ['accessibility', 'wcag', 'design', 'compliance']),

  d('graph-density-modes', 'Added executive and analyst density modes to the graph', 'Design', '2025-08-11', 'arjun', 'Approved', 'Medium',
    'The graph canvas offers a sparse executive layout and a dense analyst layout from the same data.',
    'Executives and analysts asked for opposite things from the same screen; one density control resolved a debate that had run for six weeks.',
    ['Single medium-density layout — satisfied neither group in testing', 'Per-user custom layouts — configuration burden with no requested flexibility'],
    ['graph', 'density', 'ux', 'design']),

  d('deprecate-rest-ingest', 'Deprecated the synchronous REST ingest endpoint', 'Engineering', '2025-08-18', 'priya', 'Approved', 'High',
    'Document ingestion moved to an asynchronous queue, deprecating the synchronous REST ingest path.',
    'Bulk imports of 2,000+ documents timed out at the HTTP layer; a queue made ingestion durable and gave us retry semantics.',
    ['Raise the HTTP timeout — moves the failure, does not remove it', 'Client-side chunking — pushes retry complexity onto integrators'],
    ['ingestion', 'queue', 'api', 'deprecation']),

  d('multi-provider-llm', 'Added a second LLM provider behind a routing abstraction', 'Engineering', '2025-09-01', 'sanjay', 'Approved', 'High',
    'Introduced a provider abstraction with a second model vendor as automatic failover for the answer layer.',
    'A four-hour provider outage in August took the answer layer down entirely; single-vendor dependency became an availability risk we could no longer justify.',
    ['Stay single-provider — simpler, one outage away from full downtime', 'Self-host a fallback model — GPU standby cost for rare events'],
    ['llm', 'reliability', 'vendor', 'architecture']),

  d('kill-browser-extension', 'Killed the browser extension after a four-week spike', 'Product', '2025-09-08', 'rithvik', 'Deprecated', 'Medium',
    'Abandoned an in-progress browser extension for capturing decisions from web tools.',
    'Capture volume in the prototype was 0.4 decisions per user per week — an order of magnitude below the threshold that would justify maintaining it.',
    ['Ship it anyway and iterate — maintenance cost across browser updates', 'Rebuild as a bookmarklet — same low capture volume, less capability'],
    ['sunset', 'extension', 'scope']),

  // ---------- 2025 Q4 — Enterprise motion ----------
  d('soc2-type2-window', 'Opened the SOC 2 Type II observation window', 'Legal', '2025-09-22', 'daniel', 'Approved', 'Critical',
    'Started the six-month SOC 2 Type II observation window with continuous control monitoring.',
    'Type I unblocked questionnaires but three enterprise renewals require Type II; starting the window in September makes the report available for Q2 renewals.',
    ['Delay to January — misses the renewal cycle by a full quarter', 'Skip Type II — caps us below the enterprise segment permanently'],
    ['soc2', 'compliance', 'enterprise']),

  d('dual-key-encryption', 'Dual-key customer-held encryption for the EU region', 'Engineering', '2025-09-29', 'sanjay', 'Contested', 'Critical',
    'Proposed envelope encryption with customer-held keys for EU-region tenants, currently unresolved.',
    'Customer-held keys satisfy sovereignty requirements, but modelling shows disaster-recovery MTTR rising from 45 minutes to 3.5 hours if a customer key server is unreachable.',
    ['Platform-managed keys — 45-minute MTTR, fails two sovereignty reviews', 'Escrowed customer keys — compromise design, not yet built or costed'],
    ['encryption', 'gdpr', 'contested', 'security', 'residency']),

  d('enterprise-tier-pricing', 'Introduced an enterprise tier at $4,800/month', 'Business', '2025-10-06', 'mukesh', 'Approved', 'High',
    'Added an enterprise tier bundling SSO, EU residency, audit exports, and a named support contact.',
    'The three features enterprise buyers demanded were the three cheapest for us to deliver at that price point; bundling them stopped per-deal negotiation.',
    ['Custom quote per enterprise deal — every negotiation restarted from zero', 'Fold enterprise features into the base tier — gives away the upsell'],
    ['pricing', 'enterprise', 'packaging']),

  d('named-support-sla', 'Committed to a 4-hour first-response SLA on enterprise', 'Partnerships', '2025-10-13', 'meera', 'Approved', 'Medium',
    'Enterprise contracts carry a four-hour business-hours first-response commitment with a named contact.',
    'Response time was the second-most negotiated contract term after price; publishing a standard SLA removed it from negotiation entirely.',
    ['One-hour SLA — unstaffable at current headcount', 'No formal SLA — every enterprise contract negotiated a bespoke one'],
    ['sla', 'support', 'enterprise', 'contracts']),

  d('partner-with-grc-vendor', 'Signed a referral partnership with a GRC platform', 'Partnerships', '2025-10-20', 'meera', 'Approved', 'High',
    'Entered a mutual referral agreement with a governance-risk-compliance platform serving mid-market enterprises.',
    'Their customers already have the audit obligation that creates our need; the partnership reaches qualified buyers without outbound spend.',
    ['Build our own GRC features — competes with the partner, years of work', 'Pure outbound to the same segment — higher cost per qualified meeting'],
    ['partnerships', 'gtm', 'referral', 'grc']),

  d('reject-acquisition-inquiry', 'Declined an early acquisition inquiry', 'Business', '2025-10-27', 'tarun', 'Approved', 'Critical',
    'Turned down an informal acquisition approach valuing the company at $19M.',
    'The offer valued us below the trajectory implied by pipeline growth, and the acquirer intended to fold the confidence gate into an existing search product.',
    ['Enter formal negotiations — months of founder distraction at a weak valuation', 'Counter at a higher number — the strategic fit concern was unresolved regardless'],
    ['m&a', 'strategy', 'board']),

  d('hire-gtm-lead', 'Hired a go-to-market lead ahead of more engineers', 'Hiring', '2025-11-03', 'tarun', 'Approved', 'High',
    'Prioritised a GTM lead over the next two engineering hires in the post-seed hiring plan.',
    'Product velocity was not the constraint — qualified pipeline was; founder-led sales had saturated at roughly six conversations per week.',
    ['Two more engineers — accelerates a roadmap that is not the bottleneck', 'Agency-led outbound — tested, poor qualification in a compliance-led sale'],
    ['hiring', 'gtm', 'prioritisation']),

  d('quarterly-decision-review', 'Instituted a quarterly decision review using our own product', 'Business', '2025-11-10', 'tarun', 'Approved', 'Medium',
    'Every quarter the team reviews its own decision ledger, marking outcomes and reversing decisions that did not hold.',
    'Dogfooding surfaced four product gaps in the first session that months of user interviews had not, including the missing Reversed relationship type.',
    ['Annual retrospective — too slow to catch decisions worth reversing', 'Ad hoc reviews — never happened without a scheduled forcing function'],
    ['process', 'dogfooding', 'governance']),

  d('reverses-edge-type', 'Added a REVERSES relationship type to the graph', 'Engineering', '2025-11-17', 'priya', 'Approved', 'Medium',
    'Introduced an explicit REVERSES edge so a decision can formally supersede an earlier one.',
    'Reversals were previously recorded as CONTRADICTS, which conflated genuine disputes with clean supersession and distorted the confidence calculation.',
    ['Reuse CONTRADICTS — conflates two structurally different relationships', 'Status change only — loses the link to what specifically was reversed'],
    ['graph', 'data-model', 'edges']),

  d('reverse-mobile-decision', 'Reversed the mobile deferral for read-only access', 'Product', '2025-11-24', 'rithvik', 'Approved', 'Medium',
    'Partially reversed the mobile deferral, committing to a responsive read-only experience for approvals on phones.',
    'Approval steps were stalling for days because approvers were travelling; read-only mobile approval was a bounded scope that removed the bottleneck.',
    ['Hold the original deferral — approval latency stayed the top workflow complaint', 'Full native app — the original decision correctly rejected this scope'],
    ['mobile', 'reversal', 'approvals', 'roadmap']),

  d('drop-on-prem-tier', 'Declined to offer a self-hosted on-premise tier', 'Business', '2025-12-01', 'tarun', 'Approved', 'High',
    'Rejected building a customer-managed on-premise deployment despite requests from two large prospects.',
    'On-premise would fork the release process and require support engineering we cannot staff; EU residency covered the actual compliance concern in both cases.',
    ['Build on-premise for the two prospects — release fork and support burden', 'Single-tenant cloud — considered, deferred as a future middle path'],
    ['deployment', 'scope', 'enterprise']),

  d('annual-contract-default', 'Made annual contracts the default with monthly at a premium', 'Business', '2025-12-08', 'mukesh', 'Approved', 'Medium',
    'Annual prepay became the default contract shape, with month-to-month priced 20% higher.',
    'Monthly contracts churned at 3.1x the annual rate in the pilot cohort, and annual prepay materially improved the cash position for hiring.',
    ['Monthly default — better conversion, materially worse retention and cash', 'Annual only — loses smaller teams unwilling to commit upfront'],
    ['pricing', 'contracts', 'retention', 'cash']),

  d('security-bug-bounty', 'Opened a private security bug bounty', 'Engineering', '2025-12-15', 'sanjay', 'Approved', 'Medium',
    'Launched an invite-only bug bounty with a fixed reward schedule ahead of the public launch.',
    'A private programme surfaced two authorisation bugs before public exposure at a fraction of the cost of a full penetration test.',
    ['Public bounty from the start — noise volume beyond our triage capacity', 'Annual pentest only — point-in-time coverage between releases'],
    ['security', 'bug-bounty', 'launch']),

  // ---------- 2026 — Scale and refinement ----------
  d('public-launch', 'Launched publicly out of private beta', 'Business', '2026-01-13', 'tarun', 'Approved', 'Critical',
    'Opened general availability with self-serve signup on the team tier and sales-assisted enterprise onboarding.',
    'Pipeline exceeded our capacity to hand-onboard, and the confidence gate had held steady above the quality bar for two consecutive quarters.',
    ['Extend private beta another quarter — pipeline already exceeded manual capacity', 'Self-serve on all tiers — enterprise needs residency and SSO configuration'],
    ['launch', 'milestone', 'gtm']),

  d('usage-analytics-privacy', 'Chose privacy-preserving product analytics', 'Legal', '2026-01-20', 'daniel', 'Approved', 'Medium',
    'Product analytics record event types and aggregate timings only, never query text or document content.',
    'Our entire positioning rests on being trusted with sensitive decision records; instrumenting query content would have contradicted that in our own DPA.',
    ['Full session recording — richest signal, irreconcilable with our privacy claims', 'No analytics — flew blind on onboarding drop-off'],
    ['privacy', 'analytics', 'trust', 'gdpr']),

  d('confidence-breakdown-ui', 'Exposed the confidence score breakdown in the UI', 'Product', '2026-01-27', 'rithvik', 'Approved', 'High',
    'Confidence scores expand into their five weighted components rather than showing a single opaque number.',
    'Users distrusted a bare number they could not interrogate; showing the components turned scepticism into corrective action on the weak component.',
    ['Single opaque score — tested as less trusted than no score at all', 'Full formula documentation only — nobody read the docs mid-task'],
    ['confidence', 'transparency', 'ux']),

  d('admin-dashboard', 'Built an admin dashboard for data stewardship', 'Product', '2026-02-03', 'rithvik', 'Approved', 'High',
    'Added an admin-only dashboard for managing nodes, decisions, people, evidence, and user roles.',
    'Data stewards were filing support tickets for corrections we could only make with direct database access, which broke our own audit story.',
    ['Support-ticket corrections — unauditable and slow', 'Full inline editing everywhere — too much destructive power for ordinary editors'],
    ['admin', 'stewardship', 'tooling']),

  d('query-driven-loading', 'Made the workspace query-driven instead of loading everything', 'Engineering', '2026-02-10', 'sanjay', 'Approved', 'High',
    'The graph, ledger, and timeline populate from a search query rather than rendering the entire corpus on load.',
    'At 40,000 nodes the initial render took 6.2 seconds and showed an unreadable hairball; scoping to a searched subgraph made both problems disappear.',
    ['Paginate the full graph — still a meaningless view of unrelated nodes', 'Server-side layout precomputation — expensive, does not fix comprehensibility'],
    ['performance', 'search', 'ux', 'architecture']),

  d('search-full-text-postgres', 'Used PostgreSQL full-text search rather than Elasticsearch', 'Engineering', '2026-02-17', 'priya', 'Approved', 'Medium',
    'Entity search runs on PostgreSQL GIN indexes over generated tsvectors instead of a dedicated search cluster.',
    'Postgres full-text search returned in 31ms at p95 over our largest tenant; Elasticsearch would have added a cluster to operate for no measured gain.',
    ['Elasticsearch — better at very large scale, another system to run', 'Client-side filtering — impossible past a few thousand nodes'],
    ['search', 'postgres', 'performance']),

  d('deprecate-mock-store', 'Removed the hardcoded mock data store from the application', 'Engineering', '2026-02-24', 'sanjay', 'Approved', 'High',
    'Deleted the in-app mock dataset as the source of UI state, replacing it with database-backed queries.',
    'Two demos showed mock records to real prospects because the fallback silently masked an empty database; that failure mode had to be removed structurally.',
    ['Keep mocks behind a feature flag — the flag was the failure mode', 'Keep mocks for local dev only — same silent-masking risk during demos'],
    ['technical-debt', 'data', 'refactor']),

  d('seeded-demo-tenant', 'Created a seeded demo tenant separate from production data', 'Product', '2026-03-03', 'meera', 'Approved', 'Medium',
    'Sales demos run against an explicitly labelled seeded tenant rather than a prospect-shaped mock.',
    'Prospects consistently asked whether the demo data was real; labelling it removed a credibility objection that came up in most first calls.',
    ['Demo on live customer data — impossible under our own DPA', 'Empty demo tenant filled live — burned meeting time on data entry'],
    ['demo', 'sales', 'data']),

  d('graph-virtualisation', 'Virtualised graph rendering above 500 visible nodes', 'Engineering', '2026-03-10', 'arjun', 'Approved', 'Medium',
    'The canvas renders only nodes intersecting the viewport once the visible set exceeds 500.',
    'Frame time exceeded 90ms during pan on large subgraphs, and the interaction felt broken well before the graph became unreadable.',
    ['Cap the visible subgraph at 500 — silently hides matched results', 'WebGL rendering — large rewrite for a problem virtualisation solved'],
    ['performance', 'graph', 'rendering']),

  d('hire-ml-engineer', 'Hired a dedicated ML engineer for retrieval quality', 'Hiring', '2026-03-17', 'sanjay', 'Approved', 'High',
    'Added a full-time ML engineer owning retrieval quality, evaluation, and embedding pipeline maintenance.',
    'Retrieval quality work was being done between feature sprints and consistently lost the prioritisation argument to shippable features.',
    ['Consultant on retainer — no continuity on a continuously moving benchmark', 'Keep splitting it across the team — the pattern that created the problem'],
    ['hiring', 'ml', 'quality']),

  d('embedding-model-upgrade', 'Upgraded the embedding model and reindexed the corpus', 'Engineering', '2026-03-24', 'lakshmi', 'Approved', 'Medium',
    'Migrated to a newer embedding model and reindexed all tenant corpora over a two-week rolling window.',
    'The new model improved recall by 7 points on the benchmark; rolling reindex kept every tenant searchable throughout the migration.',
    ['Stay on the existing model — leaves a measured 7-point recall gain unclaimed', 'Big-bang reindex — hours of degraded search across all tenants'],
    ['embeddings', 'migration', 'retrieval']),

  d('deprecate-legacy-api-v1', 'Deprecated the v1 public API with a six-month sunset', 'Engineering', '2026-04-07', 'priya', 'Approved', 'High',
    'Announced end-of-life for the v1 REST API with a six-month migration window to v2.',
    'Maintaining both surfaces doubled the integration test matrix; six months exceeded the longest integration rebuild our customers reported.',
    ['Indefinite v1 support — permanent double maintenance burden', 'Three-month sunset — shorter than two customers could realistically migrate in'],
    ['api', 'deprecation', 'versioning']),

  d('customer-advisory-board', 'Formed a customer advisory board', 'Partnerships', '2026-04-14', 'meera', 'Approved', 'Medium',
    'Convened six customers into a quarterly advisory board with early roadmap visibility.',
    'Roadmap decisions were being made from the loudest individual requests; the board gave us a weighted view across segments instead.',
    ['Individual quarterly calls — same time cost, no cross-customer synthesis', 'Public roadmap voting — dominated by the largest customer\'s user count'],
    ['customers', 'roadmap', 'advisory']),

  d('pricing-increase-2026', 'Raised list prices 18% for new customers', 'Business', '2026-04-21', 'mukesh', 'Approved', 'High',
    'Increased list pricing 18% for new contracts while grandfathering existing customers for their current term.',
    'Win rate at the old price was 61% — well above the 35-40% band that indicates correct pricing — and the product had added SSO, residency, and audit exports since.',
    ['Hold pricing — leaves margin on the table at a demonstrably high win rate', 'Raise for existing customers too — churn risk on the reference accounts'],
    ['pricing', 'revenue', 'strategy']),

  d('multi-tenant-isolation-audit', 'Commissioned an external multi-tenant isolation audit', 'Legal', '2026-05-05', 'daniel', 'Approved', 'High',
    'Engaged an external security firm to audit tenant isolation boundaries across the data and application layers.',
    'Shared-infrastructure isolation was the most common enterprise security question, and an internal assertion is not evidence to a security reviewer.',
    ['Internal review only — not accepted as evidence by enterprise reviewers', 'Wait for the SOC 2 auditor — narrower scope than tenant isolation specifically'],
    ['security', 'audit', 'multi-tenancy', 'enterprise']),

  d('support-tier-restructure', 'Restructured support into two tiers with published response times', 'Partnerships', '2026-05-12', 'meera', 'Approved', 'Medium',
    'Split support into standard and priority tiers with published, differentiated first-response targets.',
    'Undifferentiated support meant enterprise escalations queued behind trial-tier questions, which put two renewal conversations at risk.',
    ['Single support queue — enterprise escalations blocked behind trials', 'Three tiers — more complexity than our support volume justified'],
    ['support', 'sla', 'operations']),

  d('graph-export-formats', 'Shipped graph export in JSON-LD and CSV', 'Product', '2026-05-19', 'rithvik', 'Approved', 'Low',
    'Added exports of any subgraph in JSON-LD and flattened CSV for external analysis and archival.',
    'Customers asked for exports as an exit guarantee more than an analysis feature; providing it removed a lock-in objection during procurement.',
    ['No export — read as vendor lock-in in two procurement reviews', 'API-only export — required engineering effort from the customer'],
    ['export', 'interoperability', 'procurement']),

  d('ai-prefill-decision-form', 'Added AI pre-fill to the new decision trace form', 'Product', '2026-06-02', 'rithvik', 'Approved', 'Medium',
    'The decision creation form pre-fills summary, rationale, and tags from linked evidence, always editable before saving.',
    'Median time to record a decision was 7 minutes and most abandonment happened in the rationale field; pre-fill cut it to under 2 minutes.',
    ['Blank form — measured 7-minute median and high abandonment', 'Auto-save the AI draft without review — violates our human-in-the-loop rule'],
    ['ai', 'forms', 'productivity', 'human-in-the-loop']),

  d('edge-creation-ui', 'Shipped visual edge creation on the graph canvas', 'Product', '2026-06-09', 'arjun', 'Approved', 'Medium',
    'Users can link two nodes directly on the canvas and choose the relationship type in place.',
    'Relationships could only be created through forms, so the graph stayed sparse; canvas linking tripled edge creation in the first fortnight.',
    ['Form-only relationship creation — the pattern that kept the graph sparse', 'Auto-infer relationships — inference quality was below the human-review bar'],
    ['graph', 'editing', 'ux']),

  d('node-position-persistence', 'Persisted node positions per tenant', 'Engineering', '2026-06-16', 'priya', 'Approved', 'Low',
    'Manual node placements on the canvas are saved and restored per tenant rather than re-running auto-layout.',
    'Teams arranged their graphs meaningfully and lost the arrangement on reload, which they reported as data loss rather than a layout reset.',
    ['Auto-layout every load — deterministic but discards deliberate arrangement', 'Per-user positions — teams expect a shared canvas, not private views'],
    ['graph', 'persistence', 'ux']),

  d('chat-history-persistence', 'Persisted Why Chat conversation history', 'Engineering', '2026-06-23', 'priya', 'Approved', 'Medium',
    'Chat sessions and messages persist to the database with citations and confidence scores intact.',
    'Users treated an answer with citations as a durable record and lost it on refresh; the loss of the citation trail was the specific complaint.',
    ['Ephemeral chat — the behaviour users reported as broken', 'Browser-local history — invisible across devices and to auditors'],
    ['chat', 'persistence', 'history']),

  d('evidence-upload-review', 'Shipped evidence upload with human-reviewed entity suggestions', 'Product', '2026-06-30', 'rithvik', 'Approved', 'High',
    'Uploads are hashed, analysed for candidate entities, and require explicit confirmation before graph writes.',
    'This operationalises the earlier rejection of unattended extraction while still delivering the upload-to-graph moment that sells the product.',
    ['Automatic extraction on upload — previously rejected on accuracy grounds', 'Upload with no suggestions — loses the demo moment entirely'],
    ['upload', 'extraction', 'human-in-the-loop', 'evidence']),

  d('role-based-editing-gate', 'Gated all graph mutations behind the contributor role', 'Engineering', '2026-07-07', 'sanjay', 'Approved', 'High',
    'Viewers see a fully read-only interface with editing controls hidden rather than disabled-on-click.',
    'Viewers were clicking edit controls and receiving 403 errors, which read as broken software rather than as an intentional permission boundary.',
    ['Show controls and reject on submit — the behaviour users reported as broken', 'Separate read-only application — duplicate UI to maintain'],
    ['rbac', 'permissions', 'ux']),

  d('postgres-connection-resilience', 'Required the app to degrade gracefully when Postgres is unreachable', 'Engineering', '2026-07-14', 'sanjay', 'Approved', 'Medium',
    'Database outages fall back to a clearly-labelled degraded mode rather than returning 500 errors.',
    'A 20-minute database incident during a live pilot demo returned raw errors; a visible degraded banner keeps the session usable and honest.',
    ['Hard fail on database loss — worst possible demo and pilot experience', 'Silent fallback — indistinguishable from working, which caused the mock-data incident'],
    ['reliability', 'database', 'degradation']),

  d('observability-tracing', 'Added distributed tracing across the retrieval pipeline', 'Engineering', '2026-07-21', 'lakshmi', 'Approved', 'Medium',
    'Every query carries a trace through retrieval, reranking, and generation with per-stage latency attribution.',
    'Latency regressions were being debugged by guesswork; the first week of traces attributed 61% of p95 latency to a single unindexed lookup.',
    ['Aggregate metrics only — showed the regression, never the cause', 'Log-based debugging — the approach that made regressions take days'],
    ['observability', 'tracing', 'performance']),

  d('quarterly-security-training', 'Made security training a quarterly requirement', 'Legal', '2026-07-28', 'daniel', 'Approved', 'Low',
    'All staff complete security and data-handling training quarterly, tracked as a SOC 2 control.',
    'Annual training left an eleven-month gap during which the team more than doubled; quarterly cadence keeps new joiners within a quarter of coverage.',
    ['Annual training — control gap during a period of rapid hiring', 'Onboarding-only training — no refresh as controls changed'],
    ['security', 'training', 'soc2', 'compliance']),

  d('deprecate-density-executive', 'Merged executive density mode into a saved view', 'Design', '2026-08-04', 'arjun', 'Approved', 'Low',
    'Replaced the two hardcoded density modes with saveable named views that include density as one setting.',
    'Density was one of five things teams wanted to save together; generalising it removed a special case rather than adding a feature.',
    ['Keep both modes and add saved views — two overlapping mechanisms', 'Add more preset modes — the special case multiplied'],
    ['design', 'views', 'simplification']),

  d('multi-region-active', 'Ran EU and US regions active-active', 'Engineering', '2026-08-11', 'sanjay', 'Pending', 'High',
    'Proposed promoting the EU region from a residency-only deployment to active-active with the US region.',
    'Active-active would improve EU latency and provide regional failover, but cross-region consistency for the graph is unresolved and costed at one quarter.',
    ['Keep EU as residency-only — current state, no failover for EU tenants', 'Active-passive standby — cheaper, does not improve EU latency'],
    ['infrastructure', 'multi-region', 'pending', 'availability']),

  d('series-a-preparation', 'Began Series A preparation for Q1 2027', 'Business', '2026-08-18', 'tarun', 'Pending', 'Critical',
    'Started assembling the Series A data room and metrics narrative targeting a Q1 2027 raise.',
    'At current net revenue retention and pipeline growth the metrics support a raise, but the board wants two more quarters of enterprise cohort data first.',
    ['Raise now on current metrics — thinner enterprise cohort evidence', 'Delay to H2 2027 — runway floor breached before close'],
    ['fundraising', 'series-a', 'pending', 'board'])
];

// ============================================================
// DOCUMENT SPECS
// ============================================================

export type DocType = 'RFC' | 'ADR' | 'Postmortem' | 'Meeting' | 'Slack' | 'Audit' | 'PDF' | 'Email';

interface DocumentSpec {
  slug: string;
  title: string;
  type: DocType;
  date: string;
  author: string;
  dept: string;
  snippet: string;
  decision?: string;
}

const doc = (
  slug: string, title: string, type: DocType, date: string, author: string,
  dept: string, snippet: string, decision?: string
): DocumentSpec => ({ slug, title, type, date, author, dept, snippet, decision });

export const DOCUMENT_SPECS: DocumentSpec[] = [
  doc('inc-cert', 'Certificate of Incorporation — Aletheia Inc.', 'PDF', '2024-09-02', 'daniel', 'Legal',
    'Delaware C-Corporation, 10,000,000 authorised shares of common stock, par value $0.0001.', 'incorporate-entity'),
  doc('founder-agreement', 'Founders Agreement & Vesting Schedule', 'PDF', '2024-09-04', 'daniel', 'Legal',
    'Four-year vesting with a twelve-month cliff applies to all founder common stock without exception.', 'founder-equity-split'),
  doc('adr-001-frontend', 'ADR-001: Frontend Framework Selection', 'ADR', '2024-09-12', 'sanjay', 'Engineering',
    'Next.js App Router selected. Server components reduced initial JS payload from 312KB to 194KB in the prototype.', 'nextjs-frontend'),
  doc('adr-002-datastore', 'ADR-002: Primary Datastore Selection', 'ADR', '2024-09-18', 'sanjay', 'Engineering',
    'PostgreSQL selected. Recursive CTE traversal benchmarked at 41ms for 3-hop queries over 200k edges.', 'postgres-over-mongo'),
  doc('rfc-003-jsonb', 'RFC-003: Node Attribute Storage Strategy', 'RFC', '2024-09-20', 'priya', 'Engineering',
    'JSONB payloads accepted; node shape changed eleven times in six weeks, each of which would have required a migration.', 'jsonb-node-payload'),
  doc('adr-004-repo', 'ADR-004: Repository Structure', 'ADR', '2024-09-24', 'sanjay', 'Engineering',
    'Single Next.js application retained. Monorepo tooling overhead not justified below roughly eight engineers.', 'monorepo-single-app'),
  doc('research-confidence', 'Design Partner Research: Trust & Confidence Signals', 'PDF', '2024-10-01', 'rithvik', 'Product',
    'Seven of eight interviewees treated a hedged answer as a confident answer. Only outright refusal changed reported trust.', 'confidence-gate-core'),
  doc('adr-005-auth', 'ADR-005: Authentication Approach', 'ADR', '2024-10-08', 'sanjay', 'Engineering',
    'JWT with role claims. Session state avoided to keep route handlers stateless across regions.', 'jwt-auth-before-beta'),
  doc('llm-cost-model', 'LLM Vendor Cost Model — Hosted vs Self-Hosted', 'PDF', '2024-10-14', 'lakshmi', 'Engineering',
    'Self-hosting modelled at $1,904/month in GPU reservation against $61/month for hosted inference at projected volume.', 'gpt4o-mini-over-llama'),
  doc('rfc-006-streaming', 'RFC-006: Answer Streaming Transport', 'RFC', '2024-10-16', 'priya', 'Engineering',
    'SSE selected over websockets. Verified traversal of two pilot corporate proxies that block websocket upgrades.', 'sse-streaming'),
  doc('eval-harness-spec', 'Hallucination Evaluation Harness Specification', 'RFC', '2024-10-22', 'lakshmi', 'Engineering',
    '240 questions: 180 with known answers in corpus, 60 deliberately absent to measure refusal behaviour.', 'anti-hallucination-benchmark'),
  doc('bench-graph-vector', 'Benchmark: Graph-Bounded vs Pure Vector Retrieval', 'ADR', '2024-10-29', 'lakshmi', 'Engineering',
    'False citation rate fell from 28.4% to 0.8% when candidates were bounded to 2-hop graph neighbourhoods.', 'graph-bounded-retrieval'),
  doc('provenance-spec', 'Evidence Provenance & Hashing Specification', 'RFC', '2024-11-04', 'rithvik', 'Product',
    'SHA-256 computed at ingestion; hash displayed with every citation drawn from the document.', 'evidence-hash-provenance'),
  doc('positioning-memo', 'Positioning Memo: Why Confidence, Not Search', 'PDF', '2024-11-08', 'tarun', 'Executive',
    'Competitors compete on recall. None will publish a number and refuse to answer below it.', 'confidence-scoring-differentiator'),
  doc('pricing-interviews', 'Pricing Interview Synthesis — 11 Organisations', 'PDF', '2024-11-15', 'mukesh', 'Finance',
    'Three of four pilots said per-seat counting would cap invitations and therefore cap adoption.', 'per-org-seat-pricing'),
  doc('design-tokens-v1', 'ALETHEIA Design Token Specification v1', 'RFC', '2024-11-19', 'arjun', 'Design',
    'Single token set for surface, ink and accent. Dark-first with light derived from identical ramps.', 'design-system-tokens'),
  doc('adr-007-canvas', 'ADR-007: Graph Canvas Implementation', 'ADR', '2024-11-26', 'arjun', 'Design',
    'Bespoke SVG selected. Dissent recorded from engineering on long-term maintenance cost.', 'graph-canvas-svg'),
  doc('yc-application', 'Y Combinator W25 Application Draft', 'PDF', '2024-12-02', 'tarun', 'Executive',
    'Two signed design partners; confidence-gated institutional memory for regulated organisations.', 'yc-w25-application'),
  doc('design-partner-agreement', 'Design Partner Agreement Template', 'PDF', '2024-12-06', 'meera', 'Go-To-Market',
    'Unpaid access in exchange for weekly structured feedback sessions and named-reference rights.', 'two-design-partners'),
  doc('ip-assignment', 'IP Assignment & Confidentiality Agreements (Executed)', 'PDF', '2024-12-10', 'daniel', 'Legal',
    'Coverage backdated to first commit for all founders and both contractors.', 'ip-assignment-agreements'),
  doc('rfc-008-audit-log', 'RFC-008: Append-Only Audit Log', 'RFC', '2025-01-08', 'sanjay', 'Engineering',
    'UPDATE and DELETE revoked for the application role on audit tables at the database level.', 'audit-log-immutable'),
  doc('rbac-spec', 'Role Model Specification: Viewer / Contributor / Admin', 'RFC', '2025-01-14', 'rithvik', 'Product',
    'All eight interviewed organisations mapped cleanly onto three roles with no requested fourth.', 'rbac-three-roles'),
  doc('slack-noise-analysis', 'Slack Ingestion Signal-to-Noise Analysis', 'PDF', '2025-01-21', 'lakshmi', 'Engineering',
    'Slack-derived passages scored lowest of all sources on citation precision in benchmark testing.', 'drop-slack-connector-v1'),
  doc('pilot-contract-1', 'Paid Pilot Agreement — Design Partner One', 'PDF', '2025-02-03', 'meera', 'Go-To-Market',
    'Six-month pilot, $18,000 total, with a defined success criterion of 40 recorded decisions.', 'first-paid-pilot'),
  doc('soc2-readiness', 'SOC 2 Type I Readiness Assessment', 'Audit', '2025-02-11', 'daniel', 'Legal',
    'Eleven of nineteen controls already satisfied; access review and change management identified as gaps.', 'soc2-type1-commitment'),
  doc('dpa-template', 'Standard Data Processing Agreement Template', 'PDF', '2025-02-18', 'daniel', 'Legal',
    'Uniform 72-hour breach notification window applied to all subprocessors.', 'vendor-dpa-standardisation'),
  doc('hiring-scorecard-fe', 'Founding Engineer Hiring Scorecard & Debrief', 'PDF', '2025-02-24', 'sanjay', 'Engineering',
    'Traversal performance depth weighted at 40% of the scorecard, above general seniority.', 'hire-founding-engineer'),
  doc('work-sample-spec', 'Paid Work Sample Specification & Rubric', 'RFC', '2025-03-03', 'sanjay', 'Engineering',
    'Four hours, paid at market contractor rate, on a realistic retrieval scoping problem.', 'interview-work-sample'),
  doc('remote-policy', 'Remote-First Working Policy', 'PDF', '2025-03-10', 'tarun', 'Executive',
    'Fully distributed with one company-funded in-person week per quarter for planning.', 'remote-first-policy'),
  doc('rate-limit-spec', 'Guest Access Rate Limiting Specification', 'RFC', '2025-03-17', 'priya', 'Engineering',
    'Twenty grounded queries per hour per IP for unauthenticated demo sessions.', 'rate-limit-guest-chat'),
  doc('postmortem-provider', 'Postmortem: Provider Quota Exhaustion During Demo', 'Postmortem', '2025-03-24', 'priya', 'Engineering',
    'Raw 429 surfaced to the user during a live pilot demo. Fallback path did not exist at the time.', 'graceful-llm-degradation'),
  doc('usage-analytics-mobile', 'Platform Usage Analysis — Desktop vs Mobile', 'PDF', '2025-04-01', 'rithvik', 'Product',
    '96.2% of sessions on desktop; mobile sessions averaged 41 seconds against 14 minutes on desktop.', 'drop-mobile-app'),
  doc('oss-license-review', 'Open Source Release Review — Evaluation Harness', 'PDF', '2025-04-08', 'daniel', 'Legal',
    'Apache 2.0 approved for the harness. Dataset withheld as it contains partner-derived content.', 'open-source-eval-harness'),
  doc('seed-term-sheet', 'Seed Round Term Sheet — Executed', 'PDF', '2025-04-21', 'tarun', 'Executive',
    '$2.4M post-money SAFE at a $16M cap with a pro-rata side letter for the lead.', 'seed-round-close'),
  doc('runway-model', 'Runway Model & Spending Constraint Policy', 'PDF', '2025-04-28', 'mukesh', 'Finance',
    'All commitments must preserve 24 months of runway at signature under the base-case model.', 'runway-24-months'),
  doc('adr-009-pgvector', 'ADR-009: Vector Storage Location', 'ADR', '2025-05-06', 'sanjay', 'Engineering',
    'pgvector retained. p95 retrieval 74ms at 1.8M vectors, inside the 150ms interaction budget.', 'pgvector-over-qdrant'),
  doc('reranker-eval', 'Cross-Encoder Reranker Evaluation Results', 'PDF', '2025-05-13', 'lakshmi', 'Engineering',
    'Answer-level precision improved 11 points for 40ms of added p95 latency.', 'reranker-cross-encoder'),
  doc('citation-ux-study', 'Citation Verification Usability Study', 'PDF', '2025-05-20', 'arjun', 'Design',
    'Median 94 seconds to locate a cited passage within a linked document before deep-linking existed.', 'citation-click-to-source'),
  doc('timeline-requirements', 'Timeline View Requirements from Audit Interviews', 'PDF', '2025-06-02', 'rithvik', 'Product',
    'Auditors consistently asked what was known at the time of the decision, not what was decided.', 'timeline-view'),
  doc('contested-status-rfc', 'RFC-010: Contested Decision Status', 'RFC', '2025-06-09', 'rithvik', 'Product',
    'Contested status introduced for decisions with unreconciled conflicting evidence.', 'contested-status'),
  doc('extraction-accuracy', 'Automatic Extraction Accuracy Assessment', 'Audit', '2025-06-16', 'lakshmi', 'Engineering',
    'Unattended extraction produced 23% incorrect entities on a 400-document sample, most of them plausible.', 'drop-auto-extraction'),
  doc('csv-import-spec', 'CSV Bulk Import Mapping Specification', 'RFC', '2025-06-23', 'priya', 'Engineering',
    'Column mapping with a dry-run preview before any write to the graph.', 'bulk-import-csv'),
  doc('saml-requirements', 'Enterprise SSO Requirements Summary', 'PDF', '2025-07-07', 'sanjay', 'Engineering',
    'SAML appeared as a hard requirement in four of four enterprise security questionnaires.', 'sso-saml-enterprise'),
  doc('eu-residency-plan', 'EU Data Residency Implementation Plan', 'RFC', '2025-07-14', 'daniel', 'Legal',
    'Frankfurt region with tenant-pinned storage and no cross-region replication of customer content.', 'data-residency-eu'),
  doc('design-lead-scorecard', 'Design Lead Hiring Debrief', 'PDF', '2025-07-21', 'rithvik', 'Product',
    'Continuous iteration against recorded user sessions weighted above portfolio breadth.', 'hire-design-lead'),
  doc('theme-usage-data', 'Beta Theme Preference Telemetry', 'PDF', '2025-07-28', 'arjun', 'Design',
    '87% of beta users retained the default dark theme across the full beta period.', 'dark-mode-default'),
  doc('wcag-audit', 'WCAG 2.1 AA Contrast Audit Report', 'Audit', '2025-08-04', 'arjun', 'Design',
    'Fourteen contrast failures identified and remediated, eleven of them in secondary text on elevated surfaces.', 'accessibility-contrast-audit'),
  doc('density-research', 'Executive vs Analyst Graph Density Research', 'PDF', '2025-08-11', 'arjun', 'Design',
    'Executives requested fewer than 12 visible nodes; analysts requested every connected node.', 'graph-density-modes'),
  doc('ingest-queue-rfc', 'RFC-011: Asynchronous Ingestion Queue', 'RFC', '2025-08-18', 'priya', 'Engineering',
    'Synchronous ingest timed out above roughly 1,400 documents in a single import.', 'deprecate-rest-ingest'),
  doc('postmortem-outage', 'Postmortem: Four-Hour LLM Provider Outage', 'Postmortem', '2025-09-01', 'sanjay', 'Engineering',
    'Answer layer fully unavailable for 3h52m. Single-vendor dependency identified as the root cause.', 'multi-provider-llm'),
  doc('extension-metrics', 'Browser Extension Prototype Metrics', 'PDF', '2025-09-08', 'rithvik', 'Product',
    'Capture rate 0.4 decisions per user per week against a 4.0 threshold for continued investment.', 'kill-browser-extension'),
  doc('soc2-type2-plan', 'SOC 2 Type II Observation Window Plan', 'Audit', '2025-09-22', 'daniel', 'Legal',
    'Six-month observation window opened September 2025 with continuous control monitoring.', 'soc2-type2-window'),
  doc('dual-key-analysis', 'Dual-Key Encryption Recovery Impact Analysis', 'Audit', '2025-09-29', 'sanjay', 'Engineering',
    'Modelled disaster-recovery MTTR rises from 45 minutes to 3.5 hours when a customer key server is unreachable.', 'dual-key-encryption'),
  doc('enterprise-packaging', 'Enterprise Tier Packaging Analysis', 'PDF', '2025-10-06', 'mukesh', 'Finance',
    'The three most-demanded enterprise features were among the four cheapest to deliver.', 'enterprise-tier-pricing'),
  doc('sla-definition', 'Enterprise Support SLA Definition', 'PDF', '2025-10-13', 'meera', 'Go-To-Market',
    'Four-hour first response during business hours with a named support contact per account.', 'named-support-sla'),
  doc('grc-partnership', 'GRC Platform Referral Partnership Agreement', 'PDF', '2025-10-20', 'meera', 'Go-To-Market',
    'Mutual referral with a 12% first-year revenue share in both directions.', 'partner-with-grc-vendor'),
  doc('acquisition-inquiry', 'Inbound Acquisition Inquiry — Board Memo', 'Meeting', '2025-10-27', 'tarun', 'Executive',
    'Informal approach at approximately $19M. Board consensus to decline and continue independently.', 'reject-acquisition-inquiry'),
  doc('gtm-hire-case', 'Hiring Sequence Analysis: GTM vs Engineering', 'PDF', '2025-11-03', 'tarun', 'Executive',
    'Founder-led sales saturated at approximately six qualified conversations per week.', 'hire-gtm-lead'),
  doc('q4-decision-review', 'Q4 2025 Internal Decision Review Minutes', 'Meeting', '2025-11-10', 'tarun', 'Executive',
    'Four product gaps identified through dogfooding, including the absence of a reversal relationship.', 'quarterly-decision-review'),
  doc('reverses-edge-rfc', 'RFC-012: REVERSES Relationship Type', 'RFC', '2025-11-17', 'priya', 'Engineering',
    'Reversal separated from contradiction; conflating them distorted confidence calculation.', 'reverses-edge-type'),
  doc('mobile-approval-research', 'Approval Latency Research', 'PDF', '2025-11-24', 'rithvik', 'Product',
    'Median approval latency 3.2 days, with travelling approvers accounting for most of the delay.', 'reverse-mobile-decision'),
  doc('on-prem-analysis', 'On-Premise Deployment Feasibility Analysis', 'PDF', '2025-12-01', 'sanjay', 'Engineering',
    'Release fork plus dedicated support engineering estimated at 1.5 FTE ongoing.', 'drop-on-prem-tier'),
  doc('churn-analysis-2025', 'Contract Term vs Retention Analysis', 'PDF', '2025-12-08', 'mukesh', 'Finance',
    'Monthly contracts churned at 3.1x the rate of annual contracts in the pilot cohort.', 'annual-contract-default'),
  doc('bug-bounty-policy', 'Private Bug Bounty Programme Policy', 'PDF', '2025-12-15', 'sanjay', 'Engineering',
    'Invite-only with a fixed reward schedule from $250 to $5,000 by severity.', 'security-bug-bounty'),
  doc('launch-readiness', 'Public Launch Readiness Review', 'Meeting', '2026-01-13', 'tarun', 'Executive',
    'Confidence gate held above the quality bar for two consecutive quarters. Launch approved.', 'public-launch'),
  doc('analytics-privacy-review', 'Product Analytics Privacy Review', 'Audit', '2026-01-20', 'daniel', 'Legal',
    'Event types and aggregate timings only. Query text and document content explicitly excluded.', 'usage-analytics-privacy'),
  doc('confidence-ui-study', 'Confidence Transparency Usability Study', 'PDF', '2026-01-27', 'arjun', 'Design',
    'An opaque score tested as less trusted than showing no score at all.', 'confidence-breakdown-ui'),
  doc('admin-requirements', 'Data Stewardship Requirements', 'RFC', '2026-02-03', 'rithvik', 'Product',
    'Corrections previously required direct database access, which itself broke the audit narrative.', 'admin-dashboard'),
  doc('perf-large-graph', 'Large Graph Rendering Performance Analysis', 'PDF', '2026-02-10', 'sanjay', 'Engineering',
    'Initial render 6.2 seconds at 40,000 nodes, producing an unreadable view even once loaded.', 'query-driven-loading'),
  doc('search-benchmark', 'PostgreSQL Full-Text Search Benchmark', 'PDF', '2026-02-17', 'priya', 'Engineering',
    'p95 31ms across the largest tenant corpus using GIN indexes over generated tsvectors.', 'search-full-text-postgres'),
  doc('mock-data-incident', 'Postmortem: Mock Data Shown in Prospect Demo', 'Postmortem', '2026-02-24', 'meera', 'Go-To-Market',
    'Silent fallback to bundled sample data during an empty-database state went unnoticed for two demos.', 'deprecate-mock-store'),
  doc('demo-tenant-spec', 'Seeded Demo Tenant Specification', 'RFC', '2026-03-03', 'meera', 'Go-To-Market',
    'Explicitly labelled demo tenant with representative data and no production customer content.', 'seeded-demo-tenant'),
  doc('virtualisation-rfc', 'RFC-013: Canvas Viewport Virtualisation', 'RFC', '2026-03-10', 'arjun', 'Design',
    'Frame time exceeded 90ms during pan above roughly 500 visible nodes.', 'graph-virtualisation'),
  doc('ml-hire-case', 'ML Engineer Hiring Justification', 'PDF', '2026-03-17', 'sanjay', 'Engineering',
    'Retrieval quality work lost the prioritisation argument in six of seven sprint plannings.', 'hire-ml-engineer'),
  doc('embedding-migration', 'Embedding Model Migration Plan', 'RFC', '2026-03-24', 'lakshmi', 'Engineering',
    'Rolling reindex across a two-week window keeping every tenant continuously searchable.', 'embedding-model-upgrade'),
  doc('api-v1-sunset', 'API v1 Sunset Notice & Migration Guide', 'PDF', '2026-04-07', 'priya', 'Engineering',
    'Six-month window; longest reported customer integration rebuild was eleven weeks.', 'deprecate-legacy-api-v1'),
  doc('cab-charter', 'Customer Advisory Board Charter', 'PDF', '2026-04-14', 'meera', 'Go-To-Market',
    'Six customers across three segments meeting quarterly with early roadmap visibility.', 'customer-advisory-board'),
  doc('win-rate-analysis', 'Win Rate & Price Sensitivity Analysis', 'PDF', '2026-04-21', 'mukesh', 'Finance',
    'Win rate of 61% sits well above the 35-40% band that indicates correctly-set pricing.', 'pricing-increase-2026'),
  doc('isolation-audit', 'External Multi-Tenant Isolation Audit Report', 'Audit', '2026-05-05', 'daniel', 'Legal',
    'No cross-tenant data access paths identified. Two hardening recommendations accepted.', 'multi-tenant-isolation-audit'),
  doc('support-restructure', 'Support Tier Restructure Proposal', 'PDF', '2026-05-12', 'meera', 'Go-To-Market',
    'Enterprise escalations queued behind trial-tier questions in 34% of measured cases.', 'support-tier-restructure'),
  doc('export-formats-rfc', 'RFC-014: Graph Export Formats', 'RFC', '2026-05-19', 'rithvik', 'Product',
    'JSON-LD for semantic fidelity and flattened CSV for spreadsheet analysis.', 'graph-export-formats'),
  doc('prefill-study', 'Decision Entry Time & Abandonment Study', 'PDF', '2026-06-02', 'rithvik', 'Product',
    'Median 7 minutes to record a decision, with most abandonment occurring in the rationale field.', 'ai-prefill-decision-form'),
  doc('edge-ui-spec', 'Canvas Edge Creation Interaction Specification', 'RFC', '2026-06-09', 'arjun', 'Design',
    'Two-click linking with in-place relationship type selection on the canvas.', 'edge-creation-ui'),
  doc('position-persistence-rfc', 'RFC-015: Node Position Persistence', 'RFC', '2026-06-16', 'priya', 'Engineering',
    'Positions stored per tenant on the node payload; users reported layout loss as data loss.', 'node-position-persistence'),
  doc('chat-history-rfc', 'RFC-016: Chat Session Persistence', 'RFC', '2026-06-23', 'priya', 'Engineering',
    'Sessions and messages persisted with citations and confidence scores retained intact.', 'chat-history-persistence'),
  doc('upload-flow-spec', 'Evidence Upload & Suggestion Review Flow', 'RFC', '2026-06-30', 'rithvik', 'Product',
    'Hash on upload, suggest candidates, require explicit confirmation before any graph write.', 'evidence-upload-review'),
  doc('rbac-ux-review', 'Read-Only Experience Review', 'PDF', '2026-07-07', 'arjun', 'Design',
    'Viewers clicking hidden-permission controls received 403 errors interpreted as software faults.', 'role-based-editing-gate'),
  doc('db-resilience-rfc', 'RFC-017: Database Degradation Behaviour', 'RFC', '2026-07-14', 'sanjay', 'Engineering',
    'Visible degraded-mode banner required. Silent fallback explicitly prohibited after the demo incident.', 'postgres-connection-resilience'),
  doc('tracing-rollout', 'Distributed Tracing Rollout Report', 'PDF', '2026-07-21', 'lakshmi', 'Engineering',
    'First week of traces attributed 61% of p95 latency to a single unindexed metadata lookup.', 'observability-tracing'),
  doc('training-policy', 'Quarterly Security Training Policy', 'PDF', '2026-07-28', 'daniel', 'Legal',
    'Quarterly cadence adopted; headcount more than doubled during the previous annual gap.', 'quarterly-security-training'),
  doc('saved-views-rfc', 'RFC-018: Saved Graph Views', 'RFC', '2026-08-04', 'arjun', 'Design',
    'Density generalised into saved named views alongside filters, layout and focus.', 'deprecate-density-executive'),
  doc('multi-region-proposal', 'Active-Active Multi-Region Proposal', 'RFC', '2026-08-11', 'sanjay', 'Engineering',
    'Cross-region graph consistency unresolved; one quarter of engineering estimated.', 'multi-region-active'),
  doc('series-a-deck', 'Series A Narrative & Metrics Pack (Draft)', 'PDF', '2026-08-18', 'tarun', 'Executive',
    'Board requested two additional quarters of enterprise cohort data before opening the round.', 'series-a-preparation'),
  // Standalone institutional documents (no single owning decision)
  doc('board-minutes-2025q2', 'Board Meeting Minutes — Q2 2025', 'Meeting', '2025-06-30', 'george', 'Board',
    'Board reviewed pilot conversion, SOC 2 progress, and approved the post-seed hiring plan.'),
  doc('board-minutes-2025q4', 'Board Meeting Minutes — Q4 2025', 'Meeting', '2025-12-18', 'george', 'Board',
    'Acquisition inquiry declined by consensus. Enterprise tier performance reviewed against plan.'),
  doc('board-minutes-2026q2', 'Board Meeting Minutes — Q2 2026', 'Meeting', '2026-06-30', 'george', 'Board',
    'Launch metrics reviewed. Series A timing deferred pending two further quarters of cohort data.'),
  doc('eng-handbook', 'Engineering Handbook & Review Standards', 'RFC', '2025-05-01', 'sanjay', 'Engineering',
    'Two approving reviews required for schema changes; one for application-layer changes.'),
  doc('incident-response-plan', 'Incident Response Plan', 'PDF', '2025-09-15', 'sanjay', 'Engineering',
    'Severity ladder, on-call rotation, and a 24-hour customer communication commitment for Sev-1.'),
  doc('data-retention-policy', 'Data Retention & Deletion Policy', 'PDF', '2025-11-05', 'daniel', 'Legal',
    'Customer content deleted within 30 days of termination; audit metadata retained for seven years.'),
  doc('brand-guidelines', 'ALETHEIA Brand & Voice Guidelines', 'PDF', '2025-10-01', 'arjun', 'Design',
    'Plain, precise language. No superlatives in product copy. Confidence claims must carry a number.'),
  doc('competitive-landscape', 'Competitive Landscape Review 2026', 'PDF', '2026-04-01', 'meera', 'Go-To-Market',
    'Nine competitors reviewed; none publish a refusal threshold or expose a confidence breakdown.'),
  doc('okr-2026-h1', 'Company OKRs — H1 2026', 'PDF', '2026-01-06', 'tarun', 'Executive',
    'Three objectives: launch publicly, reach $500k ARR, and complete SOC 2 Type II.'),
  doc('okr-2026-h2', 'Company OKRs — H2 2026', 'PDF', '2026-07-01', 'tarun', 'Executive',
    'Three objectives: enterprise cohort proof, retrieval quality above benchmark, Series A readiness.')
];

// ============================================================
// EVENT SPECS
// ============================================================

type EventKind = 'milestone' | 'incident' | 'meeting' | 'launch' | 'funding' | 'hiring';

interface EventSpec {
  slug: string;
  title: string;
  date: string;
  actor: string;
  kind: EventKind;
  description: string;
  decision?: string;
}

const ev = (
  slug: string, title: string, date: string, actor: string,
  kind: EventKind, description: string, decision?: string
): EventSpec => ({ slug, title, date, actor, kind, description, decision });

export const EVENT_SPECS: EventSpec[] = [
  ev('first-commit', 'First commit to the Aletheia repository', '2024-09-06', 'sanjay', 'milestone',
    'Initial Next.js scaffold committed, establishing the codebase that became the production application.'),
  ev('founding-offsite', 'Founding team offsite — thesis lock-in', '2024-09-08', 'tarun', 'meeting',
    'Four-day offsite where the institutional memory thesis and confidence-gating principle were agreed.', 'confidence-gate-core'),
  ev('first-prototype', 'First working retrieval prototype', '2024-10-05', 'priya', 'milestone',
    'End-to-end query to grounded answer with citations working against a 200-document corpus.'),
  ev('benchmark-baseline', 'First hallucination benchmark baseline recorded', '2024-10-24', 'lakshmi', 'milestone',
    'Baseline of 28.4% false citation rate established on the 240-question evaluation set.', 'anti-hallucination-benchmark'),
  ev('graph-bounding-result', 'Graph bounding cuts false citations to 0.8%', '2024-10-31', 'lakshmi', 'milestone',
    'The result that defined the product thesis and became the central claim in all positioning.', 'graph-bounded-retrieval'),
  ev('first-demo-partner', 'First external product demonstration', '2024-11-12', 'rithvik', 'meeting',
    'Demonstration to the fintech that later became design partner one and the first paying customer.'),
  ev('yc-submitted', 'YC W25 application submitted', '2024-12-02', 'tarun', 'milestone',
    'Application filed with two signed design partners and a working confidence-gated prototype.', 'yc-w25-application'),
  ev('yc-rejected', 'YC W25 application declined', '2025-01-06', 'tarun', 'milestone',
    'Application unsuccessful. Team elected to raise a traditional seed round instead.'),
  ev('beta-open', 'Private beta opened to first cohort', '2025-01-27', 'rithvik', 'launch',
    'Twelve organisations admitted to the private beta behind authenticated access.', 'jwt-auth-before-beta'),
  ev('first-revenue', 'First revenue recognised', '2025-02-05', 'mukesh', 'milestone',
    'First pilot invoice issued and paid, marking the transition from unpaid partnerships to revenue.', 'first-paid-pilot'),
  ev('priya-joins', 'Priya Nandakumar joins as founding engineer', '2025-03-01', 'sanjay', 'hiring',
    'First non-founder hire, taking ownership of graph traversal and the confidence pipeline.', 'hire-founding-engineer'),
  ev('demo-failure-incident', 'Live demo failure from provider quota exhaustion', '2025-03-20', 'priya', 'incident',
    'A raw 429 error surfaced mid-demo to a prospect, directly triggering the graceful degradation requirement.', 'graceful-llm-degradation'),
  ev('seed-closed', 'Seed round closed and funds received', '2025-04-21', 'tarun', 'funding',
    '$2.4M received, extending runway past 30 months and funding the SOC 2 programme.', 'seed-round-close'),
  ev('soc2-type1-issued', 'SOC 2 Type I report issued', '2025-05-28', 'daniel', 'milestone',
    'Type I report received, unblocking enterprise security questionnaires that had stalled three deals.', 'soc2-type1-commitment'),
  ev('tenth-customer', 'Tenth paying customer signed', '2025-06-26', 'meera', 'milestone',
    'Reached ten paying organisations, crossing the threshold the board set for the post-seed hiring plan.'),
  ev('arjun-joins', 'Arjun Deshpande joins as design lead', '2025-08-01', 'rithvik', 'hiring',
    'Design brought in-house, ending the agency retainer arrangement.', 'hire-design-lead'),
  ev('provider-outage', 'Four-hour LLM provider outage', '2025-08-27', 'sanjay', 'incident',
    'Complete answer-layer unavailability for 3h52m, triggering the multi-provider architecture decision.', 'multi-provider-llm'),
  ev('meera-joins', 'Meera Subramanian joins as head of GTM', '2025-11-17', 'tarun', 'hiring',
    'First dedicated go-to-market hire, taking over the pipeline from founder-led sales.', 'hire-gtm-lead'),
  ev('hundred-k-arr', '$100k ARR crossed', '2025-12-19', 'mukesh', 'milestone',
    'Annual recurring revenue passed $100,000 across fourteen paying organisations.'),
  ev('public-launch-day', 'Public launch day', '2026-01-13', 'tarun', 'launch',
    'General availability opened with self-serve signup. 340 signups in the first week.', 'public-launch'),
  ev('lakshmi-joins', 'Lakshmi Venkatesan joins as ML engineer', '2026-04-01', 'sanjay', 'hiring',
    'Dedicated ownership of retrieval quality and the evaluation harness.', 'hire-ml-engineer'),
  ev('soc2-type2-issued', 'SOC 2 Type II report issued', '2026-04-30', 'daniel', 'milestone',
    'Type II report received after the six-month observation window, unblocking three enterprise renewals.', 'soc2-type2-window'),
  ev('five-hundred-k-arr', '$500k ARR crossed', '2026-06-15', 'mukesh', 'milestone',
    'Annual recurring revenue passed $500,000, meeting the H1 2026 company objective.'),
  ev('db-outage-pilot', 'Database outage during a pilot session', '2026-07-09', 'sanjay', 'incident',
    'A 20-minute PostgreSQL incident returned raw errors to a pilot user, prompting the degraded-mode requirement.', 'postgres-connection-resilience'),
  ev('first-enterprise-renewal', 'First enterprise renewal signed', '2026-08-03', 'meera', 'milestone',
    'The first enterprise customer renewed at an expanded seat count following the Type II report.'),
  // Recurring governance events
  ev('board-q1-2025', 'Board meeting — Q1 2025', '2025-03-31', 'george', 'meeting',
    'Reviewed beta cohort engagement, SOC 2 readiness, and approved the seed fundraising process.'),
  ev('board-q2-2025', 'Board meeting — Q2 2025', '2025-06-30', 'george', 'meeting',
    'Reviewed pilot conversion and approved the post-seed hiring plan prioritising GTM.'),
  ev('board-q3-2025', 'Board meeting — Q3 2025', '2025-09-30', 'george', 'meeting',
    'Reviewed the provider outage postmortem and endorsed multi-provider redundancy.'),
  ev('board-q4-2025', 'Board meeting — Q4 2025', '2025-12-18', 'george', 'meeting',
    'Declined the acquisition inquiry by consensus and approved the 2026 launch plan.', 'reject-acquisition-inquiry'),
  ev('board-q1-2026', 'Board meeting — Q1 2026', '2026-03-31', 'george', 'meeting',
    'Reviewed launch metrics against plan and approved the 2026 pricing increase.'),
  ev('board-q2-2026', 'Board meeting — Q2 2026', '2026-06-30', 'george', 'meeting',
    'Deferred Series A timing pending two further quarters of enterprise cohort data.', 'series-a-preparation'),
  ev('offsite-2025-h1', 'Company offsite — H1 2025 planning', '2025-02-17', 'tarun', 'meeting',
    'Quarterly in-person week covering roadmap sequencing and the enterprise compliance strategy.', 'remote-first-policy'),
  ev('offsite-2025-h2', 'Company offsite — H2 2025 planning', '2025-08-25', 'tarun', 'meeting',
    'Planning week that produced the enterprise tier packaging and the SLA commitment.'),
  ev('offsite-2026-h1', 'Company offsite — H1 2026 planning', '2026-02-16', 'tarun', 'meeting',
    'Launch preparation week covering support readiness, pricing, and the admin tooling scope.'),
  ev('decision-review-q4-2025', 'Internal decision review — Q4 2025', '2025-11-10', 'tarun', 'meeting',
    'First dogfooding review of our own decision ledger, surfacing four product gaps.', 'quarterly-decision-review'),
  ev('decision-review-q1-2026', 'Internal decision review — Q1 2026', '2026-03-09', 'rithvik', 'meeting',
    'Reviewed 34 decisions; reversed the mobile deferral and confirmed the on-premise rejection.'),
  ev('decision-review-q2-2026', 'Internal decision review — Q2 2026', '2026-06-08', 'rithvik', 'meeting',
    'Reviewed 41 decisions; flagged the graph canvas build-vs-buy decision as still contested.'),
  ev('pentest-2025', 'External penetration test conducted', '2025-10-14', 'sanjay', 'milestone',
    'Third-party penetration test with two medium findings, both remediated within the fortnight.'),
  ev('pentest-2026', 'External penetration test conducted', '2026-05-19', 'sanjay', 'milestone',
    'Annual penetration test with one low finding, remediated before the report was finalised.'),
  ev('gdpr-review-2025', 'GDPR compliance review completed', '2025-07-30', 'daniel', 'milestone',
    'Full data-flow mapping completed ahead of the EU residency launch.', 'data-residency-eu'),
  ev('eu-region-live', 'EU (Frankfurt) region went live', '2025-08-29', 'sanjay', 'launch',
    'Frankfurt region opened with tenant-pinned storage, unblocking two stalled enterprise deals.', 'data-residency-eu'),
  ev('sso-first-customer', 'First customer onboarded via SAML SSO', '2025-07-28', 'priya', 'milestone',
    'Enterprise identity integration validated end-to-end against a production identity provider.', 'sso-saml-enterprise'),
  ev('bounty-first-finding', 'First bug bounty finding triaged', '2026-01-08', 'sanjay', 'incident',
    'An authorisation bypass in the export endpoint was reported and patched within 36 hours.', 'security-bug-bounty'),
  ev('api-v2-release', 'Public API v2 released', '2026-04-07', 'priya', 'launch',
    'v2 released alongside the v1 sunset notice and a published migration guide.', 'deprecate-legacy-api-v1'),
  ev('cab-first-session', 'First customer advisory board session', '2026-05-06', 'meera', 'meeting',
    'Six customers convened; export formats and saved views emerged as the top cross-segment requests.', 'customer-advisory-board')
];

// ============================================================
// DERIVATION HELPERS
// ============================================================

/** Stable non-cryptographic hash so derived values never change between runs. */
const hashString = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

/** Deterministic pseudo-SHA-256 for demo provenance display. */
const fakeHash = (seed: string): string => {
  let out = '';
  for (let i = 0; out.length < 64; i++) {
    out += hashString(`${seed}:${i}`).toString(16).padStart(8, '0');
  }
  return `sha256:${out.slice(0, 64)}`;
};

const STATUS_PROFILE: Record<DecisionStatus, ConfidenceBreakdown> = {
  Approved: { evidenceCoverage: 92, sourceReliability: 90, attribution: 98, temporalConsistency: 88, approvalCompleteness: 95 },
  Confirmed: { evidenceCoverage: 94, sourceReliability: 92, attribution: 100, temporalConsistency: 90, approvalCompleteness: 96 },
  Pending: { evidenceCoverage: 72, sourceReliability: 76, attribution: 85, temporalConsistency: 70, approvalCompleteness: 42 },
  Contested: { evidenceCoverage: 68, sourceReliability: 64, attribution: 80, temporalConsistency: 52, approvalCompleteness: 38 },
  Deprecated: { evidenceCoverage: 80, sourceReliability: 82, attribution: 90, temporalConsistency: 74, approvalCompleteness: 70 }
};

const breakdownFor = (slug: string, status: DecisionStatus): ConfidenceBreakdown => {
  const base = STATUS_PROFILE[status];
  const jitter = (field: string, spread: number) => ((hashString(slug + field) % (spread * 2 + 1)) - spread);
  const clamp = (n: number) => Math.max(20, Math.min(100, n));
  return {
    evidenceCoverage: clamp(base.evidenceCoverage + jitter('ec', 6)),
    sourceReliability: clamp(base.sourceReliability + jitter('sr', 6)),
    attribution: clamp(base.attribution + jitter('at', 4)),
    temporalConsistency: clamp(base.temporalConsistency + jitter('tc', 8)),
    approvalCompleteness: clamp(base.approvalCompleteness + jitter('ap', 8))
  };
};

export const scoreOf = (b: ConfidenceBreakdown): number =>
  Math.round(
    b.evidenceCoverage * 0.35 +
    b.sourceReliability * 0.25 +
    b.attribution * 0.2 +
    b.temporalConsistency * 0.1 +
    b.approvalCompleteness * 0.1
  );

const initialsOf = (name: string) =>
  name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();

const CATEGORY_DEPARTMENT: Record<DecisionCategory, string> = {
  Engineering: 'Engineering',
  Product: 'Product',
  Design: 'Design',
  Business: 'Executive & Strategy',
  Hiring: 'People & Talent',
  Legal: 'Legal & Compliance',
  Partnerships: 'Go-To-Market'
};

/** Clustered grid layout: each entity family occupies its own band of canvas. */
const layoutFor = (family: 'person' | 'decision' | 'document' | 'event', index: number) => {
  const bands = {
    person: { x0: 120, y0: 120, cols: 5, dx: 260, dy: 170 },
    decision: { x0: 120, y0: 520, cols: 10, dx: 250, dy: 190 },
    document: { x0: 180, y0: 2400, cols: 10, dx: 250, dy: 180 },
    event: { x0: 150, y0: 4400, cols: 8, dx: 260, dy: 180 }
  } as const;
  const b = bands[family];
  return {
    x: b.x0 + (index % b.cols) * b.dx,
    y: b.y0 + Math.floor(index / b.cols) * b.dy
  };
};

// ============================================================
// CURATED CROSS-LINKS (relationships that carry real meaning)
// ============================================================

/** [sourceDecisionSlug, targetDecisionSlug, label, description] */
const CURATED_EDGES: [string, string, GraphEdge['label'], string][] = [
  ['reverse-mobile-decision', 'drop-mobile-app', 'REVERSES',
    'Read-only mobile approval access partially reverses the original blanket mobile deferral.'],
  ['multi-provider-llm', 'gpt4o-mini-over-llama', 'REVERSES',
    'Single-vendor standardisation was superseded by a multi-provider routing abstraction.'],
  ['deprecate-mock-store', 'query-driven-loading', 'DEPENDS_ON',
    'Removing the mock store was only safe once the workspace loaded real data by query.'],
  ['query-driven-loading', 'search-full-text-postgres', 'DEPENDS_ON',
    'Query-driven loading requires the full-text search index to resolve a subgraph.'],
  ['evidence-upload-review', 'drop-auto-extraction', 'SUPPORTS',
    'The reviewed-suggestion upload flow operationalises the earlier rejection of unattended extraction.'],
  ['dual-key-encryption', 'data-residency-eu', 'DEPENDS_ON',
    'Customer-held keys were proposed to strengthen the EU residency guarantee.'],
  ['dual-key-encryption', 'postgres-connection-resilience', 'CONTRADICTS',
    'Customer-held keys raise recovery time, which conflicts with the availability commitment.'],
  ['graph-canvas-svg', 'graph-virtualisation', 'PRECEDES',
    'The bespoke canvas decision created the rendering performance work that followed.'],
  ['enterprise-tier-pricing', 'sso-saml-enterprise', 'DEPENDS_ON',
    'The enterprise tier bundles SSO as one of its three anchor capabilities.'],
  ['enterprise-tier-pricing', 'data-residency-eu', 'DEPENDS_ON',
    'The enterprise tier bundles EU residency as an anchor capability.'],
  ['soc2-type2-window', 'soc2-type1-commitment', 'PRECEDES',
    'Type I readiness established the control baseline the Type II window observes.'],
  ['public-launch', 'soc2-type1-commitment', 'DEPENDS_ON',
    'Public launch was gated on having a security report available for inbound enterprise interest.'],
  ['per-org-seat-pricing', 'pricing-increase-2026', 'PRECEDES',
    'Seat-band pricing established the structure the 2026 increase was applied to.'],
  ['annual-contract-default', 'runway-24-months', 'SUPPORTS',
    'Annual prepay materially improves the cash position the runway floor protects.'],
  ['graph-bounded-retrieval', 'confidence-scoring-differentiator', 'SUPPORTS',
    'The measured 0.8% false citation rate is the evidence behind the positioning claim.'],
  ['anti-hallucination-benchmark', 'graph-bounded-retrieval', 'PRECEDES',
    'The benchmark existed first and is what made the graph-bounding result measurable.'],
  ['confidence-gate-core', 'confidence-breakdown-ui', 'PRECEDES',
    'The core confidence primitive was later made transparent through the breakdown UI.'],
  ['role-based-editing-gate', 'rbac-three-roles', 'DEPENDS_ON',
    'Hiding mutation controls depends on the three-role model being authoritative.'],
  ['admin-dashboard', 'rbac-three-roles', 'DEPENDS_ON',
    'The admin dashboard is gated on the admin role defined by the role model.'],
  ['node-position-persistence', 'jsonb-node-payload', 'DEPENDS_ON',
    'Positions are stored on the JSONB node payload rather than as dedicated columns.'],
  ['chat-history-persistence', 'postgres-over-mongo', 'DEPENDS_ON',
    'Chat session persistence uses the relational message tables in the primary datastore.'],
  ['deprecate-rest-ingest', 'bulk-import-csv', 'PRECEDES',
    'Large CSV imports exposed the synchronous ingest timeout that forced the queue migration.'],
  ['graceful-llm-degradation', 'multi-provider-llm', 'PRECEDES',
    'Fallback behaviour was the first response to provider fragility; redundancy followed.'],
  ['drop-slack-connector-v1', 'confidence-gate-core', 'SUPPORTS',
    'Slack was cut specifically to protect the confidence metric the gate depends on.'],
  ['hire-gtm-lead', 'first-paid-pilot', 'TRIGGERED_BY',
    'Pipeline demand created by early pilots exceeded founder-led sales capacity.'],
  ['seed-round-close', 'yc-w25-application', 'TRIGGERED_BY',
    'The unsuccessful YC application redirected the team to a traditional seed process.'],
  ['embedding-model-upgrade', 'reranker-cross-encoder', 'PRECEDES',
    'Reranking established the evaluation discipline the embedding migration was measured against.'],
  ['kill-browser-extension', 'drop-mobile-app', 'SUPPORTS',
    'Both decisions applied the same usage-threshold test to a proposed new surface.'],
  ['multi-region-active', 'data-residency-eu', 'DEPENDS_ON',
    'Active-active would promote the residency-only EU region to a full peer.'],
  ['series-a-preparation', 'seed-round-close', 'PRECEDES',
    'The seed round set the metrics baseline the Series A narrative builds on.'],
  ['deprecate-density-executive', 'graph-density-modes', 'REVERSES',
    'Saved views replaced the two hardcoded density modes with a general mechanism.'],
  ['ai-prefill-decision-form', 'drop-auto-extraction', 'CONTRADICTS',
    'Pre-fill reintroduces model-generated content, constrained by mandatory human review.'],
  ['drop-on-prem-tier', 'data-residency-eu', 'SUPPORTS',
    'EU residency addressed the compliance concern that on-premise requests were really about.'],
  ['security-bug-bounty', 'public-launch', 'PRECEDES',
    'The private bounty ran deliberately ahead of public exposure.'],
  ['observability-tracing', 'query-driven-loading', 'SUPPORTS',
    'Tracing attributed the latency that justified scoping the workspace to a searched subgraph.']
];

// ============================================================
// BUILD
// ============================================================

export interface SeedBundle {
  nodes: GraphNode[];
  edges: GraphEdge[];
  decisions: DecisionItem[];
  evidence: EvidenceDocument[];
  timeline: TimelineEvent[];
}

const decisionNodeId = (slug: string) => `DEC-${slug.toUpperCase()}`;
const documentNodeId = (slug: string) => `DOC-${slug.toUpperCase()}`;
const evidenceId = (slug: string) => `EVD-${slug.toUpperCase()}`;
const eventNodeId = (slug: string) => `EVT-${slug.toUpperCase()}`;

let cachedBundle: SeedBundle | null = null;

export function buildSeed(): SeedBundle {
  if (cachedBundle) return cachedBundle;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const decisions: DecisionItem[] = [];
  const evidence: EvidenceDocument[] = [];
  const timeline: TimelineEvent[] = [];

  const pushEdge = (
    source: string, target: string, label: GraphEdge['label'],
    confidence: number, description: string
  ) => {
    const id = `EDG-${edges.length + 1}-${label}`;
    edges.push({ id, source, target, label, confidence, description });
  };

  // ---------- People ----------
  PEOPLE.forEach((person, i) => {
    const pos = layoutFor('person', i);
    nodes.push({
      id: person.id,
      label: person.name,
      type: 'person',
      subtitle: person.role,
      category: person.department,
      date: person.department,
      x: pos.x,
      y: pos.y,
      owner: person.role,
      description: person.bio,
      tags: person.tags,
      evidenceCount: 0
    });
  });

  // ---------- Documents & Evidence ----------
  const docsByDecision = new Map<string, DocumentSpec[]>();
  DOCUMENT_SPECS.forEach(spec => {
    if (!spec.decision) return;
    const list = docsByDecision.get(spec.decision) || [];
    list.push(spec);
    docsByDecision.set(spec.decision, list);
  });

  DOCUMENT_SPECS.forEach((spec, i) => {
    const author = personByKey(spec.author);
    const pos = layoutFor('document', i);
    const evId = evidenceId(spec.slug);
    const nodeId = documentNodeId(spec.slug);

    nodes.push({
      id: nodeId,
      label: spec.title,
      type: 'document',
      subtitle: `${spec.type} · ${author.name}`,
      category: spec.dept,
      date: spec.date,
      x: pos.x,
      y: pos.y,
      owner: author.name,
      description: spec.snippet,
      tags: [spec.type.toLowerCase(), spec.dept.toLowerCase().replace(/\s+/g, '-')],
      evidenceCount: 1,
      evidenceId: evId
    });

    evidence.push({
      id: evId,
      title: spec.title,
      type: spec.type,
      author: `${author.name} (${author.role})`,
      date: spec.date,
      hash: fakeHash(spec.slug),
      verified: true,
      department: spec.dept,
      highlightSnippet: spec.snippet,
      content:
        `${spec.title}\n` +
        `${'='.repeat(spec.title.length)}\n\n` +
        `Author: ${author.name} (${author.role})\n` +
        `Department: ${spec.dept}\n` +
        `Date: ${spec.date}\n` +
        `Document type: ${spec.type}\n\n` +
        `SUMMARY\n-------\n${spec.snippet}\n\n` +
        `CONTEXT\n-------\n` +
        `This record forms part of the Aletheia institutional memory corpus. It is retained as ` +
        `primary evidence and is hash-verified at ingestion so that any citation drawn from it can ` +
        `be checked byte-for-byte against the filed original.\n\n` +
        (spec.decision
          ? `RELATED DECISION\n----------------\nThis document is cited as supporting evidence for decision ${decisionNodeId(spec.decision)}.\n`
          : `RELATED DECISION\n----------------\nStandalone institutional record; not tied to a single decision.\n`),
      relatedDecisionId: spec.decision ? decisionNodeId(spec.decision) : ''
    });

    // person AUTHORED_BY document
    pushEdge(author.id, nodeId, 'AUTHORED_BY', 1, `${author.name} authored ${spec.title}.`);

    timeline.push({
      id: `TL-DOC-${spec.slug.toUpperCase()}`,
      date: spec.date,
      time: '09:00 UTC',
      title: spec.title,
      actor: author.name,
      actorRole: author.role,
      type: 'document_created',
      description: spec.snippet,
      relatedNodeId: nodeId,
      relatedEvidenceId: evId,
      relatedDecisionId: spec.decision ? decisionNodeId(spec.decision) : undefined,
      branch: 'root',
      status: 'confirmed'
    });
  });

  // ---------- Decisions ----------
  const lastByCategory = new Map<DecisionCategory, string>();

  DECISION_SPECS.forEach((spec, i) => {
    const owner = personByKey(spec.owner);
    const pos = layoutFor('decision', i);
    const nodeId = decisionNodeId(spec.slug);
    const supportingDocs = docsByDecision.get(spec.slug) || [];
    const primaryDoc = supportingDocs[0];
    const primaryEvId = primaryDoc ? evidenceId(primaryDoc.slug) : '';
    const breakdown = breakdownFor(spec.slug, spec.status);
    const confidence = scoreOf(breakdown);
    const department = CATEGORY_DEPARTMENT[spec.cat];

    nodes.push({
      id: nodeId,
      label: spec.title,
      type: 'decision',
      subtitle: department,
      category: spec.cat,
      date: spec.date,
      x: pos.x,
      y: pos.y,
      confidenceScore: confidence,
      status: spec.status,
      owner: `${owner.name} (${owner.role})`,
      description: spec.summary,
      rationale: spec.rationale,
      tags: spec.tags,
      evidenceCount: supportingDocs.length,
      evidenceId: primaryEvId || undefined
    });

    decisions.push({
      id: nodeId,
      title: spec.title,
      owner: owner.name,
      ownerRole: owner.role,
      ownerAvatar: initialsOf(owner.name),
      department,
      date: `${spec.date} 10:00`,
      status: spec.status,
      confidence,
      confidenceBreakdown: breakdown,
      impact: spec.impact,
      summary: spec.summary,
      rationale: spec.rationale,
      alternativesConsidered: spec.alts,
      linkedNodeIds: [nodeId, owner.id, ...supportingDocs.map(dd => documentNodeId(dd.slug))],
      primaryEvidenceId: primaryEvId,
      tags: spec.tags,
      warnings:
        spec.status === 'Contested'
          ? [{
              id: `WARN-${spec.slug.toUpperCase()}`,
              type: 'conflicting_evidence' as const,
              message: 'Conflicting evidence recorded against this decision; no reconciliation on file.',
              remediation: 'Reconcile the conflicting records and re-run approval before treating this as settled.'
            }]
          : spec.status === 'Pending'
            ? [{
                id: `WARN-${spec.slug.toUpperCase()}`,
                type: 'missing_approval' as const,
                message: 'Formal approval has not been recorded for this decision.',
                remediation: 'Obtain and file the approving sign-off from the accountable owner.'
              }]
            : []
    });

    // owner AUTHORED_BY decision
    pushEdge(owner.id, nodeId, 'AUTHORED_BY', 1, `${owner.name} owns and signed off ${spec.title}.`);

    // supporting documents SUPPORT the decision
    supportingDocs.forEach(dd => {
      pushEdge(
        documentNodeId(dd.slug), nodeId, 'SUPPORTS', 0.94,
        `${dd.title} is filed as supporting evidence for this decision.`
      );
    });

    // chronological chain within a category
    const previous = lastByCategory.get(spec.cat);
    if (previous) {
      pushEdge(previous, nodeId, 'PRECEDES', 0.8, `Earlier ${spec.cat} decision preceding this one.`);
    }
    lastByCategory.set(spec.cat, nodeId);

    timeline.push({
      id: `TL-${spec.slug.toUpperCase()}`,
      date: spec.date,
      time: '10:00 UTC',
      title: spec.title,
      actor: owner.name,
      actorRole: owner.role,
      type:
        spec.status === 'Contested'
          ? 'sign_off_missing'
          : spec.status === 'Pending'
            ? 'decision_pending'
            : 'decision_confirmed',
      description: spec.summary,
      relatedNodeId: nodeId,
      relatedDecisionId: nodeId,
      relatedEvidenceId: primaryEvId || undefined,
      branch: spec.cat.toLowerCase(),
      status:
        spec.status === 'Contested'
          ? 'warning'
          : spec.status === 'Pending'
            ? 'pending'
            : 'confirmed'
    });
  });

  // ---------- Events ----------
  EVENT_SPECS.forEach((spec, i) => {
    const actor = personByKey(spec.actor);
    const pos = layoutFor('event', i);
    const nodeId = eventNodeId(spec.slug);

    nodes.push({
      id: nodeId,
      label: spec.title,
      type: 'event',
      subtitle: `${spec.kind.charAt(0).toUpperCase()}${spec.kind.slice(1)} · ${actor.name}`,
      category: spec.kind,
      date: spec.date,
      x: pos.x,
      y: pos.y,
      owner: actor.name,
      description: spec.description,
      tags: [spec.kind, 'event'],
      evidenceCount: 0
    });

    pushEdge(actor.id, nodeId, 'AUTHORED_BY', 1, `${actor.name} recorded this event.`);

    if (spec.decision) {
      pushEdge(
        nodeId, decisionNodeId(spec.decision), 'TRIGGERED_BY', 0.9,
        `${spec.title} is recorded as a trigger for this decision.`
      );
    }

    timeline.push({
      id: `TL-EVT-${spec.slug.toUpperCase()}`,
      date: spec.date,
      time: '12:00 UTC',
      title: spec.title,
      actor: actor.name,
      actorRole: actor.role,
      type: spec.kind === 'meeting' ? 'meeting' : spec.kind === 'incident' ? 'discussion' : 'decision_confirmed',
      description: spec.description,
      relatedNodeId: nodeId,
      relatedDecisionId: spec.decision ? decisionNodeId(spec.decision) : undefined,
      branch: 'root',
      status: spec.kind === 'incident' ? 'warning' : 'confirmed'
    });
  });

  // ---------- Curated cross-links ----------
  const nodeIds = new Set(nodes.map(n => n.id));
  CURATED_EDGES.forEach(([from, to, label, description]) => {
    const s = decisionNodeId(from);
    const t = decisionNodeId(to);
    if (nodeIds.has(s) && nodeIds.has(t)) {
      pushEdge(s, t, label, label === 'CONTRADICTS' ? 0.72 : 0.9, description);
    }
  });

  timeline.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  cachedBundle = { nodes, edges, decisions, evidence, timeline };
  return cachedBundle;
}

export const seedCounts = () => {
  const b = buildSeed();
  return {
    nodes: b.nodes.length,
    edges: b.edges.length,
    decisions: b.decisions.length,
    evidence: b.evidence.length,
    timeline: b.timeline.length,
    total: b.nodes.length + b.edges.length + b.decisions.length + b.evidence.length + b.timeline.length
  };
};
