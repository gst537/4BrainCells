import { NextResponse } from 'next/server';
import { getGraph, deleteNode, getCounts, getDbStatus } from '../../../../lib/db';
import { requireRole } from '../../../../lib/auth';

/** GET /api/admin/nodes?type=&q=&page=&pageSize= — paginated node listing. */
const getHandler = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || '';
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(200, Number(url.searchParams.get('pageSize')) || 25);

    const { nodes } = await getGraph();
    let filtered = nodes as Array<Record<string, unknown>>;
    if (type) filtered = filtered.filter(n => n.type === type);
    if (q) {
      filtered = filtered.filter(n =>
        String(n.label || '').toLowerCase().includes(q) ||
        String(n.id || '').toLowerCase().includes(q) ||
        String(n.description || '').toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    return NextResponse.json({
      nodes: filtered.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      counts: await getCounts(),
      storage: await getDbStatus()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list nodes';
    console.error('Admin nodes error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

/** DELETE /api/admin/nodes?id=<nodeId> — removes the node and its edges. */
const deleteHandler = async (request: Request) => {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing node id' }, { status: 400 });
    await deleteNode(id);
    return NextResponse.json({ success: true, id, counts: await getCounts() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete node';
    console.error('Admin delete node error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('admin', getHandler);
export const DELETE = requireRole('admin', deleteHandler);
