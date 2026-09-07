'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  X, 
  Share2, 
  Clock, 
  FileText, 
  User, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  GitBranch, 
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const DecisionDetailDrawer: React.FC = () => {
  const {
    selectedDecision,
    isDecisionDetailOpen,
    setIsDecisionDetailOpen,
    jumpToGraphForDecision,
    askWhyInChat,
    timelineEvents,
    evidence,
    selectEvidence,
    setIsDocumentModalOpen,
    setIsThreadModalOpen
  } = useMemory();

  if (!isDecisionDetailOpen || !selectedDecision) return null;

  const breakdown = selectedDecision.confidenceBreakdown || {
    evidenceCoverage: 90,
    sourceReliability: 88,
    attribution: 100,
    temporalConsistency: 75,
    approvalCompleteness: 60
  };

  const relatedEvents = timelineEvents.filter(
    e => e.relatedDecisionId === selectedDecision.id
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-[#141414] border-l border-[#262626] h-full flex flex-col shadow-2xl overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-[#242424] bg-[#141414]/95 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#1f1f1f] border border-[#333333] font-mono-tech text-xs text-[#00E5FF] font-semibold">
              {selectedDecision.id}
            </span>
            <span className="text-xs text-[#7F8C99] font-mono-tech">
              Institutional Trace Record
            </span>
          </div>

          <button
            onClick={() => setIsDecisionDetailOpen(false)}
            className="p-1.5 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-7">
          
          {/* Title & Metadata */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                selectedDecision.status === 'Approved' || selectedDecision.status === 'Confirmed'
                  ? 'border-[#00C8D7] text-[#00E5FF] bg-[#00E5FF]/10'
                  : selectedDecision.status === 'Pending'
                  ? 'border-[#FFB000] text-[#FFB000] bg-[#FFB000]/10'
                  : 'border-[#FF4D4D] text-[#FF4D4D] bg-[#FF4D4D]/10'
              }`}>
                {selectedDecision.status}
              </span>
              <span className="font-mono-tech text-xs text-[#7F8C99]">
                {selectedDecision.date}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight font-sans">
              {selectedDecision.title}
            </h2>

            <div className="flex items-center gap-3 mt-3 text-xs text-[#d1d5db]">
              <div className="flex items-center gap-2 bg-[#1b1b1b] px-3 py-1.5 rounded-lg border border-[#2a2a2a]">
                <div className="w-5 h-5 rounded-full bg-[#262626] flex items-center justify-center text-[10px] font-bold text-white">
                  {selectedDecision.ownerAvatar || selectedDecision.owner[0]}
                </div>
                <div>
                  <span className="font-semibold text-white">{selectedDecision.owner}</span>
                  <span className="text-[#7F8C99] text-[11px] ml-1">({selectedDecision.ownerRole})</span>
                </div>
              </div>

              <div className="bg-[#1b1b1b] px-3 py-1.5 rounded-lg border border-[#2a2a2a] text-[#7F8C99]">
                {selectedDecision.department}
              </div>
            </div>
          </div>

          {/* Traceability Warnings (if any) */}
          {selectedDecision.warnings && selectedDecision.warnings.length > 0 && (
            <div className="space-y-2">
              {selectedDecision.warnings.map(w => (
                <div 
                  key={w.id} 
                  className="p-3.5 rounded-xl bg-[rgba(255,77,77,0.08)] border border-[#FF4D4D] text-xs text-[#FF4D4D] space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{w.message}</span>
                  </div>
                  {w.remediation && (
                    <p className="text-[11px] text-[#ff8080] pl-6">
                      Recommended Action: {w.remediation}
                    </p>
                  )}
                  {w.conflictingRecords && (
                    <div className="pl-6 flex flex-wrap gap-1.5 mt-1">
                      {w.conflictingRecords.map(rec => (
                        <span key={rec} className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-mono-tech border border-[#FF4D4D]/30">
                          {rec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Traceability Score & Confidence Engine Breakdown */}
          <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono-tech">
                  Traceability Confidence Engine
                </h3>
              </div>
              <span className={`text-base font-bold font-mono-tech ${
                selectedDecision.confidence >= 80 ? 'text-[#00E5FF]' :
                selectedDecision.confidence >= 60 ? 'text-[#FFB000]' : 'text-[#FF4D4D]'
              }`}>
                {selectedDecision.confidence}%
              </span>
            </div>

            {/* Sub-scores */}
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[#7F8C99] mb-1 text-[11px]">
                  <span>Evidence Coverage (35%)</span>
                  <span className="text-white font-mono-tech">{breakdown.evidenceCoverage}%</span>
                </div>
                <div className="w-full h-1 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: `${breakdown.evidenceCoverage}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#7F8C99] mb-1 text-[11px]">
                  <span>Source Reliability (25%)</span>
                  <span className="text-white font-mono-tech">{breakdown.sourceReliability}%</span>
                </div>
                <div className="w-full h-1 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF] rounded-full" style={{ width: `${breakdown.sourceReliability}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#7F8C99] mb-1 text-[11px]">
                  <span>Decision Attribution (20%)</span>
                  <span className="text-white font-mono-tech">{breakdown.attribution}%</span>
                </div>
                <div className="w-full h-1 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D95F] rounded-full" style={{ width: `${breakdown.attribution}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#7F8C99] mb-1 text-[11px]">
                  <span>Temporal Consistency (10%)</span>
                  <span className="text-white font-mono-tech">{breakdown.temporalConsistency}%</span>
                </div>
                <div className="w-full h-1 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFB000] rounded-full" style={{ width: `${breakdown.temporalConsistency}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#7F8C99] mb-1 text-[11px]">
                  <span>Approval Completeness (10%)</span>
                  <span className="text-white font-mono-tech">{breakdown.approvalCompleteness}%</span>
                </div>
                <div className="w-full h-1 bg-[#242424] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFB000] rounded-full" style={{ width: `${breakdown.approvalCompleteness}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Explanation 6 Questions: WHO, WHAT, WHEN, WHY, EVIDENCE, WHAT NEXT */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider font-mono-tech">
              Institutional Explanation Framework
            </h3>

            {/* WHAT */}
            <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-[#00E5FF]">What was decided</span>
              <p className="text-xs text-[#d1d5db] mt-1 leading-relaxed">{selectedDecision.summary}</p>
            </div>

            {/* WHY */}
            <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-[#00E5FF]">Why it was made (Root Rationale)</span>
              <p className="text-xs text-[#d1d5db] mt-1 leading-relaxed">{selectedDecision.rationale}</p>
            </div>

            {/* ALTERNATIVES CONSIDERED */}
            {selectedDecision.alternativesConsidered && (
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626]">
                <span className="text-[10px] font-mono-tech uppercase font-bold text-[#7F8C99]">Alternatives Rejected</span>
                <ul className="mt-2 space-y-1.5">
                  {selectedDecision.alternativesConsidered.map((alt, i) => (
                    <li key={i} className="text-xs text-[#b0b0b0] flex items-start gap-2">
                      <span className="text-[#FF4D4D] font-mono-tech">✕</span>
                      <span>{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Chronological & Branching Timeline Context */}
          <div>
            <h3 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider font-mono-tech mb-3">
              Event Lineage & Timeline
            </h3>

            <div className="space-y-3 border-l-2 border-[#262626] ml-2 pl-4">
              {relatedEvents.length === 0 ? (
                <div className="text-xs text-[#7F8C99]">No isolated timeline events recorded for this specific node.</div>
              ) : (
                relatedEvents.map(evt => (
                  <div key={evt.id} className="relative group">
                    <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                      evt.status === 'confirmed' ? 'bg-[#00E5FF] border-[#00E5FF]' :
                      evt.status === 'warning' ? 'bg-[#FF4D4D] border-[#FF4D4D]' : 'bg-[#FFB000] border-[#FFB000]'
                    }`} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{evt.title}</span>
                      <span className="text-[10px] font-mono-tech text-[#7F8C99]">{evt.date}</span>
                    </div>
                    <p className="text-xs text-[#a0a0a0] mt-0.5">{evt.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-4 border-t border-[#242424] grid grid-cols-2 gap-3">
            <button
              onClick={() => jumpToGraphForDecision(selectedDecision.id)}
              className="px-4 py-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] hover:border-[#00E5FF] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>View in Knowledge Graph</span>
            </button>

            <button
              onClick={() => askWhyInChat(`Why was ${selectedDecision.title} approved?`)}
              className="px-4 py-2.5 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] hover:border-[#00E5FF] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Ask Why in Chat</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
