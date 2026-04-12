import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenant_id = formData.get("tenant_id") as string;
    const current_password = formData.get("current_password") as string;
    const new_password = formData.get("new_password") as string;

    // fetch current hash
    const result = await pool.query(
      `SELECT password_hash FROM tenants WHERE id = $1`,
      [tenant_id]
    );

    const tenant = result.rows[0];
    if (!tenant)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // verify current password
    const match = await bcrypt.compare(current_password, tenant.password_hash);
    if (!match) {
      return NextResponse.redirect(
        new URL("/settings?error=wrong_password", req.url)
      );
    }

    // hash new password
    const new_hash = await bcrypt.hash(new_password, 10);

    await pool.query(`UPDATE tenants SET password_hash = $1 WHERE id = $2`, [
      new_hash,
      tenant_id,
    ]);

    return NextResponse.redirect(
      new URL("/settings?success=password_updated", req.url)
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
