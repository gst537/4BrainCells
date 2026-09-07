'use client';

import React, { useState, useRef } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { GraphNode } from '@/types';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Maximize2, 
  X, 
  FileText, 
  User, 
  Calendar, 
  Share2, 
  ArrowRight,
  ArrowLeft,
  GitBranch,
  ShieldCheck,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const KnowledgeGraphView: React.FC = () => {
  const {
    graphNodes,
    graphEdges,
    selectedNodeId,
    selectNode,
    isExpandedTrace,
    toggleExpandTrace,
    askWhyInChat,
    selectEvidence,
    setIsDocumentModalOpen
  } = useMemory();

  // Canvas pan & zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  // Selected node details
  const selectedNode = graphNodes.find(n => n.id === selectedNodeId) || graphNodes[0];

  const handleZoomIn = () => setZoom(z => Math.min(2.0, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.15));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingCanvas) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggedNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: { x, y }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggedNodeId(null);
  };

  const getNodePos = (node: GraphNode) => {
    if (nodePositions[node.id]) {
      return nodePositions[node.id];
    }
    return { x: node.x, y: node.y };
  };

  // Visible nodes (central & 1st hop always visible; 2nd hop shown when isExpandedTrace is true)
  const visibleNodes = graphNodes.filter(n => !n.isExpanded || isExpandedTrace);
  const visibleEdges = graphEdges.filter(e => {
    const sourceNode = graphNodes.find(n => n.id === e.source);
    const targetNode = graphNodes.find(n => n.id === e.target);
    if (!sourceNode || !targetNode) return false;
    if (sourceNode.isExpanded && !isExpandedTrace) return false;
    if (targetNode.isExpanded && !isExpandedTrace) return false;
    return true;
  });

  return (
    <div 
      className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#101010] relative select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      {/* GRAPH CANVAS AREA with dark dotted grid */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        className="flex-1 relative h-full overflow-hidden bg-dotted-grid cursor-grab active:cursor-grabbing"
      >
        
        {/* SVG Edge Connections */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {visibleEdges.map(edge => {
            const sourceNode = graphNodes.find(n => n.id === edge.source);
            const targetNode = graphNodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const p1 = getNodePos(sourceNode);
            const p2 = getNodePos(targetNode);

            // Calculate center offsets based on node dimensions
            const x1 = p1.x + 80;
            const y1 = p1.y + 35;
            const x2 = p2.x + 80;
            const y2 = p2.y + 35;

            const isDashed = edge.source === 'PER-EVANS' || edge.label === 'AUTHORED_BY';

            return (
              <g key={edge.id} className="transition-all duration-500">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edge.relationshipStyle === 'verified' ? '#00E5FF' : '#555555'}
                  strokeWidth={1.5}
                  strokeDasharray={isDashed ? '4 4' : undefined}
                  opacity={0.7}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes Container */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {visibleNodes.map(node => {
            const pos = getNodePos(node);
            const isSelected = selectedNodeId === node.id;
            const isCentral = node.id === 'DCSN-9942';

            return (
              <div
                key={node.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                  selectNode(node.id);
                }}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  position: 'absolute'
                }}
                className={`graph-node pointer-events-auto cursor-pointer transition-shadow duration-200 ${
                  isCentral
                    ? 'w-56 p-4 rounded-xl bg-[#141414] border-2 border-[#00E5FF] glow-border-cyan'
                    : isSelected
                    ? 'w-48 p-3 rounded-xl bg-[#161616] border-2 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                    : 'w-48 p-3 rounded-xl bg-[#181818] border border-[#2a2a2a] hover:border-[#444444]'
                }`}
              >
                {/* Central Decision Node matching Screenshot 3 */}
                {isCentral ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00E5FF]/15 border border-[#00E5FF]/30 w-fit">
                      <span className="w-2.5 h-2.5 rounded-sm border border-[#00E5FF] flex items-center justify-center text-[8px] text-[#00E5FF]">■</span>
                      <span className="text-[10px] font-mono-tech text-[#00E5FF] font-semibold">Decision</span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-white font-sans tracking-wide">
                      {node.label}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#FFB000]">
                      <span>{node.date}</span>
                    </div>

                    {/* Amber Progress Bar */}
                    <div className="w-full h-1 rounded-full bg-[#262626] overflow-hidden mt-1">
                      <div className="h-full bg-[#FFB000] rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                ) : (
                  // Connected Person / Document / Event Nodes
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0">
                      {node.type === 'person' && <User className="w-3.5 h-3.5 text-[#7F8C99]" />}
                      {node.type === 'document' && <FileText className="w-3.5 h-3.5 text-[#7F8C99]" />}
                      {node.type === 'event' && <Calendar className="w-3.5 h-3.5 text-[#7F8C99]" />}
                      {node.type === 'decision' && <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white truncate font-sans">
                        {node.label}
                      </h4>
                      <p className="text-[10px] text-[#7F8C99] truncate font-sans">
                        {node.subtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom-Left Zoom & Pan Controls matching Screenshot 3 */}
        <div className="absolute bottom-6 left-6 flex items-center gap-1 p-1 rounded-xl bg-[#181818] border border-[#2a2a2a] shadow-2xl z-10">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1.15)}
            title="Fit to Screen"
            className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* RIGHT CONTEXT PANEL matching Screenshot 3 */}
      {selectedNode && (
        <aside className="w-96 bg-[#141414] border-l border-[#242424] flex flex-col justify-between h-full p-6 select-none z-20 shadow-2xl overflow-y-auto">
          
          <div className="space-y-6">
            {/* Top Node ID & Close Button */}
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-xs text-[#00E5FF] font-semibold tracking-wider">
                NODE_ID: {selectedNode.id}
              </span>
              <button
                onClick={() => selectNode(null)}
                className="p-1 rounded text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Status */}
            <div>
              <h2 className="text-xl font-bold text-white font-sans tracking-tight">
                {selectedNode.label}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-[#7F8C99]">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#FFB000]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000]" />
                  <span>{selectedNode.status || 'Confirmed'}</span>
                </span>
              </div>
            </div>

            {/* Author & Timestamp Cards Side-by-Side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#191919] border border-[#262626]">
                <p className="text-[11px] text-[#7F8C99]">Author</p>
                <p className="text-xs font-semibold text-white mt-1 truncate">
                  {selectedNode.owner || 'C. Evans (CEO)'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#191919] border border-[#262626]">
                <p className="text-[11px] text-[#7F8C99]">Timestamp</p>
                <p className="text-xs font-mono-tech text-[#d1d5db] mt-1 truncate">
                  {selectedNode.date.includes(':') ? selectedNode.date : '2023-10-15T14:32...'}
                </p>
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#7F8C99]">Confidence Score</span>
                <span className="font-mono-tech font-bold text-[#FFB000]">
                  {selectedNode.confidenceScore ? `${selectedNode.confidenceScore}%` : '82%'}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#222222] overflow-hidden">
                <div 
                  className="h-full bg-[#FFB000] rounded-full transition-all"
                  style={{ width: selectedNode.confidenceScore ? `${selectedNode.confidenceScore}%` : '82%' }}
                />
              </div>
            </div>

            {/* Context Summary */}
            <div>
              <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider mb-2 font-mono-tech">
                Context Summary
              </h4>
              <p className="text-xs text-[#d1d5db] leading-relaxed font-sans bg-[#181818] p-3 rounded-xl border border-[#242424]">
                {selectedNode.description}
              </p>
            </div>

            {/* Key Dependencies matching Screenshot 3 */}
            <div>
              <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider mb-2 font-mono-tech">
                Key Dependencies
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    selectNode('DOC-RISK-V2');
                    setIsDocumentModalOpen(true);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#00E5FF] text-xs text-white transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-[#d1d5db] group-hover:text-white">
                    → Doc: Risk Analysis V2
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#7F8C99] group-hover:text-[#00E5FF]" />
                </button>

                <button
                  onClick={() => selectNode('EVT-BOARD-OCT14')}
                  className="w-full text-left p-2.5 rounded-xl bg-[#181818] border border-[#262626] hover:border-[#00E5FF] text-xs text-white transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="text-[#d1d5db] group-hover:text-white">
                    ← Event: Oct 14 Board Mtg
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#7F8C99] group-hover:text-[#00E5FF]" />
                </button>
              </div>
            </div>

            {/* Tags matching Screenshot 3 */}
            <div>
              <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider mb-2 font-mono-tech">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedNode.tags || ['strategy', 'Q3-2023', 'EMEA', 'risk']).map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-[#132328] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono-tech"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Expand Trace Button matching Screenshot 3 */}
          <div className="pt-6 border-t border-[#242424]">
            <button
              onClick={toggleExpandTrace}
              className={`w-full py-2.5 px-4 rounded-xl border font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isExpandedTrace
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'bg-[#181818] hover:bg-[#202020] border-[#00E5FF] text-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isExpandedTrace ? 'Collapse Trace' : 'Expand Trace'}</span>
            </button>
          </div>

        </aside>
      )}

    </div>
  );
};
