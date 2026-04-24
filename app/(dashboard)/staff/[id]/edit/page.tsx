import StaffEditForm from "@/components/dashboard/StaffEditForm";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`,
    [id, tenant.id]
  );

  const member = result.rows[0];
  if (!member) notFound();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link
          href={`/staff/${id}`}
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
          ← Back to {member.name}
        </Link>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 4px",
          }}
        >
          Edit Team Member
        </h1>
        <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
          Update staff member information, roles, and portal access.
        </p>
      </div>

      <StaffEditForm
        staffId={id}
        tenantId={tenant.id}
        brand={tenant.primary_color ?? 'var(--color-brand-600)'}
        hasPortal={!!member.password_hash}
        initial={{
          name: member.name ?? "",
          role: member.role ?? "",
          email: member.email ?? "",
          phone: member.phone ?? "",
          avatar_url: member.avatar_url ?? "",
          avatar_color:
            member.avatar_color ?? tenant.primary_color ?? 'var(--color-brand-600)',
          bio: member.bio ?? "",
        }}
      />
    </div>
  );
}
