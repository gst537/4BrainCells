'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, User, GitBranch, Check, Loader2, AlertTriangle } from 'lucide-react';

interface Suggestion {
  id: string;
  kind: 'person' | 'document' | 'decision';
  label: string;
  snippet: string;
  confidence: number;
}

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

const authedFetch = (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
};

const sha256Hex = async (buffer: ArrayBuffer) => {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return `sha256:${Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')}`;
};

const kindIcon = (kind: Suggestion['kind']) => {
  if (kind === 'person') return <User className="h-3.5 w-3.5 text-emerald-400" />;
  if (kind === 'decision') return <GitBranch className="h-3.5 w-3.5 text-cyan-400" />;
  return <FileText className="h-3.5 w-3.5 text-indigo-400" />;
};

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({ isOpen, onClose, onConfirmed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<'select' | 'analyzing' | 'review' | 'saving'>('select');
  const [content, setContent] = useState('');
  const [hash, setHash] = useState('');
  const [summary, setSummary] = useState('');
  const [degraded, setDegraded] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setFile(null);
    setStage('select');
    setContent('');
    setHash('');
    setSummary('');
    setDegraded(false);
    setSuggestions([]);
    setSelected(new Set());
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    setStage('analyzing');

    try {
      const buffer = await f.arrayBuffer();
      const fileHash = await sha256Hex(buffer);
      setHash(fileHash);

      const isTextLike = /\.(txt|md|markdown)$/i.test(f.name) || f.type.startsWith('text/');
      const text = isTextLike ? new TextDecoder().decode(buffer) : '';
      setContent(text);

      const res = await authedFetch('/api/evidence/suggest', {
        method: 'POST',
        body: JSON.stringify({
          title: f.name,
          docType: isTextLike ? 'text' : f.type || 'binary',
          content: text
        })
      });
      const data = await res.json();
      setSummary(data.summary || '');
      setDegraded(Boolean(data.degraded));
      const suggs: Suggestion[] = data.suggestions || [];
      setSuggestions(suggs);
      setSelected(new Set(suggs.filter(s => s.confidence >= 50).map(s => s.id)));
      setStage('review');
    } catch (err: any) {
      console.error('Evidence analysis failed:', err);
      setError('Could not analyze the document, but you can still add it to the vault as-is below.');
      setSuggestions([]);
      setDegraded(true);
      setStage('review');
    }
  };

  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!file) return;
    setStage('saving');
    setError('');

    try {
      const docId = `EVD-UP-${Date.now()}`;
      const docSuggestion = suggestions.find(s => selected.has(s.id) && s.kind === 'document');
      const highlightSnippet = docSuggestion?.snippet || content.slice(0, 240) || 'No text preview available for this file type.';

      const evidenceDoc = {
        id: docId,
        title: file.name,
        type: 'Slack' as const, // generic "uploaded" bucket; closest existing enum value
        author: 'Vault Upload',
        date: new Date().toISOString().split('T')[0],
        hash,
        verified: false,
        department: 'Pending Review',
        highlightSnippet,
        content: content || '(Binary file — no extracted text preview.)',
        relatedDecisionId: ''
      };

      const evidenceRes = await authedFetch('/api/evidence', {
        method: 'POST',
        body: JSON.stringify(evidenceDoc)
      });
      if (!evidenceRes.ok) {
        const d = await evidenceRes.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to save evidence document');
      }

      // Only explicitly confirmed person/decision suggestions become graph
      // nodes — nothing is written automatically from extraction alone.
      const acceptedEntities = suggestions.filter(s => selected.has(s.id) && s.kind !== 'document');
      for (const s of acceptedEntities) {
        const node = {
          id: `NODE-${Date.now()}-${s.id}`,
          type: s.kind,
          label: s.label,
          date: new Date().toISOString().split('T')[0],
          status: s.kind === 'decision' ? 'Pending' : undefined,
          owner: s.kind === 'person' ? s.label : undefined,
          confidenceScore: s.confidence,
          subtitle: 'Suggested from Evidence Upload (human-reviewed)',
          category: 'Vault Extraction',
          x: Math.random() * 800,
          y: Math.random() * 600,
          description: s.snippet,
          tags: ['vault-upload'],
          evidenceCount: 1,
          evidenceId: docId
        };
        await authedFetch('/api/graph/nodes', { method: 'POST', body: JSON.stringify(node) });
      }

      onConfirmed();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save.');
      setStage('review');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#151722] shrink-0">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Upload className="h-4 w-4 text-emerald-400" />
            <span>Upload Evidence Document</span>
          </h2>
          <button onClick={handleClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {stage === 'select' && (
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                Select PDF / Markdown / Text File
              </label>
              <input
                type="file"
                accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf"
                onChange={handleFileChange}
                className="w-full text-xs text-zinc-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-black file:text-xs file:font-semibold hover:file:bg-emerald-400 file:cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                A SHA-256 hash is computed for provenance. Text and Markdown files are analyzed for candidate entities; PDFs are hashed and stored with manual review.
              </p>
            </div>
          )}

          {stage === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 text-xs gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              <span>Hashing file & analyzing for candidate entities...</span>
            </div>
          )}

          {(stage === 'review' || stage === 'saving') && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[#12141f] border border-white/10 p-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                  <span>{file?.name}</span>
                  {degraded && (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> AI extraction unavailable
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-300 truncate">{hash}</p>
              </div>

              {summary && (
                <p className="text-xs text-zinc-400 leading-relaxed">{summary}</p>
              )}

              <div>
                <h4 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Candidate Entities — review before adding to graph
                </h4>
                {suggestions.length === 0 && (
                  <p className="text-xs text-zinc-500 italic">No candidate entities suggested. You can still add the raw document below.</p>
                )}
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {suggestions.map(s => (
                    <label
                      key={s.id}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer transition-all ${
                        selected.has(s.id) ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/5 bg-[#12141f] hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggleSelected(s.id)}
                        className="mt-0.5 accent-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                          {kindIcon(s.kind)}
                          <span className="truncate">{s.label}</span>
                          <span className="text-[9px] font-mono uppercase text-zinc-500 shrink-0">{s.kind}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 italic line-clamp-2 mt-0.5">&quot;{s.snippet}&quot;</p>
                      </div>
                      {selected.has(s.id) && <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {(stage === 'review' || stage === 'saving') && (
          <div className="p-4 border-t border-white/10 flex justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={stage === 'saving'}
              onClick={handleConfirm}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.2)] disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {stage === 'saving' ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirm & Add {selected.size > 0 ? `(${selected.size} selected)` : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
