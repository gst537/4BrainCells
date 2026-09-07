import { NextResponse } from 'next/server';
import { generateToken } from '../../../../lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // In a real app, you would verify against a database.
    // For this demo, we accept any username with password 'admin'
    if (username && password === 'admin') {
      const token = generateToken({ username, role: 'admin' });
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
