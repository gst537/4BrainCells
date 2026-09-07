import { NextResponse } from 'next/server';
import { getGraph, saveGraph } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

// GET graph data from PostgreSQL (or fallback DB helper)
const getHandler = async (request: Request) => {
  try {
    const data = await getGraph();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 });
  }
};

// POST new graph data (replace all nodes/edges)
const postHandler = async (request: Request) => {
  try {
    const body = await request.json();
    if (!body.nodes || !body.edges) {
      return NextResponse.json({ error: 'Invalid payload: missing nodes or edges' }, { status: 400 });
    }
    await saveGraph(body.nodes, body.edges);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write graph data:', error);
    return NextResponse.json({ error: 'Failed to write graph data' }, { status: 500 });
  }
};

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);
