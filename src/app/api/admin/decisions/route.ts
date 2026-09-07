import { NextResponse } from 'next/server';
import { getAllDecisions, updateDecision, deleteDecision, updateNode, getCounts } from '../../../../lib/db';
import { requireRole } from '../../../../lib/auth';

/** GET /api/admin/decisions?q=&status=&page=&pageSize= */
const getHandler = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const status = url.searchParams.get('status') || '';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(200, Number(url.searchParams.get('pageSize')) || 25);

    let decisions = await getAllDecisions();
    if (status) decisions = decisions.filter((d: { status: string }) => d.status === status);
    if (q) {
      decisions = decisions.filter((d: { title: string; owner: string; id: string }) =>
        d.title.toLowerCase().includes(q) ||
        d.owner.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }

    const total = decisions.length;
    const start = (page - 1) * pageSize;
    return NextResponse.json({
      decisions: decisions.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list decisions';
    console.error('Admin decisions error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

/** PATCH /api/admin/decisions?id=<id> — edit ledger fields, mirrored onto the node. */
const patchHandler = async (request: Request) => {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing decision id' }, { status: 400 });

    const patch = await request.json();
    const updated = await updateDecision(id, patch);
    if (!updated) return NextResponse.json({ error: `Decision ${id} not found` }, { status: 404 });

    // Keep the graph node projection consistent with the ledger record.
    const nodePatch: Record<string, unknown> = {};
    if (patch.title !== undefined) nodePatch.label = patch.title;
    if (patch.status !== undefined) nodePatch.status = patch.status;
    if (patch.summary !== undefined) nodePatch.description = patch.summary;
    if (patch.rationale !== undefined) nodePatch.rationale = patch.rationale;
    if (patch.confidence !== undefined) nodePatch.confidenceScore = patch.confidence;
    if (Object.keys(nodePatch).length) await updateNode(id, nodePatch);

    return NextResponse.json({ success: true, decision: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update decision';
    console.error('Admin patch decision error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

/** DELETE /api/admin/decisions?id=<id> */
const deleteHandler = async (request: Request) => {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing decision id' }, { status: 400 });
    await deleteDecision(id);
    return NextResponse.json({ success: true, id, counts: await getCounts() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete decision';
    console.error('Admin delete decision error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('admin', getHandler);
export const PATCH = requireRole('admin', patchHandler);
export const DELETE = requireRole('admin', deleteHandler);
