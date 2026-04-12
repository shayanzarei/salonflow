import pool from "@/lib/db";
import { notFound } from "next/navigation";

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; token?: string }>;
}) {
  const { booking, token } = await searchParams;

  if (!booking || !token) notFound();

  const result = await pool.query(
    `SELECT
       b.*,
       s.name AS service_name,
       s.price,
       s.duration_mins,
       st.name AS staff_name,
       t.primary_color,
       t.address
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     JOIN tenants t ON b.tenant_id = t.id
     WHERE b.id = $1 AND b.cancellation_token = $2`,
    [booking, token]
  );

  const bookingData = result.rows[0];
  if (!bookingData) notFound();

  const alreadyCancelled = bookingData.status === "cancelled";
  const brand = bookingData.primary_color ?? "#7C3AED";
  const bookedAt = new Date(bookingData.booked_at);

  if (alreadyCancelled) {
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
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 36 }}>✓</span>
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 12px",
          }}
        >
          Already cancelled
        </h1>
        <p style={{ fontSize: 16, color: "#888", margin: "0 0 32px" }}>
          This appointment has already been cancelled.
        </p>
        <a
          href="/"
          style={{
            padding: "14px 36px",
            background: brand,
            color: "white",
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to home
        </a>
      </div>
    );
  }

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
      {/* Warning icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <span style={{ color: "white", fontSize: 36 }}>⚠</span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#111",
          margin: "0 0 12px",
          textAlign: "center",
        }}
      >
        Cancel appointment?
      </h1>
      <p
        style={{
          fontSize: 16,
          color: "#888",
          margin: "0 0 36px",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        Are you sure you want to cancel this booking?
        <br />
        This action cannot be undone.
      </p>

      {/* Booking details card */}
      <div
        style={{
          background: "white",
          border: "1px solid #f0f0f0",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 480,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "#aaa",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 20px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ℹ Appointment Details
        </p>

        {/* Service row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: "1px solid #f5f5f5",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${brand}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18, color: brand }}>✂</span>
            </div>
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 4px",
                }}
              >
                {bookingData.service_name}
              </h3>
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                with {bookingData.staff_name}
              </p>
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: brand }}>
            €{bookingData.price}
          </span>
        </div>

        {/* Details grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
        >
          <div>
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
              📅 Date
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {bookedAt.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
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
              🕐 Time
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {bookedAt.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
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
              ⏱ Duration
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {bookingData.duration_mins} minutes
            </p>
          </div>
          {bookingData.address && (
            <div>
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
                📍 Location
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                {bookingData.address.split(",")[0]}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation policy */}
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          borderRadius: 16,
          padding: "16px 20px",
          width: "100%",
          maxWidth: 480,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#DC2626",
            margin: "0 0 6px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ⚠ Cancellation Policy
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#DC2626",
            margin: 0,
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          Cancellations made less than 24 hours before your appointment may be
          subject to a cancellation fee.
        </p>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          width: "100%",
          maxWidth: 480,
          marginBottom: 20,
        }}
      >
        <a
          href="/"
          style={{
            flex: 1,
            padding: "16px",
            background: "white",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          ← Keep appointment
        </a>
        <form action="/api/bookings/cancel" method="POST" style={{ flex: 1 }}>
          <input type="hidden" name="booking_id" value={booking} />
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              background: "#EF4444",
              color: "white",
              border: "none",
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            ✕ Yes, cancel
          </button>
        </form>
      </div>

      {/* Reschedule link */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 8px" }}>
          Need to reschedule instead?
        </p>
        <a
          href="/book"
          style={{
            fontSize: 14,
            color: brand,
            fontWeight: 500,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          📅 Choose a new time
        </a>
      </div>
    </div>
  );
}
