import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    const businessStartedAt =
      (formData.get("business_started_at") as string | null) || null;

    await pool.query(
      `UPDATE tenants
       SET business_started_at = $1
       WHERE id = $2`,
      [businessStartedAt, tenantId]
    );

    return NextResponse.redirect(new URL(`/admin/tenants/${tenantId}`, req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
