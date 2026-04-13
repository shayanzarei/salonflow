import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const STAFF_COLORS = [
  "#7C3AED",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export default async function StaffPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Staff</h1>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:text-[13px]"
            style={{
              color: brand,
              background: `${brand}15`,
            }}
          >
            {staffList.length} Team Members
          </span>
        </div>
        <Link
          href="/staff/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-sm font-medium text-white no-underline"
          style={{ background: brand }}
        >
          + Add Staff Member
        </Link>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Total Appointments (This Week)",
            value: totalWeekAppointments,
            icon: "✅",
            iconBg: "#ECFDF5",
          },
          {
            label: "Active Staff Today",
            value: `${activeStaff} / ${staffList.length}`,
            icon: "👥",
            iconBg: "#EEF2FF",
          },
          {
            label: "Total Revenue Generated",
            value: `€${totalRevenue.toLocaleString("en", { minimumFractionDigits: 0 })}`,
            icon: "📈",
            iconBg: "#F5F3FF",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: 13, color: "#888", margin: "0 0 8px" }}>
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                }}
              >
                {stat.value}
              </p>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: stat.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Team directory */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}
          >
            Team Directory
          </h2>
        </div>

        {staffList.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>👥</p>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111",
                margin: "0 0 8px",
              }}
            >
              No team members yet
            </h3>
            <p style={{ fontSize: 14, color: "#888", margin: "0 0 20px" }}>
              Add your first staff member to get started
            </p>
            <Link
              href="/staff/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                background: brand,
                color: "white",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              + Add Staff Member
            </Link>
          </div>
        ) : (
          <div>
            {staffList.map((member, i) => {
              const color = STAFF_COLORS[i % STAFF_COLORS.length];
              const initials = member.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const hasPortal = !!member.password_hash;
              const upcomingCount = parseInt(member.upcoming_count);

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 border-b border-gray-50 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  {/* Left: avatar + info */}
                  <div className="flex min-w-0 items-center gap-3.5 sm:gap-3.5">
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: `${color}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: color,
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#111",
                          margin: "0 0 2px",
                        }}
                      >
                        {member.name}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#666",
                          margin: "0 0 1px",
                        }}
                      >
                        {member.role}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: portal status + upcoming + menu */}
                  <div className="flex flex-wrap items-center gap-3 sm:justify-end sm:gap-5">
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "4px 12px",
                        borderRadius: 100,
                        background: hasPortal ? "#ECFDF5" : "#F5F5F5",
                        color: hasPortal ? "#059669" : "#999",
                      }}
                    >
                      {hasPortal ? "Active" : "Not set"}
                    </span>

                    <div style={{ textAlign: "right", minWidth: 80 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111",
                          margin: 0,
                        }}
                      >
                        {upcomingCount} upcoming
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        appointments
                      </p>
                    </div>

                    {/* Quick actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link
                        href={`/staff/${member.id}`}
                        style={{
                          fontSize: 13,
                          color: brand,
                          textDecoration: "none",
                          fontWeight: 500,
                          padding: "6px 14px",
                          border: `1px solid ${brand}30`,
                          borderRadius: 8,
                          background: `${brand}08`,
                        }}
                      >
                        View 👀
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
