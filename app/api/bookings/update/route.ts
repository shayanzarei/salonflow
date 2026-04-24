import pool from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { bookableServiceSql } from "@/lib/services/bookable";
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
    if (Number.isNaN(booked_at.getTime()) || booked_at.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Booking time must be in the future." },
        { status: 400 }
      );
    }

    const [serviceResult, staffResult] = await Promise.all([
      pool.query(
        `SELECT * FROM services WHERE id = $1 AND tenant_id = $2 AND ${bookableServiceSql()}`,
        [service_id, tenant_id]
      ),
      pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [staff_id, tenant_id]),
    ]);
    const service = serviceResult.rows[0];
    const staff = staffResult.rows[0];
    if (!service || !staff) {
      return NextResponse.json({ error: "Invalid booking selection" }, { status: 400 });
    }

    const conflictResult = await pool.query(
      `SELECT b.id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1
         AND b.id <> $2
         AND b.status IN ('confirmed', 'pending')
         AND b.booked_at < ($3::timestamptz + ($4::int || ' minutes')::interval)
         AND (b.booked_at + (s.duration_mins || ' minutes')::interval) > $3::timestamptz
       LIMIT 1`,
      [staff_id, booking_id, booked_at.toISOString(), service.duration_mins]
    );
    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: "This staff member is already booked at that time." },
        { status: 409 }
      );
    }

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
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
