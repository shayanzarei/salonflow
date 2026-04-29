import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { PACKAGE_ENTITLEMENTS, type PackageId } from "@/config/packages";
import pool from "@/lib/db";
import { getPackageMap, getTenantOverrideEntries } from "@/lib/packages";
import { notFound } from "next/navigation";

/**
 * Per-tenant entitlement overrides. Each row shows the package default and
 * (when present) the override value, with a single control to flip a
 * boolean or set a numeric limit.
 */
export default async function TenantEntitlementsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT id, plan_tier FROM tenants WHERE id = $1`,
    [id]
  );
  const tenant = result.rows[0];
  if (!tenant) notFound();

  const packageMap = await getPackageMap();
  const tenantPackage = packageMap[tenant.plan_tier as PackageId];
  const overrideEntries = await getTenantOverrideEntries(id);
  const overrideMap = Object.fromEntries(
    overrideEntries.map((item) => [item.key, item.value])
  ) as Record<string, boolean | number | null>;

  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
        <h2 className="font-semibold text-ink-900">Plan & overrides</h2>
        <p className="mt-0.5 text-caption text-ink-400">
          Override this tenant&apos;s package features and limits without
          changing the shared package defaults.
        </p>
      </div>
      <div className="divide-y divide-ink-50">
        {PACKAGE_ENTITLEMENTS.map((feat) => {
          const packageValue = tenantPackage?.entitlements[feat.key];
          const overrideValue = overrideMap[feat.key];
          const effectiveValue =
            overrideValue !== undefined ? overrideValue : packageValue;
          return (
            <div
              key={feat.key}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 pr-0 sm:pr-4">
                <p className="flex flex-wrap items-center gap-2 text-body-sm font-medium text-ink-900">
                  {feat.label}
                  <Badge variant="brand">Package default</Badge>
                  {overrideValue !== undefined && (
                    <Badge variant="warning">Overridden</Badge>
                  )}
                </p>
                <p className="mt-0.5 text-caption text-ink-400">
                  {feat.description}
                </p>
                <p className="mt-1 text-caption text-ink-500">
                  Current package value:{" "}
                  <span className="font-medium text-ink-700">
                    {packageValue === null
                      ? "Unlimited"
                      : typeof packageValue === "boolean"
                        ? packageValue
                          ? "Enabled"
                          : "Disabled"
                        : packageValue}
                  </span>
                </p>
              </div>
              {feat.type === "boolean" ? (
                <form
                  action="/api/admin/tenant-entitlements"
                  method="POST"
                  className="shrink-0 self-start sm:self-center"
                >
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="key" value={feat.key} />
                  <input type="hidden" name="value_type" value="boolean" />
                  <input
                    type="hidden"
                    name="value"
                    value={effectiveValue ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors"
                    style={{
                      background: effectiveValue
                        ? "var(--color-brand-600)"
                        : "#D1D5DB",
                    }}
                    aria-label={
                      effectiveValue
                        ? `Disable ${feat.label}`
                        : `Enable ${feat.label}`
                    }
                  >
                    <span
                      className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]"
                      style={{ left: effectiveValue ? 23 : 3 }}
                    />
                  </button>
                </form>
              ) : (
                <form
                  action="/api/admin/tenant-entitlements"
                  method="POST"
                  className="w-full max-w-[200px] shrink-0 self-start sm:self-center"
                >
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="key" value={feat.key} />
                  <input type="hidden" name="value_type" value="limit" />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id={`tenant-ent-${feat.key}`}
                        type="number"
                        min="0"
                        name="value"
                        defaultValue={
                          effectiveValue === null
                            ? ""
                            : String(effectiveValue)
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                    <Button type="submit" variant="dark" size="sm">
                      Save
                    </Button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
