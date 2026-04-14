import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenantId = guard.session.tenantId;

  const [tenantResult, serviceResult, staffResult] = await Promise.all([
    pool.query(
      `SELECT tagline, about, address, hours
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    ),
    pool.query(`SELECT COUNT(*)::int AS count FROM services WHERE tenant_id = $1`, [
      tenantId,
    ]),
    pool.query(`SELECT COUNT(*)::int AS count FROM staff WHERE tenant_id = $1`, [
      tenantId,
    ]),
  ]);

  const tenant = tenantResult.rows[0];
  const servicesCount = serviceResult.rows[0]?.count ?? 0;
  const staffCount = staffResult.rows[0]?.count ?? 0;

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const hasBasicInfo =
    Boolean(tenant.tagline?.trim()) &&
    Boolean(tenant.about?.trim()) &&
    Boolean(tenant.address?.trim()) &&
    Boolean(tenant.hours?.trim());

  if (!hasBasicInfo || servicesCount < 1 || staffCount < 1) {
    return NextResponse.json(
      {
        error:
          "Complete basic profile, add at least one service, and add at least one staff member before submitting for review.",
      },
      { status: 400 }
    );
  }

  await pool.query(
    `UPDATE tenants
     SET website_status = 'pending_approval',
         website_review_submitted_at = NOW(),
         website_review_note = NULL
     WHERE id = $1`,
    [tenantId]
  );

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}
