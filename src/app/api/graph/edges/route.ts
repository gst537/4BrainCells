import { NextResponse } from 'next/server';
import { addEdge, deleteEdge, getGraph } from '../../../../lib/db';
import { requireRole } from '../../../../lib/auth';

const VALID_LABELS = new Set([
  'SUPPORTS', 'PRECEDES', 'TRIGGERED_BY', 'AUTHORED_BY', 'CONTRADICTS',
  'DEPENDS_ON', 'REVERSES', 'RESULTED_IN', 'DISCUSSED_AT', 'FOLLOWED_BY'
]);

/** GET /api/graph/edges — all edges from the live datastore. */
const getHandler = async () => {
  try {
    const { edges } = await getGraph();
    return NextResponse.json({ edges, count: edges.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch edges';
    console.error('Error fetching edges:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

const postHandler = async (request: Request) => {
  try {
    const body = await request.json();
    const { source, target, label, description, confidence } = body;

    if (!source || !target || !label) {
      return NextResponse.json({ error: 'Missing required fields: source, target, label' }, { status: 400 });
    }
    if (source === target) {
      return NextResponse.json({ error: 'An edge cannot connect a node to itself' }, { status: 400 });
    }
    if (!VALID_LABELS.has(label)) {
      return NextResponse.json({ error: `Invalid relationship label: ${label}` }, { status: 400 });
    }

    const edge = {
      id: body.id || `EDGE-${Date.now()}`,
      source,
      target,
      label,
      confidence: typeof confidence === 'number' ? confidence : 1,
      description: description || undefined
    };

    const saved = await addEdge(edge);
    return NextResponse.json({ success: true, edge: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add edge';
    console.error('Error adding edge:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

const deleteHandler = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing edge id' }, { status: 400 });
    await deleteEdge(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete edge';
    console.error('Error deleting edge:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('viewer', getHandler);
export const POST = requireRole('contributor', postHandler);
export const DELETE = requireRole('contributor', deleteHandler);
