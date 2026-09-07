import { NextResponse } from 'next/server';
import { seedDatabase, clearDatabase, getCounts } from '../../../lib/db';
import { requireRole } from '../../../lib/auth';

/** GET /api/seed — report what is currently stored. */
const getHandler = async () => {
  const counts = await getCounts();
  return NextResponse.json({ counts });
};

/**
 * POST /api/seed — reload the Aletheia institutional corpus.
 * Body: { action: 'seed' | 'clear' }.  Admin only: it is destructive.
 */
const postHandler = async (request: Request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action === 'clear' ? 'clear' : 'seed';

    if (action === 'clear') {
      const result = await clearDatabase();
      return NextResponse.json({ success: true, action, ...result, counts: await getCounts() });
    }

    const result = await seedDatabase();
    return NextResponse.json({ success: true, action, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    console.error('Seed error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const GET = requireRole('viewer', getHandler);
export const POST = requireRole('admin', postHandler);
