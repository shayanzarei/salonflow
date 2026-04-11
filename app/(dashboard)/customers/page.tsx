import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function CustomersPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT
       client_name,
       client_email,
       client_phone,
       COUNT(*) AS total_bookings,
       SUM(s.price) AS total_spent,
       MAX(b.booked_at) AS last_visit
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.tenant_id = $1
     GROUP BY client_name, client_email, client_phone
     ORDER BY last_visit DESC`,
    [tenant.id]
  );

  const customers = result.rows;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">
          {customers.length} total customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {customers.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No customers yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {customers.map((customer) => (
              <div
                key={customer.client_email}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0"
                    style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
                  >
                    {customer.client_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {customer.client_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {customer.client_email}
                    </p>
                    {customer.client_phone && (
                      <p className="text-xs text-gray-400">
                        {customer.client_phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${parseFloat(customer.total_spent).toFixed(2)} spent
                  </p>
                  <p className="text-xs text-gray-400">
                    {customer.total_bookings} booking{customer.total_bookings !== '1' ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last visit{' '}
                    {new Date(customer.last_visit).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}