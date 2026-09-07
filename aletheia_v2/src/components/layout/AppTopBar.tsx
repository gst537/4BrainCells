'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { 
  Search, 
  Bell, 
  Sun, 
  Cloud, 
  CheckCircle2,
  Database
} from 'lucide-react';

export const AppTopBar: React.FC = () => {
  const { activeTab, setIsSearchModalOpen } = useMemory();

  const getPlaceholder = () => {
    if (activeTab === 'decision-ledger') return 'Search Ledger...';
    if (activeTab === 'why-chat') return 'Search institutional memory...';
    return 'Search institutional memory...';
  };

  return (
    <header className="h-14 border-b border-[#242424] bg-[#121212] px-6 flex items-center justify-between shrink-0 select-none z-20">
      
      {/* Left: Global Search Input */}
      <div className="flex-1 max-w-md">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#262626] hover:border-[#3a3a3a] text-xs text-[#7F8C99] transition-colors group text-left cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#7F8C99] group-hover:text-white transition-colors" />
          <span className="flex-1">{getPlaceholder()}</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono-tech bg-[#222222] text-[#7F8C99] rounded border border-[#333333]">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Notification, Theme, Status & Avatar */}
      <div className="flex items-center gap-3 ml-4">
        {/* Notifications */}
        <button 
          title="Notifications" 
          className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#1c1c1c] transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Theme/Sun */}
        <button 
          title="Theme Toggle" 
          className="p-2 rounded-lg text-[#7F8C99] hover:text-white hover:bg-[#1c1c1c] transition-colors"
        >
          <Sun className="w-4 h-4" />
        </button>

        {/* Cloud Sync Status */}
        <div 
          title="Institutional Cloud Sync Active" 
          className="p-2 rounded-lg text-[#7F8C99] hover:text-[#00E5FF] hover:bg-[#1c1c1c] transition-colors flex items-center gap-1 cursor-default"
        >
          <Cloud className="w-4 h-4" />
        </div>

        {/* User Avatar Circle */}
        <div className="w-7 h-7 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center text-[11px] font-bold text-[#F2F2F2] cursor-pointer hover:border-[#00E5FF] transition-colors">
          EU
        </div>
      </div>

    </header>
  );
};
