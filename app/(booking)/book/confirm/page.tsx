import BookingProgress from "@/components/booking/BookingProgress";
import pool from "@/lib/db";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string; time?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service, staff, time } = await searchParams;
  const brand = tenant.primary_color ?? "#7C3AED";

  const [serviceResult, staffResult] = await Promise.all([
    pool.query(
      `SELECT * FROM services WHERE id = $1 AND tenant_id = $2 AND ${bookableServiceSql()}`,
      [service, tenant.id]
    ),
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [
      staff,
      tenant.id,
    ]),
  ]);

  const selectedService = serviceResult.rows[0];
  const selectedStaff = staffResult.rows[0];
  if (!selectedService || !selectedStaff || !time) notFound();

  const bookedAt = new Date(time);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Back */}
        <a
          href={`/book/time?service=${service}&staff=${staff}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#666",
            fontSize: 14,
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          ← Back
        </a>

        {/* Progress */}
        <BookingProgress step={4} brand={brand} />

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 12px",
            }}
          >
            Confirm your booking
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: 0 }}>
            Review your appointment details before confirming
          </p>
        </div>

        {/* Two column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Left — Booking summary */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{ background: brand, padding: "28px 32px" }}>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 6px",
                }}
              >
                {tenant.name}
              </p>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                }}
              >
                Booking Summary
              </h2>
            </div>

            {/* Details */}
            <div style={{ padding: 32 }}>
              {/* Staff */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 28,
                  paddingBottom: 28,
                  borderBottom: "1px solid #f5f5f5",
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
                    fontSize: 18,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {selectedStaff.name.charAt(0)}
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
                    {selectedStaff.name}
                  </p>
                  <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                    {selectedStaff.role}
                  </p>
                </div>
              </div>

              {/* Rows */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  { label: "Service", value: selectedService.name },
                  {
                    label: "Date",
                    value: bookedAt.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  {
                    label: "Time",
                    value: bookedAt.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  },
                  {
                    label: "Duration",
                    value: `${selectedService.duration_mins} mins`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 14, color: "#888" }}>
                      {item.label}
                    </span>
                    <span
                      style={{ fontSize: 14, fontWeight: 500, color: "#111" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#111" }}
                  >
                    Total
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: brand }}>
                    €{selectedService.price}
                  </span>
                </div>
              </div>

              {/* Location */}
              {tenant.address && (
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 24,
                    borderTop: "1px solid #f5f5f5",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 8px",
                    }}
                  >
                    Location
                  </p>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>
                    📍 {tenant.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Customer form */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: 20,
              padding: 32,
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 6px",
              }}
            >
              Your details
            </h2>
            <p style={{ fontSize: 14, color: "#888", margin: "0 0 28px" }}>
              Enter your information to complete the booking
            </p>

            <form
              action="/api/bookings"
              method="POST"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <input type="hidden" name="service_id" value={service} />
              <input type="hidden" name="staff_id" value={staff} />
              <input type="hidden" name="booked_at" value={time} />

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  Full name
                </label>
                <input
                  type="text"
                  name="client_name"
                  required
                  placeholder="Sarah Johnson"
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "12px 16px",
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
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="client_email"
                  required
                  placeholder="sarah@example.com"
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "12px 16px",
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
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  Phone number{" "}
                  <span style={{ color: "#bbb", fontWeight: 400 }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="tel"
                  name="client_phone"
                  placeholder="+31 6 12345678"
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 14,
                    color: "#111",
                    background: "white",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Cancellation policy */}
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#888",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  By confirming, you agree to our cancellation policy. Free
                  cancellation up to 24 hours before your appointment.
                </p>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "16px",
                  background: brand,
                  color: "white",
                  border: "none",
                  borderRadius: 100,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Confirm booking →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
