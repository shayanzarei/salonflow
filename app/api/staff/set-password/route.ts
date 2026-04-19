import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

/**
 * Staff may set their own password while logged in as that staff member.
 * Salon owners must use the email invite / setup link flow instead.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.tenantId || !(session as { isStaff?: boolean }).isStaff) {
    return NextResponse.json(
      { error: "Use the password link from your email to set your password." },
      { status: 403 }
    );
  }

  const staffSessionId = (session as { staffId?: string | null }).staffId;
  if (!staffSessionId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const staff_id = formData.get("staff_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const password = formData.get("password") as string;

    if (staff_id !== staffSessionId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (tenant_id !== session.tenantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE staff SET password_hash = $1 WHERE id = $2 AND tenant_id = $3`,
      [password_hash, staff_id, tenant_id]
    );

    return NextResponse.redirect(new URL(`/staff/${staff_id}`, req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
