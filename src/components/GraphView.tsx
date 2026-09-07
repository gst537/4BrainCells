'use client';

import { useCallback } from 'react';
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

import DecisionNode from './nodes/DecisionNode';
import DocumentNode from './nodes/DocumentNode';
import PersonNode from './nodes/PersonNode';
import mockData from '../../data/graphMock.json';

const nodeTypes = {
  decisionNode: DecisionNode,
  documentNode: DocumentNode,
  personNode: PersonNode,
};

// Hardcoded layout for the 6 mock nodes to look good instantly
const initialLayout = {
  'person-1': { x: 250, y: 50 },
  'person-2': { x: 700, y: 50 },
  'doc-1': { x: 200, y: 150 },
  'doc-2': { x: 650, y: 150 },
  'decision-1': { x: 150, y: 400 },
  'decision-2': { x: 650, y: 350 },
};

const initialNodes: Node[] = mockData.nodes.map((node) => ({
  ...node,
  position: initialLayout[node.id as keyof typeof initialLayout] || { x: 0, y: 0 },
})) as Node[];

const initialEdges: Edge[] = mockData.edges as unknown as Edge[];

export default function GraphView() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800">Traceability Timeline</h2>
        <p className="text-xs text-slate-500">How decisions, evidence, and people connect.</p>
      </div>
      
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
