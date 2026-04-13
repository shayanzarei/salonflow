import pool from '@/lib/db';
import Link from 'next/link';

export default async function AdminTenantsPage() {
  const result = await pool.query(
    `SELECT
       t.*,
       COUNT(b.id) AS booking_count
     FROM tenants t
     LEFT JOIN bookings b ON t.id = b.tenant_id
     WHERE t.is_admin = false
     GROUP BY t.id
     ORDER BY t.created_at DESC`
  );

  const tenants = result.rows;

  return (
    <div className="min-w-0">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Tenants</h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            {tenants.length} salons on the platform
          </p>
        </div>

        <Link
          href="/admin/tenants/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          Add salon
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {tenants.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No salons yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tenants.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/admin/tenants/${tenant.id}`}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-medium text-white"
                    style={{
                      backgroundColor: tenant.primary_color ?? "#7C3AED",
                    }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {tenant.name}
                    </p>
                    <p className="truncate text-xs text-gray-400">
                      {tenant.slug}.myplatform.com
                    </p>
                  </div>
                </div>
                <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-gray-50 pt-3 sm:w-auto sm:justify-end sm:gap-6 sm:border-t-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-400">
                      {tenant.booking_count} bookings
                    </p>
                    <p className="text-xs capitalize text-gray-400">
                      {tenant.plan_tier} plan
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium capitalize text-white"
                    style={{
                      backgroundColor: tenant.primary_color ?? "#7C3AED",
                    }}
                  >
                    {tenant.plan_tier}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}