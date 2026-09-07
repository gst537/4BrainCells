import { NextResponse } from 'next/server';
import { getEvidence, addEvidence } from '../../../lib/db';
import { requireAuth } from '../../../lib/auth';

export const GET = async () => {
  try {
    const docs = await getEvidence();
    return NextResponse.json({ documents: docs });
  } catch (error: any) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch evidence' }, { status: 500 });
  }
};

const postHandler = async (request: Request) => {
  try {
    const doc = await request.json();
    if (!doc.id || !doc.title || !doc.content || !doc.hash) {
      return NextResponse.json({ error: 'Missing required evidence fields' }, { status: 400 });
    }
    const saved = await addEvidence(doc);
    return NextResponse.json({ success: true, document: saved });
  } catch (error: any) {
    console.error('Error adding evidence:', error);
    return NextResponse.json({ error: error.message || 'Failed to add evidence' }, { status: 500 });
  }
};

export const POST = requireAuth(postHandler);
