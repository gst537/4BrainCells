import { NextResponse } from 'next/server';
import { addNode } from '../../../../lib/db';
import { requireAuth } from '../../../../lib/auth';

const postHandler = async (request: Request) => {
  try {
    const node = await request.json();
    if (!node.id || !node.type) {
      return NextResponse.json({ error: 'Missing required node fields' }, { status: 400 });
    }

    const savedNode = await addNode(node);
    return NextResponse.json({ success: true, node: savedNode });
  } catch (error: any) {
    console.error('Error adding node:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const POST = requireAuth(postHandler as any);
