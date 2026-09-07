import { NextResponse } from 'next/server';
import { getDbStatus } from '../../../lib/db';

export const GET = async () => {
  const db = await getDbStatus();
  return NextResponse.json({
    db,
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing'
  });
};
