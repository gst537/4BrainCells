import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { Bell, X, FileText, CheckCircle2, GitPullRequest } from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useMemory();

  if (!isNotificationsOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsNotificationsOpen(false)}
      />
      <div className="fixed top-0 right-0 w-96 h-full bg-[#121212] border-l border-[#242424] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-[#242424] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Bell className="w-4 h-4 text-[#00E5FF]" />
            <h2 className="text-sm font-semibold tracking-wide">Activity Feed</h2>
          </div>
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1.5 rounded-md text-[#7F8C99] hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          <div className="p-3 rounded-lg bg-[#181818] border border-[#242424] hover:border-[#3a3a3a] transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-[#00D95F]">
                <CheckCircle2 className="w-3 h-3" />
                <span>DECISION UPDATED</span>
              </div>
              <span className="text-[10px] text-[#555] font-mono-tech">10 MIN AGO</span>
            </div>
            <p className="text-xs text-white leading-relaxed font-sans mb-1">
              Sanjay Kumar approved <span className="font-semibold text-[#00E5FF]">ADR-012: Migrate to vector-backed RAG</span>.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#181818] border border-[#242424] hover:border-[#3a3a3a] transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-[#3B82F6]">
                <FileText className="w-3 h-3" />
                <span>NEW EVIDENCE INGESTED</span>
              </div>
              <span className="text-[10px] text-[#555] font-mono-tech">1 HR AGO</span>
            </div>
            <p className="text-xs text-white leading-relaxed font-sans mb-1">
              Automated ingestion from Notion: "Q3 System Architecture Planning".
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[#181818] border border-[#242424] hover:border-[#3a3a3a] transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-[#9CA3AF]">
                <GitPullRequest className="w-3 h-3" />
                <span>GITHUB WEBHOOK</span>
              </div>
              <span className="text-[10px] text-[#555] font-mono-tech">3 HRS AGO</span>
            </div>
            <p className="text-xs text-[#aaaaaa] leading-relaxed font-sans mb-1">
              PR #1042 merged by tarungs. Node <span className="font-mono text-xs">feat/pgvector</span> created.
            </p>
          </div>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-[#242424] shrink-0">
          <button className="w-full py-2 bg-[#1a1a1a] text-xs font-semibold text-[#888] rounded-lg hover:text-white transition-colors">
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
};
