'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DecisionItem,
  GraphNode,
  GraphEdge,
  EvidenceDocument,
  ChatMessage,
  TimelineEvent,
  CitationReference
} from '@/types';
import {
  initialDecisions,
  initialGraphNodes,
  initialGraphEdges,
  initialEvidence,
  initialChatMessages,
  initialTimelineEvents,
  calculateConfidence
} from '@/data/mockStore';

export type NavigationTab = 'knowledge-graph' | 'decision-ledger' | 'why-chat' | 'timeline';

interface MemoryContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Entities state
  decisions: DecisionItem[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  evidence: Record<string, EvidenceDocument>;
  timelineEvents: TimelineEvent[];
  chatMessages: ChatMessage[];
  
  // Selection
  selectedDecisionId: string | null;
  selectedDecision: DecisionItem | null;
  selectedNodeId: string | null;
  selectedNode: GraphNode | null;
  selectedEvidenceId: string | null;
  selectedEvidence: EvidenceDocument | null;
  activeEvidenceRef: string;
  
  // Trace Expansion
  isExpandedTrace: boolean;
  toggleExpandTrace: () => void;

  // Modals & Drawers
  isDecisionDetailOpen: boolean;
  setIsDecisionDetailOpen: (open: boolean) => void;
  isNewTraceModalOpen: boolean;
  setIsNewTraceModalOpen: (open: boolean) => void;
  isDocumentModalOpen: boolean;
  setIsDocumentModalOpen: (open: boolean) => void;
  isThreadModalOpen: boolean;
  setIsThreadModalOpen: (open: boolean) => void;
  isPersonModalOpen: boolean;
  setIsPersonModalOpen: (open: boolean) => void;
  selectedPerson: { name: string; role: string; department?: string } | null;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  
  // Filter state
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  filterConfidence: string;
  setFilterConfidence: (c: string) => void;
  filterOwner: string;
  setFilterOwner: (o: string) => void;
  filterTag: string;
  setFilterTag: (t: string) => void;
  clearFilters: () => void;

  // Actions
  selectDecision: (id: string | null) => void;
  selectNode: (id: string | null) => void;
  selectEvidence: (id: string | null) => void;
  setActiveEvidenceRef: (ref: string) => void;
  openPersonModal: (name: string, role: string, department?: string) => void;
  jumpToGraphForDecision: (decisionId: string) => void;
  askWhyInChat: (query: string) => void;
  addDecisionTrace: (
    newDecision: Partial<DecisionItem>,
    mockDoc?: Partial<EvidenceDocument>
  ) => void;
  sendChatMessage: (text: string) => Promise<void>;
  exportLedgerCSV: () => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('why-chat');
  
  const [decisions, setDecisions] = useState<DecisionItem[]>(initialDecisions);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(initialGraphNodes);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(initialGraphEdges);
  const [evidence, setEvidence] = useState<Record<string, EvidenceDocument>>(initialEvidence);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(initialTimelineEvents);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>('DCSN-9942');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('DCSN-9942');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>('REF-1');
  const [activeEvidenceRef, setActiveEvidenceRef] = useState<string>('REF-1');
  const [isExpandedTrace, setIsExpandedTrace] = useState<boolean>(false);

  // Modals
  const [isDecisionDetailOpen, setIsDecisionDetailOpen] = useState(false);
  const [isNewTraceModalOpen, setIsNewTraceModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<{ name: string; role: string; department?: string } | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterConfidence('all');
    setFilterOwner('all');
    setFilterTag('all');
  };

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsDecisionDetailOpen(false);
        setIsNewTraceModalOpen(false);
        setIsDocumentModalOpen(false);
        setIsThreadModalOpen(false);
        setIsPersonModalOpen(false);
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedDecision = decisions.find(d => d.id === selectedDecisionId) || null;
  const selectedNode = graphNodes.find(n => n.id === selectedNodeId) || null;
  const selectedEvidence = (selectedEvidenceId && evidence[selectedEvidenceId]) ? evidence[selectedEvidenceId] : null;

  const selectDecision = (id: string | null) => {
    setSelectedDecisionId(id);
    if (id) {
      setIsDecisionDetailOpen(true);
    }
  };

  const selectNode = (id: string | null) => {
    setSelectedNodeId(id);
  };

  const selectEvidence = (id: string | null) => {
    setSelectedEvidenceId(id);
    if (id === 'REF-2') {
      setActiveEvidenceRef('REF-2');
    } else if (id === 'REF-1') {
      setActiveEvidenceRef('REF-1');
    }
  };

  const openPersonModal = (name: string, role: string, department?: string) => {
    setSelectedPerson({ name, role, department });
    setIsPersonModalOpen(true);
  };

  const toggleExpandTrace = () => {
    setIsExpandedTrace(prev => !prev);
  };

  const jumpToGraphForDecision = (decisionId: string) => {
    setActiveTab('knowledge-graph');
    setIsDecisionDetailOpen(false);
    setSelectedNodeId(decisionId);
  };

  const askWhyInChat = (query: string) => {
    setActiveTab('why-chat');
    setIsDecisionDetailOpen(false);
    sendChatMessage(query);
  };

  const addDecisionTrace = (
    newDecision: Partial<DecisionItem>,
    mockDoc?: Partial<EvidenceDocument>
  ) => {
    const newId = newDecision.id || `DEC-2024-${Math.floor(100 + Math.random() * 900)}`;
    const breakdown = newDecision.confidenceBreakdown || {
      evidenceCoverage: 85,
      sourceReliability: 90,
      attribution: 95,
      temporalConsistency: 80,
      approvalCompleteness: 85
    };
    const calculatedConf = calculateConfidence(breakdown);

    const docId = `DOC-${newId}`;
    if (mockDoc) {
      const createdEvidence: EvidenceDocument = {
        id: docId,
        title: mockDoc.title || `${newDecision.title} Specification`,
        type: mockDoc.type || 'RFC',
        author: mockDoc.author || (newDecision.owner ? `${newDecision.owner} (${newDecision.ownerRole || 'Owner'})` : 'Author'),
        date: new Date().toISOString(),
        hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
        verified: true,
        department: newDecision.department || 'Operations',
        highlightSnippet: mockDoc.highlightSnippet || newDecision.summary || '',
        content: mockDoc.content || newDecision.rationale || '',
        relatedDecisionId: newId,
        refBadge: `Ref: ${Object.keys(evidence).length + 1}`
      };
      setEvidence(prev => ({ ...prev, [docId]: createdEvidence }));
    }

    const createdDecision: DecisionItem = {
      id: newId,
      title: newDecision.title || 'Untitled Decision',
      owner: newDecision.owner || 'Exec User',
      ownerRole: newDecision.ownerRole || 'Technical Director',
      ownerAvatar: newDecision.owner ? newDecision.owner.split(' ').map(n => n[0]).join('') : 'EU',
      department: newDecision.department || 'Executive Operations',
      date: newDecision.date || new Date().toISOString().slice(0, 16).replace('T', ' '),
      status: newDecision.status || 'Approved',
      confidence: calculatedConf,
      confidenceBreakdown: breakdown,
      impact: newDecision.impact || 'High',
      summary: newDecision.summary || 'Trace generated via Institutional Memory wizard.',
      rationale: newDecision.rationale || 'Operational mandate based on evidentiary audit.',
      alternativesConsidered: newDecision.alternativesConsidered || ['Status quo / defer decision'],
      linkedNodeIds: [newId, docId],
      primaryEvidenceId: docId,
      tags: newDecision.tags && newDecision.tags.length ? newDecision.tags : ['NewTrace', '2024']
    };

    // Live update Ledger
    setDecisions(prev => [createdDecision, ...prev]);

    // Live update Graph
    const newNode: GraphNode = {
      id: newId,
      label: createdDecision.title,
      type: 'decision',
      subtitle: createdDecision.ownerRole,
      category: createdDecision.department,
      date: createdDecision.date,
      x: 480 + (Math.random() * 80 - 40),
      y: 200 + (Math.random() * 80 - 40),
      confidenceScore: calculatedConf,
      status: createdDecision.status,
      owner: createdDecision.owner,
      description: createdDecision.summary,
      tags: createdDecision.tags || [],
      evidenceCount: 1,
      evidenceId: docId
    };
    setGraphNodes(prev => [...prev, newNode]);

    // Live update Timeline
    const newTimelineEvent: TimelineEvent = {
      id: `TL-${newId}`,
      date: createdDecision.date.split(' ')[0],
      time: createdDecision.date.split(' ')[1] || '12:00',
      title: createdDecision.title,
      actor: createdDecision.owner,
      actorRole: createdDecision.ownerRole,
      type: createdDecision.status === 'Approved' ? 'decision_confirmed' : 'decision_pending',
      description: createdDecision.summary,
      relatedDecisionId: newId,
      relatedEvidenceId: docId,
      branch: 'root',
      status: createdDecision.status === 'Approved' ? 'confirmed' : 'pending'
    };
    setTimelineEvents(prev => [newTimelineEvent, ...prev]);

    // Select the new item
    setSelectedDecisionId(newId);
    setSelectedNodeId(newId);
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `MSG-USER-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Deterministic intelligence engine
    const queryLower = text.toLowerCase();
    let replyText = '';
    let confidenceScore = 80;
    let confidenceBadge: ChatMessage['confidenceBadge'] = 'Strong Confidence';
    let confidenceLevel: ChatMessage['confidenceLevel'] = 'strong';
    let citations: CitationReference[] = [];
    let activeRefId: string | undefined = undefined;
    let traceabilityWarning = undefined;
    let graphFocusNodes: string[] = [];

    if (queryLower.includes('cloud-native') || queryLower.includes('pivot') || queryLower.includes('2022') || queryLower.includes('scalability')) {
      replyText = `The pivot to a cloud-native architecture in Q3 2022 was driven primarily by three compounding factors identified in the Q2 Scalability Assessment. Chiefly, legacy on-premise infrastructure was resulting in a 40% increase in deployment bottlenecks [Ref 1], and our primary competitor's shift necessitated faster time-to-market.`;
      confidenceScore = 94;
      confidenceBadge = 'Strong Confidence';
      confidenceLevel = 'strong';
      activeRefId = 'REF-1';
      graphFocusNodes = ['DEC-101', 'REF-1'];
      citations = [
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
      ];
    } else if (queryLower.includes('budget') || queryLower.includes('approval') || queryLower.includes('cfo') || queryLower.includes('procureit')) {
      replyText = `Records indicate verbal approval was likely given during the August Executive Offsite [Ref 2]. However, formal sign-off in the procurement system (ProcureIT) is missing for the final 15% overrun authorization.`;
      confidenceScore = 48;
      confidenceBadge = 'Weak Confidence';
      confidenceLevel = 'weak';
      activeRefId = 'REF-2';
      graphFocusNodes = ['DEC-2023-090', 'REF-2'];
      traceabilityWarning = {
        id: 'GAP-PROCUREIT',
        type: 'traceability_gap' as const,
        message: 'Traceability gap detected. Recommending audit of Q3 Procurement Logs.',
        remediation: 'Initiate formal procurement audit to reconcile verbal sign-off with ProcureIT entry #88219.',
        conflictingRecords: ['Offsite Budget Finalization Email', 'ProcureIT Master Ledger']
      };
      citations = [
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
      ];
    } else if (queryLower.includes('neuraltech') || queryLower.includes('acquisition') || queryLower.includes('larson')) {
      replyText = `The Acquisition of NeuralTech Labs (DEC-2023-089) was approved on 2023-10-24 led by E. Larson with a 92% confidence score. Technical due diligence validated 14 core patent applications and live benchmark confirming 99.2% accuracy on 12-hop graph reasoning benchmarks.`;
      confidenceScore = 92;
      confidenceBadge = 'Strong Confidence';
      confidenceLevel = 'strong';
      activeRefId = 'EVD-ACQ-089';
      graphFocusNodes = ['DEC-2023-089', 'EVD-ACQ-089'];
      citations = [
        {
          id: 'CIT-3',
          docTitle: 'NeuralTech Labs M&A Technical Due Diligence',
          docType: 'ADR',
          author: 'E. Larson & Technical Committee',
          date: '2023-10-20',
          hash: 'sha256:91827364...',
          evidenceId: 'EVD-ACQ-089',
          snippet: 'Cleanroom codebase verified; 14 core patent applications transferred without copyleft encumbrances.',
          refLabel: '[Ref 3]'
        }
      ];
    } else if (queryLower.includes('strategy') || queryLower.includes('emea') || queryLower.includes('evans')) {
      replyText = `The Q3 Strategy Shift (DCSN-9942) was confirmed on 2023-10-15 by CEO C. Evans. Following the Q2 risk analysis and the Oct 14 Board Meeting, the organization pivoted from aggressive expansion in EMEA to consolidation of North American assets.`;
      confidenceScore = 82;
      confidenceBadge = 'Strong Confidence';
      confidenceLevel = 'strong';
      activeRefId = 'DOC-RISK-V2';
      graphFocusNodes = ['DCSN-9942', 'DOC-RISK-V2', 'EVT-BOARD-OCT14'];
      citations = [
        {
          id: 'CIT-4',
          docTitle: 'Risk Analysis V2: EMEA Operating Environment',
          docType: 'Audit',
          author: 'Corporate Risk Office',
          date: '2023-10-12',
          hash: 'sha256:6b29384f...',
          evidenceId: 'DOC-RISK-V2',
          snippet: 'Regulatory compliance overhead in EMEA increased 18% with projected €4.2M compliance friction.',
          refLabel: '[Ref 4]'
        }
      ];
    } else if (queryLower.includes('auth') || queryLower.includes('reynolds') || queryLower.includes('contested')) {
      replyText = `Deprecation of Legacy Auth V1 (DEC-2023-085) is currently contested (42% confidence). While security architects noted 38 non-expiring tokens during SOC 2, Data Engineering raised concerns that legacy batch ETL synchronization will break without prior adapter deployments.`;
      confidenceScore = 42;
      confidenceBadge = 'Weak Confidence';
      confidenceLevel = 'weak';
      activeRefId = 'EVD-AUTH-085';
      graphFocusNodes = ['DEC-2023-085', 'EVD-AUTH-085'];
      traceabilityWarning = {
        id: 'WARN-CONFLICT-AUTH',
        type: 'conflicting_evidence' as const,
        message: 'Conflicting evidence detected: Engineering Director flagged downstream breakages in batch sync.',
        remediation: 'Hold hard cutoff until batch ETL pipeline adapts gRPC credentials.'
      };
      citations = [
        {
          id: 'CIT-5',
          docTitle: 'Auth V1 Sunsetting Security Risk Matrix',
          docType: 'Audit',
          author: 'J. Reynolds',
          date: '2023-10-21',
          hash: 'sha256:02938475...',
          evidenceId: 'EVD-AUTH-085',
          snippet: '38 legacy API keys active without rotation; downstream ETL dependencies unmapped.',
          refLabel: '[Ref 5]'
        }
      ];
    } else {
      replyText = 'No sufficiently supported evidence was found in the institutional memory for this inquiry. Verify that relevant documents and decision transcripts have been ingested into the knowledge vault.';
      confidenceScore = 8;
      confidenceBadge = 'No Evidence';
      confidenceLevel = 'not_found';
    }

    if (activeRefId) {
      setActiveEvidenceRef(activeRefId);
      setSelectedEvidenceId(activeRefId);
    }

    const aiMsg: ChatMessage = {
      id: `MSG-AI-${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceScore,
      confidenceBadge,
      confidenceLevel,
      activeRefId,
      citations,
      graphFocusNodes,
      traceabilityWarning
    };

    setTimeout(() => {
      setChatMessages(prev => [...prev, aiMsg]);
    }, 450);
  };

  const exportLedgerCSV = () => {
    const headers = ['DECISION_ID', 'TITLE', 'PRIMARY_OWNER', 'CONFIDENCE', 'STATUS', 'DATE', 'DEPARTMENT'];
    const rows = decisions.map(d => [
      `"${d.id}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.owner}"`,
      `"${d.confidence}%"`,
      `"${d.status}"`,
      `"${d.date}"`,
      `"${d.department}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aletheia_decision_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MemoryContext.Provider
      value={{
        activeTab,
        setActiveTab,
        decisions,
        graphNodes,
        graphEdges,
        evidence,
        timelineEvents,
        chatMessages,
        selectedDecisionId,
        selectedDecision,
        selectedNodeId,
        selectedNode,
        selectedEvidenceId,
        selectedEvidence,
        activeEvidenceRef,
        isExpandedTrace,
        toggleExpandTrace,
        isDecisionDetailOpen,
        setIsDecisionDetailOpen,
        isNewTraceModalOpen,
        setIsNewTraceModalOpen,
        isDocumentModalOpen,
        setIsDocumentModalOpen,
        isThreadModalOpen,
        setIsThreadModalOpen,
        isPersonModalOpen,
        setIsPersonModalOpen,
        selectedPerson,
        isSearchModalOpen,
        setIsSearchModalOpen,
        filterStatus,
        setFilterStatus,
        filterConfidence,
        setFilterConfidence,
        filterOwner,
        setFilterOwner,
        filterTag,
        setFilterTag,
        clearFilters,
        selectDecision,
        selectNode,
        selectEvidence,
        setActiveEvidenceRef,
        openPersonModal,
        jumpToGraphForDecision,
        askWhyInChat,
        addDecisionTrace,
        sendChatMessage,
        exportLedgerCSV
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};
