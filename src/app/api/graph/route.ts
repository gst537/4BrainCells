import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'graphMock.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Failed to read graph data:', error);
    return NextResponse.json({ error: 'Failed to read graph data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.nodes || !body.edges) {
      return NextResponse.json({ error: 'Invalid payload: missing nodes or edges' }, { status: 400 });
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write graph data:', error);
    return NextResponse.json({ error: 'Failed to write graph data' }, { status: 500 });
  }
}
