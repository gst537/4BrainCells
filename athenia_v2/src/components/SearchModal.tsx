'use client';

import React, { useState, useEffect } from 'react';
import { GraphNode } from '@/types';
import { Search, X, GitBranch, FileText, User, AlertTriangle, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  onSelectNode: (node: GraphNode) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onSelectNode
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const results = nodes.filter(n => 
    query === '' ||
    n.label.toLowerCase().includes(query.toLowerCase()) ||
    n.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
    n.description.toLowerCase().includes(query.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'decision': return <GitBranch className="h-4 w-4 text-cyan-400" />;
      case 'document': return <FileText className="h-4 w-4 text-indigo-400" />;
      case 'person': return <User className="h-4 w-4 text-emerald-400" />;
      case 'event': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl bg-[#0f111a] border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="relative border-b border-white/10 p-4 flex items-center">
          <Search className="h-5 w-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search institutional memory (e.g. Kubernetes, Neo4j, Black Friday, Elena)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/10 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No institutional memory nodes matched &quot;{query}&quot;.
            </div>
          ) : (
            results.map(node => (
              <div
                key={node.id}
                onClick={() => {
                  onSelectNode(node);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 shrink-0">
                    {getIcon(node.type)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                        {node.label}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                        {node.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {node.subtitle} • {node.date}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-cyan-400 shrink-0 ml-3" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0b0c13] px-4 py-2 text-[11px] font-mono text-zinc-500 flex justify-between border-t border-white/5">
          <span>Navigate with mouse or enter</span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
};
