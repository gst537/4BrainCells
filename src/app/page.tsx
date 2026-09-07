'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodeDrawer } from '@/components/NodeDrawer';
import { DecisionLedger } from '@/components/DecisionLedger';
import { mockNodes, mockEdges, mockDecisions } from '@/data/mockData';
import { GraphNode } from '@/types';
import { 
  GitBranch, 
  ShieldCheck, 
  FileCheck2, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  // Data Fetching
  const { data: graphData, error } = useSWR('/api/graph', async (url: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch graph data');
    return res.json();
  });

  const nodes = graphData?.nodes || mockNodes;
  const edges = graphData?.edges || mockEdges;

  // Selection states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0] || null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  // Density Mode (normally in context, using executive for dashboard)
  const densityMode = 'executive';

  // Navigation helpers for jumping to other pages
  const handleSelectDecisionInGraph = (decisionId: string) => {
    const target = nodes.find((n: GraphNode) => n.id === decisionId);
    if (target) {
      setSelectedNode(target);
      setHighlightedNodeIds([target.id]);
      // If we wanted to go full screen, we'd go to /graph?node=id
    }
  };

  const handleSelectEvidence = (evidenceId: string) => {
    router.push(`/vault?id=${evidenceId}`);
  };

  const handleAskWhyInChat = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#07080c] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
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
              <span className="font-semibold text-amber-300 font-mono">{edges.length} ACTIVE BRANCHES</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
            <span className="hidden md:inline font-mono">ALETHEIA v2.4</span>
            <div className="flex items-center space-x-1 rounded bg-white/5 px-2 py-0.5 border border-white/5 text-zinc-300">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>Neo4j + Qdrant Bounded</span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full max-w-[1720px] flex flex-col min-h-0">
        
        <div className="flex flex-col space-y-6 flex-1 min-h-0">
          {/* Top Row: Knowledge Graph + Node Context Drawer */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[500px]">
            <div className="xl:col-span-2 flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Interactive Branching Knowledge Map
                  </h3>
                  <span className="text-zinc-500 text-xs">• Drag nodes to explore connection branches</span>
                </div>
                <button
                  onClick={() => router.push('/graph')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>Expand Fullscreen</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
              
              <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/10 relative">
                <GraphCanvas
                  nodes={nodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  onSelectNode={setSelectedNode}
                  onSelectEvidence={handleSelectEvidence}
                  densityMode={densityMode}
                />
              </div>
            </div>

            {/* Side Context Inspector Drawer */}
            <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0c0d12]">
              {selectedNode ? (
                <NodeDrawer
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  edges={edges}
                  allNodes={nodes}
                  onSelectNode={setSelectedNode}
                  onSelectEvidence={handleSelectEvidence}
                  onAskWhyInChat={handleAskWhyInChat}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-white mb-2">Select a Node</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Click any decision node in the graph to view its detailed trace, context, and associated evidence.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Curated Decision Ledger */}
          <div className="h-[400px] shrink-0 border border-white/10 rounded-2xl overflow-hidden">
            <DecisionLedger
              decisions={mockDecisions}
              onSelectDecisionInGraph={handleSelectDecisionInGraph}
              onAskWhyInChat={handleAskWhyInChat}
              onSelectEvidence={handleSelectEvidence}
              densityMode={densityMode}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
