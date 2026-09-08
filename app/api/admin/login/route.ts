import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, setAdminCookie, getAdminSessionFromCookies } from '@/lib/auth/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid.' }, { status: 400 });
  }
  const email = (body.email || '').trim();
  const password = body.password || '';
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
  }
  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: 'Kombinasi email atau password salah.' }, { status: 401 });
  }
  await setAdminCookie(email);
  return NextResponse.json({
    user: { id: 'admin-001', email: email.toLowerCase(), name: 'Panitia SPMB SD Bina Nusa', role: 'ADMIN' as const },
  });
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: { id: 'admin-001', email: session.email, name: 'Panitia SPMB SD Bina Nusa', role: 'ADMIN' as const },
  });
}
