'use client';

import GraphView from '@/components/GraphView';
import DecisionLedger from '@/components/DecisionLedger';
import WhyChat from '@/components/WhyChat';
import { Database } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100/50 p-4 lg:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6 h-[calc(100vh-3rem)] flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Institutional Memory</h1>
              <p className="text-sm text-slate-500 font-medium">Decision Traceability Platform</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold tracking-wide">
              LIVE LEDGER
            </span>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wide">
              HACKATHON DEMO
            </span>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* Left Column: Ledger & Chat */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full min-h-0">
            <div className="h-[40%] min-h-0">
              <DecisionLedger />
            </div>
            <div className="h-[60%] min-h-0">
              <WhyChat />
            </div>
          </div>

          {/* Right Column: Interactive Graph */}
          <div className="lg:col-span-8 h-full min-h-0">
            <GraphView />
          </div>

        </div>
      </div>
    </main>
  );
}
