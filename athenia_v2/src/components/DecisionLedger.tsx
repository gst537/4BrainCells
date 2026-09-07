'use client';

import React, { useState, useMemo } from 'react';
import { DecisionItem, DecisionStatus } from '@/types';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  GitBranch, 
  MessageSquareCode, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  Building,
  UserCheck
} from 'lucide-react';

interface DecisionLedgerProps {
  decisions: DecisionItem[];
  onSelectDecisionInGraph: (decisionId: string) => void;
  onAskWhyInChat: (query: string) => void;
  onSelectEvidence: (evidenceId: string) => void;
  densityMode: 'executive' | 'analyst';
}

export const DecisionLedger: React.FC<DecisionLedgerProps> = ({
  decisions,
  onSelectDecisionInGraph,
  onAskWhyInChat,
  onSelectEvidence,
  densityMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesSearch = 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [decisions, statusFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full w-full bg-[#090a0f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Ledger Header & Search Controls */}
      <div className="border-b border-white/10 bg-[#0e1017] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Curated Decision Ledger</h2>
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-mono font-semibold text-amber-300 border border-amber-500/30">
                {filteredDecisions.length} Active Records
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Authoritative, evidence-backed repository of all high-impact technical and organizational choices.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search choices, owners, departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 rounded-xl bg-[#151722] pl-9 pr-3 text-xs text-white placeholder-zinc-500 border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center rounded-xl bg-[#151722] p-1 border border-white/10 text-xs">
              {['all', 'Approved', 'Contested', 'Pending'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-[#0b0c13] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <th className="py-3 px-4 w-8"></th>
              <th className="py-3 px-4">Decision ID</th>
              <th className="py-3 px-4">Title & Rationale Summary</th>
              <th className="py-3 px-4">Primary Owner</th>
              <th className="py-3 px-4">Confidence Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Impact</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {filteredDecisions.map(decision => {
              const isExpanded = expandedRowId === decision.id;

              return (
                <React.Fragment key={decision.id}>
                  <tr 
                    onClick={() => setExpandedRowId(isExpanded ? null : decision.id)}
                    className={`cursor-pointer transition-colors ${
                      isExpanded ? 'bg-[#151724]' : 'hover:bg-[#11131c]'
                    }`}
                  >
                    {/* Expand Chevron */}
                    <td className="py-3.5 px-4 text-zinc-500">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300 whitespace-nowrap">
                      {decision.id}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-white group-hover:text-cyan-200">
                        {decision.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {decision.summary}
                      </div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                          {decision.owner.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-white">{decision.owner}</div>
                          <div className="text-[10px] text-zinc-500">{decision.department}</div>
                        </div>
                      </div>
                    </td>

                    {/* Confidence Meter */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-zinc-400">Score</span>
                          <span className={`font-semibold ${
                            decision.confidence > 90 ? 'text-cyan-300' :
                            decision.confidence > 75 ? 'text-amber-300' : 'text-red-300'
                          }`}>
                            {decision.confidence}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              decision.confidence > 90 ? 'bg-cyan-400' :
                              decision.confidence > 75 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${decision.confidence}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        decision.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        decision.status === 'Contested' ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
                        'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {decision.status}
                      </span>
                    </td>

                    {/* Impact Tier */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[11px] font-mono font-medium ${
                        decision.impact === 'Critical' ? 'text-red-400' :
                        decision.impact === 'High' ? 'text-amber-300' : 'text-blue-300'
                      }`}>
                        {decision.impact}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {decision.date}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onSelectDecisionInGraph(decision.id)}
                          title="Trace in Knowledge Graph"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-zinc-400 border border-white/5 transition-all"
                        >
                          <GitBranch className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onAskWhyInChat(`Why did we decide: "${decision.title}"?`)}
                          title="Ask 'Why' in Chat"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 text-zinc-400 border border-white/5 transition-all"
                        >
                          <MessageSquareCode className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectEvidence(decision.primaryEvidenceId)}
                          title="Inspect Primary Evidence"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-400 border border-white/5 transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Drawer Row */}
                  {isExpanded && (
                    <tr className="bg-[#12141e] border-b border-white/10">
                      <td colSpan={9} className="p-5">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
                          {/* Rationale & Core Why */}
                          <div className="lg:col-span-2 space-y-4">
                            <div>
                              <h4 className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                                Proven Root Rationale (&apos;The Why&apos;)
                              </h4>
                              <p className="text-zinc-200 bg-black/30 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                                {decision.rationale}
                              </p>
                            </div>

                            {/* Alternatives Evaluated & Rejected */}
                            <div>
                              <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
                                Rejected Alternatives & Why They Failed
                              </h4>
                              <ul className="space-y-1.5">
                                {decision.alternativesConsidered.map((alt, idx) => (
                                  <li key={idx} className="flex items-start space-x-2 text-zinc-300 bg-black/20 p-2 rounded-lg border border-white/5">
                                    <span className="text-amber-400 font-mono text-[10px] mt-0.5">✕</span>
                                    <span>{alt}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Side Action & Evidence Capsule */}
                          <div className="space-y-4 bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col justify-between">
                            <div>
                              <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                                Evidence Verification
                              </h4>
                              <p className="text-zinc-400 text-[11px] mb-3">
                                Every decision in ALETHEIA is cryptographically linked to meeting minutes, RFCs, and architecture review boards.
                              </p>
                              <button
                                onClick={() => onSelectEvidence(decision.primaryEvidenceId)}
                                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/50 transition-all font-mono text-[11px]"
                              >
                                <span className="flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" />
                                  {decision.primaryEvidenceId}
                                </span>
                                <span>Inspect Source ➔</span>
                              </button>
                            </div>

                            <div className="pt-3 border-t border-white/10 flex gap-2">
                              <button
                                onClick={() => onSelectDecisionInGraph(decision.id)}
                                className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-center font-medium flex items-center justify-center gap-1.5"
                              >
                                <GitBranch className="h-3.5 w-3.5" />
                                <span>Trace in Graph</span>
                              </button>
                              <button
                                onClick={() => onAskWhyInChat(`Why did we decide: "${decision.title}"?`)}
                                className="flex-1 py-2 px-3 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-center font-medium flex items-center justify-center gap-1.5"
                              >
                                <MessageSquareCode className="h-3.5 w-3.5" />
                                <span>Ask &apos;Why&apos;</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
