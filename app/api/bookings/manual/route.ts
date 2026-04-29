import {
  findConflictingBooking,
  isExclusionViolation,
} from "@/lib/conflict-check";
import pool from "@/lib/db";
import { bookingConfirmationEmail } from "@/lib/emails/booking-confirmation";
import { bookingStaffNotificationEmail } from "@/lib/emails/booking-staff-notification";
import { sendEmail } from "@/lib/emails/send";
import { createNotification } from "@/lib/notifications";
import { isValidPhone, normalizePhoneInput } from "@/lib/phone";
import { bookableServiceSql } from "@/lib/services/bookable";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
  wallClockToUtc,
} from "@/lib/timezone";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tenant_id = formData.get("tenant_id") as string;
    const client_name = formData.get("client_name") as string;
    const client_email = formData.get("client_email") as string;
    const client_phone = formData.get("client_phone") as string;
    const normalizedPhone = normalizePhoneInput(client_phone);
    const service_id = formData.get("service_id") as string;
    const staff_id = formData.get("staff_id") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const status = formData.get("status") as string;

    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // ── Resolve tenant + service + staff up front so we know the salon's IANA
    //    zone *before* we convert the wall-clock input to UTC. The form sends
    //    the salon-local date/time (what the owner sees in their dashboard);
    //    we MUST interpret that against the salon's zone, not the server's.
    const [tenantResult, serviceResult, staffResult] = await Promise.all([
      pool.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]),
      pool.query(
        `SELECT * FROM services WHERE id = $1 AND tenant_id = $2 AND ${bookableServiceSql()}`,
        [service_id, tenant_id]
      ),
      pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [staff_id, tenant_id]),
    ]);

    const tenant = tenantResult.rows[0];
    const service = serviceResult.rows[0];
    const staff = staffResult.rows[0];
    if (!tenant || !service || !staff) {
      return NextResponse.json({ error: "Invalid booking selection" }, { status: 400 });
    }

    const tenantZone =
      tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
        ? (tenant.iana_timezone as string)
        : DEFAULT_FALLBACK_TIMEZONE;

    // Convert wall-clock (date + time the owner picked) → UTC using the salon's
    // zone. wallClockToUtc throws on malformed input; let it bubble to the
    // catch block as a 500-with-message so the client sees a clear failure
    // instead of a silently shifted booking.
    let booked_at: Date;
    try {
      booked_at = wallClockToUtc(date, time, tenantZone);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid date/time";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    if (Number.isNaN(booked_at.getTime()) || booked_at.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Booking time must be in the future." },
        { status: 400 }
      );
    }

    const durationMins = Number(service.duration_mins);
    const booking_end_utc = new Date(booked_at.getTime() + durationMins * 60_000);

    // Single source of truth for the overlap rule (see lib/conflict-check.ts).
    // Stays in lock-step with /api/bookings, /api/bookings/update, and
    // lib/availability — change the rule there, not here.
    const conflictId = await findConflictingBooking(pool, {
      staffId: staff_id,
      startUtc: booked_at.toISOString(),
      endUtc: booking_end_utc.toISOString(),
    });
    if (conflictId) {
      return NextResponse.json(
        { error: "This staff member is already booked at that time." },
        { status: 409 }
      );
    }

    // DB-side backstop for the race two app-level checks can't catch — see
    // migration 017 and lib/conflict-check.ts. SQLSTATE 23P01 → 409 keeps the
    // shape identical to the application-level conflict response above.
    let booking;
    try {
      const result = await pool.query(
        `INSERT INTO bookings
          (tenant_id, service_id, staff_id, client_name, client_email, client_phone,
           booking_start_utc, booking_end_utc, provider_iana_timezone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          tenant_id,
          service_id,
          staff_id,
          client_name,
          client_email,
          normalizedPhone,
          booked_at,
          booking_end_utc,
          tenantZone,
          status,
        ]
      );
      booking = result.rows[0];
    } catch (err) {
      if (isExclusionViolation(err)) {
        return NextResponse.json(
          { error: "This staff member was just booked at that time. Please choose another." },
          { status: 409 }
        );
      }
      throw err;
    }
    const bookingId = booking.id as string;

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

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.solohub.nl").replace(/\/$/, "");
    const dashboardUrl = `${appUrl}/bookings/${bookingId}`;

    const { subject: clientSubject, html: clientHtml } = bookingConfirmationEmail({
      clientName: client_name,
      salonName: tenant.name,
      serviceName: service.name,
      staffName: staff.name,
      bookedAt: booked_at,
      price: Number(service.price),
      salonAddress: tenant.address,
      cancellationToken: booking.cancellation_token,
      bookingId,
      salonSlug: tenant.slug,
      cancelBaseUrl: req.nextUrl.origin,
      brandColor: tenant.primary_color,
      salonTimezone: tenantZone,
    });
    const emailJobs: Array<Promise<boolean>> = [
      sendEmail({
        to: client_email,
        subject: clientSubject,
        html: clientHtml,
      }),
    ];

    const ownerEmail = tenant.owner_email as string | null;
    if (ownerEmail) {
      const { subject, html } = bookingStaffNotificationEmail({
        recipientName: tenant.owner_first_name ?? tenant.name,
        recipientRole: "owner",
        salonName: tenant.name,
        clientName: client_name,
        clientEmail: client_email,
        clientPhone: normalizedPhone,
        serviceName: service.name,
        staffName: staff.name,
        bookedAt: booked_at,
        durationMins: service.duration_mins,
        price: Number(service.price),
        dashboardUrl,
        salonTimezone: tenantZone,
      });
      emailJobs.push(
        sendEmail({
          to: ownerEmail,
          subject,
          html,
        })
      );
    }

    const staffEmail = staff.email as string | null;
    if (staffEmail && staffEmail.toLowerCase() !== ownerEmail?.toLowerCase()) {
      const { subject, html } = bookingStaffNotificationEmail({
        recipientName: staff.name,
        recipientRole: "staff",
        salonName: tenant.name,
        clientName: client_name,
        clientEmail: client_email,
        clientPhone: normalizedPhone,
        serviceName: service.name,
        staffName: staff.name,
        bookedAt: booked_at,
        durationMins: service.duration_mins,
        price: Number(service.price),
        dashboardUrl,
        salonTimezone: tenantZone,
      });
      emailJobs.push(
        sendEmail({
          to: staffEmail,
          subject,
          html,
        })
      );
    }

    const emailResults = await Promise.allSettled(emailJobs);
    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("[manual booking] email job rejected", { index, error: result.reason });
      } else if (!result.value) {
        console.error("[manual booking] email send returned false", { index });
      }
    });

    return NextResponse.redirect(
      new URL(`/bookings/${bookingId}`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
