'use client';

import React, { useEffect } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { KnowledgeGraphView } from '@/components/graph/KnowledgeGraphView';

export default function KnowledgeGraphPage() {
  const { setActiveTab } = useMemory();

  useEffect(() => {
    setActiveTab('knowledge-graph');
  }, [setActiveTab]);

  return <KnowledgeGraphView />;
}
