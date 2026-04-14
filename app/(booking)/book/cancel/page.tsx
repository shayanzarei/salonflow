import { CalendarIcon, ClockIcon, MapPinIcon, ScissorsIcon } from "@/components/ui/Icons";
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 sm:py-12">
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
        <h1 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
          Already cancelled
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500 sm:text-base">
          This appointment has already been cancelled.
        </p>
        <a
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white no-underline sm:px-10 sm:text-[15px]"
          style={{ background: brand }}
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10 sm:px-6 sm:py-12">
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
      <h1 className="mb-3 max-w-md text-balance text-center text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
        Cancel appointment?
      </h1>
      <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-gray-500 sm:mb-9 sm:text-base">
        Are you sure you want to cancel this booking? This action cannot be
        undone.
      </p>

      <div className="mb-4 w-full max-w-md rounded-[20px] border border-gray-100 bg-white p-5 sm:p-7">
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

        <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
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
              <ScissorsIcon size={18} color={brand} />
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
          <span className="text-lg font-bold sm:text-xl" style={{ color: brand }}>
            €{bookingData.price}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              <CalendarIcon size={12} /> Date
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
              <ClockIcon size={12} /> Time
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
              <ClockIcon size={12} /> Duration
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
                <MapPinIcon size={12} /> Location
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
      <div className="mb-7 w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
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

      <div className="mb-5 flex w-full max-w-md flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-3">
        <a
          href="/"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-800 no-underline sm:text-[15px]"
        >
          ← Keep appointment
        </a>
        <form action="/api/bookings/cancel" method="POST" className="flex-1">
          <input type="hidden" name="booking_id" value={booking} />
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-none bg-red-500 px-4 py-3 text-sm font-semibold text-white"
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
          <CalendarIcon size={14} /> Choose a new time
        </a>
      </div>
    </div>
  );
}
