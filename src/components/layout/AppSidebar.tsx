'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemory, NavigationTab } from '@/context/MemoryContext';
import { useAuth } from '@/context/AuthContext';
import {
  Share2,
  TableProperties,
  Clock,
  GitBranch,
  Plus,
  Shield
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const { activeTab, setActiveTab, setIsNewTraceModalOpen } = useMemory();
  const { role, canEdit } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const onAdminPage = pathname === '/admin';

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'knowledge-graph',
      label: 'Knowledge Graph',
      icon: <Share2 className="w-4 h-4" />
    },
    {
      id: 'decision-ledger',
      label: 'Decision Ledger',
      icon: <TableProperties className="w-4 h-4" />
    },
    {
      id: 'why-chat',
      label: 'Why Chat',
      icon: <Clock className="w-4 h-4" />
    }
  ];

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#242424] flex flex-col justify-between h-screen select-none shrink-0 z-30">
      
      {/* Top Brand & Nav */}
      <div className="p-5 flex flex-col">
        {/* Brand Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-wider text-[#00E5FF] font-sans">
            ALETHEIA
          </h1>
          <p className="text-xs text-[#7F8C99] font-medium tracking-wide mt-0.5">
            Institutional Memory
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map(item => {
            const isActive = !onAdminPage && activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onAdminPage) router.push('/');
                }}
                className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#1c1c1c] text-[#F2F2F2] font-semibold'
                    : 'text-[#7F8C99] hover:text-[#d1d5db] hover:bg-[#1f1f1f]'
                }`}
              >
                {/* Active Cyan Left Indicator Stripe */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00E5FF] rounded-r shadow-[0_0_8px_#00E5FF]" />
                )}

                {/* Icon */}
                <span className={`transition-colors ${isActive ? 'text-[#00E5FF]' : 'text-[#7F8C99] group-hover:text-white'}`}>
                  {item.icon}
                </span>

                {/* Label */}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin-only entry */}
          {role === 'admin' && (
            <Link
              href="/admin"
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left group ${
                onAdminPage
                  ? 'bg-[#1c1c1c] text-[#F2F2F2] font-semibold'
                  : 'text-[#7F8C99] hover:text-[#d1d5db] hover:bg-[#1f1f1f]'
              }`}
            >
              {onAdminPage && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00E5FF] rounded-r shadow-[0_0_8px_#00E5FF]" />
              )}
              <span className={`transition-colors ${onAdminPage ? 'text-[#00E5FF]' : 'text-[#7F8C99] group-hover:text-white'}`}>
                <Shield className="w-4 h-4" />
              </span>
              <span>Admin</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Section: Action Button & Profile */}
      <div className="p-4 border-t border-[#242424] space-y-3">
        {/* New Decision Trace Button — writers only */}
        {canEdit && (
          <button
            onClick={() => setIsNewTraceModalOpen(true)}
            className="w-full bg-[#00E5FF] hover:bg-[#00c8d7] text-black font-semibold text-sm py-2.5 px-4 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Decision Trace</span>
          </button>
        )}

        {/* User Profile Card */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#141414] border border-[#242424]">
          <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center text-xs font-bold text-[#F2F2F2] shrink-0">
            {role ? role.slice(0, 2).toUpperCase() : '—'}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[#F2F2F2] truncate capitalize">
              {role || 'Not signed in'}
            </span>
            <span className="text-[11px] font-mono-tech text-[#7F8C99] truncate">
              {canEdit ? 'read · write' : 'read only'}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
};
