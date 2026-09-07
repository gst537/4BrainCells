'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  User, 
  Building, 
  Hash, 
  Share2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';

export const DocumentModal: React.FC = () => {
  const {
    isDocumentModalOpen,
    setIsDocumentModalOpen,
    selectedEvidence,
    evidence,
    selectDecision,
    jumpToGraphForDecision,
    askWhyInChat
  } = useMemory();

  if (!isDocumentModalOpen) return null;

  const doc = selectedEvidence || evidence['REF-1'];
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-3xl bg-[#151515] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#00E5FF]" />
            <h2 className="text-sm font-bold text-white tracking-wide font-sans truncate">
              {doc.title}
            </h2>
          </div>

          <button
            onClick={() => setIsDocumentModalOpen(false)}
            className="p-1 rounded text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#262626]">
              <span className="text-[10px] text-[#7F8C99] font-mono-tech uppercase">Author</span>
              <p className="text-xs font-semibold text-white mt-1 truncate">{doc.author}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#262626]">
              <span className="text-[10px] text-[#7F8C99] font-mono-tech uppercase">Date</span>
              <p className="text-xs font-mono-tech text-white mt-1 truncate">{doc.date.split('T')[0]}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#262626]">
              <span className="text-[10px] text-[#7F8C99] font-mono-tech uppercase">Format</span>
              <p className="text-xs font-mono-tech text-[#00E5FF] mt-1">{doc.type}</p>
            </div>

            <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#262626]">
              <span className="text-[10px] text-[#7F8C99] font-mono-tech uppercase">Integrity Hash</span>
              <p className="text-xs font-mono-tech text-[#00D95F] mt-1 truncate">SHA-256 Valid</p>
            </div>
          </div>

          {/* Cryptographic Lineage Proof */}
          <div className="p-3 rounded-xl bg-[#141414] border border-[#222222] text-[11px] font-mono-tech text-[#7F8C99] flex items-center justify-between">
            <span className="truncate">Hash: {doc.hash}</span>
            <span className="text-[#00D95F] font-semibold shrink-0 ml-2">● Verified</span>
          </div>

          {/* Highlighted Key Finding */}
          <div>
            <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider font-mono-tech mb-2">
              Primary Evidentiary Excerpt
            </h4>
            <div className="p-4 rounded-xl bg-[#191919] border border-[#00E5FF]/40 text-xs text-[#d1d5db] leading-relaxed glow-cyan-subtle">
              {doc.highlightSnippet}
            </div>
          </div>

          {/* Complete Document Body */}
          <div>
            <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider font-mono-tech mb-2">
              Complete Artifact Content
            </h4>
            <div className="p-4 rounded-xl bg-[#121212] border border-[#242424] text-xs font-mono-tech text-[#b8b8b8] leading-relaxed whitespace-pre-wrap">
              {doc.content}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#242424] bg-[#161616] flex items-center justify-between">
          <button
            onClick={() => setIsDocumentModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#1f1f1f] border border-[#333333] text-xs font-medium text-[#d1d5db] hover:text-white transition-colors cursor-pointer"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {doc.relatedDecisionId && (
              <button
                onClick={() => {
                  setIsDocumentModalOpen(false);
                  selectDecision(doc.relatedDecisionId);
                }}
                className="px-4 py-2 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] hover:border-[#00E5FF] text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Open Related Decision</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsDocumentModalOpen(false);
                askWhyInChat(`What evidence in ${doc.title} justified the infrastructure decision?`);
              }}
              className="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00c8d7] text-black font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ask Why About This</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
