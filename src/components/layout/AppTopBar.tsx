'use client';

import React, { useState, useEffect } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Bell,
  Sun,
  Cloud,
  Loader2,
  X,
  Database,
  AlertTriangle,
  LogOut
} from 'lucide-react';

const SUGGESTIONS = ['tech stack', 'pricing', 'hiring', 'compliance', 'retrieval', 'fundraising'];

export const AppTopBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    performSearch,
    clearSearch,
    isSearching,
    hasSearched,
    lastQuery,
    storageMode,
    graphNodes
  } = useMemory();
  const { role, logout } = useAuth();

  const [draft, setDraft] = useState(searchQuery);

  // Keep the input in sync when a search is triggered from elsewhere.
  useEffect(() => { setDraft(searchQuery); }, [searchQuery]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || isSearching) return;
    void performSearch(draft);
  };

  return (
    <header className="h-14 border-b border-[#242424] bg-[#121212] px-6 flex items-center justify-between shrink-0 select-none z-20">

      {/* Left: Global Search Input */}
      <div className="flex-1 max-w-2xl flex items-center gap-3">
        <form onSubmit={submit} className="flex-1">
          <div
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#181818] border transition-colors ${
              isSearching ? 'border-[#00E5FF]/50' : 'border-[#262626] focus-within:border-[#00E5FF]/60 hover:border-[#3a3a3a]'
            }`}
          >
            {isSearching
              ? <Loader2 className="w-3.5 h-3.5 text-[#00E5FF] animate-spin shrink-0" />
              : <Search className="w-3.5 h-3.5 text-[#7F8C99] shrink-0" />}

            <input
              type="text"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Search institutional memory — e.g. tech stack, pricing, hiring…"
              className="flex-1 bg-transparent text-xs text-white placeholder-[#7F8C99] outline-none"
            />

            {hasSearched && (
              <button
                type="button"
                onClick={() => { setDraft(''); clearSearch(); }}
                title="Clear results"
                className="text-[#7F8C99] hover:text-white p-0.5 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              disabled={!draft.trim() || isSearching}
              className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#00E5FF] text-black disabled:opacity-30 disabled:cursor-not-allowed shrink-0 hover:bg-[#00c8d7] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Result summary / suggestions */}
        {hasSearched ? (
          <span className="hidden lg:block text-[11px] font-mono-tech text-[#7F8C99] whitespace-nowrap">
            {graphNodes.length} nodes · &ldquo;{lastQuery}&rdquo;
          </span>
        ) : (
          <div className="hidden xl:flex items-center gap-1.5">
            {SUGGESTIONS.slice(0, 4).map(s => (
              <button
                key={s}
                onClick={() => { setDraft(s); void performSearch(s); }}
                className="px-2 py-0.5 text-[10px] font-mono-tech rounded bg-[#1f1f1f] text-[#00E5FF] hover:bg-[#262626] transition-colors whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Status & controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* Storage mode indicator — degraded state must be visible, never silent */}
        {storageMode && (
          <div
            title={
              storageMode === 'connected'
                ? 'Connected to PostgreSQL'
                : 'PostgreSQL unreachable — running on in-memory storage. Writes will not survive a restart.'
            }
            className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono-tech border ${
              storageMode === 'connected'
                ? 'text-[#00D95F] border-[#00D95F]/30 bg-[#00D95F]/10'
                : 'text-[#FFB000] border-[#FFB000]/30 bg-[#FFB000]/10'
            }`}
          >
            {storageMode === 'connected'
              ? <Database className="w-3 h-3" />
              : <AlertTriangle className="w-3 h-3" />}
            {storageMode === 'connected' ? 'Postgres' : 'In-Memory'}
          </div>
        )}

        {role && (
          <span
            title={`Signed in as ${role}`}
            className="hidden sm:block px-2 py-1 rounded-lg text-[10px] font-mono-tech uppercase tracking-wide bg-[#1c1c1c] border border-[#2e2e2e] text-[#7F8C99]"
          >
            {role}
          </span>
        )}

        <button title="Notifications" className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#1c1c1c] transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <button title="Theme Toggle" className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#1c1c1c] transition-colors">
          <Sun className="w-4 h-4" />
        </button>

        <div title="Institutional Cloud Sync Active" className="p-2 rounded-lg text-[#7F8C99] flex items-center gap-1 cursor-default">
          <Cloud className="w-4 h-4" />
        </div>

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#1c1c1c] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </header>
  );
};
