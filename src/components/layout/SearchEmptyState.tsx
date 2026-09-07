'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { Search, Loader2, AlertTriangle, SearchX } from 'lucide-react';

const EXAMPLES = [
  'tech stack',
  'pricing',
  'hiring',
  'compliance',
  'retrieval quality',
  'fundraising',
  'contested'
];

interface Props {
  /** What this view would show if data were loaded, e.g. "the knowledge graph". */
  subject: string;
}

/**
 * Rendered by every workspace view while no query has resolved a subgraph.
 * The workspace is query-driven: nothing loads until the user asks for something.
 */
export const SearchEmptyState: React.FC<Props> = ({ subject }) => {
  const { isSearching, hasSearched, searchError, lastQuery, performSearch } = useMemory();

  if (isSearching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#7F8C99] select-none">
        <Loader2 className="w-7 h-7 text-[#00E5FF] animate-spin" />
        <p className="text-sm">Resolving institutional memory…</p>
        {lastQuery && (
          <p className="text-xs font-mono-tech text-[#5c6670]">&ldquo;{lastQuery}&rdquo;</p>
        )}
      </div>
    );
  }

  if (searchError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#FFB000]/10 border border-[#FFB000]/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#FFB000]" />
        </div>
        <h3 className="text-sm font-semibold text-[#F2F2F2]">Search could not complete</h3>
        <p className="text-xs text-[#7F8C99] max-w-sm leading-relaxed">{searchError}</p>
        {lastQuery && (
          <button
            onClick={() => void performSearch(lastQuery)}
            className="mt-1 px-3 py-1.5 rounded-lg bg-[#1f1f1f] border border-[#2e2e2e] text-xs text-[#00E5FF] hover:bg-[#262626] transition-colors"
          >
            Retry &ldquo;{lastQuery}&rdquo;
          </button>
        )}
      </div>
    );
  }

  if (hasSearched) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-8 text-center select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center">
          <SearchX className="w-6 h-6 text-[#7F8C99]" />
        </div>
        <h3 className="text-sm font-semibold text-[#F2F2F2]">
          No institutional records matched &ldquo;{lastQuery}&rdquo;
        </h3>
        <p className="text-xs text-[#7F8C99] max-w-sm leading-relaxed">
          Nothing in the graph is connected to that query. Rather than showing unrelated records,
          the workspace stays empty — try different terms, or record the decision if it was never captured.
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 mt-1">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => void performSearch(ex)}
              className="px-2 py-0.5 text-[10px] font-mono-tech rounded bg-[#1f1f1f] text-[#00E5FF] hover:bg-[#262626] transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center select-none overflow-hidden">
      {/* Recessive dot grid so the empty canvas still reads as a workspace */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/25 flex items-center justify-center">
        <Search className="w-7 h-7 text-[#00E5FF]" />
      </div>

      <div className="relative space-y-1.5">
        <h3 className="text-base font-semibold text-[#F2F2F2]">
          Search to explore {subject}
        </h3>
        <p className="text-xs text-[#7F8C99] max-w-md leading-relaxed">
          Aletheia loads only the slice of institutional memory that answers your question —
          the matched records, everything connected to them, and the evidence behind each one.
        </p>
      </div>

      <div className="relative flex flex-wrap justify-center gap-1.5 max-w-md">
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            onClick={() => void performSearch(ex)}
            className="px-2.5 py-1 text-[11px] font-mono-tech rounded-lg bg-[#1f1f1f] border border-[#2a2a2a] text-[#00E5FF] hover:bg-[#262626] hover:border-[#00E5FF]/40 transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};
