import AdminDeleteTenantButton from "@/components/admin/AdminDeleteTenantButton";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import pool from "@/lib/db";
import { notFound } from "next/navigation";

/**
 * Irreversible operations isolated on their own page so they can't be
 * triggered by a misclick on a busy editor screen.
 */
export default async function TenantDangerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT id, name, slug, tenant_status FROM tenants WHERE id = $1`,
    [id]
  );
  const tenant = result.rows[0];
  if (!tenant) notFound();

  const isSuspended = tenant.tenant_status === "suspended";

  return (
    <div className="space-y-4">
      {/* Suspend / un-suspend */}
      <Card variant="outlined" className="overflow-hidden border-warning-200 p-0">
        <div className="border-b border-warning-200 bg-warning-50 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-warning-700">Suspend</h2>
          <p className="mt-0.5 text-caption text-warning-700/80">
            Hides the public site and disables booking. Reversible — restore
            by setting status back to active.
          </p>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-ink-900">
              Current status:{" "}
              <span
                className={
                  isSuspended ? "text-warning-700" : "text-success-700"
                }
              >
                {tenant.tenant_status}
              </span>
            </p>
            <p className="mt-0.5 text-caption text-ink-500">
              Suspending preserves all data — bookings, services, staff,
              clients — and only blocks public access.
            </p>
          </div>
          <form
            action="/api/admin/tenants/lifecycle"
            method="POST"
            className="shrink-0"
          >
            <input type="hidden" name="tenant_id" value={id} />
            <input
              type="hidden"
              name="tenant_status"
              value={isSuspended ? "active" : "suspended"}
            />
            <Button
              type="submit"
              variant={isSuspended ? "primary" : "secondary"}
              size="sm"
            >
              {isSuspended ? "Restore to active" : "Suspend tenant"}
            </Button>
          </form>
        </div>
      </Card>

      {/* Permanent delete */}
      <AdminDeleteTenantButton
        tenantId={id}
        tenantName={tenant.name}
        tenantSlug={tenant.slug}
      />
    </div>
  );
}
