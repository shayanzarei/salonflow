import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

  const [bookingResult, servicesResult, staffResult] = await Promise.all([
    pool.query(
      `SELECT
         b.*,
         s.name AS service_name, s.price, s.duration_mins,
         st.name AS staff_name, st.role AS staff_role,
         st.id AS staff_id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.id = $1 AND b.tenant_id = $2`,
      [id, tenant.id]
    ),
    pool.query(`SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
    pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
  ]);

  const booking = bookingResult.rows[0];
  if (!booking) notFound();

  const services = servicesResult.rows;
  const staffList = staffResult.rows;

  // get client stats
  const clientStats = await pool.query(
    `SELECT
       COUNT(*) AS total_bookings,
       COALESCE(SUM(s.price), 0) AS total_spent,
       MIN(b.created_at) AS member_since
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.tenant_id = $1 AND b.client_email = $2`,
    [tenant.id, booking.client_email]
  );

  const stats = clientStats.rows[0];
  const initials = booking.client_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusConfig: Record<
    string,
    { color: string; bg: string; dot: string }
  > = {
    confirmed: { color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
    pending: { color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
    cancelled: { color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  };

  const sc = statusConfig[booking.status] ?? statusConfig.pending;
  const bookingRef = `#BK-${booking.id.split("-")[0].toUpperCase()}`;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/bookings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#888",
            textDecoration: "none",
            marginBottom: 12,
          }}
        >
          ← Back to Bookings
        </Link>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: 0 }}
          >
            Booking {bookingRef}
          </h1>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: sc.color,
              background: sc.bg,
              padding: "6px 14px",
              borderRadius: 100,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: sc.dot,
              }}
            />
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Client info card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 16 }}>👤</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Client Information
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 4px",
                  }}
                >
                  {booking.client_name}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#888",
                    margin: "0 0 2px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span>✉</span> {booking.client_email}
                </p>
                {booking.client_phone && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "#888",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <span>📞</span> {booking.client_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Stats pills */}
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { label: "TOTAL BOOKINGS", value: stats.total_bookings },
                {
                  label: "TOTAL SPENT",
                  value: `€${parseFloat(stats.total_spent).toFixed(0)}`,
                },
                {
                  label: "MEMBER SINCE",
                  value: new Date(stats.member_since).toLocaleDateString(
                    "en-US",
                    { month: "short", year: "numeric" }
                  ),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 4px",
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111",
                      margin: 0,
                    }}
                  >
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment details card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 16 }}>📅</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Appointment Details
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                {
                  icon: "✂",
                  label: "Service",
                  value: booking.service_name,
                  colored: false,
                },
                {
                  icon: "👤",
                  label: "Staff",
                  value: booking.staff_name,
                  colored: false,
                },
                {
                  icon: "📅",
                  label: "Date",
                  colored: false,
                  value: new Date(booking.booked_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  ),
                },
                {
                  icon: "🕐",
                  label: "Time",
                  colored: false,
                  value: new Date(booking.booked_at).toLocaleTimeString(
                    "en-US",
                    { hour: "numeric", minute: "2-digit" }
                  ),
                },
                {
                  icon: "⏱",
                  label: "Duration",
                  value: `${booking.duration_mins} minutes`,
                  colored: false,
                },
                {
                  icon: "💶",
                  label: "Price",
                  value: `€${booking.price}`,
                  colored: true,
                },
                ...(tenant.address
                  ? [
                      {
                        icon: "📍",
                        label: "Location",
                        value: tenant.address,
                        colored: false,
                      },
                    ]
                  : []),
              ].map((item, i) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: i < 6 ? "1px solid #f5f5f5" : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, color: "#666" }}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: item.colored ? brand : "#111",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-20 xl:self-start">
          {/* Edit booking card */}
          {booking.status !== "cancelled" && (
            <div
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid #f0f0f0",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <span style={{ fontSize: 16 }}>✏️</span>
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  Edit Booking
                </h2>
              </div>

              <form
                action="/api/bookings/update"
                method="POST"
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="tenant_id" value={tenant.id} />

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Service
                  </label>
                  <select
                    name="service_id"
                    defaultValue={booking.service_id}
                    style={{
                      width: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "#111",
                      background: "white",
                      outline: "none",
                    }}
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Staff
                  </label>
                  <select
                    name="staff_id"
                    defaultValue={booking.staff_id}
                    style={{
                      width: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "#111",
                      background: "white",
                      outline: "none",
                    }}
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={
                        new Date(booking.booked_at).toISOString().split("T")[0]
                      }
                      style={{
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 14,
                        color: "#111",
                        background: "white",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 8,
                      }}
                    >
                      Time
                    </label>
                    <input
                      type="time"
                      name="time"
                      defaultValue={new Date(booking.booked_at)
                        .toTimeString()
                        .slice(0, 5)}
                      style={{
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "10px 14px",
                        fontSize: 14,
                        color: "#111",
                        background: "white",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={booking.status}
                    style={{
                      width: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "#111",
                      background: "white",
                      outline: "none",
                    }}
                  >
                    <option value="confirmed">● Confirmed</option>
                    <option value="pending">● Pending</option>
                    <option value="cancelled">● Cancelled</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: brand,
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* Quick actions card */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 16 }}>⚡</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Quick Actions
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {booking.status !== "cancelled" && (
                <form action="/api/bookings/update-status" method="POST">
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input type="hidden" name="tenant_id" value={tenant.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <input
                    type="hidden"
                    name="redirect"
                    value={`/bookings/${booking.id}`}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: "white",
                      color: "#DC2626",
                      border: "1px solid #FECACA",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    ✕ Cancel Booking
                  </button>
                </form>
              )}

              <form action="/api/bookings/delete" method="POST">
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="tenant_id" value={tenant.id} />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "11px",
                    background: "#EF4444",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  🗑 Delete Booking
                </button>
              </form>

              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  textAlign: "center",
                  margin: "4px 0 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                ⚠ This action cannot be undone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
