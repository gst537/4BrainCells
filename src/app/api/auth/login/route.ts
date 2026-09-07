import { NextResponse } from 'next/server';
import { generateToken } from '../../../../lib/auth';

// Role-based login demo:
//   username: 'admin',       password: 'admin'    → admin role (full access)
//   username: 'contributor', password: 'admin'    → contributor role (can add/edit)
//   username: 'viewer',      password: 'admin'    → viewer role (read-only)
//   any other username,      password: 'admin'    → contributor role (default)
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username && password === 'admin') {
      let role: 'admin' | 'contributor' | 'viewer' = 'contributor';
      if (username === 'admin') role = 'admin';
      else if (username === 'viewer') role = 'viewer';

      const token = generateToken({ username, role });
      return NextResponse.json({ token, role });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
