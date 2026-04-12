import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const booking_id = formData.get("booking_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const status = formData.get("status") as string;
    const redirect = formData.get("redirect") as string;

    await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2 AND tenant_id = $3`,
      [status, booking_id, tenant_id]
    );

    return NextResponse.redirect(new URL(redirect || "/bookings", req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
