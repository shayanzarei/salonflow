import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;
  const tenant = await getTenant();
  const brand = tenant?.primary_color ?? "#7C3AED";

  // fetch booking details if we have a booking id
  let bookingData = null;
  if (booking) {
    const result = await pool.query(
      `SELECT
         b.*,
         s.name AS service_name,
         s.duration_mins,
         s.price,
         st.name AS staff_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.id = $1`,
      [booking]
    );
    bookingData = result.rows[0] ?? null;
  }

  const bookedAt = bookingData ? new Date(bookingData.booked_at) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      {/* Success icon */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: brand,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontSize: 36 }}>✓</span>
        </div>
        {/* Notification badge */}
        <div
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#F59E0B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>
            1
          </span>
        </div>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 40,
          fontWeight: 700,
          color: "#111",
          margin: "0 0 12px",
          textAlign: "center",
        }}
      >
        Booking confirmed!
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#888",
          margin: "0 0 40px",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        We've sent a confirmation email with all the details.
        <br />
        We can't wait to see you!
      </p>

      {/* Booking details card */}
      {bookingData && bookedAt && (
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: 20,
            padding: 32,
            width: "100%",
            maxWidth: 480,
            marginBottom: 32,
          }}
        >
          {/* Service + staff */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
              paddingBottom: 24,
              borderBottom: "1px solid #f5f5f5",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${brand}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 20, color: brand }}>✂</span>
            </div>
            <div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 4px",
                }}
              >
                {bookingData.service_name}
              </h3>
              <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
                with {bookingData.staff_name}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {[
              {
                icon: "📅",
                label: "Date",
                value: bookedAt.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              {
                icon: "🕐",
                label: "Time",
                value: bookedAt.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                }),
              },
              {
                icon: "⏱",
                label: "Duration",
                value: `${bookingData.duration_mins} minutes`,
              },
              {
                icon: "💶",
                label: "Total",
                value: `€${bookingData.price}`,
                colored: true,
              },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: 12,
                    color: "#aaa",
                    margin: "0 0 4px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 12 }}>{item.icon}</span> {item.label}
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: item.colored ? brand : "#111",
                    margin: 0,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Location */}
          {tenant?.address && (
            <div style={{ paddingTop: 20, borderTop: "1px solid #f5f5f5" }}>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 6px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                📍 Location
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#555",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {tenant.address}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CTA buttons */}

      <a
        href="/"
        style={{
          display: "inline-block",
          padding: "16px 48px",
          background: brand,
          color: "white",
          borderRadius: 100,
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
          marginBottom: 20,
        }}
      >
        Back to home
      </a>

      {/* Secondary actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <a
          href={
            bookedAt
              ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingData?.service_name ?? "Appointment")}&dates=${bookedAt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${bookedAt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
              : "#"
          }
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: brand,
            fontSize: 14,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          📅 Add to calendar
        </a>
        <span style={{ color: "#ddd" }}>|</span>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`I just booked at ${bookingData?.salon_name ?? "the salon"}!`)}`}
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: brand,
            fontSize: 14,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          🔗 Share
        </a>
      </div>
    </div>
  );
}
