import { NextResponse } from 'next/server';
import { createChatSession } from '../../../../lib/db';

// Auth is intentionally optional here, matching /api/chat's guest-friendly
// posture — chat history should work for unauthenticated demo sessions too.
export const POST = async (request: Request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body.id || `sess-${Date.now()}`;
    const title = body.title || 'Why Chat Session';
    const session = await createChatSession(id, title);
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    console.error('Error creating chat session:', error);
    return NextResponse.json({ error: error.message || 'Failed to create session' }, { status: 500 });
  }
};
