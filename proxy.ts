import { NextRequest, NextResponse } from 'next/server';

export default function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const slug = host.split('.')[0];
  const pathname = req.nextUrl.pathname;

  const reserved = ['admin', 'app', 'www', 'localhost', 'localhost:3000', 'localhost:3001'];
  const adminPaths = [
    '/admin', '/dashboard', '/overview', '/login',
    '/staff', '/services', '/bookings', '/customers',
    '/settings', '/api'
  ];

  const isAdminPath = adminPaths.some(p => pathname.startsWith(p));
  if (isAdminPath) return NextResponse.next();

  if (reserved.includes(slug)) return NextResponse.next();

  const res = NextResponse.next();
  res.headers.set('x-tenant-slug', slug);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};