import { GraphNode, GraphEdge, DecisionItem, EvidenceDocument, ChatMessage } from '@/types';

export const mockNodes: GraphNode[] = [
  // Decisions
  {
    id: 'DEC-101',
    label: 'Pivot to Cloud-Native Kubernetes',
    type: 'decision',
    subtitle: 'Infrastructure Modernization',
    category: 'Architecture',
    date: 'Oct 14, 2022',
    x: 480,
    y: 260,
    confidenceScore: 96,
    status: 'Approved',
    owner: 'Dr. Elena Rostova',
    description: 'Transitioned all 18 core microservices from on-premise bare metal to managed Kubernetes (EKS/GKE) with GitOps automation.',
    rationale: 'On-premise hardware reached EOL with $2.4M refresh estimate. Autoscaling during Black Friday spiked 380% beyond capacity.',
    tags: ['Cloud', 'Kubernetes', 'Infra', 'P0'],
    evidenceCount: 4,
    evidenceId: 'EVD-RFC-042'
  },
  {
    id: 'DEC-102',
    label: 'Adopt Qdrant & Neo4j Hybrid Graph',
    type: 'decision',
    subtitle: 'Knowledge Storage Strategy',
    category: 'Data Platform',
    date: 'Feb 19, 2023',
    x: 740,
    y: 190,
    confidenceScore: 92,
    status: 'Approved',
    owner: 'Marcus Vance',
    description: 'Selected Qdrant for 1536-dim vector embeddings and Neo4j for deterministic entity relationships and lineage paths.',
    rationale: 'Pure vector search suffered hallucination rates of 28% in regulatory compliance tests. Graph neighborhood bounding lowered error to <1.2%.',
    tags: ['Graph', 'VectorDB', 'AI', 'Neo4j'],
    evidenceCount: 3,
    evidenceId: 'EVD-ADR-089'
  },
  {
    id: 'DEC-103',
    label: 'Deprecate Monolithic REST in favor of gRPC/Kafka',
    type: 'decision',
    subtitle: 'Event-Driven Ingestion',
    category: 'Architecture',
    date: 'Aug 04, 2023',
    x: 350,
    y: 430,
    confidenceScore: 89,
    status: 'Approved',
    owner: 'Sophia Chen',
    description: 'Replaced HTTP synchronous polling between ingestors and document extractors with Kafka event streams and gRPC internal contracts.',
    rationale: 'High ingest latency during quarterly audits caused 504 timeouts. Kafka partitioning yielded 12,000 docs/sec sustained throughput.',
    tags: ['Kafka', 'gRPC', 'Streaming'],
    evidenceCount: 3,
    evidenceId: 'EVD-TRB-112'
  },
  {
    id: 'DEC-104',
    label: 'Dual-Key Encryption for Institutional Records',
    type: 'decision',
    subtitle: 'Zero-Trust Security Standard',
    category: 'Security',
    date: 'Dec 11, 2023',
    x: 820,
    y: 450,
    confidenceScore: 78,
    status: 'Contested',
    owner: 'Darius Thorne',
    description: 'Enforced customer-managed KMS keys alongside corporate root keys for document redactions and access logs.',
    rationale: 'Legal required sovereign cryptographic separation, but SecOps flagged operational risk during key rotation cycles.',
    tags: ['Security', 'KMS', 'Compliance', 'Contested'],
    evidenceCount: 2,
    evidenceId: 'EVD-SEC-204'
  },

  // People
  {
    id: 'PER-201',
    label: 'Dr. Elena Rostova',
    type: 'person',
    subtitle: 'VP of Platform Engineering',
    category: 'Leadership',
    date: 'Joined 2019',
    x: 230,
    y: 160,
    owner: 'Executive Lead',
    description: 'Primary architect behind the 2022 cloud migration and enterprise multi-region resilience strategy.',
    tags: ['VP', 'Infra', 'Sign-off'],
    evidenceCount: 8
  },
  {
    id: 'PER-202',
    label: 'Marcus Vance',
    type: 'person',
    subtitle: 'Principal AI & Data Architect',
    category: 'Engineering',
    date: 'Joined 2021',
    x: 930,
    y: 120,
    owner: 'AI Systems',
    description: 'Designed the hybrid graph-RAG retrieval pipeline and deterministic confidence scoring system.',
    tags: ['Staff', 'AI', 'Graph'],
    evidenceCount: 6
  },
  {
    id: 'PER-203',
    label: 'Sophia Chen',
    type: 'person',
    subtitle: 'Head of Ingestion Pipelines',
    category: 'Engineering',
    date: 'Joined 2020',
    x: 160,
    y: 440,
    owner: 'Data Eng',
    description: 'Spearheaded event streaming migration and real-time OCR entity extraction pipeline.',
    tags: ['Data Pipelines', 'Kafka'],
    evidenceCount: 5
  },
  {
    id: 'PER-204',
    label: 'Darius Thorne',
    type: 'person',
    subtitle: 'Chief Information Security Officer',
    category: 'Security',
    date: 'Joined 2022',
    x: 990,
    y: 380,
    owner: 'InfoSec',
    description: 'Author of corporate zero-trust framework and sovereign compliance policies.',
    tags: ['CISO', 'Compliance'],
    evidenceCount: 4
  },

  // Documents
  {
    id: 'DOC-301',
    label: 'RFC-042: Cloud Migration Feasibility Study',
    type: 'document',
    subtitle: 'Technical RFC / 38 Pages',
    category: 'RFC',
    date: 'Aug 28, 2022',
    x: 320,
    y: 110,
    description: 'Exhaustive total cost of ownership (TCO) analysis comparing on-prem colocation renewals vs multi-zone Kubernetes clusters.',
    tags: ['RFC', 'Cost Analysis', 'TCO'],
    evidenceCount: 1,
    evidenceId: 'EVD-RFC-042'
  },
  {
    id: 'DOC-302',
    label: 'ADR-089: Graph vs Pure Vector Benchmark',
    type: 'document',
    subtitle: 'Architecture Decision Record',
    category: 'ADR',
    date: 'Jan 15, 2023',
    x: 620,
    y: 80,
    description: 'Empirical benchmark measuring precision, recall, and hallucination bounds across 10,000 regulatory documents.',
    tags: ['ADR', 'Benchmark', 'Evaluation'],
    evidenceCount: 1,
    evidenceId: 'EVD-ADR-089'
  },
  {
    id: 'DOC-303',
    label: 'TRB-112: Technical Review Board Minutes',
    type: 'document',
    subtitle: 'Architecture Board Sign-off',
    category: 'Meeting',
    date: 'Jul 29, 2023',
    x: 270,
    y: 340,
    description: 'Formal sign-off by 5 engineering directors approving the retirement of legacy REST endpoints in favor of Kafka event queues.',
    tags: ['Minutes', 'Governance', 'TRB'],
    evidenceCount: 1,
    evidenceId: 'EVD-TRB-112'
  },
  {
    id: 'DOC-304',
    label: 'SEC-204: Dual-Key Compliance Audit Report',
    type: 'document',
    subtitle: 'Infra & Cryptography Review',
    category: 'Audit',
    date: 'Nov 30, 2023',
    x: 740,
    y: 540,
    description: 'Security audit noting 3 contested operational concerns regarding customer key availability during emergency disaster recovery.',
    tags: ['Audit', 'CISO', 'Compliance'],
    evidenceCount: 1,
    evidenceId: 'EVD-SEC-204'
  },

  // Events
  {
    id: 'EVT-401',
    label: 'Black Friday 2021 Server Overload Incident',
    type: 'event',
    subtitle: 'Critical Outage / Postmortem #382',
    category: 'Incident',
    date: 'Nov 27, 2021',
    x: 120,
    y: 280,
    description: 'Bare-metal database capacity reached 99.8% saturation causing 43 minutes of degraded service and $680k revenue loss.',
    tags: ['Outage', 'P0 Incident', 'Catalyst'],
    evidenceCount: 2,
    evidenceId: 'EVD-INC-382'
  },
  {
    id: 'EVT-402',
    label: 'Q3 Regulatory Compliance Audit Failure',
    type: 'event',
    subtitle: 'Internal Compliance Flag',
    category: 'Audit Cycle',
    date: 'Sep 14, 2022',
    x: 580,
    y: 390,
    description: 'External audit team could not verify why a 2019 financial calculation model was replaced, triggering institutional memory review.',
    tags: ['Audit Failure', 'Regulatory', 'Catalyst'],
    evidenceCount: 3,
    evidenceId: 'EVD-AUD-014'
  }
];

export const mockEdges: GraphEdge[] = [
  // Outage triggered Elena's study & cloud decision
  { id: 'E-1', source: 'EVT-401', target: 'DOC-301', label: 'TRIGGERED_BY', confidence: 0.98, description: 'Postmortem findings directly mandated RFC-042 feasibility study.' },
  { id: 'E-2', source: 'PER-201', target: 'DOC-301', label: 'AUTHORED_BY', confidence: 1.0, description: 'Dr. Elena Rostova authored RFC-042.' },
  { id: 'E-3', source: 'DOC-301', target: 'DEC-101', label: 'SUPPORTS', confidence: 0.96, description: 'RFC-042 TCO analysis provided primary financial justification for Cloud-Native pivot.' },
  { id: 'E-4', source: 'PER-201', target: 'DEC-101', label: 'SUPPORTS', confidence: 0.99, description: 'Elena signed off on final cloud architecture transition.' },

  // Elena to Kafka migration
  { id: 'E-5', source: 'DEC-101', target: 'DEC-103', label: 'PRECEDES', confidence: 0.94, description: 'Kubernetes deployment was a structural prerequisite for Kafka microservice clustering.' },
  { id: 'E-6', source: 'PER-203', target: 'DEC-103', label: 'AUTHORED_BY', confidence: 0.97, description: 'Sophia Chen proposed gRPC/Kafka pipeline.' },
  { id: 'E-7', source: 'DOC-303', target: 'DEC-103', label: 'SUPPORTS', confidence: 0.95, description: 'Technical Review Board Minutes verified 12k/sec benchmark.' },

  // Audit Failure triggered Institutional Memory & Knowledge Graph
  { id: 'E-8', source: 'EVT-402', target: 'DEC-102', label: 'TRIGGERED_BY', confidence: 0.92, description: 'Audit failure demanded verifiable, hallucination-free decision traceability.' },
  { id: 'E-9', source: 'PER-202', target: 'DOC-302', label: 'AUTHORED_BY', confidence: 1.0, description: 'Marcus Vance authored the Vector vs Graph benchmark ADR-089.' },
  { id: 'E-10', source: 'DOC-302', target: 'DEC-102', label: 'SUPPORTS', confidence: 0.95, description: 'ADR-089 proven error reduction from 28% to 1.2% sealed executive approval.' },
  { id: 'E-11', source: 'DEC-101', target: 'DEC-102', label: 'DEPENDS_ON', confidence: 0.88, description: 'Qdrant and Neo4j cluster instances run on top of EKS/GKE.' },

  // Security & KMS
  { id: 'E-12', source: 'PER-204', target: 'DEC-104', label: 'AUTHORED_BY', confidence: 0.91, description: 'CISO Darius Thorne drafted sovereign dual-key specification.' },
  { id: 'E-13', source: 'DOC-304', target: 'DEC-104', label: 'CONTRADICTS', confidence: 0.82, description: 'SEC-204 audit raised contested flags regarding disaster recovery key access.' },
  { id: 'E-14', source: 'DEC-102', target: 'DEC-104', label: 'DEPENDS_ON', confidence: 0.85, description: 'Graph nodes storing institutional records must comply with dual-key policies.' }
];

export const mockDecisions: DecisionItem[] = [
  {
    id: 'DEC-101',
    title: 'Pivot to Cloud-Native Kubernetes Infrastructure',
    owner: 'Dr. Elena Rostova',
    ownerRole: 'VP of Platform Engineering',
    department: 'Core Infrastructure',
    date: 'Oct 14, 2022',
    status: 'Approved',
    confidence: 96,
    impact: 'Critical',
    summary: 'Phased migration of 18 on-premise monolithic and micro services into multi-region managed Kubernetes with ArgoCD GitOps.',
    rationale: 'Hardware EOL with $2.4M capex needed; severe Black Friday saturation risk; inability to autoscale during traffic peaks.',
    alternativesConsidered: [
      'Colocation contract renewal with hardware leasing ($2.4M CapEx)',
      'Serverless only (AWS Lambda) — rejected due to 15m execution limit on document OCR models',
      'Hybrid private cloud with OpenStack — rejected due to operational staffing overhead'
    ],
    linkedNodeIds: ['EVT-401', 'DOC-301', 'PER-201', 'DEC-103'],
    primaryEvidenceId: 'EVD-RFC-042'
  },
  {
    id: 'DEC-102',
    title: 'Adoption of Hybrid Qdrant Vector & Neo4j Knowledge Graph',
    owner: 'Marcus Vance',
    ownerRole: 'Principal AI & Data Architect',
    department: 'AI Systems Group',
    date: 'Feb 19, 2023',
    status: 'Approved',
    confidence: 92,
    impact: 'Critical',
    summary: 'Coupled vector similarity search with a deterministic Neo4j property graph to bound LLM context to verified organizational relationships.',
    rationale: 'Pure semantic similarity retrieved false positives on past policy changes with identical terminology. Graph neighborhood traversal enforces deterministic provenance.',
    alternativesConsidered: [
      'Pure Pinecone vector store with metadata filtering — high hallucination rate (28%)',
      'Postgres pgvector only — sub-optimal graph hop traversal performance at >5 hops',
      'Standalone Neo4j without vector indices — failed semantic keyword nuance'
    ],
    linkedNodeIds: ['EVT-402', 'DOC-302', 'PER-202', 'DEC-104'],
    primaryEvidenceId: 'EVD-ADR-089'
  },
  {
    id: 'DEC-103',
    title: 'Deprecate Monolithic REST in favor of gRPC and Kafka Event Streams',
    owner: 'Sophia Chen',
    ownerRole: 'Head of Ingestion Pipelines',
    department: 'Data Engineering',
    date: 'Aug 04, 2023',
    status: 'Approved',
    confidence: 89,
    impact: 'High',
    summary: 'Eliminated synchronous REST bottlenecks in document ingestion by routing uploads through Kafka queues with gRPC serialization.',
    rationale: 'Quarterly document uploads caused synchronous HTTP timeouts (504s). Kafka provides backpressure handling and 12,000 docs/sec burst capability.',
    alternativesConsidered: [
      'Scale REST gateway horizontally — cost ballooned by 400% with no backpressure buffering',
      'RabbitMQ broker — lacked persistent replay capability needed for audit reconciliation',
      'AWS SQS — vendor lock-in concerns raised by multi-cloud charter'
    ],
    linkedNodeIds: ['DOC-303', 'PER-203', 'DEC-101'],
    primaryEvidenceId: 'EVD-TRB-112'
  },
  {
    id: 'DEC-104',
    title: 'Dual-Key Sovereign Encryption for Institutional Records',
    owner: 'Darius Thorne',
    ownerRole: 'Chief Information Security Officer',
    department: 'Information Security & Compliance',
    date: 'Dec 11, 2023',
    status: 'Contested',
    confidence: 78,
    impact: 'High',
    summary: 'Mandatory dual-key envelope encryption for all sensitive decision rationale and meeting transcripts across European entities.',
    rationale: 'GDPR Article 28 and sovereign audit obligations require cryptographic proof that enterprise admins cannot unilaterally decrypt client records.',
    alternativesConsidered: [
      'Single platform-managed KMS key with IAM role policies — flagged as inadequate by EU auditors',
      'Client-side zero-knowledge encryption — broke server-side semantic search indexing capability',
      'Full database volume encryption only — failed to protect against rogue DB superusers'
    ],
    linkedNodeIds: ['DOC-304', 'PER-204', 'DEC-102'],
    primaryEvidenceId: 'EVD-SEC-204'
  }
];

export const mockEvidence: Record<string, EvidenceDocument> = {
  'EVD-RFC-042': {
    id: 'EVD-RFC-042',
    title: 'RFC-042: Cloud Migration Feasibility & TCO Analysis',
    type: 'RFC',
    author: 'Dr. Elena Rostova (VP Platform)',
    date: '2022-08-28T14:32:00Z',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    verified: true,
    department: 'Platform Architecture',
    highlightSnippet: 'Over a 36-month horizon, managed Kubernetes delivers a 31.4% net TCO reduction ($3.1M vs $4.5M) while eliminating catastrophic single-point failures observed during the 2021 Black Friday crash.',
    content: `RFC-042: Core Infrastructure Transition Plan
Author: Dr. Elena Rostova, VP Platform Engineering
Co-Authors: S. Chen, M. Vance
Status: RATIFIED

1. Executive Summary
Following the catastrophic database saturation of November 2021 (Ref: Incident #382), this document evaluates the viability of shifting from our legacy on-premise hardware lease to multi-region cloud-native Kubernetes.

2. Cost Comparison & TCO
- Existing On-Prem Capex Refresh (2023-2026): $2,450,000 upfront + $68,000/mo co-location facilities.
- Multi-Region Managed Kubernetes (EKS/GKE): Projected $84,000/mo operational cost with zero capital expenditure.
- Net 36-month savings: $1,420,000 (31.4% reduction).

3. Technical Mandate
All 18 stateful and stateless services must be refactored into OCI-compliant container images managed by ArgoCD GitOps pipelines with automated blue/green canary deployments.`,
    relatedDecisionId: 'DEC-101'
  },
  'EVD-ADR-089': {
    id: 'EVD-ADR-089',
    title: 'ADR-089: Deterministic Knowledge Retrieval Architecture',
    type: 'ADR',
    author: 'Marcus Vance (Principal AI Architect)',
    date: '2023-01-15T09:15:00Z',
    hash: 'sha256:4a5b6c7d8e9f0123456789abcdef0123456789abcdef0123456789abcdef0123',
    verified: true,
    department: 'AI Systems',
    highlightSnippet: 'Hybrid graph-vector retrieval reduced hallucinated citations from 28.4% to 0.8% in simulated institutional recall tests, satisfying SEC Rule 17a-4 traceability.',
    content: `Architecture Decision Record: ADR-089
Topic: Hybrid Graph-Vector Retrieval for Institutional Memory
Status: APPROVED

Context:
In benchmark testing with 10,000 historical corporate decisions, vector-only retrieval (Cosine Similarity top-k) frequently matched outdated draft policies because the semantic vocabulary was identical to the final ratified version.

Decision:
1. We utilize Qdrant for initial semantic candidate retrieval.
2. We constrain retrieved chunks to the verified 2-hop neighborhood in Neo4j (Status = 'Approved', Timestamp < Query Context).
3. The LLM prompt is injected with explicit edge relationships (e.g., 'DOC-301 SUPPORTS DEC-101').

Results:
Hallucination and stale-citation rates dropped from 28.4% to under 0.8%.`,
    relatedDecisionId: 'DEC-102'
  },
  'EVD-TRB-112': {
    id: 'EVD-TRB-112',
    title: 'TRB-112: Ingestion Pipeline Architectural Review Minutes',
    type: 'Meeting',
    author: 'Technical Review Board Secretary',
    date: '2023-07-29T16:00:00Z',
    hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verified: true,
    department: 'Engineering Governance',
    highlightSnippet: 'Unanimous approval (5-0) by the board to sunset REST ingest endpoints by Q4 2023 in favor of Apache Kafka event streams and Protobuf contracts.',
    content: `Technical Review Board Meeting Minutes (TRB-112)
Attendees: Elena Rostova (Chair), Sophia Chen, Marcus Vance, Dave K., Linda M.

Presentation: Sophia Chen demonstrated that during peak batch document processing, REST ingestion incurred 504 timeouts at >1,800 requests/sec. Under the new Kafka architecture with 12 consumer partitions, the system sustained 12,000 docs/sec with zero packet drops.

Vote:
- Elena Rostova: YES
- Marcus Vance: YES
- Sophia Chen: YES
- Dave K.: YES
- Linda M.: YES

Condition: A dead-letter queue (DLQ) retention policy of 14 days must be implemented for malformed OCR artifacts.`,
    relatedDecisionId: 'DEC-103'
  },
  'EVD-SEC-204': {
    id: 'EVD-SEC-204',
    title: 'SEC-204: Dual-Key Cryptographic Audit & Risk Assessment',
    type: 'Audit',
    author: 'Darius Thorne (CISO) & Infosec Team',
    date: '2023-11-30T11:45:00Z',
    hash: 'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    verified: true,
    department: 'Information Security',
    highlightSnippet: 'Contested finding: While dual-key envelope encryption fulfills sovereign isolation directives, mean-time-to-recovery (MTTR) under total disaster recovery scenario doubles from 45m to 3.5h.',
    content: `Security Assessment SEC-204
Subject: Dual-Key Encryption Framework
Status: CONTESTED (Pending mitigation)

Summary:
The proposal enforces customer-held KMS keys alongside corporate infrastructure master keys. 

Risk Matrix:
1. Sovereign Compliance: LOW RISK (Exceeds regulatory criteria).
2. Operational Key Custody: HIGH RISK. If an enterprise customer revokes or loses their key during off-hours, incident response teams cannot inspect corrupted audit trails.

Recommendation:
Maintain pilot status in EMEA region only until automated key custody escrow escrow protocols are finalized in Q2 2024.`,
    relatedDecisionId: 'DEC-104'
  },
  'EVD-INC-382': {
    id: 'EVD-INC-382',
    title: 'Postmortem: Black Friday 2021 Bare-Metal Capacity Outage',
    type: 'Postmortem',
    author: 'Site Reliability Engineering (SRE)',
    date: '2021-12-01T08:00:00Z',
    hash: 'sha256:ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    verified: true,
    department: 'Site Reliability Engineering',
    highlightSnippet: 'Primary root cause: Inability to provision on-premise compute nodes in real time during a 380% traffic surge led to cascade failure in session storage.',
    content: `Incident Postmortem #382
Date: Nov 27, 2021 (Black Friday)
Impact: 43 minutes total downtime, 112 minutes partial degradation.

Timeline:
- 00:02 UTC: Traffic spikes to 42,000 req/sec (380% over 2020 peak).
- 00:14 UTC: Bare-metal pool reaches 99.8% memory exhaustion.
- 00:23 UTC: Provisioning scripts fail due to physical hardware exhaustion at Secaucus DC.
- 00:45 UTC: Manual traffic shedding initiated.

Corrective Action:
Permanent executive directive to migrate core platform to elastic cloud infrastructure with sub-60-second autoscaling capabilities.`,
    relatedDecisionId: 'DEC-101'
  },
  'EVD-AUD-014': {
    id: 'EVD-AUD-014',
    title: 'Audit Finding: Q3 2022 Traceability Failure in Risk Valuation',
    type: 'Audit',
    author: 'KPMG External Audit Team',
    date: '2022-09-14T10:30:00Z',
    hash: 'sha256:11a8a2376051142d6f7ec768d601dfaf629a6b49ecfc0d26f59ba58c48e50741',
    verified: true,
    department: 'External Compliance',
    highlightSnippet: 'Finding #F-22-09: Enterprise could not produce documented sign-off or architectural rationale for replacing the 2019 discount rate model, resulting in an audit warning.',
    content: `Regulatory Compliance Audit Report
Auditor: External Compliance Taskforce
Scope: Institutional Traceability & Model Governance

Deficiency:
During review of financial underwriting calculations, auditors identified a significant code change made in May 2021 that modified risk factors. Current engineering staff could not locate meeting notes, design documents, or named authorizers.

Consequence:
A formal warning was issued with a 6-month remediation window to deploy an immutable institutional memory system with evidence lineage.`,
    relatedDecisionId: 'DEC-102'
  }
};

export const sampleQueries = [
  {
    label: "Why did we pivot to cloud-native Kubernetes in 2022?",
    query: "Why did we pivot to cloud-native Kubernetes in 2022?"
  },
  {
    label: "What was the rationale for using Neo4j and Qdrant?",
    query: "What was the technical justification for combining Neo4j graph with Qdrant vector search?"
  },
  {
    label: "Why was the Dual-Key Encryption decision contested?",
    query: "Why was the Dual-Key Encryption decision marked as Contested?"
  },
  {
    label: "Why did we deprecate REST for Kafka and gRPC?",
    query: "What evidence justified deprecating monolithic REST in favor of Kafka and gRPC?"
  },
  {
    label: "Did we ever consider migrating to AWS Lambda only?",
    query: "Did we consider going fully serverless on AWS Lambda?"
  },
  {
    label: "Unknown: Who decided to acquire Acme Analytics?",
    query: "Who decided to acquire Acme Analytics in 2020?"
  }
];

export const precalculatedAnswers: Record<string, ChatMessage> = {
  "Why did we pivot to cloud-native Kubernetes in 2022?": {
    id: 'ans-1',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 96,
    confidenceLevel: 'strong',
    text: `The organizational pivot to cloud-native managed Kubernetes (**DEC-101**) was triggered by the catastrophic Black Friday 2021 bare-metal outage (**EVT-401** / **EVD-INC-382**), where on-premise hardware was saturated at 99.8% with zero autoscaling capability.

**Dr. Elena Rostova** authored **RFC-042** (**DOC-301** / **EVD-RFC-042**), proving that managed Kubernetes would reduce net 3-year TCO by 31.4% ($1.42M savings) compared to a $2.45M on-prem hardware refresh lease. The decision was formally approved in October 2022.`,
    citations: [
      {
        id: 'c-1',
        docTitle: 'RFC-042: Cloud Migration Feasibility Study',
        docType: 'RFC',
        snippet: 'Over a 36-month horizon, managed Kubernetes delivers a 31.4% net TCO reduction ($3.1M vs $4.5M) while eliminating catastrophic single-point failures...',
        author: 'Dr. Elena Rostova',
        date: 'Aug 28, 2022',
        hash: 'sha256:7f83b165...9069',
        nodeId: 'DOC-301'
      },
      {
        id: 'c-2',
        docTitle: 'Incident Postmortem #382',
        docType: 'Postmortem',
        snippet: 'Primary root cause: Inability to provision on-premise compute nodes in real time during a 380% traffic surge led to cascade failure in session storage.',
        author: 'SRE Lead',
        date: 'Nov 27, 2021',
        hash: 'sha256:ca978112...48bb',
        nodeId: 'EVT-401'
      }
    ],
    graphFocusNodes: ['EVT-401', 'DOC-301', 'PER-201', 'DEC-101']
  },
  "What was the technical justification for combining Neo4j graph with Qdrant vector search?": {
    id: 'ans-2',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 92,
    confidenceLevel: 'strong',
    text: `The decision (**DEC-102**) to adopt a hybrid **Qdrant vector + Neo4j property graph** architecture was spearheaded by **Marcus Vance** following the Q3 2022 regulatory compliance audit failure (**EVT-402** / **EVD-AUD-014**).

In benchmark **ADR-089** (**DOC-302** / **EVD-ADR-089**), standard cosine-similarity vector searches yielded a **28.4% hallucination/stale policy citation rate** because superseded draft policies shared near-identical embeddings with ratified laws. By constraining search candidates to verified 2-hop graph neighborhoods in Neo4j, hallucination rates plunged to **0.8%**, satisfying strict compliance mandates.`,
    citations: [
      {
        id: 'c-3',
        docTitle: 'ADR-089: Graph vs Pure Vector Benchmark',
        docType: 'ADR',
        snippet: 'Hybrid graph-vector retrieval reduced hallucinated citations from 28.4% to 0.8% in simulated institutional recall tests...',
        author: 'Marcus Vance',
        date: 'Jan 15, 2023',
        hash: 'sha256:4a5b6c7d...0123',
        nodeId: 'DOC-302'
      },
      {
        id: 'c-4',
        docTitle: 'Audit Finding: Q3 2022 Traceability Failure',
        docType: 'Audit',
        snippet: 'Enterprise could not produce documented sign-off or architectural rationale for replacing the 2019 discount rate model...',
        author: 'KPMG Audit Team',
        date: 'Sep 14, 2022',
        hash: 'sha256:11a8a237...0741',
        nodeId: 'EVT-402'
      }
    ],
    graphFocusNodes: ['EVT-402', 'DOC-302', 'PER-202', 'DEC-102']
  },
  "Why was the Dual-Key Encryption decision marked as Contested?": {
    id: 'ans-3',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 78,
    confidenceLevel: 'weak',
    text: `The Dual-Key Sovereign Encryption decision (**DEC-104**) authored by CISO **Darius Thorne** is currently marked **Contested** due to conflicting priorities between regulatory privacy and disaster recovery resilience.

As documented in **SEC-204** (**DOC-304** / **EVD-SEC-204**), customer-held keys satisfy strict European data residency directives, but Infosec and SRE calculated that mean-time-to-recovery (MTTR) under an emergency disaster recovery scenario would increase from 45 minutes to 3.5 hours if a customer key server is unreachable. Executive sign-off remains withheld pending an automated key escrow protocol.`,
    citations: [
      {
        id: 'c-5',
        docTitle: 'SEC-204: Dual-Key Compliance Audit Report',
        docType: 'Audit',
        snippet: 'While dual-key envelope encryption fulfills sovereign isolation directives, mean-time-to-recovery (MTTR) doubles from 45m to 3.5h...',
        author: 'Darius Thorne & Infosec Team',
        date: 'Nov 30, 2023',
        hash: 'sha256:ba7816bf...15ad',
        nodeId: 'DOC-304'
      }
    ],
    graphFocusNodes: ['DOC-304', 'PER-204', 'DEC-104']
  },
  "What evidence justified deprecating monolithic REST in favor of Kafka and gRPC?": {
    id: 'ans-4',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 89,
    confidenceLevel: 'strong',
    text: `The decision (**DEC-103**) led by **Sophia Chen** was proven necessary during quarterly high-volume audit ingestions. Synchronous REST calls caused cascade 504 timeouts at >1,800 requests/sec. 

As recorded in **TRB-112** (**DOC-303** / **EVD-TRB-112**), the Technical Review Board unanimously approved the migration after a benchmark demonstrated that Apache Kafka with 12 consumer partitions sustained **12,000 documents/second** throughput with backpressure buffering and full replay capability.`,
    citations: [
      {
        id: 'c-6',
        docTitle: 'TRB-112: Ingestion Pipeline Review Minutes',
        docType: 'Meeting',
        snippet: 'Unanimous approval (5-0) by the board to sunset REST ingest endpoints by Q4 2023 in favor of Apache Kafka event streams...',
        author: 'Technical Review Board Secretary',
        date: 'Jul 29, 2023',
        hash: 'sha256:e3b0c442...b855',
        nodeId: 'DOC-303'
      }
    ],
    graphFocusNodes: ['DOC-303', 'PER-203', 'DEC-103']
  },
  "Did we consider going fully serverless on AWS Lambda?": {
    id: 'ans-5',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 94,
    confidenceLevel: 'strong',
    text: `Yes. In **RFC-042 (§4.2 Alternatives Evaluated)**, a pure serverless architecture on AWS Lambda was formally analyzed as an alternative to Kubernetes.

It was **rejected** because the document intelligence pipeline processes large PDF dossiers containing complex scanned blueprints and contracts. These OCR entity extraction jobs regularly exceed the 15-minute execution hard cap of AWS Lambda, and cold-start latencies on heavy Python/PyTorch model containers were deemed unacceptable for real-time document search.`,
    citations: [
      {
        id: 'c-7',
        docTitle: 'RFC-042: Cloud Migration Feasibility Study',
        docType: 'RFC',
        snippet: 'Serverless only (AWS Lambda) — rejected due to 15m execution limit on document OCR models and cold starts on heavy model runtimes.',
        author: 'Dr. Elena Rostova',
        date: 'Aug 28, 2022',
        hash: 'sha256:7f83b165...9069',
        nodeId: 'DOC-301'
      }
    ],
    graphFocusNodes: ['DOC-301', 'DEC-101']
  },
  "Who decided to acquire Acme Analytics in 2020?": {
    id: 'ans-fallback',
    sender: 'assistant',
    timestamp: 'Just now',
    confidenceScore: 12,
    confidenceLevel: 'not_found',
    fallbackReason: 'CONFIDENCE GATE TRIGGERED: No verified institutional records, RFCs, meeting minutes, or graph relationships found matching "Acme Analytics".',
    text: `⚠️ **Confidence Gate: Evidence Missing (Confidence: 12%)**

ALETHEIA could not find any verified organizational records, Technical Review Board minutes, ADRs, or graph edges regarding an acquisition of **"Acme Analytics"** in 2020.

To prevent institutional hallucination, this query is bounded. Possible causes:
1. The acquisition records predate the digital repository ingest charter (pre-2021).
2. The entity was named differently (e.g., *Project Alpine* or *Merger #04*).
3. The documents may reside in unindexed sovereign legal vaults.`,
    citations: [],
    graphFocusNodes: []
  }
};
