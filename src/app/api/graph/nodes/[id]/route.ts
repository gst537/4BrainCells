import { NextResponse } from 'next/server';
import { updateNode, deleteNode } from '../../../../../lib/db';
import { requireRole } from '../../../../../lib/auth';

const idFrom = (request: Request) => {
  const url = new URL(request.url);
  return decodeURIComponent(url.pathname.split('/').pop() || '');
};

const patchHandler = async (request: Request) => {
  try {
    const id = idFrom(request);
    if (!id) return NextResponse.json({ error: 'Missing node id' }, { status: 400 });

    const patch = await request.json();
    const updated = await updateNode(id, patch);
    if (!updated) return NextResponse.json({ error: `Node ${id} not found` }, { status: 404 });

    return NextResponse.json({ success: true, node: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update node';
    console.error('Error updating node:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

const deleteHandler = async (request: Request) => {
  try {
    const id = idFrom(request);
    if (!id) return NextResponse.json({ error: 'Missing node id' }, { status: 400 });
    await deleteNode(id);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete node';
    console.error('Error deleting node:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const PATCH = requireRole('contributor', patchHandler);
export const DELETE = requireRole('admin', deleteHandler);
