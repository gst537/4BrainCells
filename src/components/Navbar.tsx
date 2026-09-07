'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GitBranch, 
  FileSpreadsheet, 
  MessageSquareCode, 
  FileText, 
  Columns3, 
  ShieldCheck, 
  Sparkles, 
  Layers,
  Database,
  Search,
  ExternalLink,
  Activity
} from 'lucide-react';

interface NavbarProps {
  densityMode: 'executive' | 'analyst';
  setDensityMode: (mode: 'executive' | 'analyst') => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  densityMode,
  setDensityMode,
  onOpenSearch
}) => {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Team */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 glow-cyan">
              <GitBranch className="h-5 w-5 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-[#0a0a0f]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-lg text-white font-sans">ALETHEIA</span>
                <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-300 border border-cyan-500/30">
                  4BrainCells
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Intelligent Institutional Memory & Decision Traceability
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-white/10 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Memory Engine Active
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-400">94 Decisions</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-400">412 Verified Citations</span>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="flex items-center space-x-1 rounded-xl bg-[#141520] p-1 border border-white/10">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              pathname === '/'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Columns3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Executive Suite</span>
          </Link>

          <Link
            href="/graph"
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              pathname === '/graph'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
            <span>Branch Graph</span>
          </Link>

          <Link
            href="/ledger"
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              pathname === '/ledger'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-400" />
            <span>Decision Ledger</span>
          </Link>

          <Link
            href="/chat"
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              pathname === '/chat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquareCode className="h-3.5 w-3.5 text-purple-400" />
            <span>&apos;Why&apos; Chat (RAG)</span>
          </Link>

          <Link
            href="/vault"
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              pathname === '/vault'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-400" />
            <span>Evidence Vault</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Density Mode Switch */}
          <div className="hidden md:flex items-center rounded-lg bg-[#141520] p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setDensityMode('executive')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                densityMode === 'executive'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Executive Spacious Layout"
            >
              Executive
            </button>
            <button
              onClick={() => setDensityMode('analyst')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                densityMode === 'analyst'
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Analyst High-Density Data Layout"
            >
              Analyst
            </button>
          </div>

          {/* Quick Search Shortcut */}
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 rounded-lg bg-[#151722] px-3 py-1.5 text-xs text-zinc-400 border border-white/10 hover:border-cyan-500/50 hover:text-white transition-all"
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Trace Memory...</span>
            <kbd className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-white/10">⌘K</kbd>
          </button>
        </div>

      </div>
    </header>
  );
};
