import BookingProgress from "@/components/booking/BookingProgress";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ChooseTimePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service, staff } = await searchParams;
  const brand = tenant.primary_color ?? "#7C3AED";

  const [serviceResult, staffResult] = await Promise.all([
    pool.query(`SELECT * FROM services WHERE id = $1 AND tenant_id = $2`, [
      service,
      tenant.id,
    ]),
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [
      staff,
      tenant.id,
    ]),
  ]);

  const selectedService = serviceResult.rows[0];
  const selectedStaff = staffResult.rows[0];
  if (!selectedService || !selectedStaff) notFound();

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <a
          href={`/book/staff?service=${service}`}
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

        <BookingProgress step={3} brand={brand} />

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 12px",
            }}
          >
            Choose a time
          </h1>
          <p style={{ fontSize: 16, color: "#888", margin: 0 }}>
            {selectedService.name} <span style={{ color: "#bbb" }}>with</span>{" "}
            {selectedStaff.name}
          </p>
        </div>

        <TimeSlotPicker service={service!} staff={staff!} brand={brand} />
      </div>
    </div>
  );
}
