import { NextResponse } from 'next/server';
import { addNode, getGraph } from '../../../../lib/db';
import { requireRole } from '../../../../lib/auth';

/** GET /api/graph/nodes — all nodes from the live datastore (optionally by type). */
const getHandler = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const { nodes } = await getGraph();
    const filtered = type ? nodes.filter((n: { type: string }) => n.type === type) : nodes;
    return NextResponse.json({ nodes: filtered, count: filtered.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch nodes';
    console.error('Error fetching nodes:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

const postHandler = async (request: Request) => {
  try {
    const node = await request.json();
    if (!node.id || !node.type) {
      return NextResponse.json({ error: 'Missing required node fields' }, { status: 400 });
    }
    const savedNode = await addNode(node);
    return NextResponse.json({ success: true, node: savedNode });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add node';
    console.error('Error adding node:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('viewer', getHandler);
export const POST = requireRole('contributor', postHandler);
