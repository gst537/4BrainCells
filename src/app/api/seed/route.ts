import { NextResponse } from 'next/server';
import { saveGraph } from '../../../lib/db';
import { mockNodes, mockEdges } from '../../../data/mockData';

export async function GET() {
  try {
    await saveGraph(mockNodes, mockEdges);
    return NextResponse.json({ success: true, message: 'Database seeded with mockData.ts' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
