import { NextResponse } from 'next/server';
import { updateNode } from '../../../../../lib/db';
import { requireAuth } from '../../../../../lib/auth';

const patchHandler = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing node id' }, { status: 400 });
    }

    const patch = await request.json();
    const updated = await updateNode(id, patch);
    if (!updated) {
      return NextResponse.json({ error: `Node ${id} not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, node: updated });
  } catch (error: any) {
    console.error('Error updating node:', error);
    return NextResponse.json({ error: error.message || 'Failed to update node' }, { status: 500 });
  }
};

export const PATCH = requireAuth(patchHandler);
