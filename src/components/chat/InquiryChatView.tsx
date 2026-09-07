'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  FileText, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Search
} from 'lucide-react';

export const InquiryChatView: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    evidence,
    activeEvidenceRef,
    setActiveEvidenceRef,
    setIsDocumentModalOpen,
    setIsThreadModalOpen,
    selectEvidence,
    jumpToGraphForDecision
  } = useMemory();

  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ref1CardRef = useRef<HTMLDivElement>(null);
  const ref2CardRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isSubmitting) return;
    const q = inputQuery;
    setInputQuery('');
    setIsSubmitting(true);
    await sendChatMessage(q);
    setIsSubmitting(false);
  };

  const handleRefClick = (refId: string) => {
    setActiveEvidenceRef(refId);
    selectEvidence(refId);
    if (refId === 'REF-1') {
      ref1CardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (refId === 'REF-2') {
      ref2CardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#101010] h-[calc(100vh-3.5rem)] overflow-hidden select-none">
      
      {/* 2-Panel Split Container matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
        
        {/* LEFT PANEL: Inquiry Mode */}
        <div className="flex flex-col bg-[#151515] rounded-2xl border border-[#242424] overflow-hidden shadow-2xl h-full">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between shrink-0 bg-[#161616]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <h2 className="text-sm font-semibold text-[#F2F2F2] tracking-wide font-sans">
                Inquiry Mode
              </h2>
            </div>
            
            <div className="px-2.5 py-0.5 rounded-md bg-[#1d1d1d] border border-[#2d2d2d] text-[11px] font-mono-tech text-[#7F8C99]">
              Session: #994A
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 min-h-0">
            {chatMessages.map(msg => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex flex-col items-end space-y-1">
                    <div className="bg-[#222222] border border-[#2e2e2e] text-[#F2F2F2] text-xs px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed shadow-sm">
                      {msg.text}
                    </div>
                    <span className="text-[11px] font-mono-tech text-[#7F8C99] pr-1">
                      You · {msg.timestamp}
                    </span>
                  </div>
                );
              }

              // Assistant message
              return (
                <div key={msg.id} className="flex flex-col items-start space-y-2 max-w-[95%]">
                  {/* Header: Avatar, Name & Confidence Badge */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#181818] border border-[#00E5FF] flex items-center justify-center text-[11px] font-bold text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                        A
                      </div>
                      <span className="text-xs font-semibold text-[#F2F2F2]">
                        Aletheia AI
                      </span>
                    </div>

                    {msg.confidenceBadge && (
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 ${
                        msg.confidenceBadge === 'Strong Confidence'
                          ? 'border-[#FFB000] text-[#FFB000] bg-transparent'
                          : msg.confidenceBadge === 'Weak Confidence'
                          ? 'border-[#FFB000] text-[#FFB000] bg-transparent'
                          : 'border-[#7F8C99] text-[#7F8C99] bg-transparent'
                      }`}>
                        {msg.confidenceBadge === 'Weak Confidence' && <AlertTriangle className="w-3 h-3 text-[#FFB000]" />}
                        {msg.confidenceBadge}
                      </span>
                    )}
                  </div>

                  {/* Body Text with Clickable Evidence Links */}
                  <div className="text-xs text-[#d1d5db] leading-relaxed pl-8">
                    {msg.id === 'MSG-2' ? (
                      <p>
                        The pivot to a cloud-native architecture in Q3 2022 was driven primarily by three compounding factors identified in the{' '}
                        <button
                          onClick={() => handleRefClick('REF-1')}
                          className="text-[#00E5FF] hover:underline cursor-pointer font-medium"
                        >
                          Q2 Scalability Assessment
                        </button>
                        . Chiefly, legacy on-premise infrastructure was resulting in a 40% increase in deployment bottlenecks{' '}
                        <button
                          onClick={() => handleRefClick('REF-1')}
                          className="text-[#00E5FF] font-mono-tech font-bold hover:underline cursor-pointer"
                        >
                          [Ref 1]
                        </button>
                        , and our primary competitor&apos;s shift necessitated faster time-to-market.
                      </p>
                    ) : msg.id === 'MSG-4' ? (
                      <div className="space-y-3">
                        <p>
                          Records indicate verbal approval was likely given during the{' '}
                          <button
                            onClick={() => handleRefClick('REF-2')}
                            className="text-[#00E5FF] hover:underline cursor-pointer font-medium"
                          >
                            August Executive Offsite [Ref 2]
                          </button>
                          . However, formal sign-off in the procurement system (ProcureIT) is missing for the final 15% overrun authorization.
                        </p>

                        {/* Red Warning Box matching Screenshot 1 */}
                        <button
                          onClick={() => handleRefClick('REF-2')}
                          className="w-full text-left bg-[rgba(255,77,77,0.06)] border border-[#FF4D4D] rounded-lg p-3 hover:bg-[rgba(255,77,77,0.12)] transition-colors cursor-pointer block"
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF4D4D]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Traceability gap detected. Recommending audit of Q3 Procurement Logs.</span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}

                    {/* Additional citations if present */}
                    {msg.citations && msg.citations.length > 0 && msg.id !== 'MSG-2' && msg.id !== 'MSG-4' && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {msg.citations.map(cit => (
                          <button
                            key={cit.id}
                            onClick={() => cit.evidenceId && handleRefClick(cit.evidenceId)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1f1f1f] border border-[#2f2f2f] text-[11px] text-[#00E5FF] hover:border-[#00E5FF] transition-colors"
                          >
                            <FileText className="w-3 h-3 text-[#00E5FF]" />
                            <span>{cit.refLabel || cit.docTitle}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[11px] font-mono-tech text-[#7F8C99] pl-8">
                    Aletheia · {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form matching Screenshot 1 */}
          <form onSubmit={handleSend} className="p-3 border-t border-[#242424] bg-[#151515] flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask 'Why' about any decision..."
              className="flex-1 bg-[#1b1b1b] border border-[#282828] focus:border-[#00E5FF] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#7F8C99] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputQuery.trim()}
              className="bg-[#00E5FF] hover:bg-[#00c8d7] disabled:opacity-40 text-black p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
            </button>
          </form>

        </div>

        {/* RIGHT PANEL: Evidence Viewer matching Screenshot 1 */}
        <div className="flex flex-col bg-[#151515] rounded-2xl border border-[#242424] overflow-hidden shadow-2xl h-full">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#242424] flex items-center justify-between shrink-0 bg-[#161616]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7F8C99]" />
              <h2 className="text-sm font-semibold text-[#F2F2F2] tracking-wide font-sans">
                Evidence Viewer
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-medium font-mono-tech">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span>Ref: 1 active</span>
            </div>
          </div>

          {/* Evidence Cards Scroll Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
            
            {/* EVIDENCE CARD 1: Q2 Scalability Assessment.pdf */}
            <div 
              ref={ref1CardRef}
              className={`rounded-xl bg-[#191919] p-4 transition-all duration-300 ${
                activeEvidenceRef === 'REF-1'
                  ? 'border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.18)]'
                  : 'border border-[#262626] hover:border-[#383838]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white font-sans">
                    Q2 Scalability Assessment.pdf
                  </h3>
                  <p className="text-[11px] font-mono-tech text-[#7F8C99] mt-0.5">
                    S. Chen (VP Eng) · 2022-07-14T09:22:00Z
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#142328] border border-[#00E5FF] text-[11px] font-mono-tech font-bold text-[#00E5FF]">
                  Ref: 1
                </span>
              </div>

              {/* Inner Excerpt Box with Highlights */}
              <div className="my-3.5 p-3 rounded-lg bg-[#141414] border border-[#242424] text-xs text-[#d1d5db] leading-relaxed">
                ...analysis indicates that the current on-premise infrastructure is operating at{' '}
                <span className="text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-1 py-0.5 rounded">
                  92% capacity
                </span>{' '}
                during peak hours. The resulting{' '}
                <span className="text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-1 py-0.5 rounded">
                  deployment bottlenecks have increased by 40% quarter-over-quarter
                </span>
                . To maintain SLA commitments and counter competitor advancements, a phased migration to a{' '}
                <span className="text-[#00E5FF] font-semibold bg-[#00E5FF]/10 px-1 py-0.5 rounded">
                  cloud-native architecture
                </span>{' '}
                is strongly recommended.
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    selectEvidence('REF-1');
                    setIsDocumentModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] hover:border-[#00E5FF] text-xs font-medium text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>View Full Document</span>
                </button>
              </div>
            </div>

            {/* EVIDENCE CARD 2: Re: Offsite Budget Finalization */}
            <div 
              ref={ref2CardRef}
              className={`rounded-xl bg-[#191919] p-4 transition-all duration-300 ${
                activeEvidenceRef === 'REF-2'
                  ? 'border-2 border-[#FFB000] shadow-[0_0_20px_rgba(255,176,0,0.18)]'
                  : 'border border-[#262626] hover:border-[#383838]'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white font-sans">
                    Re: Offsite Budget Finalization
                  </h3>
                  <p className="text-[11px] font-mono-tech text-[#7F8C99] mt-0.5">
                    M. Davis (CFO) · 2022-08-23T14:35:00Z
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#252015] border border-[#383838] text-[11px] font-mono-tech font-bold text-[#7F8C99]">
                  Ref: 2
                </span>
              </div>

              {/* Quoted Email Content */}
              <div className="my-3.5 p-3 rounded-lg bg-[#141414] border border-[#242424] text-xs text-[#b8b8b8] leading-relaxed font-sans space-y-2">
                <p className="text-[#888888]">
                  &gt; On Aug 22, 2022, J. Doe wrote:<br />
                  &gt; Need final nod on the 15% buffer for the AWS transition discussed yesterday.
                </p>
                <p>
                  Yeah, go ahead with the buffer as discussed in the afternoon session. I&apos;ll formally sign off in{' '}
                  <span className="text-[#FFB000] font-semibold bg-[#FFB000]/10 px-1 py-0.5 rounded">
                    ProcureIT
                  </span>{' '}
                  when I&apos;m back at my desk next week.
                </p>
              </div>

              {/* Footer: Missing Sub-trace Warning & View Thread Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs text-[#FF4D4D] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4D]" />
                  <span>Missing Sub-trace: ProcureIT</span>
                </div>

                <button
                  onClick={() => {
                    selectEvidence('REF-2');
                    setIsThreadModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#252525] border border-[#333333] hover:border-[#FFB000] text-xs font-medium text-white transition-all cursor-pointer"
                >
                  View Thread
                </button>
              </div>
            </div>

            {/* Additional Evidence in Vault */}
            {evidence['DOC-RISK-V2'] && (
              <div className="rounded-xl bg-[#171717] border border-[#242424] p-4 opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">Risk Analysis V2: EMEA Operating Environment</h3>
                    <p className="text-[10px] font-mono-tech text-[#7F8C99]">Corporate Risk Office · 2023-10-12</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#333333] text-[10px] font-mono-tech text-[#7F8C99]">Ref: 3</span>
                </div>
                <p className="text-xs text-[#999999] mt-2 line-clamp-2">{evidence['DOC-RISK-V2'].highlightSnippet}</p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
