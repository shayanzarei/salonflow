import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { sendWhatsAppNotification } from "@/lib/notify/whatsapp";
import { NextResponse } from "next/server";

export async function POST() {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenantId = guard.session.tenantId;

  const [tenantResult, serviceResult, staffResult, salonHoursResult] = await Promise.all([
    pool.query(
      `SELECT name, tagline, about, address
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
    pool.query(
      `SELECT COUNT(*)::int AS count
       FROM salon_working_hours
       WHERE tenant_id = $1 AND is_working = true`,
      [tenantId]
    ),
  ]);

  const tenant = tenantResult.rows[0];
  const servicesCount = serviceResult.rows[0]?.count ?? 0;
  const staffCount = staffResult.rows[0]?.count ?? 0;
  const workingDaysCount = salonHoursResult.rows[0]?.count ?? 0;

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const hasBasicInfo =
    Boolean(tenant.tagline?.trim()) &&
    Boolean(tenant.about?.trim()) &&
    Boolean(tenant.address?.trim());
  const hasWorkingHours = workingDaysCount > 0;

  if (!hasBasicInfo || servicesCount < 1 || staffCount < 1 || !hasWorkingHours) {
    return NextResponse.json(
      {
        error:
          "Complete basic profile, add at least one service, add at least one staff member, and configure working hours before submitting for review.",
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

  void sendWhatsAppNotification(
    [
      "New booking-site review submission",
      `Tenant: ${tenant.name ?? tenantId}`,
      `Tenant ID: ${tenantId}`,
      `Services: ${servicesCount}`,
      `Staff: ${staffCount}`,
      `Working days: ${workingDaysCount}`,
      `Submitted at: ${new Date().toISOString()}`,
      `Review in admin dashboard`,
    ].join("\n")
  ).catch((error: unknown) => {
    console.error("[website-submit] WhatsApp notification failed", error);
  });

  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}
