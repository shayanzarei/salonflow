import StaffTabs from "@/components/dashboard/StaffTabs";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { CalendarIcon, TrendingUpIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const STAFF_COLORS = [
  'var(--color-brand-600)',
  'var(--color-accent-500)',
  "var(--color-success-600)",
  "var(--color-danger-600)",
  "var(--color-info-600)",
  "var(--color-danger-700)",
  'var(--color-brand-500)',
  "var(--color-success-700)",
];

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const [staffResult, allStaffResult] = await Promise.all([
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [
      id,
      tenant.id,
    ]),
    pool.query(`SELECT id FROM staff WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
  ]);

  const member = staffResult.rows[0];
  if (!member) notFound();

  const staffIndex = allStaffResult.rows.findIndex((s) => s.id === id);
  const color = STAFF_COLORS[staffIndex % STAFF_COLORS.length];
  const initials = member.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activityResult = await pool.query(
    `SELECT * FROM staff_activity WHERE staff_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [id]
  );

  const [statsResult, upcomingResult, pastResult, hoursResult] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*) AS total_bookings,
         COUNT(*) FILTER (WHERE b.booked_at >= NOW() - INTERVAL '7 days' AND b.booked_at <= NOW() + INTERVAL '7 days') AS this_week,
         COALESCE(SUM(s.price) FILTER (WHERE b.status = 'confirmed'), 0) AS revenue
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1`,
      [id]
    ),
    pool.query(
      `SELECT
         b.id, b.client_name, b.client_email, b.booked_at, b.status,
         s.name AS service_name, s.duration_mins, s.price
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1 AND b.booked_at >= NOW() AND b.status = 'confirmed'
       ORDER BY b.booked_at ASC
       LIMIT 20`,
      [id]
    ),
    pool.query(
      `SELECT
         b.id, b.client_name, b.client_email, b.booked_at, b.status,
         s.name AS service_name, s.duration_mins, s.price
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1 AND b.booked_at < NOW()
       ORDER BY b.booked_at DESC
       LIMIT 20`,
      [id]
    ),
    pool.query(
      `SELECT day_of_week, start_time, end_time, is_working
       FROM staff_working_hours
       WHERE staff_id = $1
       ORDER BY day_of_week`,
      [id]
    ),
  ]);

  const stats = statsResult.rows[0];
  const upcomingBookings = upcomingResult.rows;
  const pastBookings = pastResult.rows;
  const workingHours = hoursResult.rows;

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <Link
          href="/staff"
          className="inline-flex min-h-10 items-center gap-1.5 text-body-sm text-ink-500 no-underline"
        >
          ← Back to Staff
        </Link>
      </div>

      {/* Profile card */}
      <Card variant="outlined" className="mb-5 p-4 sm:mb-6 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Avatar + name block */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-[72px] w-[72px] shrink-0">
              <div
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[22px] font-bold"
                style={{ background: `${color}20`, color }}
              >
                {initials}
              </div>
              <div
                className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-ink-0 bg-success-600"
                aria-hidden
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h1 className="text-balance text-h2 font-bold text-ink-900">
                    {member.name}
                  </h1>
                  <p className="mt-1 text-body-sm text-ink-500">{member.role}</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:justify-end">
                  <Button asChild variant="secondary" size="md">
                    <Link href={`/staff/${id}/edit`}>Edit Profile</Link>
                  </Button>
                  <form
                    action="/api/staff/delete"
                    method="POST"
                    className="w-full sm:w-auto"
                  >
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="tenant_id" value={tenant.id} />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="md"
                      className="w-full text-danger-600 sm:w-auto"
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>

            {/* Contact info */}
            <div className="flex flex-col gap-2 text-body-sm text-ink-500 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
              <span className="flex min-w-0 items-start gap-1.5 break-all">
                <span className="shrink-0" aria-hidden>
                  ✉
                </span>
                {member.email}
              </span>
              {member.phone && (
                <span className="flex items-center gap-1.5 break-all">
                  <span aria-hidden>📞</span>
                  {member.phone}
                </span>
              )}
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" dot>
                Available
              </Badge>
              <Badge variant={member.password_hash ? "brand" : "neutral"}>
                🔑 Portal {member.password_hash ? "Active" : "Not set"}
              </Badge>
            </div>
        </div>
      </Card>

      {/* stat cards */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-3">
        {[
          {
            label: "TOTAL BOOKINGS",
            value: parseInt(stats.total_bookings).toLocaleString(),
            icon: <CalendarIcon size={16} color={brand} />,
            iconBg: "var(--color-info-50)",
          },
          {
            label: "THIS WEEK",
            value: stats.this_week,
            icon: <TrendingUpIcon size={16} color='var(--color-accent-500)' />,
            iconBg: "var(--color-warning-50)",
          },
          {
            label: "REVENUE (MTD)",
            value: `€${parseFloat(stats.revenue).toLocaleString("en", { minimumFractionDigits: 0 })}`,
            icon: <span className="text-caption font-bold text-success-600">€</span>,
            iconBg: "var(--color-success-50)",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            variant="outlined"
            className="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
                {stat.label}
              </p>
              <p className="text-h2 font-bold text-ink-900">{stat.value}</p>
            </div>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm"
              style={{ background: stat.iconBg }}
            >
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <StaffTabs
        staffId={id}
        tenantId={tenant.id}
        staffName={member.name}
        staffEmail={member.email}
        hasPortal={!!member.password_hash}
        upcomingBookings={upcomingBookings}
        pastBookings={pastBookings}
        brand={brand}
        activity={activityResult.rows}
        workingHours={workingHours}
      />
    </div>
  );
}
