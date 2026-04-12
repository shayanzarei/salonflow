import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const booking_id = formData.get("booking_id") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const service_id = formData.get("service_id") as string;
    const staff_id = formData.get("staff_id") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const status = formData.get("status") as string;

    const booked_at = new Date(`${date}T${time}`);

    await pool.query(
      `UPDATE bookings
       SET service_id = $1, staff_id = $2, booked_at = $3, status = $4
       WHERE id = $5 AND tenant_id = $6`,
      [service_id, staff_id, booked_at, status, booking_id, tenant_id]
    );

    return NextResponse.redirect(new URL(`/bookings/${booking_id}`, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
