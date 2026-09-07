'use client';

import React, { useEffect } from 'react';
import { useMemory } from '@/context/MemoryContext';
import { InquiryChatView } from '@/components/chat/InquiryChatView';

export default function ChatPage() {
  const { setActiveTab } = useMemory();

  useEffect(() => {
    setActiveTab('why-chat');
  }, [setActiveTab]);

  return <InquiryChatView />;
}
