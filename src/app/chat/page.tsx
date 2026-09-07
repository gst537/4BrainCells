'use client';

import React from 'react';
import { WhyChat } from '@/components/WhyChat';

export default function ChatPage() {
  return (
    <div className="flex-1 bg-[#0a0b10] p-6 min-h-0 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full">
        <WhyChat 
          onSelectEvidence={(id) => console.log('View evidence', id)} 
          onFocusGraphNodes={(ids) => console.log('Focus nodes', ids)} 
        />
      </div>
    </div>
  );
}
