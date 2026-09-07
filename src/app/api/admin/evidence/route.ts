import { NextResponse } from 'next/server';
import { getEvidence, setEvidenceVerified, deleteEvidence, getCounts } from '../../../../lib/db';
import { requireRole } from '../../../../lib/auth';

/** GET /api/admin/evidence?q= */
const getHandler = async (request: Request) => {
  try {
    const q = (new URL(request.url).searchParams.get('q') || '').toLowerCase();
    let documents = await getEvidence();
    if (q) {
      documents = documents.filter((doc: { title: string; author: string; id: string }) =>
        doc.title.toLowerCase().includes(q) ||
        doc.author.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q)
      );
    }
    return NextResponse.json({ documents, total: documents.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list evidence';
    console.error('Admin evidence error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

/** PATCH /api/admin/evidence?id=<id> — body { verified: boolean } */
const patchHandler = async (request: Request) => {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing evidence id' }, { status: 400 });

    const body = await request.json();
    if (typeof body.verified !== 'boolean') {
      return NextResponse.json({ error: 'Body must include a boolean "verified"' }, { status: 400 });
    }

    const updated = await setEvidenceVerified(id, body.verified);
    if (!updated) return NextResponse.json({ error: `Evidence ${id} not found` }, { status: 404 });
    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update evidence';
    console.error('Admin patch evidence error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

/** DELETE /api/admin/evidence?id=<id> */
const deleteHandler = async (request: Request) => {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing evidence id' }, { status: 400 });
    await deleteEvidence(id);
    return NextResponse.json({ success: true, id, counts: await getCounts() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete evidence';
    console.error('Admin delete evidence error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('admin', getHandler);
export const PATCH = requireRole('admin', patchHandler);
export const DELETE = requireRole('admin', deleteHandler);
