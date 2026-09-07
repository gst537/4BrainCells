'use client';

import React, { useState } from 'react';
import { EvidenceDocument } from '@/types';
import { mockEvidence } from '@/data/mockData';
import { 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Hash, 
  Calendar, 
  User, 
  Building, 
  GitBranch,
  Lock,
  Layers
} from 'lucide-react';

interface EvidenceViewerProps {
  selectedEvidenceId: string;
  onSelectEvidenceId: (id: string) => void;
  onSelectDecision: (decisionId: string) => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  selectedEvidenceId,
  onSelectEvidenceId,
  onSelectDecision
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  const docList = Object.values(mockEvidence);
  const currentDoc: EvidenceDocument = mockEvidence[selectedEvidenceId] || docList[0];

  const handleCopyHash = () => {
    navigator.clipboard.writeText(currentDoc.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0b10] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Evidence Viewer Header */}
      <div className="border-b border-white/10 bg-[#0e1017] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Evidence Vault & Audit Trail
              </h2>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300 border border-emerald-500/30">
                Verified Ledger
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Primary source documentation proving the institutional rationale.
            </p>
          </div>
        </div>

        {/* Document Selector Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          {docList.map(doc => (
            <button
              key={doc.id}
              onClick={() => onSelectEvidenceId(doc.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                doc.id === currentDoc.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-[#151724] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {doc.id}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata Banner */}
      <div className="border-b border-white/5 bg-[#12141f] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Primary Author</span>
          <span className="font-semibold text-white flex items-center gap-1.5 mt-0.5">
            <User className="h-3.5 w-3.5 text-cyan-400" />
            {currentDoc.author}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Ratification Date</span>
          <span className="font-mono text-zinc-300 flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            {new Date(currentDoc.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Department & Scope</span>
          <span className="text-zinc-300 flex items-center gap-1.5 mt-0.5">
            <Building className="h-3.5 w-3.5 text-indigo-400" />
            {currentDoc.department}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Linked Decision</span>
          <button
            onClick={() => onSelectDecision(currentDoc.relatedDecisionId)}
            className="font-mono font-semibold text-cyan-300 hover:underline flex items-center gap-1.5 mt-0.5"
          >
            <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
            {currentDoc.relatedDecisionId}
          </button>
        </div>
      </div>

      {/* Cryptographic SHA-256 Hash Strip */}
      <div className="border-b border-white/5 bg-black/40 px-4 py-2 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center space-x-2 truncate">
          <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="text-zinc-500">IMMUTABLE PROVENANCE:</span>
          <span className="text-zinc-300 truncate">{currentDoc.hash}</span>
        </div>
        <button
          onClick={handleCopyHash}
          className="ml-2 flex items-center space-x-1 text-[10px] rounded bg-white/5 hover:bg-white/10 px-2 py-0.5 text-zinc-400 hover:text-white transition-colors shrink-0"
        >
          {copiedHash ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Hash</span>
            </>
          )}
        </button>
      </div>

      {/* Main Document Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
        
        {/* Highlighted Cited Snippet Box */}
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>RAG-Cited Source Passage (Ground Truth)</span>
          </div>
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-4 text-xs sm:text-sm text-amber-100/90 leading-relaxed shadow-inner">
            &quot;{currentDoc.highlightSnippet}&quot;
          </div>
        </div>

        {/* Full Document Body */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Full Signed Archival Dossier
          </h3>
          <div className="rounded-xl bg-[#12141f] border border-white/10 p-5 font-mono text-xs text-zinc-300 whitespace-pre-line leading-relaxed shadow-lg">
            {currentDoc.content}
          </div>
        </div>

      </div>

    </div>
  );
};
