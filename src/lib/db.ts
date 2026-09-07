// src/lib/db.ts
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { mockNodes, mockEdges, mockEvidence } from '../data/mockData';

let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

let inMemoryNodes: any[] = [...mockNodes];
let inMemoryEdges: any[] = [...mockEdges];
let inMemoryEvidence: any[] = Object.values(mockEvidence);
let inMemoryChatSessions: { id: string; createdAt: string; title: string }[] = [];
let inMemoryChatMessages: Record<string, any[]> = {};

// Lazily applies setup.sql once per process so a fresh Postgres instance
// (docker compose up + npm run dev, no manual SQL step) just works.
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

export const getDbStatus = async (): Promise<'connected' | 'in-memory'> => {
  if (!pool) return 'in-memory';
  try {
    await ensureSchema();
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return 'connected';
    } finally {
      client.release();
    }
  } catch {
    return 'in-memory';
  }
};

export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('No database connection configured');
  }
  await ensureSchema();
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
};

export const getGraph = async () => {
  try {
    if (pool) {
      const nodesRes = await query('SELECT id, type, data FROM nodes');
      const edgesRes = await query('SELECT id, source, target, label, confidence, description FROM edges');
      return {
        nodes: nodesRes.rows.map(row => ({ id: row.id, type: row.type, ...row.data })),
        edges: edgesRes.rows.map(row => ({
          id: String(row.id),
          source: row.source,
          target: row.target,
          label: row.label,
          confidence: row.confidence !== null ? Number(row.confidence) : 1,
          description: row.description || undefined
        })),
      };
    }
  } catch (err) {
    console.warn('Database not available, using in-memory mock data');
  }
  return {
    nodes: inMemoryNodes,
    edges: inMemoryEdges,
  };
};

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
          'INSERT INTO edges (id, source, target, label, confidence, description) VALUES ($1, $2, $3, $4, $5, $6)',
          [edge.id, edge.source, edge.target, edge.label, edge.confidence ?? 1, edge.description ?? null]
        );
      }
      await query('COMMIT');
      return;
    }
  } catch (err) {
    console.warn('Database save failed, updating in-memory store');
  }
  inMemoryNodes = [...nodes];
  inMemoryEdges = [...edges];
};

export const addNode = async (node: any) => {
  try {
    if (pool) {
      const { id, type, ...data } = node;
      await query(
        'INSERT INTO nodes (id, type, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET type = $2, data = $3',
        [id, type, data]
      );
      return node;
    }
  } catch (err) {
    console.warn('Database addNode failed, updating in-memory store');
  }
  inMemoryNodes = [...inMemoryNodes.filter(n => n.id !== node.id), node];
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
  } catch (err) {
    console.warn('Database updateNode failed, updating in-memory store', err);
  }
  let updated: any = null;
  inMemoryNodes = inMemoryNodes.map(n => {
    if (n.id === id) {
      updated = { ...n, ...patch };
      return updated;
    }
    return n;
  });
  return updated;
};

export const addEdge = async (edge: any) => {
  try {
    if (pool) {
      await query(
        'INSERT INTO edges (id, source, target, label, confidence, description) VALUES ($1, $2, $3, $4, $5, $6)',
        [edge.id, edge.source, edge.target, edge.label, edge.confidence ?? 1, edge.description ?? null]
      );
      return edge;
    }
  } catch (err) {
    console.warn('Database addEdge failed, updating in-memory store');
  }
  inMemoryEdges = [...inMemoryEdges, edge];
  return edge;
};

// ---- Evidence Vault ----

export const getEvidence = async () => {
  try {
    if (pool) {
      const res = await query('SELECT * FROM evidence_documents ORDER BY date DESC');
      return res.rows.map(row => ({
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
        relatedDecisionId: row.related_decision_id
      }));
    }
  } catch (err) {
    console.warn('Database not available, using in-memory evidence store');
  }
  return inMemoryEvidence;
};

export const addEvidence = async (doc: any) => {
  try {
    if (pool) {
      await query(
        `INSERT INTO evidence_documents (id, title, type, author, date, hash, verified, department, highlight_snippet, content, related_decision_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [doc.id, doc.title, doc.type, doc.author, doc.date, doc.hash, doc.verified ?? true, doc.department, doc.highlightSnippet, doc.content, doc.relatedDecisionId ?? null]
      );
      return doc;
    }
  } catch (err) {
    console.warn('Database addEvidence failed, updating in-memory store');
  }
  inMemoryEvidence = [...inMemoryEvidence, doc];
  return doc;
};

// ---- Chat History Persistence ----

export const createChatSession = async (id: string, title: string) => {
  try {
    if (pool) {
      await query('INSERT INTO chat_sessions (id, title) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING', [id, title]);
      return { id, title };
    }
  } catch (err) {
    console.warn('Database createChatSession failed, using in-memory store');
  }
  if (!inMemoryChatSessions.find(s => s.id === id)) {
    inMemoryChatSessions.push({ id, createdAt: new Date().toISOString(), title });
    inMemoryChatMessages[id] = [];
  }
  return { id, title };
};

export const getChatMessages = async (sessionId: string) => {
  try {
    if (pool) {
      const res = await query(
        'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY timestamp ASC',
        [sessionId]
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
  } catch (err) {
    console.warn('Database getChatMessages failed, using in-memory store');
  }
  return inMemoryChatMessages[sessionId] || [];
};

export const addChatMessage = async (sessionId: string, message: any) => {
  try {
    if (pool) {
      await createChatSession(sessionId, 'Why Chat Session');
      await query(
        `INSERT INTO chat_messages (id, session_id, sender, text, confidence_score, confidence_level, citations, graph_focus_nodes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          message.id,
          sessionId,
          message.sender,
          message.text,
          message.confidenceScore ?? null,
          message.confidenceLevel ?? null,
          JSON.stringify(message.citations || []),
          message.graphFocusNodes || []
        ]
      );
      return message;
    }
  } catch (err) {
    console.warn('Database addChatMessage failed, using in-memory store');
  }
  if (!inMemoryChatMessages[sessionId]) inMemoryChatMessages[sessionId] = [];
  inMemoryChatMessages[sessionId].push(message);
  return message;
};
