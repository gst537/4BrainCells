export type NodeType = 'decision' | 'document' | 'person' | 'event' | 'organization' | 'project';

export type DecisionStatus = 'Approved' | 'Confirmed' | 'Contested' | 'Pending' | 'Deprecated';
export type ImpactTier = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ConfidenceBreakdown {
  evidenceCoverage: number;       // e.g. 90
  sourceReliability: number;      // e.g. 88
  attribution: number;            // e.g. 100
  temporalConsistency: number;    // e.g. 75
  approvalCompleteness: number;   // e.g. 60
}

export interface TraceabilityWarning {
  id: string;
  type: 'missing_approval' | 'conflicting_evidence' | 'traceability_gap';
  message: string;
  remediation?: string;
  conflictingRecords?: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  subtitle: string;
  category: string;
  date: string;
  x: number;
  y: number;
  confidenceScore?: number;
  status?: DecisionStatus;
  owner?: string;
  avatar?: string;
  description: string;
  rationale?: string;
  tags: string[];
  evidenceCount: number;
  evidenceId?: string;
  dependencies?: { id: string; label: string; type: NodeType; direction: 'in' | 'out' }[];
  isExpanded?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: 'SUPPORTS' | 'PRECEDES' | 'TRIGGERED_BY' | 'AUTHORED_BY' | 'CONTRADICTS' | 'DEPENDS_ON' | 'REVERSES' | 'RESULTED_IN' | 'DISCUSSED_AT' | 'FOLLOWED_BY';
  confidence: number;
  description?: string;
  relationshipStyle?: 'verified' | 'normal' | 'uncertain' | 'conflicting';
}

export interface DecisionItem {
  id: string;
  title: string;
  owner: string;
  ownerRole: string;
  ownerAvatar?: string;
  department: string;
  date: string;
  status: DecisionStatus;
  confidence: number;
  confidenceBreakdown?: ConfidenceBreakdown;
  impact: ImpactTier;
  summary: string;
  rationale: string;
  alternativesConsidered: string[];
  linkedNodeIds: string[];
  primaryEvidenceId: string;
  tags?: string[];
  warnings?: TraceabilityWarning[];
}

export interface CitationReference {
  id: string;
  docTitle: string;
  docType: 'RFC' | 'ADR' | 'Postmortem' | 'Meeting' | 'Slack' | 'Audit' | 'PDF' | 'Email';
  snippet: string;
  author: string;
  date: string;
  hash: string;
  nodeId?: string;
  evidenceId?: string;
  refLabel?: string; // e.g. "[Ref 1]"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidenceScore?: number;
  confidenceBadge?: 'Strong Confidence' | 'Weak Confidence' | 'Moderate Confidence' | 'No Evidence';
  confidenceLevel?: 'strong' | 'weak' | 'not_found';
  citations?: CitationReference[];
  graphFocusNodes?: string[];
  fallbackReason?: string;
  traceabilityWarning?: TraceabilityWarning;
  activeRefId?: string;
}

export interface EvidenceDocument {
  id: string;
  title: string;
  type: 'RFC' | 'ADR' | 'Postmortem' | 'Meeting' | 'Slack' | 'Audit' | 'PDF' | 'Email';
  author: string;
  date: string;
  hash: string;
  verified: boolean;
  department: string;
  highlightSnippet: string;
  content: string;
  relatedDecisionId: string;
  refBadge?: string; // "Ref: 1", "Ref: 2"
  missingSubtrace?: string; // e.g. "ProcureIT"
  highlightedKeywords?: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  actor: string;
  actorRole?: string;
  type: 'document_created' | 'discussion' | 'sign_off_missing' | 'meeting' | 'decision_confirmed' | 'decision_pending';
  description: string;
  relatedNodeId?: string;
  relatedDecisionId?: string;
  relatedEvidenceId?: string;
  branch?: string; // for branching timeline: 'root' | 'budget_change' | 'asset_consolidation'
  status?: 'confirmed' | 'warning' | 'pending';
}
