import pool from '@/lib/db';
import { hasPackageFeature } from '@/lib/packages';
import { Tenant } from '@/types/tenant';

export async function hasFeature(
  tenant: Tenant,
  feature: string
): Promise<boolean> {
  const knownFeature = feature as Parameters<typeof hasPackageFeature>[1];
  try {
    return await hasPackageFeature(tenant, knownFeature);
  } catch {
    const result = await pool.query(
      `SELECT enabled FROM feature_flags
       WHERE tenant_id = $1 AND feature = $2`,
      [tenant.id, feature]
    );
    return result.rows[0]?.enabled ?? false;
  }
}