import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const staff_id = formData.get("staff_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;
    const avatar_url = formData.get("avatar_url") as string;

    await pool.query(
      `UPDATE staff
       SET name = $1, role = $2, email = $3, avatar_url = NULLIF($4, '')
       WHERE id = $5 AND tenant_id = $6`,
      [name, role, email, avatar_url, staff_id, tenant_id]
    );

    return NextResponse.redirect(new URL(`/staff/${staff_id}`, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
