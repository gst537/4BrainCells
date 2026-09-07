'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { EvidenceViewer } from '@/components/EvidenceViewer';
import { EvidenceUploadModal } from '@/components/EvidenceUploadModal';
import { useMemory } from '@/context/MemoryContext';
import { Upload } from 'lucide-react';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(res => res.json());
};

export default function VaultPage() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data, mutate } = useSWR('/api/evidence', fetcher);
  const { refreshSearch } = useMemory();
  const extraDocuments = data?.documents || [];

  return (
    <div className="flex-1 bg-[#0a0b10] p-6 min-h-0 overflow-y-auto">
      <div className="max-w-6xl mx-auto h-full pb-10">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Evidence</span>
          </button>
        </div>

        <EvidenceViewer
          selectedEvidenceId={selectedEvidence || 'EVD-RFC-042'}
          onSelectEvidenceId={setSelectedEvidence}
          onSelectDecision={(id) => console.log('Decision', id)}
          extraDocuments={extraDocuments}
        />
      </div>

      <EvidenceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onConfirmed={() => { void mutate(); void refreshSearch(); }}
      />
    </div>
  );
}
