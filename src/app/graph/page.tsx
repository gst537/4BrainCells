'use client';

import React, { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { GraphCanvas } from '@/components/GraphCanvas';
import { NodeDrawer } from '@/components/NodeDrawer';
import { AddNodeModal } from '@/components/AddNodeModal';
import { mockNodes, mockEdges } from '@/data/mockData';
import { GraphNode, GraphEdge } from '@/types';
import { Plus } from 'lucide-react';

const fetcher = (url: string) => {
  const token = localStorage.getItem('jwt');
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => res.json());
};

const authedFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jwt');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
};

export default function GraphPage() {
  const { data: graphData, error, isLoading } = useSWR('/api/graph', fetcher);
  const { mutate } = useSWRConfig();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);

  // Fallback to mock data if API fails or while loading
  const nodes = graphData?.nodes || mockNodes;
  const edges = graphData?.edges || mockEdges;

  const handleCreateEdge = async (source: string, target: string, label: GraphEdge['label']) => {
    try {
      const res = await authedFetch('/api/graph/edges', {
        method: 'POST',
        body: JSON.stringify({ source, target, label })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create edge');
      }
      await mutate('/api/graph');
    } catch (err) {
      console.error('Failed to create edge:', err);
    }
  };

  const handleNodeMoved = async (id: string, x: number, y: number) => {
    try {
      await authedFetch(`/api/graph/nodes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ x, y })
      });
      await mutate('/api/graph');
    } catch (err) {
      console.error('Failed to persist node position:', err);
    }
  };

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 border-r border-white/10 bg-[#07080c] relative">
        <GraphCanvas 
          nodes={nodes} 
          edges={edges} 
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
          onSelectEvidence={(id) => {
            // Need to import useRouter if we want to navigate
            console.log('evidence', id);
          }}
          densityMode="executive"
          onCreateEdge={handleCreateEdge}
          onNodeMoved={handleNodeMoved}
        />
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <h2 className="text-sm font-semibold tracking-wide text-white flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
            <span>Branch Graph</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
              Interactive
            </span>
          </h2>
          <button 
            onClick={() => setIsAddNodeOpen(true)}
            className="flex items-center justify-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(0,245,255,0.2)] transition-all w-fit"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Node</span>
          </button>
        </div>
      </div>
      
      {selectedNode ? (
        <div className="w-[420px] bg-[#0c0d12] flex flex-col min-h-0 border-l border-white/10 shrink-0">
          <div className="flex-1 overflow-y-auto">
            <NodeDrawer 
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              edges={edges}
              allNodes={nodes}
              onSelectNode={setSelectedNode}
              onSelectEvidence={(id) => console.log('evidence', id)}
              onAskWhyInChat={(q) => console.log('chat', q)}
            />
          </div>
        </div>
      ) : (
        <div className="w-[420px] bg-[#0c0d12] flex flex-col items-center justify-center p-8 text-center shrink-0 border-l border-white/10">
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

      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onNodeAdded={(node) => setSelectedNode(node)}
      />
    </div>
  );
}
