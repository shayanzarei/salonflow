import StaffTabs from "@/components/dashboard/StaffTabs";
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

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

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

  const [statsResult, upcomingResult, pastResult] = await Promise.all([
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
  ]);

  const stats = statsResult.rows[0];
  const upcomingBookings = upcomingResult.rows;
  const pastBookings = pastResult.rows;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/staff"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#888",
            textDecoration: "none",
            marginBottom: 16,
          }}
        >
          ← Back to Staff
        </Link>
      </div>

      {/* Profile card */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          padding: 24,
          marginBottom: 20,
          flex: 3,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left: profile info */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: `${color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color,
                    fontWeight: 700,
                    fontSize: 22,
                  }}
                >
                  {initials}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#10B981",
                    border: "2px solid white",
                  }}
                />
              </div>

              {/* Name + actions */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#111",
                        margin: "0 0 4px",
                      }}
                    >
                      {member.name}
                    </h1>
                    <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
                      {member.role}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/staff/${id}/edit`}
                      style={{
                        padding: "8px 16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#555",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      Edit Profile
                    </Link>
                    <form
                      action="/api/staff/delete"
                      method="POST"
                      style={{ display: "inline" }}
                    >
                      <input type="hidden" name="id" value={id} />
                      <input type="hidden" name="tenant_id" value={tenant.id} />
                      <button
                        type="submit"
                        style={{
                          padding: "8px 16px",
                          border: "1px solid #FECACA",
                          borderRadius: 8,
                          fontSize: 13,
                          color: "#EF4444",
                          background: "white",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "#888",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                ✉ {member.email}
              </span>
              {member.phone && (
                <span
                  style={{
                    fontSize: 13,
                    color: "#888",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  📞 {member.phone}
                </span>
              )}
            </div>

            {/* Status badges */}
            <div style={{ display: "flex", gap: 8 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#059669",
                  background: "#ECFDF5",
                  padding: "4px 12px",
                  borderRadius: 100,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10B981",
                  }}
                />
                Available
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  color: member.password_hash ? brand : "#999",
                  background: member.password_hash ? `${brand}15` : "#f5f5f5",
                  padding: "4px 12px",
                  borderRadius: 100,
                }}
              >
                🔑 Portal {member.password_hash ? "Active" : "Not set"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          width: "100%",
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "TOTAL BOOKINGS",
            value: parseInt(stats.total_bookings).toLocaleString(),
            icon: "📅",
            iconBg: "#EEF2FF",
            iconColor: brand,
          },
          {
            label: "THIS WEEK",
            value: stats.this_week,
            icon: "🔄",
            iconBg: "#FFF7ED",
            iconColor: "#F59E0B",
          },
          {
            label: "REVENUE (MTD)",
            value: `€${parseFloat(stats.revenue).toLocaleString("en", { minimumFractionDigits: 0 })}`,
            icon: "€",
            iconBg: "#ECFDF5",
            iconColor: "#10B981",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#888",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  margin: "0 0 4px",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontSize: 20,
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
                width: 36,
                height: 36,
                borderRadius: 10,
                background: stat.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
                color: stat.iconColor,
              }}
            >
              {stat.icon}
            </div>
          </div>
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
      />
    </div>
  );
}
