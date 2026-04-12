import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const booking_id = formData.get("booking_id") as string;
    const tenant_id = formData.get("tenant_id") as string;

    await pool.query(`DELETE FROM bookings WHERE id = $1 AND tenant_id = $2`, [
      booking_id,
      tenant_id,
    ]);

    return NextResponse.redirect(new URL("/bookings", req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
