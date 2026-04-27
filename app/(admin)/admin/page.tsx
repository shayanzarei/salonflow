import { Card } from "@/components/ds/Card";
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
        <h1 className="text-h2 font-bold text-ink-900">
          Platform overview
        </h1>
        <p className="mt-1 text-body-sm text-ink-500 sm:text-body">
          All salons on SoloHub
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} variant="outlined">
            <p className="text-body-sm text-ink-500">{stat.label}</p>
            <p className="mt-1 text-h2 font-semibold text-ink-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
