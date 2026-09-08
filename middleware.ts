import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/server-edge';

const ADMIN_API_PREFIXES = [
  '/api/admin',
  '/api/rooms',
  '/api/exam-sessions',
  '/api/exam-assignments',
  '/api/announcements',
  '/api/settings',
];

function isAdminApiPath(pathname: string): boolean {
  return ADMIN_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAdminApi(pathname: string, method: string): boolean {
  if (pathname === '/api/registrants' && method === 'POST') return false;
  if (pathname.startsWith('/api/public/')) return false;
  if (pathname === '/api/admin/login' && method === 'POST') return false;
  return isAdminApiPath(pathname) || (pathname.startsWith('/api/registrants/') && method !== 'GET');
  // Note: GET /api/registrants is admin, so it falls into ADMIN_API_PREFIXES already
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApiRoute = pathname.startsWith('/api/') && isAdminApi(pathname, req.method);

  if (!isAdminPage && !isAdminApiRoute) return NextResponse.next();

  const hasCookie = Boolean(req.cookies.get(ADMIN_COOKIE_NAME)?.value);
  if (hasCookie) return NextResponse.next();

  if (isAdminApiRoute) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
