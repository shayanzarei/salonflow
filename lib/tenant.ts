import pool from '@/lib/db';
import { Tenant } from '@/types/tenant';
import { headers } from 'next/headers';

export async function getTenant(): Promise<Tenant | null> {
  const headersList = await headers();
  let slug = headersList.get('x-tenant-slug');

  console.log('🔍 x-tenant-slug from header:', slug);
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 DEV_TENANT_SLUG:', process.env.DEV_TENANT_SLUG);

  if (!slug && process.env.NODE_ENV === 'development') {
    slug = process.env.DEV_TENANT_SLUG ?? null;
  }

  console.log('🔍 final slug:', slug);

  if (!slug) return null;

  const result = await pool.query(
    'SELECT * FROM tenants WHERE slug = $1',
    [slug]
  );

  console.log('🔍 tenant found:', result.rows[0]?.name ?? 'NONE');

  return result.rows[0] ?? null;
}