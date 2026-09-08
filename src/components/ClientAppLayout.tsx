'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemory } from '@/context/MemoryContext';
import { AppSidebar } from './layout/AppSidebar';
import { AppTopBar } from './layout/AppTopBar';

import { DecisionDetailDrawer } from './drawers/DecisionDetailDrawer';
import { NewDecisionTraceModal } from './modals/NewDecisionTraceModal';
import { DocumentModal } from './modals/DocumentModal';
import { ThreadModal } from './modals/ThreadModal';
import { PersonModal } from './modals/PersonModal';
import { GlobalSearchModal } from './modals/GlobalSearchModal';
import { NotificationDrawer } from './drawers/NotificationDrawer';

export function ClientAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, setActiveTab } = useMemory();

  // Sync route with activeTab
  useEffect(() => {
    if (pathname === '/chat' || pathname === '/why-chat') {
      if (activeTab !== 'why-chat') setActiveTab('why-chat');
    } else if (pathname === '/ledger' || pathname === '/decision-ledger') {
      if (activeTab !== 'decision-ledger') setActiveTab('decision-ledger');
    } else if (pathname === '/graph' || pathname === '/knowledge-graph') {
      if (activeTab !== 'knowledge-graph') setActiveTab('knowledge-graph');
    }
  }, [pathname, activeTab, setActiveTab]);

  // Don't show shell on the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#101010] text-[#F2F2F2]">
      
      {/* Persistent Left Sidebar matching Screenshots */}
      <AppSidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <AppTopBar />

        {/* Viewport Content */}
        <main className="flex-1 overflow-hidden flex flex-col relative">
          {children}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <DecisionDetailDrawer />
      <NotificationDrawer />
      <NewDecisionTraceModal />
      <DocumentModal />
      <ThreadModal />
      <PersonModal />
      <GlobalSearchModal />

    </div>
  );
}
