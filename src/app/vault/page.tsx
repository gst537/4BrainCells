'use client';

import React, { useState } from 'react';
import { EvidenceViewer } from '@/components/EvidenceViewer';

export default function VaultPage() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  return (
    <div className="flex-1 bg-[#0a0b10] p-6 min-h-0 overflow-y-auto">
      <div className="max-w-6xl mx-auto h-full pb-10">
        <EvidenceViewer 
          selectedEvidenceId={selectedEvidence || 'EVD-RFC-042'}
          onSelectEvidenceId={setSelectedEvidence}
          onSelectDecision={(id) => console.log('Decision', id)}
        />
      </div>
    </div>
  );
}
