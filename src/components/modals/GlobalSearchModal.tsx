'use client';

import React, { useState, useMemo } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  Search, 
  X, 
  FileText, 
  User, 
  Calendar, 
  Share2, 
  Tag,
  ArrowRight
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    decisions,
    graphNodes,
    evidence,
    selectDecision,
    selectNode,
    selectEvidence,
    setIsDocumentModalOpen,
    setActiveTab,
    performSearch,
    isSearching
  } = useMemory();

  const [searchQuery, setSearchQuery] = useState('');

  const runFullSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchModalOpen(false);
    void performSearch(q);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();

    const matchedDecisions = decisions
      .filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        (d.tags || []).some(t => t.toLowerCase().includes(q))
      )
      .map(d => ({
        type: 'decision' as const,
        id: d.id,
        title: d.title,
        subtitle: `${d.owner} · ${d.date}`,
        item: d
      }));

    const matchedDocs = Object.values(evidence)
      .filter(doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.author.toLowerCase().includes(q) ||
        doc.highlightSnippet.toLowerCase().includes(q)
      )
      .map(doc => ({
        type: 'document' as const,
        id: doc.id,
        title: doc.title,
        subtitle: `${doc.author} · ${doc.type}`,
        item: doc
      }));

    const matchedPeople = graphNodes
      .filter(n => n.type === 'person' && (n.label.toLowerCase().includes(q) || n.subtitle.toLowerCase().includes(q)))
      .map(n => ({
        type: 'person' as const,
        id: n.id,
        title: n.label,
        subtitle: n.subtitle,
        item: n
      }));

    const matchedEvents = graphNodes
      .filter(n => n.type === 'event' && (n.label.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)))
      .map(n => ({
        type: 'event' as const,
        id: n.id,
        title: n.label,
        subtitle: n.subtitle,
        item: n
      }));

    return [...matchedDecisions, ...matchedDocs, ...matchedPeople, ...matchedEvents];
  }, [searchQuery, decisions, evidence, graphNodes]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (res: any) => {
    setIsSearchModalOpen(false);
    if (res.type === 'decision') {
      selectDecision(res.id);
    } else if (res.type === 'document') {
      selectEvidence(res.id);
      setIsDocumentModalOpen(true);
    } else {
      selectNode(res.id);
      setActiveTab('knowledge-graph');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center p-4 pt-20 animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-[#151515] border border-[#2e2e2e] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        
        {/* Search Input Header */}
        <div className="p-4 border-b border-[#242424] bg-[#181818] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#00E5FF] shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') runFullSearch(); }}
            placeholder="Search decisions, people, documents, events, tags..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#7F8C99] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#7F8C99] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono-tech bg-[#222222] text-[#7F8C99] rounded border border-[#333333]">
            ESC
          </kbd>
        </div>

        {/* Run a real institutional search (loads a fresh subgraph from the database) */}
        {searchQuery.trim() && (
          <button
            onClick={runFullSearch}
            disabled={isSearching}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-[#242424] bg-[#141414] hover:bg-[#1b1b1b] transition-colors text-left group disabled:opacity-50"
          >
            <span className="text-xs text-[#F2F2F2]">
              Search institutional memory for{' '}
              <span className="text-[#00E5FF] font-semibold">&ldquo;{searchQuery.trim()}&rdquo;</span>
            </span>
            <span className="text-[10px] font-mono-tech text-[#7F8C99] group-hover:text-[#00E5FF] transition-colors shrink-0">
              {isSearching ? 'Searching…' : 'Enter ↵'}
            </span>
          </button>
        )}

        {/* Results List — jump to something already loaded */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[160px]">
          {!searchQuery.trim() ? (
            <div className="py-12 text-center text-xs text-[#7F8C99] space-y-2">
              <p>Type to search across entire institutional memory.</p>
              <div className="flex flex-wrap justify-center gap-2 text-[11px] font-mono-tech">
                {['tech stack', 'pricing', 'hiring', 'compliance', 'retrieval'].map(ex => (
                  <button
                    key={ex}
                    onClick={() => { setIsSearchModalOpen(false); void performSearch(ex); }}
                    className="px-2 py-0.5 rounded bg-[#1f1f1f] text-[#00E5FF] hover:bg-[#262626] transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7F8C99] px-6 leading-relaxed">
              Nothing matching &ldquo;{searchQuery}&rdquo; in the currently loaded results.
              <br />
              Press <span className="text-[#00E5FF] font-mono-tech">Enter</span> to search the full institutional memory.
            </div>
          ) : (
            searchResults.map(res => (
              <button
                key={`${res.type}-${res.id}`}
                onClick={() => handleSelect(res)}
                className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0">
                    {res.type === 'decision' && <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />}
                    {res.type === 'document' && <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />}
                    {res.type === 'person' && <User className="w-3.5 h-3.5 text-[#FFB000]" />}
                    {res.type === 'event' && <Calendar className="w-3.5 h-3.5 text-[#00D95F]" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate">
                      {res.title}
                    </p>
                    <p className="text-[11px] text-[#7F8C99] truncate font-mono-tech">
                      {res.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-[#7F8C99] group-hover:text-white transition-colors shrink-0 ml-2" />
              </button>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
