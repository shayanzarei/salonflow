import { NextRequest, NextResponse } from 'next/server';

export default function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const slug = host.split('.')[0];
  const pathname = req.nextUrl.pathname;

  // skip tenant resolution for admin and dashboard routes
  const reserved = ['admin', 'app', 'www', 'localhost', 'localhost:3000', 'localhost:3001'];
  const adminPaths = ['/admin', '/dashboard', '/login', '/staff', '/services', '/bookings', '/customers', '/settings'];

  const isAdminPath = adminPaths.some(p => pathname.startsWith(p));

  if (reserved.includes(slug) || isAdminPath) return NextResponse.next();

  const res = NextResponse.next();
  res.headers.set('x-tenant-slug', slug);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};