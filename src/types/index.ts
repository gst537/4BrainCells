export type NodeType = 'decision' | 'document' | 'person' | 'event';

export type DecisionStatus = 'Approved' | 'Contested' | 'Pending' | 'Deprecated';
export type ImpactTier = 'Critical' | 'High' | 'Medium';

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
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: 'SUPPORTS' | 'PRECEDES' | 'TRIGGERED_BY' | 'AUTHORED_BY' | 'CONTRADICTS' | 'DEPENDS_ON' | 'REVERSES';
  confidence: number;
  description?: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  owner: string;
  ownerRole: string;
  department: string;
  date: string;
  status: DecisionStatus;
  confidence: number;
  impact: ImpactTier;
  summary: string;
  rationale: string;
  alternativesConsidered: string[];
  linkedNodeIds: string[];
  primaryEvidenceId: string;
}

export interface CitationReference {
  id: string;
  docTitle: string;
  docType: 'RFC' | 'ADR' | 'Postmortem' | 'Meeting' | 'Slack' | 'Audit';
  snippet: string;
  author: string;
  date: string;
  hash: string;
  nodeId: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidenceScore?: number;
  confidenceLevel?: 'strong' | 'weak' | 'not_found';
  citations?: CitationReference[];
  graphFocusNodes?: string[];
  fallbackReason?: string;
}

export interface EvidenceDocument {
  id: string;
  title: string;
  type: 'RFC' | 'ADR' | 'Postmortem' | 'Meeting' | 'Slack' | 'Audit';
  author: string;
  date: string;
  hash: string;
  verified: boolean;
  department: string;
  highlightSnippet: string;
  content: string;
  relatedDecisionId: string;
}
