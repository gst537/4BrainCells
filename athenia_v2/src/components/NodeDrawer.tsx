'use client';

import React from 'react';
import { GraphNode, GraphEdge } from '@/types';
import { 
  X, 
  GitBranch, 
  FileText, 
  User, 
  AlertTriangle, 
  ExternalLink, 
  MessageSquareCode, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface NodeDrawerProps {
  node: GraphNode | null;
  onClose: () => void;
  edges: GraphEdge[];
  allNodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
  onSelectEvidence: (evidenceId: string) => void;
  onAskWhyInChat: (query: string) => void;
}

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  node,
  onClose,
  edges,
  allNodes,
  onSelectNode,
  onSelectEvidence,
  onAskWhyInChat
}) => {
  if (!node) return null;

  // Find incoming and outgoing edges
  const relatedEdges = edges.filter(e => e.source === node.id || e.target === node.id);

  return (
    <div className="flex flex-col h-full bg-[#0d0e15] border-l border-white/10 overflow-y-auto w-full max-w-[420px] shadow-2xl">
      {/* Drawer Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0d0e15]/95 p-4 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <span className="rounded bg-cyan-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300 border border-cyan-500/30">
            {node.id}
          </span>
          <span className="text-xs uppercase font-mono text-zinc-400">
            {node.type} Context
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="p-5 space-y-6">
        
        {/* Title & Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {node.date}
            </span>
            {node.status && (
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                node.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                node.status === 'Contested' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {node.status}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
            {node.label}
          </h3>
          <p className="text-xs text-zinc-400 mt-1">{node.subtitle}</p>
        </div>

        {/* Confidence Meter (if decision) */}
        {node.confidenceScore !== undefined && (
          <div className="rounded-xl bg-[#141622] p-3.5 border border-white/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Institutional Confidence
              </span>
              <span className={`font-mono font-bold ${
                node.confidenceScore > 90 ? 'text-cyan-300' : 'text-amber-300'
              }`}>
                {node.confidenceScore}% Validated
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-black/50 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  node.confidenceScore > 90 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${node.confidenceScore}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">
              Bounded by {node.evidenceCount} verified primary source artifacts and cross-team review board ratifications.
            </p>
          </div>
        )}

        {/* Description */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Overview</h4>
          <p className="text-xs text-zinc-300 leading-relaxed bg-[#141622]/50 p-3 rounded-xl border border-white/5">
            {node.description}
          </p>
        </div>

        {/* Rationale if present */}
        {node.rationale && (
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Root Rationale (&apos;The Why&apos;)</h4>
            <div className="text-xs text-zinc-300 leading-relaxed bg-cyan-950/20 p-3 rounded-xl border border-cyan-500/20 text-cyan-100/90">
              {node.rationale}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Metadata Tags</h4>
          <div className="flex flex-wrap gap-1.5">
            {node.tags.map(tag => (
              <span key={tag} className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-mono text-zinc-400 border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action: Ask 'Why' in Chat */}
        <button
          onClick={() => onAskWhyInChat(`Why was "${node.label}" decided and what is the supporting evidence?`)}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,245,255,0.3)]"
        >
          <MessageSquareCode className="h-4 w-4" />
          <span>Trace in &apos;Why&apos; Chat</span>
        </button>

        {/* Primary Evidence Artifact */}
        {node.evidenceId && (
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Supporting Primary Evidence</h4>
            <div 
              onClick={() => onSelectEvidence(node.evidenceId!)}
              className="group cursor-pointer rounded-xl bg-[#141622] p-3.5 border border-white/10 hover:border-cyan-500/50 hover:bg-[#1a1c2b] transition-all"
            >
              <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
                <span className="font-mono font-medium flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" />
                  {node.evidenceId}
                </span>
                <span className="text-[11px] text-zinc-500 group-hover:text-cyan-300 flex items-center gap-0.5">
                  View Source <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              <p className="text-xs text-white font-medium group-hover:text-cyan-200 line-clamp-1">
                Verified Signed Document Dossier
              </p>
            </div>
          </div>
        )}

        {/* Connected Branches / Edges */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Logical Graph Branches ({relatedEdges.length})
          </h4>
          <div className="space-y-2">
            {relatedEdges.map(edge => {
              const otherNodeId = edge.source === node.id ? edge.target : edge.source;
              const otherNode = allNodes.find(n => n.id === otherNodeId);
              if (!otherNode) return null;

              const isOutgoing = edge.source === node.id;

              return (
                <div
                  key={edge.id}
                  onClick={() => onSelectNode(otherNode)}
                  className="group cursor-pointer rounded-xl bg-[#12141f] p-2.5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 border border-white/10 shrink-0">
                      {edge.label}
                    </span>
                    <div className="truncate">
                      <p className="text-xs text-zinc-200 group-hover:text-white truncate font-medium">
                        {otherNode.label}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {isOutgoing ? '➔ Target' : '⬅ Source'} • {otherNode.type}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-400 shrink-0 ml-2" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
