import {
  DecisionItem,
  GraphNode,
  GraphEdge,
  EvidenceDocument,
  ChatMessage,
  TimelineEvent,
  ConfidenceBreakdown
} from '@/types';

export function calculateConfidence(breakdown: ConfidenceBreakdown): number {
  const score =
    breakdown.evidenceCoverage * 0.35 +
    breakdown.sourceReliability * 0.25 +
    breakdown.attribution * 0.20 +
    breakdown.temporalConsistency * 0.10 +
    breakdown.approvalCompleteness * 0.10;
  return Math.round(score);
}

// -------------------------------------------------------------
// DECISION LEDGER RECORDS (Screenshot 2 & Extended Mock Data)
// -------------------------------------------------------------
export const initialDecisions: DecisionItem[] = [
  {
    id: 'DEC-2023-089',
    title: 'Acquisition of NeuralTech Labs',
    owner: 'E. Larson',
    ownerRole: 'VP of Corporate Strategy',
    ownerAvatar: 'EL',
    department: 'Corporate Strategy & M&A',
    date: '2023-10-24 14:30',
    status: 'Approved',
    confidence: 92,
    confidenceBreakdown: {
      evidenceCoverage: 95,
      sourceReliability: 94,
      attribution: 100,
      temporalConsistency: 85,
      approvalCompleteness: 90
    },
    impact: 'Critical',
    summary: 'Consolidation of North American intellectual property assets via full acquisition of NeuralTech Labs for $42M.',
    rationale: 'Complementary patents in real-time vector quantization and 12-hop graph reasoning. Preempted competing acquisition bid by European syndicate.',
    alternativesConsidered: [
      'Strategic licensing agreement ($8M/yr) — lacked exclusivity and source IP control',
      'In-house development — estimated 24-month delay causing critical market erosion',
      'Joint venture minority stake — high governance frictions with founder board'
    ],
    linkedNodeIds: ['DCSN-9942', 'PER-EVANS', 'DOC-RISK-V2'],
    primaryEvidenceId: 'EVD-ACQ-089',
    tags: ['M&A', 'AI', 'Patents', 'Q4-2023'],
    warnings: []
  },
  {
    id: 'DEC-2023-090',
    title: 'Q4 Infrastructure Budget Reallocation',
    owner: 'M. Kovač',
    ownerRole: 'Director of Cloud Operations',
    ownerAvatar: 'MK',
    department: 'Cloud Platform Engineering',
    date: '2023-10-25 09:15',
    status: 'Pending',
    confidence: 65,
    confidenceBreakdown: {
      evidenceCoverage: 70,
      sourceReliability: 65,
      attribution: 80,
      temporalConsistency: 60,
      approvalCompleteness: 45
    },
    impact: 'High',
    summary: 'Reallocation of $1.8M CapEx budget from legacy data center lease renewal to AWS EKS elastic compute pool.',
    rationale: 'Sudden workload spike resulting from EMEA asset consolidation mandated immediate burst capacity across AWS us-east-1 and eu-central-1.',
    alternativesConsidered: [
      'Short-term 6-month on-prem colocation extension — 32% premium penalty ($480k)',
      'Defer scaling until Q1 next fiscal year — risked severe SLA breach during November peak'
    ],
    linkedNodeIds: ['DCSN-9942', 'REF-2', 'EVT-OFFSITE'],
    primaryEvidenceId: 'REF-2',
    tags: ['Budget', 'AWS', 'Infra', 'Traceability-Gap'],
    warnings: [
      {
        id: 'WARN-GAP-PROCUREIT',
        type: 'missing_approval',
        message: 'Traceability gap detected: Formal sign-off in ProcureIT is missing for final 15% overrun authorization.',
        remediation: 'Recommending audit of Q3 Procurement Logs and manual sign-off capture from CFO.',
        conflictingRecords: ['ProcureIT PR-88219', 'Executive Offsite Audio Transcript']
      }
    ]
  },
  {
    id: 'DEC-2023-085',
    title: 'Deprecation of Legacy Auth V1',
    owner: 'J. Reynolds',
    ownerRole: 'Chief Security Architect',
    ownerAvatar: 'JR',
    department: 'Identity & Access Management',
    date: '2023-10-22 16:45',
    status: 'Contested',
    confidence: 42,
    confidenceBreakdown: {
      evidenceCoverage: 50,
      sourceReliability: 45,
      attribution: 60,
      temporalConsistency: 40,
      approvalCompleteness: 20
    },
    impact: 'High',
    summary: 'Mandatory migration of all internal administrative microservices to OIDC/OAuth2 zero-trust tokens, terminating API keys.',
    rationale: 'SOC 2 Type II audit flagged 38 active non-expiring service tokens with wildcard root scopes.',
    alternativesConsidered: [
      'Automated key rotation daemon — rejected as keys were still vulnerable to memory scraping',
      'Dual-stack parallel auth for 12 months — prolonged attack surface during audit cycle'
    ],
    linkedNodeIds: ['DOC-RISK-V2'],
    primaryEvidenceId: 'EVD-AUTH-085',
    tags: ['Auth', 'ZeroTrust', 'Security', 'Contested'],
    warnings: [
      {
        id: 'WARN-CONFLICT-AUTH',
        type: 'conflicting_evidence',
        message: 'Conflicting evidence detected: Engineering Director flagged downstream breakages in batch sync.',
        remediation: 'Hold hard cutoff until batch ETL pipeline adapts gRPC credentials.'
      }
    ]
  },
  {
    id: 'DCSN-9942',
    title: 'Q3 Strategy Shift',
    owner: 'C. Evans',
    ownerRole: 'CEO',
    ownerAvatar: 'CE',
    department: 'Executive Committee',
    date: '2023-10-15 14:32',
    status: 'Confirmed',
    confidence: 82,
    confidenceBreakdown: {
      evidenceCoverage: 90,
      sourceReliability: 88,
      attribution: 100,
      temporalConsistency: 75,
      approvalCompleteness: 60
    },
    impact: 'Critical',
    summary: 'Pivot from aggressive expansion in EMEA to consolidation of North American assets following the revised Q2 risk analysis report and board recommendations.',
    rationale: 'Rising sovereign regulatory friction in Europe and foreign exchange volatility threatened operating margin targets. Consolidating NA assets preserved capital runway.',
    alternativesConsidered: [
      'Maintain EMEA operations with localized subsidiary entity — compliance cost projected at €4.2M/yr',
      'Complete divestment from foreign markets — rejected by board to preserve international trademark holdings'
    ],
    linkedNodeIds: ['PER-EVANS', 'DOC-RISK-V2', 'EVT-BOARD-OCT14'],
    primaryEvidenceId: 'DOC-RISK-V2',
    tags: ['strategy', 'Q3-2023', 'EMEA', 'risk'],
    warnings: []
  },
  {
    id: 'DEC-101',
    title: 'Pivot to Cloud-Native Kubernetes in 2022',
    owner: 'Dr. Elena Rostova',
    ownerRole: 'VP of Platform Engineering',
    ownerAvatar: 'ER',
    department: 'Infrastructure & DevOps',
    date: '2022-10-14 11:30',
    status: 'Approved',
    confidence: 96,
    confidenceBreakdown: {
      evidenceCoverage: 98,
      sourceReliability: 96,
      attribution: 100,
      temporalConsistency: 95,
      approvalCompleteness: 92
    },
    impact: 'Critical',
    summary: 'Phased migration of 18 on-premise core microservices to multi-region cloud-native Kubernetes with GitOps.',
    rationale: 'Legacy on-premise infrastructure was resulting in a 40% increase in deployment bottlenecks, and primary competitor shift necessitated faster time-to-market.',
    alternativesConsidered: [
      'Colocation contract renewal with hardware leasing ($2.4M CapEx)',
      'Serverless only (AWS Lambda) — rejected due to 15m execution limit on document OCR models'
    ],
    linkedNodeIds: ['REF-1', 'PER-CHEN', 'EVT-INC-382'],
    primaryEvidenceId: 'REF-1',
    tags: ['Cloud', 'Kubernetes', 'Infra', 'Scalability'],
    warnings: []
  }
];

// -------------------------------------------------------------
// KNOWLEDGE GRAPH NODES (Screenshot 3 & Dynamic Expansion)
// -------------------------------------------------------------
export const initialGraphNodes: GraphNode[] = [
  // Central Decision Node (Screenshot 3)
  {
    id: 'DCSN-9942',
    label: 'Q3 Strategy Shift',
    type: 'decision',
    subtitle: 'Executive Committee',
    category: 'Corporate Strategy',
    date: '2023.10.15 Confirmed',
    x: 480,
    y: 280,
    confidenceScore: 82,
    status: 'Confirmed',
    owner: 'C. Evans (CEO)',
    description: 'Pivot from aggressive expansion in EMEA to consolidation of North American assets following the revised Q2 risk analysis report and board recommendations.',
    tags: ['strategy', 'Q3-2023', 'EMEA', 'risk'],
    evidenceCount: 3,
    evidenceId: 'DOC-RISK-V2',
    dependencies: [
      { id: 'DOC-RISK-V2', label: 'Doc: Risk Analysis V2', type: 'document', direction: 'out' },
      { id: 'EVT-BOARD-OCT14', label: 'Event: Oct 14 Board Mtg', type: 'event', direction: 'in' }
    ]
  },
  // Connected Person Node (Left in Screenshot 3)
  {
    id: 'PER-EVANS',
    label: 'C. Evans',
    type: 'person',
    subtitle: 'CEO',
    category: 'Leadership',
    date: 'Executive Office',
    x: 190,
    y: 280,
    owner: 'Chief Executive Officer',
    description: 'Chief Executive Officer and Chair of the Executive Committee. Primary signatory of Q3 strategic redirection.',
    tags: ['Executive', 'Signatory', 'Board'],
    evidenceCount: 12
  },
  // Connected Document Node (Top Right in Screenshot 3)
  {
    id: 'DOC-RISK-V2',
    label: 'Risk Analysis V2',
    type: 'document',
    subtitle: 'Document',
    category: 'Risk Management',
    date: '2023-10-12',
    x: 770,
    y: 160,
    description: 'Comprehensive risk assessment modeling macro-economic tightening and cross-border data sovereignty liabilities in EMEA.',
    tags: ['Risk', 'EMEA', 'Analysis', 'Confidential'],
    evidenceCount: 2,
    evidenceId: 'DOC-RISK-V2'
  },
  // Connected Event Node (Bottom Right in Screenshot 3)
  {
    id: 'EVT-BOARD-OCT14',
    label: 'Oct 14 Board Mtg',
    type: 'event',
    subtitle: 'Event',
    category: 'Governance',
    date: '2023-10-14',
    x: 770,
    y: 400,
    description: 'Quarterly board meeting where the executive committee formally reviewed the Q2 risk analysis and recommended North American asset consolidation.',
    tags: ['Board', 'Governance', 'Minutes'],
    evidenceCount: 4
  },

  // Expansion Nodes (dynamically revealed when "Expand Trace" is clicked!)
  {
    id: 'DOC-Q2-RISK',
    label: 'Q2 Risk Report',
    type: 'document',
    subtitle: 'Preceding Risk Baseline',
    category: 'Audit & Risk',
    date: '2023-07-20',
    x: 1040,
    y: 110,
    description: 'Initial quarterly risk evaluation showing emerging compliance bottlenecks in EMEA member states.',
    tags: ['Risk', 'Q2-2023', 'Baseline'],
    evidenceCount: 1,
    isExpanded: true
  },
  {
    id: 'DOC-BOARD-MIN',
    label: 'Board Minutes',
    type: 'document',
    subtitle: 'Oct 14 Verified Record',
    category: 'Governance',
    date: '2023-10-14',
    x: 1040,
    y: 330,
    description: 'Formal corporate secretary minutes ratifying the recommendation to execute the Q3 Strategy Shift.',
    tags: ['Minutes', 'Governance', 'Ratified'],
    evidenceCount: 2,
    isExpanded: true
  },
  {
    id: 'PER-BOARD-ATT',
    label: 'Board Attendees',
    type: 'person',
    subtitle: 'Quorum (8 Members)',
    category: 'Governance',
    date: 'Present: 8/8',
    x: 1040,
    y: 430,
    description: 'Full quorum present including CEO C. Evans, CFO M. Davis, and external audit committee members.',
    tags: ['Quorum', 'Board'],
    evidenceCount: 1,
    isExpanded: true
  },
  {
    id: 'DOC-STRAT-REC',
    label: 'Recommendation',
    type: 'document',
    subtitle: 'M&A Directive',
    category: 'Strategy Directive',
    date: '2023-10-14',
    x: 1040,
    y: 530,
    description: 'Formal recommendation to pursue the Acquisition of NeuralTech Labs to solidify North American technical sovereignty.',
    tags: ['M&A', 'Directive'],
    evidenceCount: 1,
    isExpanded: true
  }
];

export const initialGraphEdges: GraphEdge[] = [
  // Primary connections in Screenshot 3
  {
    id: 'EDGE-1',
    source: 'PER-EVANS',
    target: 'DCSN-9942',
    label: 'AUTHORED_BY',
    confidence: 1.0,
    description: 'C. Evans initiated and confirmed the strategy shift.',
    relationshipStyle: 'verified'
  },
  {
    id: 'EDGE-2',
    source: 'DOC-RISK-V2',
    target: 'DCSN-9942',
    label: 'SUPPORTS',
    confidence: 0.92,
    description: 'Risk Analysis V2 provided evidence for asset consolidation.',
    relationshipStyle: 'verified'
  },
  {
    id: 'EDGE-3',
    source: 'EVT-BOARD-OCT14',
    target: 'DCSN-9942',
    label: 'RESULTED_IN',
    confidence: 0.95,
    description: 'Board deliberation directly resulted in the confirmed shift.',
    relationshipStyle: 'verified'
  },

  // 2nd-hop expanded edges
  {
    id: 'EDGE-EXP-1',
    source: 'DOC-Q2-RISK',
    target: 'DOC-RISK-V2',
    label: 'PRECEDES',
    confidence: 0.90,
    description: 'Q2 Risk Report served as the empirical foundation for V2.',
    relationshipStyle: 'normal'
  },
  {
    id: 'EDGE-EXP-2',
    source: 'DOC-BOARD-MIN',
    target: 'EVT-BOARD-OCT14',
    label: 'SUPPORTS',
    confidence: 1.0,
    description: 'Official verified minutes of the Oct 14 board session.',
    relationshipStyle: 'verified'
  },
  {
    id: 'EDGE-EXP-3',
    source: 'PER-BOARD-ATT',
    target: 'EVT-BOARD-OCT14',
    label: 'DISCUSSED_AT',
    confidence: 1.0,
    description: 'Quorum attended and voted unanimously.',
    relationshipStyle: 'verified'
  },
  {
    id: 'EDGE-EXP-4',
    source: 'DOC-STRAT-REC',
    target: 'EVT-BOARD-OCT14',
    label: 'FOLLOWED_BY',
    confidence: 0.94,
    description: 'Board recommendation paved way for subsequent M&A acquisition.',
    relationshipStyle: 'verified'
  }
];

// -------------------------------------------------------------
// EVIDENCE DOCUMENTS (Screenshot 1 & Detailed Vault)
// -------------------------------------------------------------
export const initialEvidence: Record<string, EvidenceDocument> = {
  'REF-1': {
    id: 'REF-1',
    title: 'Q2 Scalability Assessment.pdf',
    type: 'PDF',
    author: 'S. Chen (VP Eng)',
    date: '2022-07-14T09:22:00Z',
    hash: 'sha256:3a91b2c48e71fa0919920b784a92c10b78291f098a87263b15498e72c81920aa',
    verified: true,
    department: 'Engineering Infrastructure',
    refBadge: 'Ref: 1',
    highlightSnippet: '...analysis indicates that the current on-premise infrastructure is operating at 92% capacity during peak hours. The resulting deployment bottlenecks have increased by 40% quarter-over-quarter. To maintain SLA commitments and counter competitor advancements, a phased migration to a cloud-native architecture is strongly recommended.',
    highlightedKeywords: ['92% capacity', 'deployment bottlenecks have increased by 40% quarter-over-quarter', 'cloud-native architecture'],
    content: `Q2 SCALABILITY & INFRASTRUCTURE ASSESSMENT REPORT
Document ID: DOC-2022-SCALE-09
Date: July 14, 2022 · 09:22:00 UTC
Author: S. Chen, VP of Engineering
Reviewers: Dr. Elena Rostova, Marcus Vance

1. Operational Capacity Findings:
System metrics across our primary colocation data center facility show sustained CPU and memory saturation exceeding 92% capacity during core enterprise operating hours (13:00 - 18:00 UTC).

2. Deployment Bottleneck Metrics:
As service interdependencies expanded from 8 to 18 microservices, manual bare-metal provisioning resulted in a 40% quarter-over-quarter increase in release pipeline wait times. Critical hotfixes currently require an average of 4.8 hours to propagate across redundant hosts.

3. Competitive Threat & Market Timing:
Our chief competitor completed their AWS migration in Q1, allowing them to release weekly functional updates while our cycle time remains bounded at 21 days.

4. Recommendation:
To prevent severe Black Friday SLA failures and ensure 99.99% availability, an immediate and phased migration to a cloud-native containerized architecture (Kubernetes EKS/GKE with GitOps) is strongly recommended.`,
    relatedDecisionId: 'DEC-101'
  },
  'REF-2': {
    id: 'REF-2',
    title: 'Re: Offsite Budget Finalization',
    type: 'Email',
    author: 'M. Davis (CFO)',
    date: '2022-08-23T14:35:00Z',
    hash: 'sha256:88bc92fa102934ef018274619827364501928475610293847561029384756102',
    verified: false,
    department: 'Corporate Finance',
    refBadge: 'Ref: 2',
    missingSubtrace: 'ProcureIT',
    highlightSnippet: `> On Aug 22, 2022, J. Doe wrote:
> Need final nod on the 15% buffer for the AWS transition discussed yesterday.

Yeah, go ahead with the buffer as discussed in the afternoon session. I'll formally sign off in ProcureIT when I'm back at my desk next week.`,
    highlightedKeywords: ['ProcureIT'],
    content: `EMAIL THREAD: Re: Offsite Budget Finalization
From: M. Davis <m.davis@aletheia.internal>
To: J. Doe <j.doe@aletheia.internal>, Executive Committee
Date: Aug 23, 2022 14:35:00 UTC
Subject: Re: Offsite Budget Finalization

> On Aug 22, 2022, J. Doe wrote:
> Executive Offsite - Session #4 Summary:
> Cloud infrastructure team requests authorization for a 15% overrun buffer ($270,000) on the AWS multi-zone transition contract to cover reserve capacity and live database replication during cutover. Need final nod on the 15% buffer for the AWS transition discussed yesterday.

Yeah, go ahead with the buffer as discussed in the afternoon session. I'll formally sign off in ProcureIT when I'm back at my desk next week.

---
TRACEABILITY NOTICE:
No record exists in ProcureIT for PR-88219 (15% Overrun Authorization). CFO M. Davis did not enter the cryptographic token prior to fiscal quarter close.`,
    relatedDecisionId: 'DEC-2023-090'
  },
  'DOC-RISK-V2': {
    id: 'DOC-RISK-V2',
    title: 'Risk Analysis V2: EMEA Operating Environment',
    type: 'Audit',
    author: 'Corporate Risk Office',
    date: '2023-10-12T11:00:00Z',
    hash: 'sha256:6b29384f81092837461524354657687980918273645142536475869708192031',
    verified: true,
    department: 'Risk Governance',
    refBadge: 'Ref: 3',
    highlightSnippet: '...revised Q2 data indicates expanding regulatory compliance exposure across EMEA subsidiaries exceeding projected revenues by 18%. Recommends capital redirection toward consolidating core North American operations.',
    highlightedKeywords: ['EMEA', 'North American operations'],
    content: `RISK ANALYSIS V2
Subject: EMEA Macro Exposure & Sovereign Data Friction
Ratified by: Executive Committee

Findings:
The compliance requirements imposed by emerging pan-European data residency directives increase annualized overhead by $3.4M without commensurate revenue uplift. Capital efficiency models show a 3.8x higher return on invested capital when deployed in the North American platform ecosystem.`,
    relatedDecisionId: 'DCSN-9942'
  },
  'EVD-ACQ-089': {
    id: 'EVD-ACQ-089',
    title: 'NeuralTech Labs M&A Technical Due Diligence',
    type: 'ADR',
    author: 'E. Larson & Technical Committee',
    date: '2023-10-20T16:00:00Z',
    hash: 'sha256:9182736450192837465162738495019283746501928374650192837465019283',
    verified: true,
    department: 'Corporate Development',
    refBadge: 'Ref: 4',
    highlightSnippet: 'Verification of 14 core patent applications and live benchmark confirming 99.2% accuracy on 12-hop graph reasoning benchmarks.',
    content: `NeuralTech Labs Technical Evaluation
Due diligence team inspected the cleanroom codebase, verifying complete independence from open-source viral copyleft licenses. All 42 full-time researchers have signed institutional IP assignment agreements.`,
    relatedDecisionId: 'DEC-2023-089'
  },
  'EVD-AUTH-085': {
    id: 'EVD-AUTH-085',
    title: 'Auth V1 Sunsetting Security Risk Matrix',
    type: 'Audit',
    author: 'J. Reynolds (Chief Security Architect)',
    date: '2023-10-21T10:15:00Z',
    hash: 'sha256:0293847561029384756102938475610293847561029384756102938475610293',
    verified: false,
    department: 'Information Security',
    refBadge: 'Ref: 5',
    highlightSnippet: 'SOC 2 finding: 38 legacy API keys have not rotated in 400+ days. However, immediate revocation risks blocking automated ETL pipelines responsible for daily ledger consolidation.',
    content: `Legacy Auth V1 Deprecation Review
Security team recommends immediate revocation. Counter-plea submitted by Data Engineering highlights lack of service principal support in batch ingestion workers.`,
    relatedDecisionId: 'DEC-2023-085'
  }
};

// -------------------------------------------------------------
// CHAT CONVERSATIONS & DETERMINISTIC RETRIEVAL
// -------------------------------------------------------------
export const initialChatMessages: ChatMessage[] = [
  {
    id: 'MSG-1',
    sender: 'user',
    text: 'Why did we pivot to cloud-native in 2022?',
    timestamp: '10:42 AM'
  },
  {
    id: 'MSG-2',
    sender: 'assistant',
    text: `The pivot to a cloud-native architecture in Q3 2022 was driven primarily by three compounding factors identified in the Q2 Scalability Assessment. Chiefly, legacy on-premise infrastructure was resulting in a 40% increase in deployment bottlenecks [Ref 1], and our primary competitor's shift necessitated faster time-to-market.`,
    timestamp: '10:43 AM',
    confidenceScore: 94,
    confidenceBadge: 'Strong Confidence',
    confidenceLevel: 'strong',
    activeRefId: 'REF-1',
    citations: [
      {
        id: 'CIT-1',
        docTitle: 'Q2 Scalability Assessment.pdf',
        docType: 'PDF',
        author: 'S. Chen (VP Eng)',
        date: '2022-07-14',
        hash: 'sha256:3a91b2c4...',
        evidenceId: 'REF-1',
        snippet: 'Operating at 92% capacity during peak hours; deployment bottlenecks increased 40% quarter-over-quarter.',
        refLabel: '[Ref 1]'
      }
    ],
    graphFocusNodes: ['DEC-101', 'REF-1']
  },
  {
    id: 'MSG-3',
    sender: 'user',
    text: 'Who gave the final approval for the budget increase?',
    timestamp: '10:45 AM'
  },
  {
    id: 'MSG-4',
    sender: 'assistant',
    text: `Records indicate verbal approval was likely given during the August Executive Offsite [Ref 2]. However, formal sign-off in the procurement system (ProcureIT) is missing for the final 15% overrun authorization.`,
    timestamp: '10:45 AM',
    confidenceScore: 48,
    confidenceBadge: 'Weak Confidence',
    confidenceLevel: 'weak',
    activeRefId: 'REF-2',
    traceabilityWarning: {
      id: 'GAP-PROCUREIT',
      type: 'traceability_gap',
      message: 'Traceability gap detected. Recommending audit of Q3 Procurement Logs.',
      remediation: 'Initiate formal procurement audit to reconcile verbal sign-off with ProcureIT entry #88219.',
      conflictingRecords: ['Offsite Budget Finalization Email', 'ProcureIT Master Ledger']
    },
    citations: [
      {
        id: 'CIT-2',
        docTitle: 'Re: Offsite Budget Finalization',
        docType: 'Email',
        author: 'M. Davis (CFO)',
        date: '2022-08-23',
        hash: 'sha256:88bc92fa...',
        evidenceId: 'REF-2',
        snippet: "Yeah, go ahead with the buffer as discussed in the afternoon session. I'll formally sign off in ProcureIT when I'm back at my desk next week.",
        refLabel: '[Ref 2]'
      }
    ],
    graphFocusNodes: ['DEC-2023-090', 'REF-2']
  }
];

// -------------------------------------------------------------
// TIMELINE EVENTS (Chronological & Branching Timeline)
// -------------------------------------------------------------
export const initialTimelineEvents: TimelineEvent[] = [
  {
    id: 'TL-1',
    date: '2022-07-14',
    time: '09:22 UTC',
    title: 'Q2 Scalability Assessment',
    actor: 'S. Chen',
    actorRole: 'VP of Engineering',
    type: 'document_created',
    description: 'Document created detailing 92% capacity saturation and 40% deployment bottleneck increase.',
    relatedEvidenceId: 'REF-1',
    relatedDecisionId: 'DEC-101',
    branch: 'root',
    status: 'confirmed'
  },
  {
    id: 'TL-2',
    date: '2022-08-23',
    time: '14:35 UTC',
    title: 'Offsite Budget Discussion',
    actor: 'M. Davis',
    actorRole: 'Chief Financial Officer',
    type: 'discussion',
    description: 'Verbal approval given via email for 15% AWS transition contingency buffer.',
    relatedEvidenceId: 'REF-2',
    relatedDecisionId: 'DEC-2023-090',
    branch: 'budget_change',
    status: 'confirmed'
  },
  {
    id: 'TL-3',
    date: '2022-08-29',
    time: '18:00 UTC',
    title: 'Procurement Review',
    actor: 'ProcureIT System',
    actorRole: 'Automated Compliance Auditor',
    type: 'sign_off_missing',
    description: 'Formal cryptographic signature missing for final 15% budget overrun authorization.',
    relatedDecisionId: 'DEC-2023-090',
    branch: 'budget_change',
    status: 'warning'
  },
  {
    id: 'TL-4',
    date: '2023-10-14',
    time: '10:00 UTC',
    title: 'Board Meeting',
    actor: 'Executive Board',
    actorRole: 'Full Quorum',
    type: 'meeting',
    description: 'Strategy recommendation issued following review of Q2 Risk Analysis V2.',
    relatedNodeId: 'EVT-BOARD-OCT14',
    relatedDecisionId: 'DCSN-9942',
    branch: 'root',
    status: 'confirmed'
  },
  {
    id: 'TL-5',
    date: '2023-10-15',
    time: '14:32 UTC',
    title: 'Q3 Strategy Shift',
    actor: 'C. Evans',
    actorRole: 'Chief Executive Officer',
    type: 'decision_confirmed',
    description: 'Decision confirmed: Consolidation of North American assets and EMEA pivot.',
    relatedNodeId: 'DCSN-9942',
    relatedDecisionId: 'DCSN-9942',
    branch: 'asset_consolidation',
    status: 'confirmed'
  },
  {
    id: 'TL-6',
    date: '2023-10-24',
    time: '14:30 UTC',
    title: 'Acquisition of NeuralTech Labs',
    actor: 'E. Larson',
    actorRole: 'VP of Corporate Strategy',
    type: 'decision_confirmed',
    description: 'Approved acquisition of NeuralTech Labs for $42M to solidify NA IP dominance.',
    relatedDecisionId: 'DEC-2023-089',
    branch: 'asset_consolidation',
    status: 'confirmed'
  },
  {
    id: 'TL-7',
    date: '2023-10-25',
    time: '09:15 UTC',
    title: 'Q4 Budget Reallocation',
    actor: 'M. Kovač',
    actorRole: 'Director of Cloud Operations',
    type: 'decision_pending',
    description: 'Decision pending: Final sign-off required for $1.8M budget transfer to AWS.',
    relatedDecisionId: 'DEC-2023-090',
    branch: 'budget_change',
    status: 'pending'
  }
];
