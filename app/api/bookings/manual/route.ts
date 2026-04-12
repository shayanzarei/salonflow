import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tenant_id = formData.get("tenant_id") as string;
    const client_name = formData.get("client_name") as string;
    const client_email = formData.get("client_email") as string;
    const client_phone = formData.get("client_phone") as string;
    const service_id = formData.get("service_id") as string;
    const staff_id = formData.get("staff_id") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const status = formData.get("status") as string;

    const booked_at = new Date(`${date}T${time}`);

    const result = await pool.query(
      `INSERT INTO bookings
        (tenant_id, service_id, staff_id, client_name, client_email, client_phone, booked_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        tenant_id,
        service_id,
        staff_id,
        client_name,
        client_email,
        client_phone || null,
        booked_at,
        status,
      ]
    );

    return NextResponse.redirect(
      new URL(`/bookings/${result.rows[0].id}`, req.url)
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
