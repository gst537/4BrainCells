'use client';

import React from 'react';
import { useMemory } from '@/context/MemoryContext';
import { KnowledgeGraphView } from '@/components/graph/KnowledgeGraphView';
import { DecisionLedgerView } from '@/components/ledger/DecisionLedgerView';
import { InquiryChatView } from '@/components/chat/InquiryChatView';

export default function Home() {
  const { activeTab } = useMemory();

  if (activeTab === 'decision-ledger') {
    return <DecisionLedgerView />;
  }

  if (activeTab === 'why-chat') {
    return <InquiryChatView />;
  }

  // Default: Knowledge Graph
  return <KnowledgeGraphView />;
}
