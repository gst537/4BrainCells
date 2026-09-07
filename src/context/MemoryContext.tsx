'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DecisionItem,
  GraphNode,
  GraphEdge,
  EvidenceDocument,
  ChatMessage,
  TimelineEvent,
  ConfidenceBreakdown
} from '@/types';

export type NavigationTab = 'knowledge-graph' | 'decision-ledger' | 'why-chat' | 'timeline';

export function calculateConfidence(breakdown: ConfidenceBreakdown): number {
  return Math.round(
    breakdown.evidenceCoverage * 0.35 +
    breakdown.sourceReliability * 0.25 +
    breakdown.attribution * 0.20 +
    breakdown.temporalConsistency * 0.10 +
    breakdown.approvalCompleteness * 0.10
  );
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'MSG-WELCOME',
  sender: 'assistant',
  timestamp: 'Online',
  text:
    "Ask why something was decided and I'll answer only from the institutional graph — citing the exact " +
    'documents behind the answer. When the evidence is thin or missing, the confidence gate trips and I say so ' +
    'instead of guessing.',
  citations: []
};

const authHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

interface MemoryContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Entities state (populated by search, empty until then)
  decisions: DecisionItem[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  evidence: Record<string, EvidenceDocument>;
  timelineEvents: TimelineEvent[];
  chatMessages: ChatMessage[];

  // Query-driven state
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching: boolean;
  hasSearched: boolean;
  searchError: string | null;
  lastQuery: string;
  performSearch: (query: string) => Promise<void>;
  refreshSearch: () => Promise<void>;
  clearSearch: () => void;
  storageMode: 'connected' | 'in-memory' | null;

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
  ) => Promise<void>;
  createEdge: (source: string, target: string, label: GraphEdge['label'], description?: string) => Promise<void>;
  updateNodePosition: (id: string, x: number, y: number) => Promise<void>;
  updateNodeFields: (id: string, patch: Partial<GraphNode>) => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  exportLedgerCSV: () => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('knowledge-graph');

  // Institutional data — deliberately empty until a search resolves a subgraph.
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [evidence, setEvidence] = useState<Record<string, EvidenceDocument>>({});
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);

  // Query state
  const [searchQuery, setSearchQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'connected' | 'in-memory' | null>(null);
  const lastQueryRef = useRef('');

  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [activeEvidenceRef, setActiveEvidenceRef] = useState<string>('');
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

  // Surface which datastore is live so degraded mode is never silent.
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setStorageMode(data.db === 'connected' ? 'connected' : 'in-memory'))
      .catch(() => setStorageMode('in-memory'));
  }, []);

  // ----------------------------------------------------------
  // Query-driven loading
  // ----------------------------------------------------------

  const runSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) return;

    setIsSearching(true);
    setSearchError(null);
    lastQueryRef.current = q;
    setLastQuery(q);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Search failed (${res.status})`);
      }
      const data = await res.json();

      setGraphNodes(data.nodes || []);
      setGraphEdges(data.edges || []);
      setDecisions(data.decisions || []);
      setTimelineEvents(data.timeline || []);

      const evidenceMap: Record<string, EvidenceDocument> = {};
      (data.evidence || []).forEach((doc: EvidenceDocument) => { evidenceMap[doc.id] = doc; });
      setEvidence(evidenceMap);

      // Focus the strongest match so the detail panes are never empty.
      const firstMatchId: string | undefined = (data.matchedIds || [])[0];
      const firstDecision = (data.decisions || [])[0] as DecisionItem | undefined;
      setSelectedNodeId(firstMatchId || (data.nodes || [])[0]?.id || null);
      setSelectedDecisionId(firstDecision ? firstDecision.id : null);
      const firstEvidence = (data.evidence || [])[0] as EvidenceDocument | undefined;
      setSelectedEvidenceId(firstEvidence ? firstEvidence.id : null);
      setActiveEvidenceRef(firstEvidence ? firstEvidence.id : '');

      setHasSearched(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setSearchError(message);
      setGraphNodes([]);
      setGraphEdges([]);
      setDecisions([]);
      setTimelineEvents([]);
      setEvidence({});
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    await runSearch(query);
  }, [runSearch]);

  /** Re-runs the active query — used after any mutation so the view reflects the DB. */
  const refreshSearch = useCallback(async () => {
    if (lastQueryRef.current) await runSearch(lastQueryRef.current);
  }, [runSearch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setLastQuery('');
    lastQueryRef.current = '';
    setHasSearched(false);
    setSearchError(null);
    setGraphNodes([]);
    setGraphEdges([]);
    setDecisions([]);
    setTimelineEvents([]);
    setEvidence({});
    setSelectedNodeId(null);
    setSelectedDecisionId(null);
    setSelectedEvidenceId(null);
  }, []);

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
    if (id) setIsDecisionDetailOpen(true);
  };

  const selectNode = (id: string | null) => setSelectedNodeId(id);

  const selectEvidence = (id: string | null) => {
    setSelectedEvidenceId(id);
    if (id) setActiveEvidenceRef(id);
  };

  const openPersonModal = (name: string, role: string, department?: string) => {
    setSelectedPerson({ name, role, department });
    setIsPersonModalOpen(true);
  };

  const toggleExpandTrace = () => setIsExpandedTrace(prev => !prev);

  const jumpToGraphForDecision = (decisionId: string) => {
    setActiveTab('knowledge-graph');
    setIsDecisionDetailOpen(false);
    setSelectedNodeId(decisionId);
  };

  // ----------------------------------------------------------
  // Mutations — every one persists, then re-runs the active query
  // ----------------------------------------------------------

  const addDecisionTrace = async (
    newDecision: Partial<DecisionItem>,
    supportingDoc?: Partial<EvidenceDocument>
  ) => {
    const newId = newDecision.id || `DEC-${Date.now()}`;
    const breakdown = newDecision.confidenceBreakdown || {
      evidenceCoverage: 85,
      sourceReliability: 90,
      attribution: 95,
      temporalConsistency: 80,
      approvalCompleteness: 85
    };
    const confidence = calculateConfidence(breakdown);
    const docId = `EVD-${newId}`;
    const nowDate = new Date().toISOString().split('T')[0];

    try {
      if (supportingDoc) {
        await fetch('/api/evidence', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            id: docId,
            title: supportingDoc.title || `${newDecision.title} — supporting record`,
            type: supportingDoc.type || 'RFC',
            author: supportingDoc.author || newDecision.owner || 'Unattributed',
            date: nowDate,
            hash: `sha256:${newId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            verified: false,
            department: newDecision.department || 'Unassigned',
            highlightSnippet: supportingDoc.highlightSnippet || newDecision.summary || '',
            content: supportingDoc.content || newDecision.rationale || '',
            relatedDecisionId: newId
          })
        });
      }

      await fetch('/api/graph/nodes', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          id: newId,
          label: newDecision.title || 'Untitled Decision',
          type: 'decision',
          subtitle: newDecision.department || 'Unassigned',
          category: newDecision.department || 'Unassigned',
          date: nowDate,
          x: 400,
          y: 300,
          confidenceScore: confidence,
          status: newDecision.status || 'Pending',
          owner: newDecision.owner || 'Unattributed',
          description: newDecision.summary || '',
          rationale: newDecision.rationale || '',
          tags: newDecision.tags || [],
          evidenceCount: supportingDoc ? 1 : 0,
          evidenceId: supportingDoc ? docId : undefined
        })
      });

      await refreshSearch();
      setSelectedDecisionId(newId);
      setSelectedNodeId(newId);
    } catch (err) {
      console.error('Failed to record decision trace:', err);
    }
  };

  const createEdge = async (
    source: string,
    target: string,
    label: GraphEdge['label'],
    description?: string
  ) => {
    try {
      const res = await fetch('/api/graph/edges', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ source, target, label, description })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create relationship');
      }
      await refreshSearch();
    } catch (err) {
      console.error('Failed to create edge:', err);
    }
  };

  const updateNodePosition = async (id: string, x: number, y: number) => {
    // Optimistic: the canvas already moved the node, so only persist here.
    setGraphNodes(prev => prev.map(n => (n.id === id ? { ...n, x, y } : n)));
    try {
      await fetch(`/api/graph/nodes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ x, y })
      });
    } catch (err) {
      console.error('Failed to persist node position:', err);
    }
  };

  const updateNodeFields = async (id: string, patch: Partial<GraphNode>) => {
    try {
      const res = await fetch(`/api/graph/nodes/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(patch)
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update node');
      }
      await refreshSearch();
    } catch (err) {
      console.error('Failed to update node:', err);
    }
  };

  // ----------------------------------------------------------
  // Why Chat — grounded answers from /api/chat
  // ----------------------------------------------------------

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `MSG-USER-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);

    const asstId = `MSG-AI-${Date.now()}`;
    setChatMessages(prev => [
      ...prev,
      {
        id: asstId,
        sender: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: []
      }
    ]);

    const history = chatMessages
      .filter(m => m.id !== 'MSG-WELCOME')
      .map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

    try {
      const res = await fetch('/api/chat?stream=true', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ messages: [...history, { role: 'user', content: text.trim() }] })
      });
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let sawMeta = false;
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!value) continue;

        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(payload);
            if (parsed.content) {
              fullText += parsed.content;
              setChatMessages(prev =>
                prev.map(m => (m.id === asstId ? { ...m, text: m.text + parsed.content } : m))
              );
            } else if (parsed.meta) {
              sawMeta = true;
              const score: number = parsed.confidenceScore ?? 0;
              setChatMessages(prev =>
                prev.map(m => m.id === asstId ? {
                  ...m,
                  citations: parsed.citations || [],
                  confidenceScore: score,
                  confidenceLevel: parsed.confidenceLevel,
                  confidenceBadge:
                    score >= 80 ? 'Strong Confidence'
                      : score >= 55 ? 'Moderate Confidence'
                        : score >= 25 ? 'Weak Confidence'
                          : 'No Evidence',
                  graphFocusNodes: parsed.graphFocusNodes || [],
                  fallbackReason: parsed.fallbackReason
                } : m)
              );
              if (parsed.graphFocusNodes?.length) setSelectedNodeId(parsed.graphFocusNodes[0]);
            }
          } catch {
            /* ignore malformed SSE frames */
          }
        }
      }

      if (!sawMeta) {
        setChatMessages(prev =>
          prev.map(m => m.id === asstId ? {
            ...m,
            confidenceScore: fullText ? 60 : 0,
            confidenceLevel: fullText ? 'weak' : 'not_found',
            confidenceBadge: fullText ? 'Moderate Confidence' : 'No Evidence'
          } : m)
        );
      }
    } catch (err) {
      console.error('Chat request failed:', err);
      setChatMessages(prev =>
        prev.map(m => m.id === asstId ? {
          ...m,
          text:
            'The answer service is unreachable right now, so no grounded answer can be produced. ' +
            'No response is being generated from memory — reconnect and ask again.',
          confidenceScore: 0,
          confidenceLevel: 'not_found',
          confidenceBadge: 'No Evidence'
        } : m)
      );
    }
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
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `aletheia_decision_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const askWhyInChat = (query: string) => {
    setActiveTab('why-chat');
    setIsDecisionDetailOpen(false);
    void sendChatMessage(query);
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
        searchQuery,
        setSearchQuery,
        isSearching,
        hasSearched,
        searchError,
        lastQuery,
        performSearch,
        refreshSearch,
        clearSearch,
        storageMode,
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
        createEdge,
        updateNodePosition,
        updateNodeFields,
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
