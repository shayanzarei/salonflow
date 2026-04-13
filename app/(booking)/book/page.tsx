import BookingProgress from "@/components/booking/BookingProgress";
import pool from "@/lib/db";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ChooseServicePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM services WHERE tenant_id = $1 AND ${bookableServiceSql()} ORDER BY name`,
    [tenant.id]
  );
  const services = result.rows;
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        {/* Back */}
        <a
          href="/"
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
        <BookingProgress step={1} brand={brand} />

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
            Choose a service
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: 0 }}>
            Select the treatment that's perfect for you
          </p>
        </div>

        {/* Services grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {services.map((service) => (
            <a
              key={service.id}
              href={`/book/staff?service=${service.id}`}
              style={{
                display: "block",
                background: "white",
                border: "1px solid #f0f0f0",
                borderRadius: 16,
                padding: "28px 32px",
                textDecoration: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 10px",
                }}
              >
                {service.name}
              </h3>
              {service.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: "#888",
                    lineHeight: 1.6,
                    margin: "0 0 24px",
                  }}
                >
                  {service.description}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                }}
              >
                <span style={{ fontSize: 13, color: "#aaa" }}>
                  {service.duration_mins} min
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, color: brand }}>
                  €{service.price}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
