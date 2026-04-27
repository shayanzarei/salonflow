import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import {
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  TrendingUpIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getPackageLimit } from "@/lib/packages";
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

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string }>;
}) {
  const { invited } = await searchParams;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const staffResult = await pool.query(
    `SELECT
       s.*,
       COUNT(b.id) FILTER (WHERE b.booked_at >= NOW() AND b.status = 'confirmed') AS upcoming_count,
       COALESCE(SUM(sv.price) FILTER (WHERE b.status = 'confirmed'), 0) AS total_revenue,
       COUNT(b.id) FILTER (WHERE b.booked_at >= NOW() - INTERVAL '7 days' AND b.status = 'confirmed') AS week_appointments
     FROM staff s
     LEFT JOIN bookings b ON b.staff_id = s.id
     LEFT JOIN services sv ON b.service_id = sv.id
     WHERE s.tenant_id = $1
     GROUP BY s.id
     ORDER BY s.name`,
    [tenant.id]
  );

  const staffList = staffResult.rows;
  const maxStaff = await getPackageLimit(tenant, "max_staff");
  const canAddStaff = maxStaff === null || staffList.length < maxStaff;
  const totalWeekAppointments = staffList.reduce(
    (sum, s) => sum + parseInt(s.week_appointments),
    0
  );
  const activeStaff = staffList.filter((s) => s.password_hash).length;
  const totalRevenue = staffList.reduce(
    (sum, s) => sum + parseFloat(s.total_revenue),
    0
  );

  return (
    <div>
      {invited === "1" ? (
        <div
          className="mb-4 rounded-sm bg-success-50 px-4 py-3 text-body-sm text-success-700 sm:mb-6"
          role="status"
        >
          Invite sent. Your team member will receive an email to set their password
          and access the staff portal.
        </div>
      ) : null}
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-h2 font-bold text-ink-900 sm:text-h1">Staff</h1>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-caption font-medium sm:text-body-sm"
            style={{
              color: brand,
              background: `${brand}15`,
            }}
          >
            {staffList.length} Team Members
          </span>
        </div>
        {canAddStaff ? (
          <Button
            asChild
            variant="primary"
            size="md"
            style={{ backgroundColor: brand }}
            className="shrink-0"
          >
            <Link href="/staff/new">
              <PlusIcon size={14} /> Add Staff Member
            </Link>
          </Button>
        ) : (
          <Badge variant="neutral">
            Staff limit reached ({maxStaff})
          </Badge>
        )}
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Total Appointments (This Week)",
            value: totalWeekAppointments,
            icon: <CheckCircleIcon size={20} color="var(--color-success-600)" />,
            iconBg: "var(--color-success-50)",
          },
          {
            label: "Active Staff Today",
            value: `${activeStaff} / ${staffList.length}`,
            icon: <UsersIcon size={20} color="var(--color-info-600)" />,
            iconBg: "var(--color-info-50)",
          },
          {
            label: "Total Revenue Generated",
            value: `€${totalRevenue.toLocaleString("en", { minimumFractionDigits: 0 })}`,
            icon: <TrendingUpIcon size={20} color='var(--color-brand-600)' />,
            iconBg: 'var(--color-brand-50)',
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            variant="outlined"
            className="flex items-center justify-between"
          >
            <div>
              <p className="mb-2 text-caption text-ink-500">{stat.label}</p>
              <p className="text-h2 font-bold text-ink-900">{stat.value}</p>
            </div>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
              style={{ background: stat.iconBg }}
            >
              {stat.icon}
            </div>
          </Card>
        ))}
      </div>

      {/* Team directory */}
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="text-body-sm font-semibold text-ink-900">
            Team Directory
          </h2>
        </div>

        {staffList.length === 0 ? (
          <div className="px-6 py-[60px] text-center">
            <div className="mb-3 flex justify-center">
              <UsersIcon size={36} color="var(--color-ink-300)" />
            </div>
            <h3 className="mb-2 text-body font-semibold text-ink-900">
              No team members yet
            </h3>
            <p className="mb-5 text-body-sm text-ink-500">
              Add your first staff member to get started
            </p>
            {canAddStaff ? (
              <Button
                asChild
                variant="primary"
                size="md"
                style={{ backgroundColor: brand }}
              >
                <Link href="/staff/new">
                  <PlusIcon size={14} /> Add Staff Member
                </Link>
              </Button>
            ) : (
              <Badge variant="neutral">
                Staff limit reached ({maxStaff})
              </Badge>
            )}
          </div>
        ) : (
          <div>
            {staffList.map((member, i) => {
              const color = STAFF_COLORS[i % STAFF_COLORS.length];
              const hasPortal = !!member.password_hash;
              const upcomingCount = parseInt(member.upcoming_count);

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 border-b border-ink-100 px-4 py-4 transition-colors last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  {/* Left: avatar + info */}
                  <div className="flex min-w-0 items-center gap-3.5">
                    <Avatar
                      name={member.name}
                      size="lg"
                      className="h-12 w-12 text-body font-bold"
                      style={{ background: `${color}20`, color }}
                    />
                    <div>
                      <p className="mb-0.5 text-body-sm font-semibold text-ink-900">
                        {member.name}
                      </p>
                      <p className="text-caption text-ink-600">
                        {member.role}
                      </p>
                      <p className="text-caption text-ink-400">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: portal status + upcoming + menu */}
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
                    <Badge variant={hasPortal ? "success" : "neutral"}>
                      {hasPortal ? "Active" : "Not set"}
                    </Badge>

                    <div className="min-w-[80px] text-right">
                      <p className="text-caption font-semibold text-ink-900">
                        {upcomingCount} upcoming
                      </p>
                      <p className="text-caption text-ink-400">
                        appointments
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-1.5">
                      <Link
                        href={`/staff/${member.id}`}
                        className="inline-flex items-center gap-1 rounded-sm px-3.5 py-1.5 text-caption font-medium no-underline"
                        style={{
                          color: brand,
                          border: `1px solid ${brand}30`,
                          background: `${brand}08`,
                        }}
                      >
                        <EyeIcon size={13} /> View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
