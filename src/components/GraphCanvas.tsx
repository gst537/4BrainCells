'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  GraphNode, 
  GraphEdge, 
  NodeType 
} from '@/types';
import { 
  GitBranch, 
  FileText, 
  User, 
  AlertTriangle, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Route
} from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  onSelectEvidence: (evidenceId: string) => void;
  highlightedNodeIds?: string[];
  densityMode: 'executive' | 'analyst';
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes: initialNodes,
  edges,
  selectedNode,
  onSelectNode,
  onSelectEvidence,
  highlightedNodeIds = [],
  densityMode
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Dragging single node
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Path tracing mode
  const [traceMode, setTraceMode] = useState(false);
  const [traceStartNode, setTraceStartNode] = useState<GraphNode | null>(null);
  const [traceEndNode, setTraceEndNode] = useState<GraphNode | null>(null);

  // Hover state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update nodes if initialNodes change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Compute connected nodes for hovered or selected node
  const activeConnectedNodeIds = useMemo(() => {
    const targetId = hoveredNodeId || selectedNode?.id;
    if (!targetId) return new Set<string>();
    const connected = new Set<string>([targetId]);
    edges.forEach(edge => {
      if (edge.source === targetId) connected.add(edge.target);
      if (edge.target === targetId) connected.add(edge.source);
    });
    return connected;
  }, [hoveredNodeId, selectedNode, edges]);

  // Compute traced path between traceStartNode and traceEndNode
  const tracedPathEdgeIds = useMemo(() => {
    if (!traceStartNode || !traceEndNode) return new Set<string>();
    const start = traceStartNode.id;
    const target = traceEndNode.id;

    // Simple BFS to find shortest branch path
    const queue: { current: string; path: string[] }[] = [{ current: start, path: [] }];
    const visited = new Set<string>([start]);

    while (queue.length > 0) {
      const { current, path } = queue.shift()!;
      if (current === target) {
        return new Set<string>(path);
      }

      for (const edge of edges) {
        let neighbor = '';
        if (edge.source === current) neighbor = edge.target;
        else if (edge.target === current) neighbor = edge.source;

        if (neighbor && !visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({
            current: neighbor,
            path: [...path, edge.id]
          });
        }
      }
    }

    return new Set<string>();
  }, [traceStartNode, traceEndNode, edges]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesType = selectedTypeFilter === 'all' || node.type === selectedTypeFilter;
      const matchesSearch = searchQuery === '' || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [nodes, selectedTypeFilter, searchQuery]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas directly
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'graph-canvas-background') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      // Move dragged node
      setNodes(prev => prev.map(node => {
        if (node.id === draggedNodeId) {
          return {
            ...node,
            x: (e.clientX - panOffset.x - dragOffset.x) / zoomLevel,
            y: (e.clientY - panOffset.y - dragOffset.y) / zoomLevel
          };
        }
        return node;
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  const handleNodeDragStart = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    if (traceMode) {
      if (!traceStartNode) {
        setTraceStartNode(node);
      } else if (!traceEndNode && traceStartNode.id !== node.id) {
        setTraceEndNode(node);
      } else {
        setTraceStartNode(node);
        setTraceEndNode(null);
      }
      return;
    }

    setDraggedNodeId(node.id);
    const nodeScreenX = node.x * zoomLevel + panOffset.x;
    const nodeScreenY = node.y * zoomLevel + panOffset.y;
    setDragOffset({
      x: e.clientX - nodeScreenX,
      y: e.clientY - nodeScreenY
    });
  };

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'decision': return { border: 'border-cyan-400', bg: 'bg-cyan-950/40', text: 'text-cyan-300', glow: 'shadow-[0_0_20px_rgba(0,245,255,0.3)]' };
      case 'document': return { border: 'border-indigo-400', bg: 'bg-indigo-950/40', text: 'text-indigo-300', glow: 'shadow-[0_0_20px_rgba(129,140,248,0.3)]' };
      case 'person': return { border: 'border-emerald-400', bg: 'bg-emerald-950/40', text: 'text-emerald-300', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]' };
      case 'event': return { border: 'border-amber-400', bg: 'bg-amber-950/40', text: 'text-amber-300', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' };
    }
  };

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'decision': return <GitBranch className="h-4 w-4 text-cyan-400" />;
      case 'document': return <FileText className="h-4 w-4 text-indigo-400" />;
      case 'person': return <User className="h-4 w-4 text-emerald-400" />;
      case 'event': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 h-full min-h-[600px] w-full select-none overflow-hidden bg-[#07080c] border border-white/10 rounded-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Background Dot Grid */}
      <div 
        id="graph-canvas-background"
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: `${32 * zoomLevel}px ${32 * zoomLevel}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`
        }}
      />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Filter Pills & Search */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#10121a]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter nodes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-44 rounded-lg bg-[#191b26] pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1">
            {[
              { id: 'all', label: 'All (14)' },
              { id: 'decision', label: 'Decisions (4)', color: 'text-cyan-300' },
              { id: 'document', label: 'Documents (4)', color: 'text-indigo-300' },
              { id: 'person', label: 'People (4)', color: 'text-emerald-300' },
              { id: 'event', label: 'Events (2)', color: 'text-amber-300' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedTypeFilter(f.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  selectedTypeFilter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Tools: Trace Mode & Zoom */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Provenance Trace Route Mode */}
          <button
            onClick={() => {
              setTraceMode(!traceMode);
              setTraceStartNode(null);
              setTraceEndNode(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md transition-all border shadow-lg ${
              traceMode
                ? 'bg-cyan-500 text-black font-semibold border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                : 'bg-[#10121a]/90 text-zinc-300 border-white/10 hover:border-cyan-400/50 hover:text-white'
            }`}
          >
            <Route className="h-3.5 w-3.5" />
            <span>{traceMode ? 'Tracing Mode Active' : 'Trace Branch Path'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-[#10121a]/90 backdrop-blur-md rounded-xl border border-white/10 p-1 shadow-xl">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.0))}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-zinc-400">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.4))}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg border-l border-white/10"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Trace Route Prompt Overlay */}
      {traceMode && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 rounded-full bg-cyan-950/90 border border-cyan-400/60 px-4 py-1.5 text-xs text-cyan-200 shadow-2xl backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-cyan-300 animate-spin" />
          <span>
            {!traceStartNode 
              ? 'Click any START node (e.g. Incident Event or Person)' 
              : !traceEndNode 
                ? `Origin: ${traceStartNode.label} ➔ Click TARGET node to discover branch path` 
                : `Active Path: ${traceStartNode.label} ➔ ${traceEndNode.label} (${tracedPathEdgeIds.size} hops)`}
          </span>
        </div>
      )}

      {/* Interactive Canvas Transform Group */}
      <div 
        className="absolute inset-0 origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`
        }}
      >
        {/* SVG Branches / Edges Layer */}
        <svg className="absolute inset-0 h-[2400px] w-[2800px] overflow-visible pointer-events-none">
          <defs>
            {/* Arrowhead marker default */}
            <marker
              id="branch-arrow"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
            {/* Arrowhead active cyan */}
            <marker
              id="branch-arrow-cyan"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00f5ff" />
            </marker>
            {/* Contradict crimson arrow */}
            <marker
              id="branch-arrow-crimson"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ff4365" />
            </marker>
          </defs>

          {/* Render Branches */}
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) return null;
            if (!visibleNodeIds.has(sourceNode.id) || !visibleNodeIds.has(targetNode.id)) return null;

            // Compute curve
            const sx = sourceNode.x + 110;
            const sy = sourceNode.y + 40;
            const tx = targetNode.x + 110;
            const ty = targetNode.y + 40;

            const dx = tx - sx;
            const dy = ty - sy;
            const cx1 = sx + dx * 0.4;
            const cy1 = sy;
            const cx2 = sx + dx * 0.6;
            const cy2 = ty;

            const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

            const isEdgeHovered = hoveredEdgeId === edge.id;
            const isConnectedToActiveNode = activeConnectedNodeIds.has(edge.source) && activeConnectedNodeIds.has(edge.target);
            const isTracedEdge = tracedPathEdgeIds.has(edge.id);
            const isContradiction = edge.label === 'CONTRADICTS';

            const strokeColor = isTracedEdge 
              ? '#00f5ff' 
              : isContradiction 
                ? '#ff4365' 
                : (isEdgeHovered || isConnectedToActiveNode) 
                  ? '#00f5ff' 
                  : 'rgba(255,255,255,0.18)';

            const strokeWidth = isTracedEdge ? 3.5 : (isEdgeHovered || isConnectedToActiveNode) ? 2.5 : 1.5;

            // Midpoint for label
            const midX = (sx + tx) / 2;
            const midY = (sy + ty) / 2;

            return (
              <g 
                key={edge.id} 
                className="group cursor-pointer pointer-events-auto"
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                onClick={() => {
                  if (edge.description) {
                    // select source node or trigger drawer
                    onSelectNode(sourceNode);
                  }
                }}
              >
                {/* Invisible wide hit area */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Visible branch curve */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isContradiction ? '4 4' : undefined}
                  markerEnd={isContradiction ? 'url(#branch-arrow-crimson)' : (isTracedEdge || isConnectedToActiveNode) ? 'url(#branch-arrow-cyan)' : 'url(#branch-arrow)'}
                  className="transition-all duration-300"
                />

                {/* Animated beam pulse when traced or active */}
                {(isTracedEdge || isConnectedToActiveNode) && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#00f5ff"
                    strokeWidth={strokeWidth + 1}
                    strokeDasharray="12 180"
                    className="animate-[beamSweep_2s_linear_infinite]"
                  />
                )}

                {/* Branch Relationship Tag */}
                <foreignObject
                  x={midX - 45}
                  y={midY - 12}
                  width="90"
                  height="24"
                  className="overflow-visible"
                >
                  <div className={`flex items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-mono tracking-wider font-semibold border backdrop-blur-md shadow-md transition-all ${
                    isTracedEdge
                      ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_12px_rgba(0,245,255,0.6)]'
                      : isContradiction
                        ? 'bg-red-950/80 text-red-300 border-red-500/50'
                        : isConnectedToActiveNode
                          ? 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40'
                          : 'bg-[#12141f]/80 text-zinc-400 border-white/10 hover:border-white/30'
                  }`}>
                    {edge.label}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {filteredNodes.map(node => {
          const isSelected = selectedNode?.id === node.id;
          const isHighlighted = highlightedNodeIds.includes(node.id);
          const isHovered = hoveredNodeId === node.id;
          const isConnected = activeConnectedNodeIds.has(node.id);
          const isTraceStart = traceStartNode?.id === node.id;
          const isTraceEnd = traceEndNode?.id === node.id;
          const colorStyles = getNodeColor(node.type);

          return (
            <div
              key={node.id}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
                width: densityMode === 'analyst' ? '200px' : '230px',
              }}
              className={`absolute cursor-pointer transition-all duration-150 group rounded-xl p-3 border backdrop-blur-xl ${
                isSelected
                  ? `ring-2 ring-cyan-400 bg-[#161928] ${colorStyles.border} ${colorStyles.glow}`
                  : isTraceStart || isTraceEnd
                    ? 'ring-2 ring-cyan-300 bg-cyan-950/60 border-cyan-400 shadow-[0_0_25px_rgba(0,245,255,0.5)]'
                    : isHighlighted || isConnected
                      ? `bg-[#131522] ${colorStyles.border} shadow-[0_0_15px_rgba(0,245,255,0.2)]`
                      : 'bg-[#0f111a]/85 border-white/10 hover:border-white/30 hover:bg-[#151724]'
              }`}
              onMouseDown={(e) => handleNodeDragStart(e, node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => onSelectNode(node)}
            >
              {/* Header: Node Type & Date */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <div className={`p-1 rounded-md bg-black/40 border border-white/5`}>
                    {getNodeIcon(node.type)}
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${colorStyles.text}`}>
                    {node.type}
                  </span>
                </div>

                {node.status && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                    node.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                    node.status === 'Contested' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                    'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    {node.status}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-cyan-200 transition-colors">
                {node.label}
              </h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {node.subtitle}
              </p>

              {/* Node Footer: Confidence or Owner */}
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>{node.date}</span>
                {node.confidenceScore !== undefined ? (
                  <div className="flex items-center space-x-1">
                    <span className="text-zinc-500">Conf:</span>
                    <span className={`font-semibold ${
                      node.confidenceScore > 90 ? 'text-cyan-300' :
                      node.confidenceScore > 75 ? 'text-amber-300' : 'text-red-300'
                    }`}>
                      {node.confidenceScore}%
                    </span>
                  </div>
                ) : (
                  <span className="text-zinc-500">{node.evidenceCount} links</span>
                )}
              </div>

              {/* Quick Jump to Evidence indicator */}
              {node.evidenceId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (node.evidenceId) onSelectEvidence(node.evidenceId);
                  }}
                  className="mt-2 w-full py-1 rounded bg-white/5 hover:bg-cyan-500/20 text-[10px] text-cyan-300 flex items-center justify-center space-x-1 border border-white/5 hover:border-cyan-500/30 transition-all"
                >
                  <FileText className="h-3 w-3" />
                  <span>Inspect Source Document</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Canvas Status Bar / Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs text-zinc-400 pointer-events-none">
        {/* Legend */}
        <div className="flex items-center space-x-3 bg-[#10121a]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <span className="text-zinc-500 font-mono text-[10px]">BRANCH NODES:</span>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span>Decision</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />
            <span>Document</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Person</span>
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Event</span>
          </div>
        </div>

        {/* Selected count info */}
        <div className="hidden sm:flex items-center space-x-2 bg-[#10121a]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 pointer-events-auto">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Click any node to open context • Drag nodes to reposition branches</span>
        </div>
      </div>
    </div>
  );
};
