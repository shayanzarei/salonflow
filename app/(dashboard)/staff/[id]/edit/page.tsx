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
      <div className="mb-7">
        <Link
          href={`/staff/${id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-body-sm text-ink-500 no-underline"
        >
          ← Back to {member.name}
        </Link>
        <h1 className="mb-1 text-h2 font-bold text-ink-900">
          Edit Team Member
        </h1>
        <p className="text-body-sm text-ink-500">
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
