import { formatEUR } from "@/lib/format-currency";
import pool from "@/lib/db";

export default async function AdminOverviewPage() {
  const [tenantsResult, bookingsResult, revenueResult] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM tenants WHERE is_admin = false`),
    pool.query(`SELECT COUNT(*) FROM bookings`),
    pool.query(
      `SELECT COALESCE(SUM(s.price), 0) as total
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.status = 'confirmed'`
    ),
  ]);

  const stats = [
    { label: 'Total salons', value: tenantsResult.rows[0].count },
    { label: 'Total bookings', value: bookingsResult.rows[0].count },
    {
      label: "Platform revenue",
      value: formatEUR(parseFloat(revenueResult.rows[0].total)),
    },
  ];

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Platform overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          All salons on SalonFlow
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
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
    </div>
  );
}