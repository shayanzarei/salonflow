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
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const avatar_url = formData.get("avatar_url") as string;
    const avatar_color = formData.get("avatar_color") as string;
    const bio = formData.get("bio") as string;

    await pool.query(
      `UPDATE staff SET
         name = $1,
         role = $2,
         email = $3,
         phone = NULLIF($4, ''),
         avatar_url = NULLIF($5, ''),
         avatar_color = NULLIF($6, ''),
         bio = NULLIF($7, '')
       WHERE id = $8 AND tenant_id = $9`,
      [name, role, email, phone, avatar_url, avatar_color, bio, staff_id, tenant_id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
