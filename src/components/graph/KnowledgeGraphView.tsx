'use client';

import React, { useState, useRef } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { useAuth } from '@/context/AuthContext';
import { GraphNode, GraphEdge } from '@/types';
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
  Sparkles,
  Link2,
  Pencil,
  Check
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
  const { canEdit, token } = useAuth();

  // Canvas pan & zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Edge linking mode
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<GraphNode | null>(null);
  const [linkEdgeType, setLinkEdgeType] = useState<GraphEdge['label'] | null>(null);
  const [pendingLink, setPendingLink] = useState<{ source: GraphNode; target: GraphNode } | null>(null);
  const [linkSaving, setLinkSaving] = useState(false);

  // Node editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editRationale, setEditRationale] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Selected node details
  const selectedNode = graphNodes.find(n => n.id === selectedNodeId) || graphNodes[0];

  const handleZoomIn = () => setZoom(z => Math.min(2.0, z + 0.15));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.15));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Step 5: Create edge via API
  const handleCreateEdge = async (source: GraphNode, target: GraphNode, label: GraphEdge['label']) => {
    if (!token) return;
    setLinkSaving(true);
    try {
      await fetch('/api/graph/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ source: source.id, target: target.id, label })
      });
      // Optimistic UI: edge will show on next graph fetch; for now close picker
    } catch (e) {
      console.error('Failed to create edge', e);
    } finally {
      setLinkSaving(false);
      setPendingLink(null);
      setLinkSource(null);
      setLinkMode(false);
    }
  };

  // Step 6: Save edited node via PATCH
  const handleSaveEdit = async () => {
    if (!selectedNode || !token) return;
    setEditSaving(true);
    try {
      await fetch(`/api/graph/nodes/${selectedNode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ label: editLabel, description: editDescription, rationale: editRationale })
      });
    } catch (e) {
      console.error('Failed to update node', e);
    } finally {
      setEditSaving(false);
      setIsEditing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.graph-node')) return;
    if (linkMode) {
      // in link mode, canvas clicks don't pan
      return;
    }
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
          <button onClick={handleZoomIn} title="Zoom In" className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
          <button onClick={handleZoomOut} title="Zoom Out" className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={handleReset} title="Reset View" className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /></button>
          <button onClick={() => setZoom(1.15)} title="Fit to Screen" className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"><Maximize2 className="w-3.5 h-3.5" /></button>
        </div>

        {/* Link Nodes button (Step 5) — only for contributors/admins */}
        {canEdit && (
          <div className="absolute bottom-6 right-6 z-10">
            <button
              onClick={() => { setLinkMode(l => !l); setLinkSource(null); setPendingLink(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                linkMode
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
                  : 'bg-[#181818] text-[#7F8C99] border-[#2a2a2a] hover:border-emerald-400/50 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{linkMode ? 'Linking…' : 'Link Nodes'}</span>
            </button>
          </div>
        )}

        {/* Link mode overlay prompt */}
        {linkMode && !pendingLink && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-emerald-950/90 border border-emerald-400/60 px-4 py-1.5 text-xs text-emerald-200 shadow-2xl backdrop-blur-xl">
            <Link2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>{!linkSource ? 'Click a SOURCE node to begin' : `Source: ${linkSource.label} → Click TARGET node`}</span>
          </div>
        )}

        {/* Relationship type picker modal (Step 5) */}
        {pendingLink && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl w-full max-w-sm shadow-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Create Relationship</h3>
              <p className="text-xs text-[#7F8C99] mb-4">
                <span className="text-emerald-300">{pendingLink.source.label}</span>{' → '}<span className="text-[#00E5FF]">{pendingLink.target.label}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['SUPPORTS','CONTRADICTS','REVERSES','AUTHORED_BY','DEPENDS_ON','TRIGGERED_BY','PRECEDES'] as GraphEdge['label'][]).map(lbl => (
                  <button
                    key={lbl}
                    disabled={linkSaving}
                    onClick={() => handleCreateEdge(pendingLink.source, pendingLink.target, lbl)}
                    className="px-2.5 py-2 rounded-lg text-[11px] font-mono font-medium border border-[#2a2a2a] bg-[#191919] text-[#d1d5db] hover:border-emerald-400/50 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <button onClick={() => { setPendingLink(null); setLinkSource(null); }} className="w-full py-2 rounded-lg text-xs text-[#7F8C99] hover:text-white border border-[#242424] hover:border-[#444444] transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT CONTEXT PANEL */}
      {selectedNode && (
        <aside className="w-96 bg-[#141414] border-l border-[#242424] flex flex-col justify-between h-full p-6 select-none z-20 shadow-2xl overflow-y-auto">
          
          <div className="space-y-6">
            {/* Top Node ID, Edit & Close */}
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-xs text-[#00E5FF] font-semibold tracking-wider">
                NODE_ID: {selectedNode.id}
              </span>
              <div className="flex items-center gap-2">
                {/* Step 6: Edit button for contributors/admins */}
                {canEdit && !isEditing && (
                  <button
                    onClick={() => {
                      setEditLabel(selectedNode.label);
                      setEditDescription(selectedNode.description || '');
                      setEditRationale(selectedNode.rationale || '');
                      setIsEditing(true);
                    }}
                    className="p-1.5 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
                    title="Edit Node"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {isEditing && (
                  <button
                    onClick={handleSaveEdit}
                    disabled={editSaving}
                    className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-50"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => { selectNode(null); setIsEditing(false); }}
                  className="p-1 rounded text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title & Status — editable in edit mode */}
            <div>
              {isEditing ? (
                <input
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="w-full text-xl font-bold text-white bg-[#1a1a1a] border border-[#00E5FF]/40 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00E5FF] mb-2"
                />
              ) : (
                <h2 className="text-xl font-bold text-white font-sans tracking-tight">{selectedNode.label}</h2>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-[#7F8C99]">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#FFB000]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB000]" />
                  <span>{selectedNode.status || 'Confirmed'}</span>
                </span>
              </div>
            </div>

            {/* Author & Timestamp */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#191919] border border-[#262626]">
                <p className="text-[11px] text-[#7F8C99]">Author</p>
                <p className="text-xs font-semibold text-white mt-1 truncate">{selectedNode.owner || 'C. Evans (CEO)'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#191919] border border-[#262626]">
                <p className="text-[11px] text-[#7F8C99]">Timestamp</p>
                <p className="text-xs font-mono-tech text-[#d1d5db] mt-1 truncate">
                  {selectedNode.date.includes(':') ? selectedNode.date : '2023-10-15T14:32...'}
                </p>
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#7F8C99]">Confidence Score</span>
                <span className="font-mono-tech font-bold text-[#FFB000]">{selectedNode.confidenceScore ? `${selectedNode.confidenceScore}%` : '82%'}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#222222] overflow-hidden">
                <div className="h-full bg-[#FFB000] rounded-full transition-all" style={{ width: selectedNode.confidenceScore ? `${selectedNode.confidenceScore}%` : '82%' }} />
              </div>
            </div>

            {/* Context Summary — editable */}
            <div>
              <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider mb-2 font-mono-tech">Context Summary</h4>
              {isEditing ? (
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full text-xs text-[#d1d5db] bg-[#1a1a1a] border border-[#00E5FF]/40 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E5FF] resize-none"
                />
              ) : (
                <p className="text-xs text-[#d1d5db] leading-relaxed font-sans bg-[#181818] p-3 rounded-xl border border-[#242424]">{selectedNode.description}</p>
              )}
            </div>

            {/* Rationale — editable */}
            {(selectedNode.rationale || isEditing) && (
              <div>
                <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider mb-2 font-mono-tech">Root Rationale</h4>
                {isEditing ? (
                  <textarea
                    value={editRationale}
                    onChange={e => setEditRationale(e.target.value)}
                    rows={3}
                    className="w-full text-xs text-[#d1d5db] bg-[#1a1a1a] border border-[#00E5FF]/40 rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E5FF] resize-none"
                    placeholder="Why was this decision made?"
                  />
                ) : (
                  <p className="text-xs text-[#d1d5db] leading-relaxed font-sans bg-[#1a2430] p-3 rounded-xl border border-[#00E5FF]/20">{selectedNode.rationale}</p>
                )}
              </div>
            )}

            {/* Tags */}
            <div>
              <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider mb-2 font-mono-tech">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedNode.tags || ['strategy', 'Q3-2023']).map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md bg-[#132328] border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono-tech">#{t}</span>
                ))}
              </div>
            </div>

            {/* Link mode: node click handler in link mode */}
            {linkMode && !pendingLink && (
              <button
                onClick={() => {
                  if (!linkSource) {
                    setLinkSource(selectedNode);
                  } else if (linkSource.id !== selectedNode.id) {
                    setPendingLink({ source: linkSource, target: selectedNode });
                  }
                }}
                className="w-full py-2.5 rounded-xl text-xs font-semibold border border-emerald-400/50 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                {!linkSource ? 'Use as Source Node' : `Link: ${linkSource.label} → ${selectedNode.label}`}
              </button>
            )}

          </div>

          {/* Bottom Expand Trace Button */}
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
