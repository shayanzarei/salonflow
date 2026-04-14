import pool from "@/lib/db";
import { createNotification } from "@/lib/notifications";
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

    const detailsResult = await pool.query(
      `SELECT
         b.client_name,
         s.name AS service_name,
         st.name AS staff_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.id = $1 AND b.tenant_id = $2`,
      [booking_id, tenant_id]
    );
    const details = detailsResult.rows[0];

    if (details) {
      await createNotification({
        tenantId: tenant_id,
        type: "booking_updated",
        title: "Booking updated",
        message: `${details.client_name}'s booking was updated (${details.service_name} with ${details.staff_name}).`,
        linkUrl: `/bookings/${booking_id}`,
        data: { bookingId: booking_id, serviceId: service_id, staffId: staff_id },
        recipients: [
          { role: "owner", id: tenant_id },
          { role: "staff", id: staff_id },
        ],
      });
    }

    return NextResponse.redirect(new URL(`/bookings/${booking_id}`, req.url));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
