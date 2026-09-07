'use client';

import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import { X, Plus, GitBranch, FileText, User } from 'lucide-react';
import { GraphNode } from '@/types';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNodeAdded?: (node: GraphNode) => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ isOpen, onClose, onNodeAdded }) => {
  const { mutate } = useSWRConfig();
  const [formData, setFormData] = useState({
    label: '',
    type: 'decision' as 'decision' | 'document' | 'person',
    status: 'draft' as 'draft' | 'approved' | 'deprecated',
    confidence: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('jwt');
    const newNode: GraphNode = {
      id: `NODE-${Date.now()}`,
      type: formData.type,
      label: formData.label,
      date: new Date().toISOString().split('T')[0],
      status: formData.status as any,
      owner: 'Current User',
      confidenceScore: formData.confidence,
      subtitle: 'Newly Added',
      category: 'Manual Entry',
      x: Math.random() * 800,
      y: Math.random() * 600,
      description: 'Manually added node.',
      tags: [],
      evidenceCount: 0
    };

    try {
      const res = await fetch('/api/graph/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newNode),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add node');
      }

      // Revalidate graph data globally
      await mutate('/api/graph');

      if (onNodeAdded) {
        onNodeAdded(newNode);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#151722]">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>Add Graph Node</span>
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Node Label (Title)
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={e => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g. Migration to Qdrant"
              className="w-full h-10 bg-[#1a1c29] border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
              Node Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'decision' })}
                className={`flex items-center justify-center space-x-1.5 h-9 rounded-lg text-xs font-medium border transition-colors ${
                  formData.type === 'decision' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-[#1a1c29] border-white/5 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Decision</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'document' })}
                className={`flex items-center justify-center space-x-1.5 h-9 rounded-lg text-xs font-medium border transition-colors ${
                  formData.type === 'document' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-[#1a1c29] border-white/5 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Document</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'person' })}
                className={`flex items-center justify-center space-x-1.5 h-9 rounded-lg text-xs font-medium border transition-colors ${
                  formData.type === 'person' ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-[#1a1c29] border-white/5 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Person</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-10 bg-[#1a1c29] border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 appearance-none"
              >
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                Confidence Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.confidence}
                onChange={e => setFormData({ ...formData, confidence: parseInt(e.target.value) || 0 })}
                className="w-full h-10 bg-[#1a1c29] border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-white/10 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,245,255,0.2)] disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Node</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
