// src/lib/db.ts
//
// Dual-mode data access layer.
//   • DATABASE_URL set and reachable → PostgreSQL is the system of record.
//   • Otherwise                      → an in-process store seeded from seedData.ts.
//
// Both modes expose identical semantics so the application never branches on
// storage backend, and the health endpoint reports which mode is live so the
// degradation is visible rather than silent.

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { buildSeed } from '../data/seedData';

let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
}

// ------------------------------------------------------------
// In-memory store (seeded from the same dataset as Postgres)
// ------------------------------------------------------------

interface MemStore {
  nodes: any[];
  edges: any[];
  decisions: any[];
  evidence: any[];
  timeline: any[];
  chatSessions: { id: string; createdAt: string; title: string }[];
  chatMessages: Record<string, any[]>;
}

const freshStore = (): MemStore => {
  const seed = buildSeed();
  return {
    nodes: seed.nodes.map(n => ({ ...n })),
    edges: seed.edges.map(e => ({ ...e })),
    decisions: seed.decisions.map(d => ({ ...d })),
    evidence: seed.evidence.map(e => ({ ...e })),
    timeline: seed.timeline.map(t => ({ ...t })),
    chatSessions: [],
    chatMessages: {}
  };
};

let mem: MemStore = freshStore();

// ------------------------------------------------------------
// Schema bootstrap
// ------------------------------------------------------------

let schemaReady: Promise<void> | null = null;
const ensureSchema = async () => {
  if (!pool) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const sqlPath = path.join(process.cwd(), 'setup.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      const client = await pool!.connect();
      try {
        await client.query(sql);
      } finally {
        client.release();
      }
    })();
  }
  return schemaReady;
};

export const query = async (text: string, params?: any[]) => {
  if (!pool) throw new Error('No database connection configured');
  await ensureSchema();
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

/** True when Postgres is configured AND reachable. */
const pgLive = async (): Promise<boolean> => {
  if (!pool) return false;
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

export const getDbStatus = async (): Promise<'connected' | 'in-memory'> =>
  (await pgLive()) ? 'connected' : 'in-memory';

// ------------------------------------------------------------
// Row mappers
// ------------------------------------------------------------

const rowToNode = (row: any) => ({ id: row.id, type: row.type, ...row.data });

const rowToEdge = (row: any) => ({
  id: String(row.id),
  source: row.source,
  target: row.target,
  label: row.label,
  confidence: row.confidence !== null && row.confidence !== undefined ? Number(row.confidence) : 1,
  description: row.description || undefined
});

const rowToDecision = (row: any) => ({
  id: row.id,
  title: row.title,
  owner: row.owner,
  ownerRole: row.owner_role,
  ownerAvatar: row.owner_avatar,
  department: row.department,
  date: row.date,
  status: row.status,
  confidence: row.confidence,
  confidenceBreakdown: row.confidence_breakdown || undefined,
  impact: row.impact,
  summary: row.summary,
  rationale: row.rationale,
  alternativesConsidered: row.alternatives_considered || [],
  linkedNodeIds: row.linked_node_ids || [],
  primaryEvidenceId: row.primary_evidence_id || '',
  tags: row.tags || [],
  warnings: row.warnings || []
});

const rowToEvidence = (row: any) => ({
  id: row.id,
  title: row.title,
  type: row.type,
  author: row.author,
  date: row.date,
  hash: row.hash,
  verified: row.verified,
  department: row.department,
  highlightSnippet: row.highlight_snippet,
  content: row.content,
  relatedDecisionId: row.related_decision_id || ''
});

const rowToTimeline = (row: any) => ({
  id: row.id,
  date: row.date,
  time: row.time || undefined,
  title: row.title,
  actor: row.actor,
  actorRole: row.actor_role || undefined,
  type: row.type,
  description: row.description,
  relatedNodeId: row.related_node_id || undefined,
  relatedDecisionId: row.related_decision_id || undefined,
  relatedEvidenceId: row.related_evidence_id || undefined,
  branch: row.branch || undefined,
  status: row.status || undefined
});

// ------------------------------------------------------------
// Graph reads
// ------------------------------------------------------------

export const getGraph = async () => {
  try {
    if (pool) {
      const nodesRes = await query('SELECT id, type, data FROM nodes');
      const edgesRes = await query('SELECT id, source, target, label, confidence, description FROM edges');
      return { nodes: nodesRes.rows.map(rowToNode), edges: edgesRes.rows.map(rowToEdge) };
    }
  } catch {
    console.warn('[db] Postgres unavailable — serving graph from in-memory store');
  }
  return { nodes: mem.nodes, edges: mem.edges };
};

// ------------------------------------------------------------
// Search
// ------------------------------------------------------------

const STOPWORDS = new Set([
  'the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'and', 'or', 'was', 'were',
  'is', 'are', 'did', 'do', 'we', 'our', 'that', 'this', 'why', 'who', 'what',
  'when', 'how', 'with', 'from', 'about', 'it', 'by', 'at', 'as', 'be'
]);

const tokenize = (text: string): string[] =>
  text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t));

const nodeHaystack = (n: any): string =>
  [n.label, n.subtitle, n.description, n.rationale, n.category, n.owner, n.status, (n.tags || []).join(' ')]
    .filter(Boolean).join(' ').toLowerCase();

/**
 * Full-text node search. Returns the matched nodes ordered by relevance.
 * Postgres uses the GIN tsvector index; the in-memory path scores token overlap.
 */
export const searchNodes = async (rawQuery: string, limit = 60): Promise<any[]> => {
  const q = rawQuery.trim();
  if (!q) return [];

  try {
    if (pool) {
      const res = await query(
        `SELECT id, type, data,
                ts_rank(to_tsvector('english',
                  coalesce(data->>'label','') || ' ' ||
                  coalesce(data->>'subtitle','') || ' ' ||
                  coalesce(data->>'description','') || ' ' ||
                  coalesce(data->>'rationale','') || ' ' ||
                  coalesce(data->>'category','') || ' ' ||
                  coalesce(data->>'owner','')
                ), websearch_to_tsquery('english', $1)) AS rank
         FROM nodes
         WHERE to_tsvector('english',
                  coalesce(data->>'label','') || ' ' ||
                  coalesce(data->>'subtitle','') || ' ' ||
                  coalesce(data->>'description','') || ' ' ||
                  coalesce(data->>'rationale','') || ' ' ||
                  coalesce(data->>'category','') || ' ' ||
                  coalesce(data->>'owner','')
               ) @@ websearch_to_tsquery('english', $1)
            OR data->>'label' ILIKE '%' || $1 || '%'
            OR data->>'description' ILIKE '%' || $1 || '%'
            OR id ILIKE '%' || $1 || '%'
         ORDER BY rank DESC
         LIMIT $2`,
        [q, limit]
      );
      return res.rows.map(rowToNode);
    }
  } catch {
    console.warn('[db] Postgres search unavailable — using in-memory search');
  }

  const tokens = tokenize(q);
  if (tokens.length === 0) return [];
  const phrase = q.toLowerCase();

  // A node qualifies only if it covers a meaningful share of the query's
  // significant terms. Without this floor a single incidental word match
  // ("analytics", "2020") would return confident-looking but unrelated
  // records — the exact failure the confidence gate exists to prevent.
  const COVERAGE_FLOOR = 0.34;

  const scored = mem.nodes
    .map(n => {
      const hay = nodeHaystack(n);
      const label = String(n.label || '').toLowerCase();
      const exactPhrase = hay.includes(phrase) || String(n.id).toLowerCase().includes(phrase);

      let score = 0;
      let matchedTokens = 0;

      if (exactPhrase) score += 14;

      tokens.forEach(t => {
        let hit = false;
        if (label.includes(t)) { score += 5; hit = true; }
        else if (hay.includes(t)) { score += 2; hit = true; }
        if ((n.tags || []).some((tag: string) => tag.toLowerCase() === t)) { score += 3; hit = true; }
        if (hit) matchedTokens += 1;
      });

      const coverage = matchedTokens / tokens.length;
      return { node: n, score, coverage, exactPhrase };
    })
    .filter(x => x.score > 0 && (x.exactPhrase || x.coverage >= COVERAGE_FLOOR))
    .sort((a, b) => (b.coverage - a.coverage) || (b.score - a.score))
    .slice(0, limit);

  return scored.map(x => x.node);
};

/**
 * Expands a matched node set into a connected subgraph: the matched nodes plus
 * their immediate neighbours, and every edge among that combined set.
 */
export const getRelatedSubgraph = async (
  nodeIds: string[]
): Promise<{ nodes: any[]; edges: any[] }> => {
  if (nodeIds.length === 0) return { nodes: [], edges: [] };

  try {
    if (pool) {
      const neighbourRes = await query(
        `SELECT DISTINCT n.id, n.type, n.data
           FROM nodes n
          WHERE n.id = ANY($1)
             OR n.id IN (SELECT target FROM edges WHERE source = ANY($1))
             OR n.id IN (SELECT source FROM edges WHERE target = ANY($1))`,
        [nodeIds]
      );
      const allIds = neighbourRes.rows.map(r => r.id);
      const edgeRes = await query(
        `SELECT id, source, target, label, confidence, description
           FROM edges
          WHERE source = ANY($1) AND target = ANY($1)`,
        [allIds]
      );
      return { nodes: neighbourRes.rows.map(rowToNode), edges: edgeRes.rows.map(rowToEdge) };
    }
  } catch {
    console.warn('[db] Postgres subgraph unavailable — using in-memory traversal');
  }

  const seedIds = new Set(nodeIds);
  const expanded = new Set(nodeIds);
  mem.edges.forEach(e => {
    if (seedIds.has(e.source)) expanded.add(e.target);
    if (seedIds.has(e.target)) expanded.add(e.source);
  });
  const nodes = mem.nodes.filter(n => expanded.has(n.id));
  const edges = mem.edges.filter(e => expanded.has(e.source) && expanded.has(e.target));
  return { nodes, edges };
};

// ------------------------------------------------------------
// Decisions
// ------------------------------------------------------------

export const getAllDecisions = async (): Promise<any[]> => {
  try {
    if (pool) {
      const res = await query('SELECT * FROM decisions ORDER BY date DESC');
      return res.rows.map(rowToDecision);
    }
  } catch {
    console.warn('[db] Postgres unavailable — serving decisions from in-memory store');
  }
  return mem.decisions;
};

export const getDecisionsByIds = async (ids: string[]): Promise<any[]> => {
  if (ids.length === 0) return [];
  try {
    if (pool) {
      const res = await query('SELECT * FROM decisions WHERE id = ANY($1) ORDER BY date DESC', [ids]);
      return res.rows.map(rowToDecision);
    }
  } catch {
    console.warn('[db] Postgres unavailable — filtering decisions in memory');
  }
  const wanted = new Set(ids);
  return mem.decisions.filter(d => wanted.has(d.id));
};

export const updateDecision = async (id: string, patch: Record<string, any>) => {
  const columnMap: Record<string, string> = {
    title: 'title', owner: 'owner', ownerRole: 'owner_role', department: 'department',
    date: 'date', status: 'status', confidence: 'confidence', impact: 'impact',
    summary: 'summary', rationale: 'rationale', tags: 'tags'
  };
  try {
    if (pool) {
      const sets: string[] = [];
      const values: any[] = [id];
      Object.entries(patch).forEach(([key, value]) => {
        const col = columnMap[key];
        if (!col) return;
        values.push(value);
        sets.push(`${col} = $${values.length}`);
      });
      if (sets.length === 0) return null;
      const res = await query(`UPDATE decisions SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, values);
      return res.rows[0] ? rowToDecision(res.rows[0]) : null;
    }
  } catch {
    console.warn('[db] Postgres updateDecision failed — updating in-memory store');
  }
  let updated: any = null;
  mem.decisions = mem.decisions.map(d => (d.id === id ? (updated = { ...d, ...patch }) : d));
  return updated;
};

export const deleteDecision = async (id: string) => {
  try {
    if (pool) {
      await query('DELETE FROM decisions WHERE id = $1', [id]);
      await query('DELETE FROM nodes WHERE id = $1', [id]);
      return true;
    }
  } catch {
    console.warn('[db] Postgres deleteDecision failed — deleting from in-memory store');
  }
  mem.decisions = mem.decisions.filter(d => d.id !== id);
  mem.nodes = mem.nodes.filter(n => n.id !== id);
  mem.edges = mem.edges.filter(e => e.source !== id && e.target !== id);
  return true;
};

// ------------------------------------------------------------
// Timeline
// ------------------------------------------------------------

export const getTimelineEvents = async (relatedIds?: string[]): Promise<any[]> => {
  try {
    if (pool) {
      if (relatedIds && relatedIds.length) {
        const res = await query(
          `SELECT * FROM timeline_events
            WHERE related_node_id = ANY($1) OR related_decision_id = ANY($1)
            ORDER BY date ASC`,
          [relatedIds]
        );
        return res.rows.map(rowToTimeline);
      }
      const res = await query('SELECT * FROM timeline_events ORDER BY date ASC');
      return res.rows.map(rowToTimeline);
    }
  } catch {
    console.warn('[db] Postgres unavailable — serving timeline from in-memory store');
  }
  if (relatedIds && relatedIds.length) {
    const wanted = new Set(relatedIds);
    return mem.timeline.filter(t => wanted.has(t.relatedNodeId) || wanted.has(t.relatedDecisionId));
  }
  return mem.timeline;
};

// ------------------------------------------------------------
// Graph writes
// ------------------------------------------------------------

export const saveGraph = async (nodes: any[], edges: any[]) => {
  try {
    if (pool) {
      await query('BEGIN');
      await query('DELETE FROM edges');
      await query('DELETE FROM nodes');
      for (const node of nodes) {
        const { id, type, ...data } = node;
        await query('INSERT INTO nodes (id, type, data) VALUES ($1, $2, $3)', [id, type, data]);
      }
      for (const edge of edges) {
        await query(
          'INSERT INTO edges (id, source, target, label, confidence, description) VALUES ($1,$2,$3,$4,$5,$6)',
          [edge.id, edge.source, edge.target, edge.label, edge.confidence ?? 1, edge.description ?? null]
        );
      }
      await query('COMMIT');
      return;
    }
  } catch {
    console.warn('[db] Postgres saveGraph failed — writing to in-memory store');
  }
  mem.nodes = [...nodes];
  mem.edges = [...edges];
};

export const addNode = async (node: any) => {
  try {
    if (pool) {
      const { id, type, ...data } = node;
      await query(
        'INSERT INTO nodes (id, type, data) VALUES ($1,$2,$3) ON CONFLICT (id) DO UPDATE SET type = $2, data = $3',
        [id, type, data]
      );
      return node;
    }
  } catch {
    console.warn('[db] Postgres addNode failed — writing to in-memory store');
  }
  mem.nodes = [...mem.nodes.filter(n => n.id !== node.id), node];
  return node;
};

export const updateNode = async (id: string, patch: Record<string, any>) => {
  try {
    if (pool) {
      const res = await query('SELECT type, data FROM nodes WHERE id = $1', [id]);
      if (res.rows.length === 0) throw new Error(`Node ${id} not found`);
      const merged = { ...res.rows[0].data, ...patch };
      await query('UPDATE nodes SET data = $2 WHERE id = $1', [id, merged]);
      return { id, type: res.rows[0].type, ...merged };
    }
  } catch {
    console.warn('[db] Postgres updateNode failed — updating in-memory store');
  }
  let updated: any = null;
  mem.nodes = mem.nodes.map(n => (n.id === id ? (updated = { ...n, ...patch }) : n));
  return updated;
};

export const deleteNode = async (id: string) => {
  try {
    if (pool) {
      await query('DELETE FROM nodes WHERE id = $1', [id]); // edges cascade
      await query('DELETE FROM decisions WHERE id = $1', [id]);
      return true;
    }
  } catch {
    console.warn('[db] Postgres deleteNode failed — deleting from in-memory store');
  }
  mem.nodes = mem.nodes.filter(n => n.id !== id);
  mem.edges = mem.edges.filter(e => e.source !== id && e.target !== id);
  mem.decisions = mem.decisions.filter(d => d.id !== id);
  return true;
};

export const addEdge = async (edge: any) => {
  try {
    if (pool) {
      await query(
        'INSERT INTO edges (id, source, target, label, confidence, description) VALUES ($1,$2,$3,$4,$5,$6)',
        [edge.id, edge.source, edge.target, edge.label, edge.confidence ?? 1, edge.description ?? null]
      );
      return edge;
    }
  } catch {
    console.warn('[db] Postgres addEdge failed — writing to in-memory store');
  }
  mem.edges = [...mem.edges, edge];
  return edge;
};

export const deleteEdge = async (id: string) => {
  try {
    if (pool) {
      await query('DELETE FROM edges WHERE id = $1', [id]);
      return true;
    }
  } catch {
    console.warn('[db] Postgres deleteEdge failed — deleting from in-memory store');
  }
  mem.edges = mem.edges.filter(e => e.id !== id);
  return true;
};

// ------------------------------------------------------------
// Evidence Vault
// ------------------------------------------------------------

export const getEvidence = async () => {
  try {
    if (pool) {
      const res = await query('SELECT * FROM evidence_documents ORDER BY date DESC');
      return res.rows.map(rowToEvidence);
    }
  } catch {
    console.warn('[db] Postgres unavailable — serving evidence from in-memory store');
  }
  return mem.evidence;
};

export const addEvidence = async (doc: any) => {
  try {
    if (pool) {
      await query(
        `INSERT INTO evidence_documents
           (id, title, type, author, date, hash, verified, department, highlight_snippet, content, related_decision_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (id) DO NOTHING`,
        [doc.id, doc.title, doc.type, doc.author, doc.date, doc.hash, doc.verified ?? true,
         doc.department, doc.highlightSnippet, doc.content, doc.relatedDecisionId ?? null]
      );
      return doc;
    }
  } catch {
    console.warn('[db] Postgres addEvidence failed — writing to in-memory store');
  }
  mem.evidence = [...mem.evidence, doc];
  return doc;
};

export const setEvidenceVerified = async (id: string, verified: boolean) => {
  try {
    if (pool) {
      const res = await query(
        'UPDATE evidence_documents SET verified = $2 WHERE id = $1 RETURNING *', [id, verified]
      );
      return res.rows[0] ? rowToEvidence(res.rows[0]) : null;
    }
  } catch {
    console.warn('[db] Postgres setEvidenceVerified failed — updating in-memory store');
  }
  let updated: any = null;
  mem.evidence = mem.evidence.map(e => (e.id === id ? (updated = { ...e, verified }) : e));
  return updated;
};

export const deleteEvidence = async (id: string) => {
  try {
    if (pool) {
      await query('DELETE FROM evidence_documents WHERE id = $1', [id]);
      return true;
    }
  } catch {
    console.warn('[db] Postgres deleteEvidence failed — deleting from in-memory store');
  }
  mem.evidence = mem.evidence.filter(e => e.id !== id);
  return true;
};

// ------------------------------------------------------------
// Chat history
// ------------------------------------------------------------

export const createChatSession = async (id: string, title: string) => {
  try {
    if (pool) {
      await query('INSERT INTO chat_sessions (id, title) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING', [id, title]);
      return { id, title };
    }
  } catch {
    console.warn('[db] Postgres createChatSession failed — using in-memory store');
  }
  if (!mem.chatSessions.find(s => s.id === id)) {
    mem.chatSessions.push({ id, createdAt: new Date().toISOString(), title });
    mem.chatMessages[id] = [];
  }
  return { id, title };
};

export const getChatMessages = async (sessionId: string) => {
  try {
    if (pool) {
      const res = await query(
        'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC', [sessionId]
      );
      return res.rows.map(row => ({
        id: row.id,
        sender: row.sender,
        text: row.text,
        confidenceScore: row.confidence_score,
        confidenceLevel: row.confidence_level,
        citations: row.citations || [],
        graphFocusNodes: row.graph_focus_nodes || [],
        timestamp: new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
  } catch {
    console.warn('[db] Postgres getChatMessages failed — using in-memory store');
  }
  return mem.chatMessages[sessionId] || [];
};

export const addChatMessage = async (sessionId: string, message: any) => {
  try {
    if (pool) {
      await createChatSession(sessionId, 'Why Chat Session');
      await query(
        `INSERT INTO chat_messages
           (id, session_id, sender, text, confidence_score, confidence_level, citations, graph_focus_nodes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [message.id, sessionId, message.sender, message.text,
         message.confidenceScore ?? null, message.confidenceLevel ?? null,
         JSON.stringify(message.citations || []), message.graphFocusNodes || []]
      );
      return message;
    }
  } catch {
    console.warn('[db] Postgres addChatMessage failed — using in-memory store');
  }
  if (!mem.chatMessages[sessionId]) mem.chatMessages[sessionId] = [];
  mem.chatMessages[sessionId].push(message);
  return message;
};

// ------------------------------------------------------------
// Seed / reset
// ------------------------------------------------------------

export const clearDatabase = async () => {
  try {
    if (pool) {
      await query('DELETE FROM edges');
      await query('DELETE FROM timeline_events');
      await query('DELETE FROM decisions');
      await query('DELETE FROM evidence_documents');
      await query('DELETE FROM nodes');
      return { mode: 'postgres' as const };
    }
  } catch {
    console.warn('[db] Postgres clear failed — clearing in-memory store');
  }
  mem = { ...freshStore(), nodes: [], edges: [], decisions: [], evidence: [], timeline: [] };
  return { mode: 'in-memory' as const };
};

/** Wipes and reloads the institutional corpus from seedData.ts. */
export const seedDatabase = async () => {
  const seed = buildSeed();

  try {
    if (pool && (await pgLive())) {
      await query('DELETE FROM edges');
      await query('DELETE FROM timeline_events');
      await query('DELETE FROM decisions');
      await query('DELETE FROM evidence_documents');
      await query('DELETE FROM nodes');

      for (const node of seed.nodes) {
        const { id, type, ...data } = node as any;
        await query('INSERT INTO nodes (id, type, data) VALUES ($1,$2,$3)', [id, type, data]);
      }
      for (const edge of seed.edges) {
        await query(
          'INSERT INTO edges (id, source, target, label, confidence, description) VALUES ($1,$2,$3,$4,$5,$6)',
          [edge.id, edge.source, edge.target, edge.label, edge.confidence, edge.description ?? null]
        );
      }
      for (const dec of seed.decisions) {
        await query(
          `INSERT INTO decisions
             (id, title, owner, owner_role, owner_avatar, department, date, status, confidence,
              confidence_breakdown, impact, summary, rationale, alternatives_considered,
              linked_node_ids, primary_evidence_id, tags, warnings)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
          [dec.id, dec.title, dec.owner, dec.ownerRole, dec.ownerAvatar, dec.department, dec.date,
           dec.status, dec.confidence, JSON.stringify(dec.confidenceBreakdown ?? null), dec.impact,
           dec.summary, dec.rationale, dec.alternativesConsidered, dec.linkedNodeIds,
           dec.primaryEvidenceId, dec.tags || [], JSON.stringify(dec.warnings || [])]
        );
      }
      for (const doc of seed.evidence) {
        await query(
          `INSERT INTO evidence_documents
             (id, title, type, author, date, hash, verified, department, highlight_snippet, content, related_decision_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [doc.id, doc.title, doc.type, doc.author, doc.date, doc.hash, doc.verified,
           doc.department, doc.highlightSnippet, doc.content, doc.relatedDecisionId]
        );
      }
      for (const t of seed.timeline) {
        await query(
          `INSERT INTO timeline_events
             (id, date, time, title, actor, actor_role, type, description,
              related_node_id, related_decision_id, related_evidence_id, branch, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [t.id, t.date, t.time ?? null, t.title, t.actor, t.actorRole ?? null, t.type, t.description,
           t.relatedNodeId ?? null, t.relatedDecisionId ?? null, t.relatedEvidenceId ?? null,
           t.branch ?? null, t.status ?? null]
        );
      }

      return {
        mode: 'postgres' as const,
        nodes: seed.nodes.length,
        edges: seed.edges.length,
        decisions: seed.decisions.length,
        evidence: seed.evidence.length,
        timeline: seed.timeline.length
      };
    }
  } catch (err) {
    console.warn('[db] Postgres seed failed — reloading in-memory store instead', err);
  }

  mem = freshStore();
  return {
    mode: 'in-memory' as const,
    nodes: mem.nodes.length,
    edges: mem.edges.length,
    decisions: mem.decisions.length,
    evidence: mem.evidence.length,
    timeline: mem.timeline.length
  };
};

/** Counts across whichever store is live — used by the admin dashboard. */
export const getCounts = async () => {
  try {
    if (pool) {
      const res = await query(
        `SELECT
           (SELECT COUNT(*) FROM nodes)              AS nodes,
           (SELECT COUNT(*) FROM edges)              AS edges,
           (SELECT COUNT(*) FROM decisions)          AS decisions,
           (SELECT COUNT(*) FROM evidence_documents) AS evidence,
           (SELECT COUNT(*) FROM timeline_events)    AS timeline`
      );
      const r = res.rows[0];
      return {
        nodes: Number(r.nodes), edges: Number(r.edges), decisions: Number(r.decisions),
        evidence: Number(r.evidence), timeline: Number(r.timeline)
      };
    }
  } catch {
    console.warn('[db] Postgres counts failed — counting in-memory store');
  }
  return {
    nodes: mem.nodes.length, edges: mem.edges.length, decisions: mem.decisions.length,
    evidence: mem.evidence.length, timeline: mem.timeline.length
  };
};
