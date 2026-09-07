'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus } from 'lucide-react';

import DecisionNode from './nodes/DecisionNode';
import DocumentNode from './nodes/DocumentNode';
import PersonNode from './nodes/PersonNode';
import AddNodeModal from './AddNodeModal';

const nodeTypes = {
  decisionNode: DecisionNode,
  documentNode: DocumentNode,
  personNode: PersonNode,
};

export default function GraphView() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch initial graph data
  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((data) => {
        if (data.nodes) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
      })
      .catch((err) => console.error('Failed to fetch graph data:', err));
  }, [setNodes, setEdges]);

  // Sync back to API
  const syncGraph = async (newNodes: Node[], newEdges: Edge[]) => {
    try {
      await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: newNodes, edges: newEdges }),
      });
    } catch (error) {
      console.error('Failed to sync graph data:', error);
    }
  };

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        syncGraph(nodes, newEdges);
        return newEdges;
      });
    },
    [nodes, setEdges]
  );

  const handleAddNode = (type: string, data: Record<string, unknown>) => {
    const id = `${type.split('Node')[0]}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 400 + Math.random() * 50, y: 300 + Math.random() * 50 },
      data,
    };
    
    setNodes((nds) => {
      const newNodes = [...nds, newNode];
      syncGraph(newNodes, edges);
      return newNodes;
    });
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Traceability Timeline</h2>
        <p className="text-xs text-slate-500">How decisions, evidence, and people connect.</p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-4 right-4 z-10 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 group"
      >
        <Plus className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium text-sm pr-1">
          Add Entity
        </span>
      </button>

      <AddNodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddNode={handleAddNode}
      />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50"
      >
        <Controls className="bg-white border-slate-200 fill-slate-600" />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'decisionNode': return '#10b981'; // emerald
              case 'documentNode': return '#6366f1'; // indigo
              case 'personNode': return '#cbd5e1'; // slate
              default: return '#eee';
            }
          }}
          className="bg-white border border-slate-200 rounded-lg shadow-sm"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#cbd5e1" />
      </ReactFlow>
    </div>
  );
}
