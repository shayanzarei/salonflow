import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  try {
    const formData = await req.formData();
    const staff_id = formData.get("staff_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const password = formData.get("password") as string;

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE staff SET password_hash = $1 WHERE id = $2 AND tenant_id = $3`,
      [password_hash, staff_id, tenant_id]
    );

    return NextResponse.redirect(new URL(`/staff/${staff_id}`, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
