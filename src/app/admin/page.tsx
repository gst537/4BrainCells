'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GraphNode, DecisionItem, EvidenceDocument, DecisionStatus } from '@/types';
import {
  Shield, Database, Users, FileText, Share2, TableProperties,
  Trash2, Save, RefreshCw, AlertTriangle, Loader2, Search,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

type AdminTab = 'nodes' | 'decisions' | 'people' | 'evidence' | 'users' | 'data';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'nodes', label: 'Nodes', icon: <Share2 className="w-3.5 h-3.5" /> },
  { id: 'decisions', label: 'Decisions', icon: <TableProperties className="w-3.5 h-3.5" /> },
  { id: 'people', label: 'People', icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'evidence', label: 'Evidence', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'users', label: 'Users & Roles', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'data', label: 'Seed / Reset', icon: <Database className="w-3.5 h-3.5" /> }
];

const STATUSES: DecisionStatus[] = ['Approved', 'Confirmed', 'Pending', 'Contested', 'Deprecated'];

interface Counts { nodes: number; edges: number; decisions: number; evidence: number; timeline: number }

const authHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export default function AdminPage() {
  const { role } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<AdminTab>('nodes');
  const [counts, setCounts] = useState<Counts | null>(null);
  const [storage, setStorage] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Listing state
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDocument[]>([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Inline decision editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState<DecisionStatus>('Approved');

  // Gate: admins only.
  useEffect(() => {
    if (role && role !== 'admin') router.replace('/');
  }, [role, router]);

  const flash = (kind: 'ok' | 'err', text: string) => {
    setNotice({ kind, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const load = useCallback(async () => {
    if (role !== 'admin') return;
    setLoading(true);
    try {
      if (tab === 'nodes' || tab === 'people') {
        const params = new URLSearchParams({ page: String(page), pageSize: '25' });
        if (q) params.set('q', q);
        if (tab === 'people') params.set('type', 'person');
        const res = await fetch(`/api/admin/nodes?${params}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load nodes');
        setNodes(data.nodes || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
        setCounts(data.counts || null);
        setStorage(data.storage || '');
      } else if (tab === 'decisions') {
        const params = new URLSearchParams({ page: String(page), pageSize: '25' });
        if (q) params.set('q', q);
        const res = await fetch(`/api/admin/decisions?${params}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load decisions');
        setDecisions(data.decisions || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } else if (tab === 'evidence') {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        const res = await fetch(`/api/admin/evidence?${params}`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load evidence');
        setEvidence(data.documents || []);
        setTotal(data.total || 0);
        setPages(1);
      } else if (tab === 'data') {
        const res = await fetch('/api/seed', { headers: authHeaders() });
        const data = await res.json();
        setCounts(data.counts || null);
        const health = await fetch('/api/health').then(r => r.json()).catch(() => null);
        if (health) setStorage(health.db);
      }
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [tab, page, q, role]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [tab, q]);

  const deleteNode = async (id: string) => {
    if (!confirm(`Delete node ${id} and all of its relationships? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/nodes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE', headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      flash('ok', `Deleted ${id}`);
      await load();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Delete failed');
    } finally { setBusy(false); }
  };

  const saveDecision = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/decisions?id=${encodeURIComponent(id)}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ title: editTitle, status: editStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      flash('ok', `Updated ${id}`);
      setEditingId(null);
      await load();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Update failed');
    } finally { setBusy(false); }
  };

  const deleteDecision = async (id: string) => {
    if (!confirm(`Delete decision ${id}? This also removes its graph node.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/decisions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE', headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      flash('ok', `Deleted ${id}`);
      await load();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Delete failed');
    } finally { setBusy(false); }
  };

  const toggleVerified = async (doc: EvidenceDocument) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/evidence?id=${encodeURIComponent(doc.id)}`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ verified: !doc.verified })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      await load();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Update failed');
    } finally { setBusy(false); }
  };

  const deleteEvidence = async (id: string) => {
    if (!confirm(`Permanently delete evidence document ${id}?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/evidence?id=${encodeURIComponent(id)}`, {
        method: 'DELETE', headers: authHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      flash('ok', `Deleted ${id}`);
      await load();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : 'Delete failed');
    } finally { setBusy(false); }
  };

  const runSeed = async (action: 'seed' | 'clear') => {
    const message = action === 'clear'
      ? 'Clear ALL institutional data? Every node, edge, decision, evidence document and timeline entry will be removed.'
      : 'Reload the Aletheia seed corpus? This replaces all existing institutional data.';
    if (!confirm(message)) return;

    setBusy(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${action} failed`);
      flash('ok',
        action === 'clear'
          ? 'All institutional data cleared.'
          : `Seeded ${data.nodes} nodes, ${data.edges} edges, ${data.decisions} decisions, ${data.evidence} documents, ${data.timeline} timeline entries (${data.mode}).`
      );
      await load();
    } catch (err) {
      flash('err', err instanceof Error ? err.message : `${action} failed`);
    } finally { setBusy(false); }
  };

  if (role !== 'admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#101010] text-center px-8">
        <div className="w-14 h-14 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-center justify-center">
          <Shield className="w-6 h-6 text-[#FF4D4D]" />
        </div>
        <h1 className="text-sm font-semibold text-[#F2F2F2]">Administrator access required</h1>
        <p className="text-xs text-[#7F8C99] max-w-sm">
          {role ? `You are signed in as ${role}. Redirecting…` : 'Sign in with an administrator account to manage institutional data.'}
        </p>
      </div>
    );
  }

  const showSearch = tab !== 'users' && tab !== 'data';

  return (
    <div className="flex-1 overflow-y-auto bg-[#101010] p-8 select-none">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[#00E5FF]" />
              Admin Dashboard
            </h1>
            <p className="text-xs text-[#7F8C99] mt-1">
              Manage the institutional corpus: nodes, decisions, people, evidence, and access.
            </p>
          </div>

          {counts && (
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono-tech">
              {([
                ['nodes', counts.nodes], ['edges', counts.edges], ['decisions', counts.decisions],
                ['evidence', counts.evidence], ['timeline', counts.timeline]
              ] as const).map(([label, value]) => (
                <div key={label} className="px-2.5 py-1.5 rounded-lg bg-[#181818] border border-[#262626] text-center">
                  <div className="text-[#F2F2F2] font-semibold text-xs">{value}</div>
                  <div className="text-[#7F8C99] uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notice && (
          <div className={`px-4 py-2.5 rounded-xl text-xs border ${
            notice.kind === 'ok'
              ? 'bg-[#00D95F]/10 border-[#00D95F]/30 text-[#00D95F]'
              : 'bg-[#FF4D4D]/10 border-[#FF4D4D]/30 text-[#FF4D4D]'
          }`}>
            {notice.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#242424] pb-2 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40'
                  : 'text-[#7F8C99] hover:text-white hover:bg-[#1c1c1c] border border-transparent'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="flex items-center gap-3">
            <div className="flex-1 max-w-sm flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181818] border border-[#262626]">
              <Search className="w-3.5 h-3.5 text-[#7F8C99]" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder={`Filter ${tab}…`}
                className="flex-1 bg-transparent text-xs text-white placeholder-[#7F8C99] outline-none"
              />
            </div>
            <button
              onClick={() => void load()}
              className="p-2 rounded-lg bg-[#181818] border border-[#262626] text-[#7F8C99] hover:text-white transition-colors"
              title="Reload"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-[11px] font-mono-tech text-[#7F8C99]">{total} records</span>
          </div>
        )}

        {/* ---------------- Nodes / People ---------------- */}
        {(tab === 'nodes' || tab === 'people') && (
          <div className="rounded-xl border border-[#242424] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#181818] text-[#7F8C99] uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">ID</th>
                  <th className="text-left px-4 py-2.5 font-medium">Label</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Category</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {nodes.map(n => (
                  <tr key={n.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-4 py-2.5 font-mono-tech text-[#7F8C99]">{n.id}</td>
                    <td className="px-4 py-2.5 text-[#F2F2F2] max-w-xs truncate">{n.label}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#00E5FF] font-mono-tech text-[10px]">
                        {n.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#7F8C99]">{n.category}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => void deleteNode(n.id)}
                        disabled={busy}
                        className="p-1.5 rounded text-[#7F8C99] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors disabled:opacity-40"
                        title="Delete node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {nodes.length === 0 && !loading && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#7F8C99]">No nodes found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Decisions ---------------- */}
        {tab === 'decisions' && (
          <div className="rounded-xl border border-[#242424] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#181818] text-[#7F8C99] uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">ID</th>
                  <th className="text-left px-4 py-2.5 font-medium">Title</th>
                  <th className="text-left px-4 py-2.5 font-medium">Owner</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium">Conf.</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {decisions.map(dec => {
                  const editing = editingId === dec.id;
                  return (
                    <tr key={dec.id} className="hover:bg-[#151515] transition-colors">
                      <td className="px-4 py-2.5 font-mono-tech text-[#7F8C99]">{dec.id}</td>
                      <td className="px-4 py-2.5 max-w-sm">
                        {editing ? (
                          <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#00E5FF]"
                          />
                        ) : (
                          <span className="text-[#F2F2F2] block truncate">{dec.title}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[#7F8C99]">{dec.owner}</td>
                      <td className="px-4 py-2.5">
                        {editing ? (
                          <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value as DecisionStatus)}
                            className="bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-xs text-white outline-none focus:border-[#00E5FF]"
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded font-mono-tech text-[10px] ${
                            dec.status === 'Contested' ? 'bg-[#FF4D4D]/15 text-[#FF4D4D]'
                              : dec.status === 'Pending' ? 'bg-[#FFB000]/15 text-[#FFB000]'
                                : 'bg-[#00D95F]/15 text-[#00D95F]'
                          }`}>
                            {dec.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono-tech text-[#7F8C99]">{dec.confidence}%</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        {editing ? (
                          <>
                            <button
                              onClick={() => void saveDecision(dec.id)}
                              disabled={busy}
                              className="p-1.5 rounded text-[#00D95F] hover:bg-[#00D95F]/10 transition-colors disabled:opacity-40"
                              title="Save"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded text-[#7F8C99] hover:text-white transition-colors"
                              title="Cancel"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(dec.id);
                                setEditTitle(dec.title);
                                setEditStatus(dec.status);
                              }}
                              className="px-2 py-1 rounded text-[10px] text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void deleteDecision(dec.id)}
                              disabled={busy}
                              className="p-1.5 rounded text-[#7F8C99] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors disabled:opacity-40"
                              title="Delete decision"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {decisions.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[#7F8C99]">No decisions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Evidence ---------------- */}
        {tab === 'evidence' && (
          <div className="rounded-xl border border-[#242424] overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#181818] text-[#7F8C99] uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">ID</th>
                  <th className="text-left px-4 py-2.5 font-medium">Title</th>
                  <th className="text-left px-4 py-2.5 font-medium">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium">Author</th>
                  <th className="text-left px-4 py-2.5 font-medium">Verified</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {evidence.map(docItem => (
                  <tr key={docItem.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-4 py-2.5 font-mono-tech text-[#7F8C99]">{docItem.id}</td>
                    <td className="px-4 py-2.5 text-[#F2F2F2] max-w-xs truncate">{docItem.title}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#00E5FF] font-mono-tech text-[10px]">
                        {docItem.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#7F8C99] max-w-[10rem] truncate">{docItem.author}</td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => void toggleVerified(docItem)}
                        disabled={busy}
                        className={`flex items-center gap-1 text-[10px] font-mono-tech transition-colors disabled:opacity-40 ${
                          docItem.verified ? 'text-[#00D95F]' : 'text-[#FFB000]'
                        }`}
                        title="Toggle verification"
                      >
                        {docItem.verified
                          ? <><CheckCircle2 className="w-3 h-3" />verified</>
                          : <><AlertTriangle className="w-3 h-3" />unverified</>}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => void deleteEvidence(docItem.id)}
                        disabled={busy}
                        className="p-1.5 rounded text-[#7F8C99] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors disabled:opacity-40"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {evidence.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[#7F8C99]">No evidence documents found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Users & Roles ---------------- */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#242424] bg-[#151515] p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[#F2F2F2]">Access model</h2>
              <p className="text-xs text-[#7F8C99] leading-relaxed">
                Roles are carried as a claim inside the signed JWT and enforced server-side on every
                mutating endpoint. The demo identity provider maps usernames to roles at sign-in.
              </p>
              <div className="rounded-lg border border-[#242424] overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#181818] text-[#7F8C99] uppercase text-[10px] tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium">Sign in as</th>
                      <th className="text-left px-4 py-2.5 font-medium">Role</th>
                      <th className="text-left px-4 py-2.5 font-medium">Can read</th>
                      <th className="text-left px-4 py-2.5 font-medium">Can edit graph</th>
                      <th className="text-left px-4 py-2.5 font-medium">Can administer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f1f1f]">
                    {[
                      { user: 'admin', role: 'admin', read: true, edit: true, admin: true },
                      { user: 'contributor', role: 'contributor', read: true, edit: true, admin: false },
                      { user: 'viewer', role: 'viewer', read: true, edit: false, admin: false },
                      { user: 'any other name', role: 'contributor', read: true, edit: true, admin: false }
                    ].map(r => (
                      <tr key={r.user}>
                        <td className="px-4 py-2.5 font-mono-tech text-[#F2F2F2]">{r.user}</td>
                        <td className="px-4 py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#00E5FF] font-mono-tech text-[10px]">
                            {r.role}
                          </span>
                        </td>
                        {[r.read, r.edit, r.admin].map((allowed, i) => (
                          <td key={i} className="px-4 py-2.5">
                            {allowed
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00D95F]" />
                              : <XCircle className="w-3.5 h-3.5 text-[#3a3a3a]" />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-[#7F8C99]">
                All accounts use the demo password <span className="font-mono-tech text-[#00E5FF]">admin</span>.
                Replace this mapping with your identity provider before any real deployment.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- Seed / Reset ---------------- */}
        {tab === 'data' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#242424] bg-[#151515] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#F2F2F2]">Storage backend</h2>
                  <p className="text-xs text-[#7F8C99] mt-0.5">
                    {storage === 'connected'
                      ? 'PostgreSQL is connected. Writes are durable.'
                      : 'PostgreSQL is unreachable — running on in-memory storage. Writes are lost on restart.'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-tech border ${
                  storage === 'connected'
                    ? 'text-[#00D95F] border-[#00D95F]/30 bg-[#00D95F]/10'
                    : 'text-[#FFB000] border-[#FFB000]/30 bg-[#FFB000]/10'
                }`}>
                  {storage === 'connected' ? 'postgres' : 'in-memory'}
                </span>
              </div>

              {counts && (
                <div className="grid grid-cols-5 gap-2">
                  {([
                    ['Nodes', counts.nodes], ['Edges', counts.edges], ['Decisions', counts.decisions],
                    ['Evidence', counts.evidence], ['Timeline', counts.timeline]
                  ] as const).map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-[#181818] border border-[#262626] p-3 text-center">
                      <div className="text-lg font-bold text-[#F2F2F2]">{value}</div>
                      <div className="text-[10px] uppercase tracking-wide text-[#7F8C99] font-mono-tech">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[#242424] bg-[#151515] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#F2F2F2]">Corpus management</h2>
              <p className="text-xs text-[#7F8C99] leading-relaxed">
                Reseeding replaces every institutional record with the bundled Aletheia corpus.
                Clearing removes everything and leaves the workspace empty. Both are destructive and
                take effect immediately.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void runSeed('seed')}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5FF] text-black text-xs font-bold hover:bg-[#00c8d7] disabled:opacity-50 transition-colors"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                  Reload seed corpus
                </button>
                <button
                  onClick={() => void runSeed('clear')}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/40 text-[#FF4D4D] text-xs font-semibold hover:bg-[#FF4D4D]/20 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between text-xs text-[#7F8C99]">
            <span className="font-mono-tech">Page {page} of {pages} — {total} records</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-[#181818] border border-[#262626] disabled:opacity-30 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-1.5 rounded-lg bg-[#181818] border border-[#262626] disabled:opacity-30 hover:text-white transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
