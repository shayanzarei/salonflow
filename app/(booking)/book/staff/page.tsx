import BookingProgress from "@/components/booking/BookingProgress";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ChooseStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service } = await searchParams;
  const brand = tenant.primary_color ?? "#7C3AED";

  const [staffResult, serviceResult] = await Promise.all([
    pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
    service
      ? pool.query(`SELECT * FROM services WHERE id = $1 AND tenant_id = $2`, [
          service,
          tenant.id,
        ])
      : Promise.resolve({ rows: [] }),
  ]);

  const staffList = staffResult.rows;
  const selectedService = serviceResult.rows[0] ?? null;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        {/* Back */}

        <a
          href="/book"
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
        <BookingProgress step={2} brand={brand} />

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
            Choose a staff member
          </h1>
          {selectedService && (
            <p style={{ fontSize: 15, color: "#888", margin: 0 }}>
              Selected:{" "}
              <strong style={{ color: "#555" }}>{selectedService.name}</strong>
            </p>
          )}
        </div>

        {/* Staff grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {staffList.map((member) => (
            <a
              key={member.id}
              href={`/book/time?service=${service}&staff=${member.id}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "white",
                border: "1px solid #f0f0f0",
                borderRadius: 16,
                padding: "32px 24px",
                textDecoration: "none",
                transition: "border-color 0.2s",
                cursor: "pointer",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: brand,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 28,
                  fontWeight: 600,
                  marginBottom: 16,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  member.name.charAt(0)
                )}
              </div>

              {/* Name & role */}
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 6px",
                  textAlign: "center",
                }}
              >
                {member.name}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#888",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {member.role}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
