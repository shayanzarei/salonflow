import { headers } from 'next/headers';
import { getServerSession, Session } from 'next-auth';
import pool from '@/lib/db';
import { Tenant } from '@/types/tenant';

export async function getTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  let slug = headersList.get('x-tenant-slug');

  // in development fall back to DEV_TENANT_SLUG
  if (!slug && process.env.NODE_ENV === 'development') {
    slug = process.env.DEV_TENANT_SLUG ?? null;
  }

  // if still no slug, try to get it from the session
  // this covers dashboard pages where the salon owner is logged in
  if (!slug) {
    const session = await getServerSession();
    if (session && !(session as Session).isAdmin) {
      slug = (session as Session).slug ?? null;
    }
  }

  if (!slug) return null;

  const result = await pool.query(
    'SELECT * FROM tenants WHERE slug = $1',
    [slug]
  );

  return result.rows[0] ?? null;
}