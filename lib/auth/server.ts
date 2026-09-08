import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME } from './server-edge';

export { ADMIN_COOKIE_NAME };
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12h

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error('ADMIN_SESSION_SECRET missing/too short (min 16 chars)');
  return s;
}

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf, 'utf8') : buf;
  return b.toString('base64url');
}
function b64urlDecode(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8');
}

export interface AdminSessionPayload {
  email: string;
  exp: number; // unix seconds
}

export function signSession(payload: AdminSessionPayload): string {
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifySession(token: string): AdminSessionPayload | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url');
  try {
    const a = Buffer.from(sig, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(b64urlDecode(body)) as AdminSessionPayload;
    if (!payload.email || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    const allowed = getAllowedEmails();
    if (!allowed.includes(payload.email.toLowerCase())) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAllowedEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS || 'admin@binanusa.sch.id';
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function verifyCredentials(email: string, password: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const allowed = getAllowedEmails();
  if (!allowed.includes(cleanEmail)) return false;
  const expected = process.env.ADMIN_PASSWORD || '';
  if (!expected) return false;
  // constant-time compare on password
  const a = Buffer.from(password, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setAdminCookie(email: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
  const token = signSession({ email: email.toLowerCase(), exp });
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSessionFromCookies(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

// For middleware (NextRequest cookies, not next/headers)
export function getAdminSessionFromRequest(req: NextRequest): AdminSessionPayload | null {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function isAdminRequest(req: NextRequest): boolean {
  return getAdminSessionFromRequest(req) !== null;
}
