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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 mt-1">{tenants.length} salons on the platform</p>
        </div>
        
          <Link href="/admin/tenants/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:opacity-90 transition-opacity"
        >
          Add salon
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {tenants.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No salons yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tenant.slug}.myplatform.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      {tenant.booking_count} bookings
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {tenant.plan_tier} plan
                    </p>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium text-white capitalize"
                    style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
                  >
                    {tenant.plan_tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}