// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_to_a_secret';

export const generateToken = (payload: object, expiresIn: any = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const requireAuth = (handler: (req: Request) => Promise<NextResponse | Response>) => {
  return async (req: Request) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    // Attach payload to request for downstream use if needed
    (req as unknown as { auth?: unknown }).auth = payload;
    return handler(req);
  };
};

export type UserRole = 'viewer' | 'contributor' | 'admin';

const ROLE_RANK: Record<UserRole, number> = { viewer: 0, contributor: 1, admin: 2 };

export const roleOf = (req: Request): UserRole | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const payload = verifyToken(authHeader.split(' ')[1]);
  if (!payload || typeof payload === 'string') return null;
  const role = (payload as { role?: string }).role;
  return role === 'admin' || role === 'contributor' || role === 'viewer' ? role : 'viewer';
};

/**
 * Wraps a handler so it only runs for callers at or above `minimum` in the
 * viewer < contributor < admin ladder.
 */
export const requireRole = (
  minimum: UserRole,
  handler: (req: Request) => Promise<NextResponse | Response>
) => {
  return async (req: Request) => {
    const role = roleOf(req);
    if (!role) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (ROLE_RANK[role] < ROLE_RANK[minimum]) {
      return NextResponse.json(
        { error: `Requires ${minimum} role or above (you are ${role})` },
        { status: 403 }
      );
    }
    return handler(req);
  };
};
