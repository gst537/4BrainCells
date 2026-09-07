'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DecisionLedger } from '@/components/DecisionLedger';
import { mockDecisions } from '@/data/mockData';

export default function LedgerPage() {
  const router = useRouter();

  return (
    <div className="flex-1 bg-[#0a0b10] p-6 min-h-0 overflow-y-auto">
      <div className="max-w-6xl mx-auto h-full pb-10">
        <DecisionLedger 
          decisions={mockDecisions} 
          onSelectDecisionInGraph={(id) => router.push(`/graph?node=${id}`)}
          onAskWhyInChat={(q) => router.push(`/chat?q=${encodeURIComponent(q)}`)}
          onSelectEvidence={(id) => router.push(`/vault?id=${id}`)}
          densityMode="executive"
        />
      </div>
    </div>
  );
}
