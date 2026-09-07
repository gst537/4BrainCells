// src/lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can add additional options like ssl if needed
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
};

export const getGraph = async () => {
  const nodesRes = await query('SELECT id, type, data FROM nodes');
  const edgesRes = await query('SELECT source, target, label FROM edges');
  return {
    nodes: nodesRes.rows.map(row => ({ id: row.id, type: row.type, ...row.data })),
    edges: edgesRes.rows.map(row => ({ source: row.source, target: row.target, label: row.label })),
  };
};

export const saveGraph = async (nodes: any[], edges: any[]) => {
  // Simple upsert implementation (replace all for demo)
  await query('BEGIN');
  await query('DELETE FROM nodes');
  await query('DELETE FROM edges');
  for (const node of nodes) {
    const { id, type, ...data } = node;
    await query('INSERT INTO nodes (id, type, data) VALUES ($1, $2, $3)', [id, type, data]);
  }
  for (const edge of edges) {
    await query('INSERT INTO edges (source, target, label) VALUES ($1, $2, $3)', [edge.source, edge.target, edge.label]);
  }
  await query('COMMIT');
};
