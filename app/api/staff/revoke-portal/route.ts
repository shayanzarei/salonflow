import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  try {
    const formData = await req.formData();
    const staff_id = formData.get("staff_id") as string;
    const tenant_id = formData.get("tenant_id") as string;

    await pool.query(
      `UPDATE staff SET password_hash = NULL WHERE id = $1 AND tenant_id = $2`,
      [staff_id, tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
