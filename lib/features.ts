import pool from '@/lib/db';
import { PLANS } from '@/config/plans';
import { Tenant } from '@/types/tenant';

export async function hasFeature(
  tenant: Tenant,
  feature: string
): Promise<boolean> {
  // first check plan-level features
  const planFeatures = PLANS[tenant.plan_tier as keyof typeof PLANS]?.features ?? [];
  if (planFeatures.some((f) => f === feature)) return true;

  // then check per-tenant overrides in the database
  const result = await pool.query(
    `SELECT enabled FROM feature_flags
     WHERE tenant_id = $1 AND feature = $2`,
    [tenant.id, feature]
  );

  return result.rows[0]?.enabled ?? false;
}