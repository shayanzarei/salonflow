import { CalendarIcon, ClockIcon, UsersIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DashboardPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todayBookings, totalRevenue, upcomingBookings, totalCustomers] =
    await Promise.all([
      pool.query(
        `SELECT COUNT(*) FROM bookings
         WHERE tenant_id = $1 AND booked_at BETWEEN $2 AND $3 AND status = 'confirmed'`,
        [tenant.id, todayStart, todayEnd]
      ),
      pool.query(
        `SELECT COALESCE(SUM(s.price), 0) as total
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.tenant_id = $1 AND b.status = 'confirmed'`,
        [tenant.id]
      ),
      pool.query(
        `SELECT
           b.id, b.client_name, b.client_email, b.booked_at, b.status,
           s.name AS service_name, s.duration_mins, s.price,
           st.name AS staff_name
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         JOIN staff st ON b.staff_id = st.id
         WHERE b.tenant_id = $1
           AND b.booked_at >= NOW()
           AND b.status = 'confirmed'
         ORDER BY b.booked_at ASC
         LIMIT 6`,
        [tenant.id]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT client_email) FROM bookings WHERE tenant_id = $1`,
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
  const brand = tenant.primary_color ?? "#7C3AED";

  const statCards = [
    {
      label: "Today's Bookings",
      value: stats.todayCount,
      icon: <CalendarIcon size={18} color="#6366F1" />,
      iconBg: "#EEF2FF",
      change: "+12%",
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
    {
      label: "Upcoming",
      value: stats.upcomingCount,
      icon: <ClockIcon size={18} color="#7C3AED" />,
      iconBg: "#F5F3FF",
      change: "+8%",
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
    {
      label: "Total Customers",
      value: stats.customerCount.toLocaleString(),
      icon: <UsersIcon size={18} color="#F59E0B" />,
      iconBg: "#FFF7ED",
      change: "+23%",
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
    {
      label: "Total Revenue",
      value: `€${stats.revenue.toLocaleString("en", { minimumFractionDigits: 0 })}`,
      icon: <span style={{ fontSize: 16, fontWeight: 700, color: "#10B981" }}>€</span>,
      iconBg: "#F0FDF4",
      change: "+18%",
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 4px",
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: 14, color: "#999", margin: 0 }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div
        className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
      >
        {statCards.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: stat.changeColor,
                  background: stat.changeBg,
                  padding: "3px 8px",
                  borderRadius: 100,
                }}
              >
                {stat.change}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#999", margin: "0 0 6px" }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111",
                margin: 0,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
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
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f5f5f5",
          }}
        >
          <h2
            style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: 0 }}
          >
            Upcoming Bookings
          </h2>
          <Link
            href="/bookings"
            style={{
              fontSize: 13,
              color: brand,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View All →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#aaa",
              fontSize: 14,
            }}
          >
            No upcoming bookings yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                {["Client", "Service", "Staff", "Date & Time"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 24px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcoming.map((booking) => (
                <tr
                  key={booking.id}
                  style={{ borderBottom: "1px solid #f9f9f9" }}
                >
                  <td style={{ padding: "16px 24px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: brand,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 600,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {booking.client_name.charAt(0)}
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#111",
                            margin: 0,
                          }}
                        >
                          {booking.client_name}
                        </p>
                        <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                          {booking.client_email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                      {booking.service_name}
                    </p>
                    <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                      {booking.duration_mins} min · €{booking.price}
                    </p>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#555",
                        }}
                      >
                        {booking.staff_name.charAt(0)}
                      </div>
                      <span style={{ fontSize: 14, color: "#333" }}>
                        {booking.staff_name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#111",
                        margin: 0,
                      }}
                    >
                      {new Date(booking.booked_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                      {new Date(booking.booked_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
