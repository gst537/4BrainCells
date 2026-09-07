'use client';

import React, { useEffect } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { DecisionLedgerView } from '@/components/ledger/DecisionLedgerView';

export default function LedgerPage() {
  const { setActiveTab } = useMemory();

  useEffect(() => {
    setActiveTab('decision-ledger');
  }, [setActiveTab]);

  return <DecisionLedgerView />;
}
