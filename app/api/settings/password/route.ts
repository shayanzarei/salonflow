import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const redirectTo =
      (formData.get("redirect_to") as string | null) || "/settings/security";
    const current_password = formData.get("current_password") as string;
    const new_password = formData.get("new_password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    if (new_password !== confirm_password) {
      return NextResponse.redirect(
        new URL(`${redirectTo}?error=password_mismatch`, req.url)
      );
    }

    const result = await pool.query(
      `SELECT password_hash FROM tenants WHERE id = $1`,
      [tenant.id]
    );

    const row = result.rows[0];
    if (!row)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const match = await bcrypt.compare(current_password, row.password_hash);
    if (!match) {
      return NextResponse.redirect(
        new URL(`${redirectTo}?error=wrong_password`, req.url)
      );
    }

    const new_hash = await bcrypt.hash(new_password, 10);

    await pool.query(`UPDATE tenants SET password_hash = $1 WHERE id = $2`, [
      new_hash,
      tenant.id,
    ]);

    return NextResponse.redirect(
      new URL(`${redirectTo}?success=password_updated`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
