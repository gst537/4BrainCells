'use client';

import React, { useState, useMemo } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { DecisionItem, DecisionStatus } from '@/types';
import { 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X,
  ShieldCheck,
  Calendar,
  User,
  Tag
} from 'lucide-react';

export const DecisionLedgerView: React.FC = () => {
  const {
    decisions,
    selectDecision,
    exportLedgerCSV,
    filterStatus,
    setFilterStatus,
    filterConfidence,
    setFilterConfidence,
    filterOwner,
    setFilterOwner,
    clearFilters
  } = useMemory();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredDecisions = useMemo(() => {
    return decisions.filter(d => {
      // Status filter
      if (filterStatus !== 'all' && d.status !== filterStatus) return false;

      // Confidence filter
      if (filterConfidence === 'high' && d.confidence < 80) return false;
      if (filterConfidence === 'medium' && (d.confidence < 60 || d.confidence >= 80)) return false;
      if (filterConfidence === 'low' && d.confidence >= 60) return false;

      // Owner filter
      if (filterOwner !== 'all' && !d.owner.toLowerCase().includes(filterOwner.toLowerCase())) return false;

      return true;
    });
  }, [decisions, filterStatus, filterConfidence, filterOwner]);

  const totalPages = Math.max(1, Math.ceil(filteredDecisions.length / pageSize));
  const paginatedDecisions = filteredDecisions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStripeColor = (status: DecisionStatus) => {
    switch (status) {
      case 'Approved':
      case 'Confirmed':
        return 'bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]';
      case 'Pending':
        return 'bg-[#FFB000] shadow-[0_0_8px_#FFB000]';
      case 'Contested':
        return 'bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]';
      default:
        return 'bg-[#7F8C99]';
    }
  };

  const getStatusBadge = (status: DecisionStatus) => {
    switch (status) {
      case 'Approved':
      case 'Confirmed':
        return 'border-[#00C8D7] text-[#00E5FF] bg-[#00E5FF]/10';
      case 'Pending':
        return 'border-[#FFB000] text-[#FFB000] bg-[#FFB000]/10';
      case 'Contested':
        return 'border-[#FF4D4D] text-[#FF4D4D] bg-[#FF4D4D]/10';
      default:
        return 'border-[#7F8C99] text-[#7F8C99] bg-transparent';
    }
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 80) return 'bg-[#00E5FF]';
    if (score >= 60) return 'bg-[#FFB000]';
    return 'bg-[#FF4D4D]';
  };

  return (
    <div className="flex-1 flex flex-col p-8 bg-[#101010] min-h-[calc(100vh-3.5rem)] select-none overflow-y-auto">
      
      {/* Ledger Header matching Screenshot 2 */}
      <div className="flex items-start justify-between pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Decision Ledger
          </h1>
          <p className="text-xs text-[#7F8C99] mt-1 tracking-wide">
            Tracking high-impact institutional choices.
          </p>
        </div>

        {/* Top Right Action Buttons: Filter & Export */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              isFilterOpen || filterStatus !== 'all' || filterConfidence !== 'all' || filterOwner !== 'all'
                ? 'bg-[#1e1e1e] border-[#00E5FF] text-[#00E5FF]'
                : 'bg-[#151515] border-[#262626] hover:border-[#383838] text-[#F2F2F2]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {(filterStatus !== 'all' || filterConfidence !== 'all' || filterOwner !== 'all') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
            )}
          </button>

          <button
            onClick={exportLedgerCSV}
            className="px-4 py-1.5 rounded-lg bg-[#151515] hover:bg-[#1f1f1f] border border-[#262626] hover:border-[#383838] text-xs font-medium text-[#F2F2F2] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter Drawer if open */}
      {isFilterOpen && (
        <div className="mb-6 p-4 rounded-xl bg-[#151515] border border-[#262626] flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-[#7F8C99]">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#1b1b1b] border border-[#2d2d2d] rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="all">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Contested">Contested</option>
                <option value="Confirmed">Confirmed</option>
              </select>
            </div>

            {/* Confidence */}
            <div className="flex items-center gap-2">
              <span className="text-[#7F8C99]">Confidence:</span>
              <select
                value={filterConfidence}
                onChange={(e) => setFilterConfidence(e.target.value)}
                className="bg-[#1b1b1b] border border-[#2d2d2d] rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-[#00E5FF]"
              >
                <option value="all">All Levels</option>
                <option value="high">High (80%+)</option>
                <option value="medium">Medium (60-79%)</option>
                <option value="low">Low (&lt;60%)</option>
              </select>
            </div>

            {/* Owner */}
            <div className="flex items-center gap-2">
              <span className="text-[#7F8C99]">Owner:</span>
              <input
                type="text"
                placeholder="Filter by owner..."
                value={filterOwner === 'all' ? '' : filterOwner}
                onChange={(e) => setFilterOwner(e.target.value || 'all')}
                className="bg-[#1b1b1b] border border-[#2d2d2d] rounded-lg px-2.5 py-1 text-white text-xs outline-none focus:border-[#00E5FF] w-36"
              />
            </div>
          </div>

          <button
            onClick={clearFilters}
            className="text-xs text-[#00E5FF] hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Clear filters</span>
          </button>
        </div>
      )}

      {/* Main Table Container matching Screenshot 2 */}
      <div className="rounded-xl border border-[#242424] bg-[#141414] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          {/* Header Row */}
          <thead>
            <tr className="border-b border-[#242424] bg-[#161616]">
              <th className="py-3.5 pl-6 pr-3 text-[11px] font-mono-tech text-[#7F8C99] uppercase tracking-wider font-medium w-36">
                DECISION ID
              </th>
              <th className="py-3.5 px-4 text-[11px] font-mono-tech text-[#7F8C99] uppercase tracking-wider font-medium">
                TITLE
              </th>
              <th className="py-3.5 px-4 text-[11px] font-mono-tech text-[#7F8C99] uppercase tracking-wider font-medium w-48">
                PRIMARY OWNER
              </th>
              <th className="py-3.5 px-4 text-[11px] font-mono-tech text-[#7F8C99] uppercase tracking-wider font-medium w-44">
                CONFIDENCE
              </th>
              <th className="py-3.5 px-4 text-[11px] font-mono-tech text-[#7F8C99] uppercase tracking-wider font-medium w-32">
                STATUS
              </th>
              <th className="py-3.5 pr-6 pl-4 text-[11px] font-mono-tech text-[#7F8C99] uppercase tracking-wider font-medium w-40 text-right">
                DATE
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#1e1e1e]">
            {paginatedDecisions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#7F8C99]">
                  No decisions match the current filter criteria.
                </td>
              </tr>
            ) : (
              paginatedDecisions.map(d => (
                <tr
                  key={d.id}
                  onClick={() => selectDecision(d.id)}
                  className="relative group hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                >
                  {/* Left Colored Stripe matching Screenshot 2 */}
                  <td className="py-4 pl-6 pr-3 font-mono-tech text-xs text-[#d1d5db] relative">
                    <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${getStripeColor(d.status)}`} />
                    <span className="group-hover:text-[#00E5FF] transition-colors">
                      {d.id}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-4 px-4 text-xs font-semibold text-white font-sans">
                    {d.title}
                  </td>

                  {/* Primary Owner with Avatar */}
                  <td className="py-4 px-4 text-xs text-[#d1d5db]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center text-[10px] font-bold text-[#F2F2F2] shrink-0">
                        {d.ownerAvatar || d.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="truncate">{d.owner}</span>
                    </div>
                  </td>

                  {/* Confidence Percentage & Meter */}
                  <td className="py-4 px-4 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono-tech text-xs text-[#d1d5db] w-8">
                        {d.confidence}%
                      </span>
                      <div className="w-24 h-1.5 rounded-full bg-[#222222] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getConfidenceBarColor(d.confidence)}`}
                          style={{ width: `${d.confidence}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-medium border font-sans ${getStatusBadge(d.status)}`}>
                      {d.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 pr-6 pl-4 text-right font-mono-tech text-xs text-[#7F8C99]">
                    {d.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer matching Screenshot 2 */}
      <div className="flex items-center justify-between pt-4 text-xs text-[#7F8C99]">
        <div className="font-mono-tech">
          {filteredDecisions.length} decisions — page {currentPage} of {totalPages}
        </div>

        {/* Pagination Arrows */}
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1.5 rounded bg-[#161616] border border-[#282828] hover:border-[#383838] disabled:opacity-30 disabled:hover:border-[#282828] text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded bg-[#161616] border border-[#282828] hover:border-[#383838] disabled:opacity-30 disabled:hover:border-[#282828] text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
