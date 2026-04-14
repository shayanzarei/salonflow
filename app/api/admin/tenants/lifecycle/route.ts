import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const tenantStatus = (formData.get("tenant_status") as string) || "trial";
    const trialStartedAt = (formData.get("trial_started_at") as string) || null;
    const trialEndsAt = (formData.get("trial_ends_at") as string) || null;

    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
    }
    if (!["trial", "active", "suspended"].includes(tenantStatus)) {
      return NextResponse.json({ error: "Invalid tenant status" }, { status: 400 });
    }

    await pool.query(
      `UPDATE tenants
       SET tenant_status = $1,
           trial_started_at = $2::timestamptz,
           trial_ends_at = $3::timestamptz
       WHERE id = $4`,
      [tenantStatus, trialStartedAt, trialEndsAt, tenantId]
    );

    return NextResponse.redirect(new URL(`/admin/tenants/${tenantId}`, req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
