'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  X, 
  Mail, 
  AlertTriangle, 
  Clock, 
  Share2, 
  User 
} from 'lucide-react';

export const ThreadModal: React.FC = () => {
  const {
    isThreadModalOpen,
    setIsThreadModalOpen,
    selectDecision,
    askWhyInChat
  } = useMemory();

  if (!isThreadModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-[#151515] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-[#FFB000]" />
            <h2 className="text-sm font-bold text-white tracking-wide font-sans">
              Email Thread: Re: Offsite Budget Finalization
            </h2>
          </div>

          <button
            onClick={() => setIsThreadModalOpen(false)}
            className="p-1 rounded text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Missing Subtrace Warning Box */}
          <div className="p-3.5 rounded-xl bg-[rgba(255,77,77,0.08)] border border-[#FF4D4D] text-xs text-[#FF4D4D] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Missing Sub-trace: ProcureIT</p>
              <p className="text-[11px] text-[#ff8080] mt-0.5">
                CFO verbal consent was provided in this correspondence, but no matching cryptographic voucher was found in the ProcureIT enterprise procurement ledger.
              </p>
            </div>
          </div>

          {/* Email 1 in Thread */}
          <div className="p-4 rounded-xl bg-[#191919] border border-[#262626] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">J. Doe</span>
                <span className="text-[#7F8C99] text-[11px]">&lt;j.doe@aletheia.internal&gt;</span>
              </div>
              <span className="font-mono-tech text-[11px] text-[#7F8C99]">Aug 22, 2022 · 16:15 UTC</span>
            </div>

            <p className="text-xs text-[#b8b8b8] leading-relaxed">
              Executive Offsite - Session #4 Summary:<br />
              Cloud infrastructure team requests authorization for a 15% overrun buffer ($270,000) on the AWS multi-zone transition contract to cover reserve capacity and live database replication during cutover. Need final nod on the 15% buffer for the AWS transition discussed yesterday.
            </p>
          </div>

          {/* Email 2 (Reply from CFO M. Davis) */}
          <div className="p-4 rounded-xl bg-[#1c1c1c] border-2 border-[#FFB000]/50 space-y-2 shadow-[0_0_15px_rgba(255,176,0,0.15)]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">M. Davis (CFO)</span>
                <span className="text-[#7F8C99] text-[11px]">&lt;m.davis@aletheia.internal&gt;</span>
              </div>
              <span className="font-mono-tech text-[11px] text-[#FFB000]">Aug 23, 2022 · 14:35 UTC</span>
            </div>

            <p className="text-xs text-[#d1d5db] leading-relaxed">
              Yeah, go ahead with the buffer as discussed in the afternoon session. I&apos;ll formally sign off in{' '}
              <span className="text-[#FFB000] font-semibold bg-[#FFB000]/10 px-1 py-0.5 rounded">
                ProcureIT
              </span>{' '}
              when I&apos;m back at my desk next week.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#242424] bg-[#161616] flex items-center justify-between">
          <button
            onClick={() => setIsThreadModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#1f1f1f] border border-[#333333] text-xs font-medium text-[#d1d5db] hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              setIsThreadModalOpen(false);
              selectDecision('DEC-2023-090');
            }}
            className="px-4 py-2 rounded-xl bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] hover:border-[#00E5FF] text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Open DEC-2023-090</span>
          </button>
        </div>

      </div>
    </div>
  );
};
