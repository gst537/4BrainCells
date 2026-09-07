'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { Navbar } from '@/components/Navbar';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodeDrawer } from '@/components/NodeDrawer';
import { DecisionLedger } from '@/components/DecisionLedger';
import { WhyChat } from '@/components/WhyChat';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { SearchModal } from '@/components/SearchModal';
import { mockNodes, mockEdges, mockDecisions } from '@/data/mockData';
import { GraphNode } from '@/types';
import { 
  GitBranch, 
  ShieldCheck, 
  FileCheck2, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'graph' | 'ledger' | 'chat' | 'evidence' | 'split'>('split');
  const [densityMode, setDensityMode] = useState<'executive' | 'analyst'>('executive');
  
  // Data Fetching
  const { data: graphData, error } = useSWR('/api/graph', async (url: string) => {
    // We get the token from localStorage (if implemented) or just pass it if public.
    // For now we'll assume the API requires auth, but we don't have a login flow yet.
    // Wait, the API requires JWT. We need a way to login first. 
    // We'll fetch with a token if available.
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch graph data');
    return res.json();
  });

  const nodes = graphData?.nodes || mockNodes; // fallback to mockNodes if not loaded or error
  const edges = graphData?.edges || mockEdges;

  // Selection states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0]);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('EVD-RFC-042');
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Jump to graph node from ledger or search
  const handleSelectDecisionInGraph = (decisionId: string) => {
    const target = nodes.find((n: GraphNode) => n.id === decisionId);
    if (target) {
      setSelectedNode(target);
      setHighlightedNodeIds([target.id]);
      setActiveTab('graph');
    }
  };

  // Jump to evidence viewer
  const handleSelectEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    setActiveTab('evidence');
  };

  // Jump to chat
  const handleAskWhyInChat = (query: string) => {
    setActiveTab('chat');
  };

  const handleFocusGraphNodes = (nodeIds: string[]) => {
    setHighlightedNodeIds(nodeIds);
    const firstNode = nodes.find((n: GraphNode) => n.id === nodeIds[0]);
    if (firstNode) {
      setSelectedNode(firstNode);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-[#07080c] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        densityMode={densityMode}
        setDensityMode={setDensityMode}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Live Operational Metrics Ribbon */}
      <div className="border-b border-white/5 bg-[#0b0c13]/90 px-4 sm:px-6 py-2.5">
        <div className="mx-auto max-w-[1720px] flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center space-x-6 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-zinc-400 font-mono text-[11px]">INSTITUTIONAL HEALTH:</span>
              <span className="font-semibold text-emerald-400 font-mono">OPTIMAL (99.2%)</span>
            </div>

            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-zinc-400 font-mono text-[11px]">AMNESIA RISK INDEX:</span>
              <span className="font-semibold text-cyan-300 font-mono">8.4% (LOW)</span>
            </div>

            <div className="flex items-center space-x-2">
              <FileCheck2 className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-zinc-400 font-mono text-[11px]">PROVENANCE PROOF:</span>
              <span className="font-semibold text-indigo-300 font-mono">SHA-256 VERIFIED</span>
            </div>

            <div className="flex items-center space-x-2">
              <GitBranch className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-zinc-400 font-mono text-[11px]">GRAPH EDGES:</span>
              <span className="font-semibold text-amber-300 font-mono">14 ACTIVE BRANCHES</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
            <span className="hidden md:inline font-mono">ALETHEIA v2.4 • Hackathon Prototype</span>
            <div className="flex items-center space-x-1 rounded bg-white/5 px-2 py-0.5 border border-white/5 text-zinc-300">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Neo4j + Qdrant Bounded</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full max-w-[1720px] flex flex-col">
        
        {/* VIEW 1: EXECUTIVE SPLIT VIEW */}
        {activeTab === 'split' && (
          <div className="flex flex-col space-y-6 flex-1">
            {/* Top Row: Knowledge Graph + Node Context Drawer */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-[640px] flex-1">
              <div className="xl:col-span-2 flex flex-col h-full min-h-[500px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Interactive Branching Knowledge Map
                    </h3>
                    <span className="text-zinc-500 text-xs">• Drag nodes to explore connection branches</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('graph')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <span>Expand Fullscreen</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <div className="flex-1 h-full min-h-[520px]">
                  <GraphCanvas
                    nodes={nodes}
                    edges={edges}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                    onSelectEvidence={handleSelectEvidence}
                    highlightedNodeIds={highlightedNodeIds}
                    densityMode={densityMode}
                  />
                </div>
              </div>

              {/* Side Context Inspector Drawer */}
              <div className="h-full min-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <NodeDrawer
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  edges={mockEdges}
                  allNodes={mockNodes}
                  onSelectNode={setSelectedNode}
                  onSelectEvidence={handleSelectEvidence}
                  onAskWhyInChat={handleAskWhyInChat}
                />
              </div>
            </div>

            {/* Bottom Row: Curated Decision Ledger */}
            <div className="min-h-[420px]">
              <DecisionLedger
                decisions={mockDecisions}
                onSelectDecisionInGraph={handleSelectDecisionInGraph}
                onAskWhyInChat={handleAskWhyInChat}
                onSelectEvidence={handleSelectEvidence}
                densityMode={densityMode}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: FULL BRANCH GRAPH VIEW */}
        {activeTab === 'graph' && (
          <div className="flex flex-col xl:flex-row gap-4 h-[calc(100vh-140px)] flex-1">
            <div className="flex-1 h-full">
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                onSelectEvidence={handleSelectEvidence}
                highlightedNodeIds={highlightedNodeIds}
                densityMode={densityMode}
              />
            </div>
            {selectedNode && (
              <div className="w-full xl:w-[420px] shrink-0 h-full rounded-2xl overflow-hidden border border-white/10">
                <NodeDrawer
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  edges={mockEdges}
                  allNodes={mockNodes}
                  onSelectNode={setSelectedNode}
                  onSelectEvidence={handleSelectEvidence}
                  onAskWhyInChat={handleAskWhyInChat}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: DECISION LEDGER VIEW */}
        {activeTab === 'ledger' && (
          <div className="h-[calc(100vh-140px)] flex-1">
            <DecisionLedger
              decisions={mockDecisions}
              onSelectDecisionInGraph={handleSelectDecisionInGraph}
              onAskWhyInChat={handleAskWhyInChat}
              onSelectEvidence={handleSelectEvidence}
              densityMode={densityMode}
            />
          </div>
        )}

        {/* VIEW 4: 'WHY' CHAT & EVIDENCE SPLIT VIEW */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] flex-1">
            <WhyChat
              onSelectEvidence={setSelectedEvidenceId}
              onFocusGraphNodes={handleFocusGraphNodes}
            />
            <EvidenceViewer
              selectedEvidenceId={selectedEvidenceId}
              onSelectEvidenceId={setSelectedEvidenceId}
              onSelectDecision={handleSelectDecisionInGraph}
            />
          </div>
        )}

        {/* VIEW 5: EVIDENCE VAULT VIEW */}
        {activeTab === 'evidence' && (
          <div className="h-[calc(100vh-140px)] flex-1">
            <EvidenceViewer
              selectedEvidenceId={selectedEvidenceId}
              onSelectEvidenceId={setSelectedEvidenceId}
              onSelectDecision={handleSelectDecisionInGraph}
            />
          </div>
        )}

      </main>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        nodes={nodes}
        onSelectNode={(node) => {
          setSelectedNode(node);
          setHighlightedNodeIds([node.id]);
          if (node.type === 'decision') {
            setActiveTab('split');
          } else {
            setActiveTab('graph');
          }
        }}
      />

    </div>
  );
}
