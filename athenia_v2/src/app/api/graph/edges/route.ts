import { NextResponse } from 'next/server';
import { addEdge } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

const VALID_LABELS = new Set(['SUPPORTS', 'PRECEDES', 'TRIGGERED_BY', 'AUTHORED_BY', 'CONTRADICTS', 'DEPENDS_ON', 'REVERSES']);

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
  } catch (error: any) {
    console.error('Error adding edge:', error);
    return NextResponse.json({ error: error.message || 'Failed to add edge' }, { status: 500 });
  }
};

export const POST = requireAuth(postHandler);
