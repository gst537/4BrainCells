import { NextResponse } from 'next/server';
import { getChatMessages, addChatMessage, createChatSession } from '../../../../../../lib/db';

const getSessionId = (request: Request) => {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  // .../sessions/[id]/messages
  return parts[parts.length - 2];
};

export const GET = async (request: Request) => {
  try {
    const sessionId = getSessionId(request);
    const messages = await getChatMessages(sessionId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const sessionId = getSessionId(request);
    const message = await request.json();
    if (!message.id || !message.sender || typeof message.text !== 'string') {
      return NextResponse.json({ error: 'Missing required message fields' }, { status: 400 });
    }
    await createChatSession(sessionId, 'Why Chat Session');
    const saved = await addChatMessage(sessionId, message);
    return NextResponse.json({ success: true, message: saved });
  } catch (error: any) {
    console.error('Error saving chat message:', error);
    return NextResponse.json({ error: error.message || 'Failed to save message' }, { status: 500 });
  }
};
