'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  X, 
  User, 
  Share2, 
  Clock, 
  Building, 
  FileText, 
  Calendar,
  ShieldCheck 
} from 'lucide-react';

export const PersonModal: React.FC = () => {
  const {
    isPersonModalOpen,
    setIsPersonModalOpen,
    selectedPerson,
    decisions,
    selectDecision,
    jumpToGraphForDecision,
    askWhyInChat
  } = useMemory();

  if (!isPersonModalOpen || !selectedPerson) return null;

  const userDecisions = decisions.filter(
    d => d.owner.toLowerCase().includes(selectedPerson.name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-full max-w-lg bg-[#151515] border border-[#2c2c2c] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#262626] border border-[#00E5FF] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_10px_rgba(0,229,255,0.3)]">
              {selectedPerson.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-sans">
                {selectedPerson.name}
              </h2>
              <p className="text-xs text-[#7F8C99]">
                {selectedPerson.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPersonModalOpen(false)}
            className="p-1.5 rounded text-[#7F8C99] hover:text-white hover:bg-[#222222] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Department */}
          <div className="p-3 rounded-xl bg-[#191919] border border-[#262626] flex items-center justify-between text-xs">
            <span className="text-[#7F8C99]">Department</span>
            <span className="font-semibold text-white">{selectedPerson.department || 'Executive Leadership'}</span>
          </div>

          {/* Decisions Owned */}
          <div>
            <h4 className="text-xs font-semibold text-[#7F8C99] uppercase tracking-wider font-mono-tech mb-2.5">
              Decisions Owned &amp; Signed ({userDecisions.length})
            </h4>

            <div className="space-y-2">
              {userDecisions.length === 0 ? (
                <p className="text-xs text-[#7F8C99]">No directly linked decisions found in current active ledger filter.</p>
              ) : (
                userDecisions.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setIsPersonModalOpen(false);
                      selectDecision(d.id);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-[#191919] border border-[#262626] hover:border-[#00E5FF] text-xs text-white transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <span className="font-mono-tech text-[10px] text-[#00E5FF] block">{d.id}</span>
                      <span className="font-semibold text-white group-hover:text-[#00E5FF] transition-colors">{d.title}</span>
                    </div>
                    <span className="text-[11px] font-mono-tech text-[#7F8C99]">{d.confidence}%</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                setIsPersonModalOpen(false);
                askWhyInChat(`What decisions was ${selectedPerson.name} involved in?`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#00E5FF] hover:bg-[#00c8d7] text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ask Why About {selectedPerson.name}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
