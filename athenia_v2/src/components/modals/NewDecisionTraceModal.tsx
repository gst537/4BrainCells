'use client';

import React, { useState } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ShieldCheck, 
  FileText, 
  User, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { DecisionStatus, ImpactTier } from '@/types';

export const NewDecisionTraceModal: React.FC = () => {
  const { isNewTraceModalOpen, setIsNewTraceModalOpen, addDecisionTrace, setActiveTab } = useMemory();

  const [step, setStep] = useState(1);

  // Step 1: Decision Information
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState('Exec User');
  const [ownerRole, setOwnerRole] = useState('VP of Strategic Operations');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16).replace('T', ' '));
  const [status, setStatus] = useState<DecisionStatus>('Approved');
  const [department, setDepartment] = useState('Enterprise Platform');

  // Step 2: Context & Rationale
  const [whyRationale, setWhyRationale] = useState('');
  const [relatedProject, setRelatedProject] = useState('North American Consolidation');
  const [tags, setTags] = useState('strategy, 2024, infra');

  // Step 3: Evidence
  const [docTitle, setDocTitle] = useState('');
  const [docAuthor, setDocAuthor] = useState('');
  const [docExcerpt, setDocExcerpt] = useState('');
  const [docType, setDocType] = useState<'RFC' | 'ADR' | 'Postmortem' | 'Audit' | 'Meeting'>('RFC');

  // Step 4: Confidence Breakdown inputs
  const [evidenceCoverage, setEvidenceCoverage] = useState(90);
  const [sourceReliability, setSourceReliability] = useState(88);
  const [attribution, setAttribution] = useState(95);
  const [temporalConsistency, setTemporalConsistency] = useState(80);
  const [approvalCompleteness, setApprovalCompleteness] = useState(85);

  if (!isNewTraceModalOpen) return null;

  const calculatedScore = Math.round(
    evidenceCoverage * 0.35 +
    sourceReliability * 0.25 +
    attribution * 0.20 +
    temporalConsistency * 0.10 +
    approvalCompleteness * 0.10
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addDecisionTrace(
      {
        title: title || 'Strategic Platform Standardization',
        summary: description || 'Mandatory consolidation of regional endpoints to enforce zero-trust token lineage.',
        owner,
        ownerRole,
        date,
        status,
        department,
        rationale: whyRationale || 'Preempted upcoming audit cycle deficiencies by standardizing institutional evidence pipelines.',
        confidenceBreakdown: {
          evidenceCoverage,
          sourceReliability,
          attribution,
          temporalConsistency,
          approvalCompleteness
        },
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      },
      docTitle ? {
        title: docTitle,
        author: docAuthor || owner,
        highlightSnippet: docExcerpt,
        type: docType
      } : undefined
    );

    setIsNewTraceModalOpen(false);
    setStep(1);
    setActiveTab('decision-ledger');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-[#151515] border border-[#2d2d2d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            <h2 className="text-sm font-bold text-white tracking-wide font-sans">
              New Institutional Decision Trace
            </h2>
          </div>

          <button
            onClick={() => setIsNewTraceModalOpen(false)}
            className="p-1 rounded text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Step Indicator */}
        <div className="px-6 py-3 border-b border-[#242424] bg-[#141414] flex items-center justify-between text-xs text-[#7F8C99] font-mono-tech">
          {[
            { n: 1, label: 'Decision Info' },
            { n: 2, label: 'Context & Why' },
            { n: 3, label: 'Evidence Links' },
            { n: 4, label: 'Confidence & Review' }
          ].map(s => (
            <div key={s.n} className="flex items-center gap-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === s.n
                  ? 'bg-[#00E5FF] text-black'
                  : step > s.n
                  ? 'bg-[#00D95F] text-black'
                  : 'bg-[#222222] text-[#7F8C99]'
              }`}>
                {step > s.n ? '✓' : s.n}
              </span>
              <span className={step === s.n ? 'text-white font-semibold' : ''}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">
                  Decision Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Migration of Payment Gateway to Cloud-Native EKS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] focus:border-[#00E5FF] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">
                  Summary Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of what technical or operational choice was enacted..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] focus:border-[#00E5FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Primary Owner</label>
                  <input
                    type="text"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Owner Role</label>
                  <input
                    type="text"
                    value={ownerRole}
                    onChange={(e) => setOwnerRole(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DecisionStatus)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Contested">Contested</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">
                  Why was this decision made? (Root Rationale) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the compounding factors, cost drivers, or operational bottlenecks that mandated this choice..."
                  value={whyRationale}
                  onChange={(e) => setWhyRationale(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] focus:border-[#00E5FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Related Strategy / Project</label>
                  <input
                    type="text"
                    value={relatedProject}
                    onChange={(e) => setRelatedProject(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-xs text-[#7F8C99]">
                Attach a primary evidentiary artifact (RFC, ADR, postmortem, or meeting thread) to anchor this decision.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Evidence Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Architectural Evaluation & Benchmark Report.pdf"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  >
                    <option value="RFC">RFC (Request for Comments)</option>
                    <option value="ADR">ADR (Architecture Decision Record)</option>
                    <option value="Audit">Compliance / Audit Report</option>
                    <option value="Meeting">Meeting Minutes</option>
                    <option value="Postmortem">Postmortem Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Document Author</label>
                  <input
                    type="text"
                    placeholder="e.g. S. Chen (VP Eng)"
                    value={docAuthor}
                    onChange={(e) => setDocAuthor(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d1d5db] mb-1.5">Key Evidentiary Excerpt</label>
                <textarea
                  rows={3}
                  placeholder="Quote the exact paragraph or empirical metrics justifying the decision..."
                  value={docExcerpt}
                  onChange={(e) => setDocExcerpt(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#2b2b2b] rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIDENCE ENGINE */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Calculated Confidence Banner */}
              <div className="p-4 rounded-xl bg-[#191919] border border-[#2a2a2a] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#7F8C99] uppercase font-mono-tech">Calculated Traceability Score</span>
                  <p className="text-sm text-white font-semibold mt-0.5">
                    {calculatedScore >= 80 ? 'Strong Confidence' : calculatedScore >= 60 ? 'Moderate Confidence' : 'Weak Confidence'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold font-mono-tech text-[#00E5FF]">
                    {calculatedScore}%
                  </span>
                </div>
              </div>

              {/* Slider adjustments for mock parameters */}
              <div className="space-y-3 p-4 rounded-xl bg-[#171717] border border-[#242424] text-xs">
                <span className="text-[#7F8C99] font-mono-tech uppercase font-semibold block mb-2">
                  Traceability Weight Breakdown
                </span>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#d1d5db]">Evidence Coverage</span>
                    <span className="font-mono-tech text-[#00E5FF]">{evidenceCoverage}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={evidenceCoverage}
                    onChange={(e) => setEvidenceCoverage(Number(e.target.value))}
                    className="w-full accent-[#00E5FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#d1d5db]">Source Reliability</span>
                    <span className="font-mono-tech text-[#00E5FF]">{sourceReliability}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={sourceReliability}
                    onChange={(e) => setSourceReliability(Number(e.target.value))}
                    className="w-full accent-[#00E5FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#d1d5db]">Decision Attribution</span>
                    <span className="font-mono-tech text-[#00E5FF]">{attribution}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={attribution}
                    onChange={(e) => setAttribution(Number(e.target.value))}
                    className="w-full accent-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Summary Review */}
              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] text-xs space-y-1.5">
                <div className="font-semibold text-white">{title || 'Strategic Platform Standardization'}</div>
                <div className="text-[#7F8C99]">Owner: {owner} · Status: {status}</div>
                <div className="text-[#b0b0b0] text-[11px]">
                  Submitting will live-insert nodes into the Decision Ledger, Knowledge Graph, and Institutional Timeline.
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-[#242424] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-xl bg-[#1c1c1c] border border-[#2d2d2d] text-xs font-semibold text-white hover:bg-[#252525] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-5 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00c8d7] text-black font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00c8d7] text-black font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>Create Decision Trace</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
