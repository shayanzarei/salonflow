import pool from "@/lib/db";
import { createNotification } from "@/lib/notifications";
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

    const bookingId = result.rows[0].id as string;

    const detailsResult = await pool.query(
      `SELECT s.name AS service_name, st.name AS staff_name
       FROM services s
       JOIN staff st ON st.id = $2
       WHERE s.id = $1 AND s.tenant_id = $3`,
      [service_id, staff_id, tenant_id]
    );
    const details = detailsResult.rows[0];

    await createNotification({
      tenantId: tenant_id,
      type: "booking_created",
      title: "New booking added",
      message: `${client_name} booked ${details?.service_name ?? "a service"} with ${details?.staff_name ?? "staff"}.`,
      linkUrl: `/bookings/${bookingId}`,
      data: {
        bookingId,
        serviceId: service_id,
        staffId: staff_id,
      },
      recipients: [
        { role: "owner", id: tenant_id },
        { role: "staff", id: staff_id },
      ],
    });

    return NextResponse.redirect(
      new URL(`/bookings/${bookingId}`, req.url)
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
