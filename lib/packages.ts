import pool from "@/lib/db";
import {
  DEFAULT_PACKAGE_DEFINITIONS,
  PACKAGE_ENTITLEMENTS,
  type PackageBooleanKey,
  type PackageEntitlementKey,
  type PackageId,
  type PackageLimitKey,
  type ResolvedPackage,
} from "@/config/packages";
import type { Tenant } from "@/types/tenant";

type PackageRow = {
  id: PackageId;
  name: string;
  subtitle: string;
  monthly_price: number;
  annual_price: number;
  featured: boolean;
  sort_order: number;
  is_active: boolean;
};

type EntitlementRow = {
  package_id?: PackageId;
  tenant_id?: string;
  key: PackageEntitlementKey;
  value_type: "boolean" | "limit";
  boolean_value: boolean | null;
  numeric_value: number | null;
};

export type PackageWithEntitlements = ResolvedPackage;

function defaultEntitlementMap(packageId: PackageId) {
  return Object.fromEntries(
    PACKAGE_ENTITLEMENTS.map((item) => [item.key, item.defaultValues[packageId]])
  ) as Record<PackageEntitlementKey, boolean | number | null>;
}

function rowValue(row: EntitlementRow) {
  return row.value_type === "boolean" ? Boolean(row.boolean_value) : row.numeric_value;
}

export async function getPackages(): Promise<PackageWithEntitlements[]> {
  const [packageResult, entitlementResult] = await Promise.all([
    pool.query<PackageRow>(
      `SELECT id, name, subtitle, monthly_price, annual_price, featured, sort_order, is_active
       FROM subscription_packages
       ORDER BY sort_order ASC, id ASC`
    ),
    pool.query<EntitlementRow>(
      `SELECT package_id, key, value_type, boolean_value, numeric_value
       FROM package_entitlements`
    ),
  ]);

  const rows =
    packageResult.rows.length > 0
      ? packageResult.rows
      : DEFAULT_PACKAGE_DEFINITIONS.map((item) => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          monthly_price: item.monthlyPrice,
          annual_price: item.annualPrice,
          featured: item.featured,
          sort_order: item.sortOrder,
          is_active: true,
        }));

  return rows.map((pkg) => {
    const entitlements = defaultEntitlementMap(pkg.id);
    entitlementResult.rows
      .filter((row) => row.package_id === pkg.id)
      .forEach((row) => {
        entitlements[row.key] = rowValue(row);
      });

    return {
      id: pkg.id,
      name: pkg.name,
      subtitle: pkg.subtitle,
      monthlyPrice: Number(pkg.monthly_price),
      annualPrice: Number(pkg.annual_price),
      featured: pkg.featured,
      sortOrder: pkg.sort_order,
      isActive: pkg.is_active,
      entitlements,
    };
  });
}

export async function getPackageMap() {
  const packages = await getPackages();
  return Object.fromEntries(packages.map((item) => [item.id, item])) as Record<
    PackageId,
    PackageWithEntitlements
  >;
}

async function getTenantOverrideMap(tenantId: string) {
  const result = await pool.query<EntitlementRow>(
    `SELECT tenant_id, key, value_type, boolean_value, numeric_value
     FROM tenant_entitlement_overrides
     WHERE tenant_id = $1`,
    [tenantId]
  );

  return Object.fromEntries(result.rows.map((row) => [row.key, rowValue(row)])) as Partial<
    Record<PackageEntitlementKey, boolean | number | null>
  >;
}

export async function hasPackageFeature(tenant: Tenant, key: PackageBooleanKey) {
  const packageMap = await getPackageMap();
  const packageId = tenant.plan_tier as PackageId;
  const baseValue = Boolean(packageMap[packageId]?.entitlements[key] ?? false);
  const overrides = await getTenantOverrideMap(tenant.id);
  const override = overrides[key];
  return typeof override === "boolean" ? override : baseValue;
}

export async function getPackageLimit(tenant: Tenant, key: PackageLimitKey) {
  const packageMap = await getPackageMap();
  const packageId = tenant.plan_tier as PackageId;
  const baseValue = packageMap[packageId]?.entitlements[key];
  const overrides = await getTenantOverrideMap(tenant.id);
  const override = overrides[key];
  return typeof override === "number" || override === null
    ? override
    : ((baseValue ?? null) as number | null);
}

export async function getTenantOverrideEntries(tenantId: string) {
  const result = await pool.query<EntitlementRow>(
    `SELECT tenant_id, key, value_type, boolean_value, numeric_value
     FROM tenant_entitlement_overrides
     WHERE tenant_id = $1
     ORDER BY key ASC`,
    [tenantId]
  );

  return result.rows.map((row) => ({
    key: row.key,
    value: rowValue(row),
    type: row.value_type,
  }));
}
