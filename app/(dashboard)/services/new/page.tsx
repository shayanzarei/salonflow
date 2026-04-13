import { AddServiceForm } from "@/components/dashboard/AddServiceForm";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewServicePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

  const staffResult = await pool.query(
    `SELECT id, name, role, avatar_url FROM staff WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/services"
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
          ← Back to Services
        </Link>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 6px",
          }}
        >
          Add New Service
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          Create a new service for your salon
        </p>
      </div>

      <AddServiceForm brand={brand} staff={staffResult.rows} />
    </div>
  );
}
