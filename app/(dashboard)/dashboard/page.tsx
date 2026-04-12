import { formatEUR } from "@/lib/format-currency";
import pool from "@/lib/db";
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function DashboardPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  // today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // fetch stats in parallel
  const [todayBookings, totalRevenue, upcomingBookings, totalCustomers] =
    await Promise.all([
      // today's bookings count
      pool.query(
        `SELECT COUNT(*) FROM bookings
         WHERE tenant_id = $1
         AND booked_at BETWEEN $2 AND $3
         AND status = 'confirmed'`,
        [tenant.id, todayStart, todayEnd]
      ),
      // total revenue
      pool.query(
        `SELECT COALESCE(SUM(s.price), 0) as total
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.tenant_id = $1 AND b.status = 'confirmed'`,
        [tenant.id]
      ),
      // next 5 upcoming bookings with details
      pool.query(
        `SELECT
           b.id,
           b.client_name,
           b.client_email,
           b.booked_at,
           b.status,
           s.name AS service_name,
           s.duration_mins,
           s.price,
           st.name AS staff_name
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         JOIN staff st ON b.staff_id = st.id
         WHERE b.tenant_id = $1
           AND b.booked_at >= NOW()
           AND b.status = 'confirmed'
         ORDER BY b.booked_at ASC
         LIMIT 5`,
        [tenant.id]
      ),
      // total unique customers
      pool.query(
        `SELECT COUNT(DISTINCT client_email) FROM bookings
         WHERE tenant_id = $1`,
        [tenant.id]
      ),
    ]);

  const stats = {
    todayCount: parseInt(todayBookings.rows[0].count),
    revenue: parseFloat(totalRevenue.rows[0].total),
    customerCount: parseInt(totalCustomers.rows[0].count),
    upcomingCount: upcomingBookings.rows.length,
  };

  const upcoming = upcomingBookings.rows;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's bookings", value: stats.todayCount },
          { label: 'Upcoming', value: stats.upcomingCount },
          { label: 'Total customers', value: stats.customerCount },
          { label: 'Total revenue', value: formatEUR(stats.revenue) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upcoming bookings</h2>
        </div>
        {upcoming.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No upcoming bookings yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                    {booking.client_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.client_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.service_name} · {booking.staff_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.booked_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(booking.booked_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
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