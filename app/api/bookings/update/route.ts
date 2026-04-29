import {
  findConflictingBooking,
  isExclusionViolation,
} from "@/lib/conflict-check";
import pool from "@/lib/db";
import { bookingStaffNotificationEmail } from "@/lib/emails/booking-staff-notification";
import {
  bookingUpdatedEmail,
  type BookingChange,
} from "@/lib/emails/booking-updated";
import { sendEmail } from "@/lib/emails/send";
import { createNotification } from "@/lib/notifications";
import { bookableServiceSql } from "@/lib/services/bookable";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  formatWithZoneLabel,
  isValidIanaTimezone,
  wallClockToUtc,
} from "@/lib/timezone";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/bookings/update
 *
 * Save changes from the dashboard's Edit Booking form. The form posts
 * salon-local YYYY-MM-DD (`date`) and HH:MM 24h (`time`); both must be
 * interpreted against the salon's IANA zone, *not* the server's clock.
 *
 * Time-zone contract (per migration 016 + lib/timezone):
 *   • `wallClockToUtc(date, time, tenantZone)` produces the canonical UTC
 *     instant. This is what we write to `bookings.booking_start_utc` and
 *     compute `booking_end_utc` from.
 *   • `bookings.provider_iana_timezone` is updated alongside so future reads
 *     can label the time correctly even if the salon migrates zones.
 *   • `booked_at` is mirrored by the migration trigger; we still set it
 *     explicitly for older code paths that haven't migrated yet.
 */
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

    if (!booking_id || !tenant_id || !service_id || !staff_id || !date || !time || !status) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: "Invalid time format." }, { status: 400 });
    }

    // Resolve the salon's zone + capture the *previous* booking state so we can
    // diff what changed and email the client a "what changed" summary.
    const [tenantRes, prevRes] = await Promise.all([
      pool.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]),
      pool.query(
        `SELECT
           b.id,
           b.client_name,
           b.client_email,
           b.client_phone,
           b.cancellation_token,
           b.booking_start_utc,
           b.provider_iana_timezone,
           b.status,
           b.service_id  AS prev_service_id,
           b.staff_id    AS prev_staff_id,
           s.name        AS prev_service_name,
           st.name       AS prev_staff_name
         FROM bookings b
         JOIN services s ON s.id = b.service_id
         JOIN staff st  ON st.id = b.staff_id
         WHERE b.id = $1 AND b.tenant_id = $2`,
        [booking_id, tenant_id]
      ),
    ]);

    const tenant = tenantRes.rows[0];
    const previous = prevRes.rows[0];
    if (!tenant || !previous) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const rawZone = (tenant.iana_timezone ?? "") as string;
    const tenantZone =
      rawZone && isValidIanaTimezone(rawZone) ? rawZone : DEFAULT_FALLBACK_TIMEZONE;

    // Wall clock → canonical UTC instant. DST-safe via the helper's two-pass.
    const startUtc = wallClockToUtc(date, time, tenantZone);
    if (Number.isNaN(startUtc.getTime()) || startUtc.getTime() <= Date.now()) {
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

    const endUtc = new Date(startUtc.getTime() + service.duration_mins * 60_000);

    // Single source of truth for the overlap rule (see lib/conflict-check.ts).
    // The `excludeBookingId` arg keeps a row from conflicting with itself
    // when the user is editing without changing the time.
    const conflictId = await findConflictingBooking(pool, {
      staffId: staff_id,
      startUtc: startUtc.toISOString(),
      endUtc: endUtc.toISOString(),
      excludeBookingId: booking_id,
    });
    if (conflictId) {
      return NextResponse.json(
        { error: "This staff member is already booked at that time." },
        { status: 409 }
      );
    }

    // DB-side backstop for the race two app-level checks can't catch — see
    // migration 017 and lib/conflict-check.ts. SQLSTATE 23P01 → 409 keeps
    // the response shape consistent with the application-level check above.
    try {
      await pool.query(
        `UPDATE bookings
           SET service_id              = $1,
               staff_id                = $2,
               booking_start_utc       = $3,
               booking_end_utc         = $4,
               provider_iana_timezone  = $5,
               booked_at               = $3,
               status                  = $6
         WHERE id = $7 AND tenant_id = $8`,
        [
          service_id,
          staff_id,
          startUtc.toISOString(),
          endUtc.toISOString(),
          tenantZone,
          status,
          booking_id,
          tenant_id,
        ]
      );
    } catch (err) {
      if (isExclusionViolation(err)) {
        return NextResponse.json(
          { error: "This staff member was just booked at that time. Please choose another." },
          { status: 409 }
        );
      }
      throw err;
    }

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

    // ── Email notifications ─────────────────────────────────────────────────
    // Build a human "what changed" diff from the previous → new state and
    // notify the client (always) plus the owner / staff (when an email is on
    // file). Owner + staff get the existing staff-notification template; the
    // client gets the dedicated booking-updated template that highlights the
    // diff inline.
    const prevStartUtc = new Date(previous.booking_start_utc);
    const prevZone =
      (previous.provider_iana_timezone &&
        isValidIanaTimezone(previous.provider_iana_timezone)
        ? (previous.provider_iana_timezone as string)
        : tenantZone);

    const prevDateLabel = prevStartUtc.toLocaleDateString("nl-NL", {
      timeZone: prevZone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const prevTimeLabel = formatWithZoneLabel(prevStartUtc, prevZone, "nl-NL");
    const newDateLabel = startUtc.toLocaleDateString("nl-NL", {
      timeZone: tenantZone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const newTimeLabel = formatWithZoneLabel(startUtc, tenantZone, "nl-NL");

    const changes: BookingChange[] = [];
    if (previous.prev_service_id !== service_id) {
      changes.push({
        label: "Service",
        before: previous.prev_service_name ?? null,
        after: service.name,
      });
    }
    if (previous.prev_staff_id !== staff_id) {
      changes.push({
        label: "With",
        before: previous.prev_staff_name ?? null,
        after: staff.name,
      });
    }
    if (prevDateLabel !== newDateLabel) {
      changes.push({
        label: "Date",
        before: prevDateLabel,
        after: newDateLabel,
      });
    }
    if (prevTimeLabel !== newTimeLabel) {
      changes.push({
        label: "Time",
        before: prevTimeLabel,
        after: newTimeLabel,
      });
    }
    if (previous.status !== status) {
      changes.push({
        label: "Status",
        before: previous.status,
        after: status,
      });
    }

    // Skip email-sending entirely if literally nothing changed (the form was
    // submitted with identical values). The DB write already happened — this
    // is just a no-op save.
    if (changes.length > 0) {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://app.solohub.nl").replace(/\/$/, "");
      const dashboardUrl = `${appUrl}/bookings/${booking_id}`;

      const emailJobs: Array<Promise<boolean>> = [];

      // Client email — always send (this is the booking owner's request).
      if (previous.client_email) {
        const { subject, html } = bookingUpdatedEmail({
          clientName: previous.client_name,
          salonName: tenant.name,
          serviceName: service.name,
          staffName: staff.name,
          bookedAt: startUtc,
          price: Number(service.price),
          salonAddress: tenant.address,
          cancellationToken: previous.cancellation_token,
          bookingId: booking_id,
          salonSlug: tenant.slug,
          cancelBaseUrl: req.nextUrl.origin,
          brandColor: tenant.primary_color,
          salonTimezone: tenantZone,
          changes,
        });
        emailJobs.push(sendEmail({ to: previous.client_email, subject, html }));
      }

      // Owner email — re-uses the staff-notification template; the subject
      // line "New booking" is acceptable for now since the body shows the
      // full latest state. A dedicated owner-update template can come later.
      const ownerEmail = tenant.owner_email as string | null;
      if (ownerEmail) {
        const { html } = bookingStaffNotificationEmail({
          recipientName: tenant.owner_first_name ?? tenant.name,
          recipientRole: "owner",
          salonName: tenant.name,
          clientName: previous.client_name,
          clientEmail: previous.client_email,
          clientPhone: previous.client_phone,
          serviceName: service.name,
          staffName: staff.name,
          bookedAt: startUtc,
          durationMins: service.duration_mins,
          price: Number(service.price),
          dashboardUrl,
          salonTimezone: tenantZone,
        });
        emailJobs.push(
          sendEmail({
            to: ownerEmail,
            subject: `Booking updated — ${previous.client_name}`,
            html,
          })
        );
      }

      // Staff email — only if assigned staff has an email AND that email is
      // distinct from the owner's, to avoid double-notifying.
      const staffEmail = staff.email as string | null;
      if (staffEmail && staffEmail.toLowerCase() !== ownerEmail?.toLowerCase()) {
        const { html } = bookingStaffNotificationEmail({
          recipientName: staff.name,
          recipientRole: "staff",
          salonName: tenant.name,
          clientName: previous.client_name,
          clientEmail: previous.client_email,
          clientPhone: previous.client_phone,
          serviceName: service.name,
          staffName: staff.name,
          bookedAt: startUtc,
          durationMins: service.duration_mins,
          price: Number(service.price),
          dashboardUrl,
          salonTimezone: tenantZone,
        });
        emailJobs.push(
          sendEmail({
            to: staffEmail,
            subject: `Booking updated — ${previous.client_name}`,
            html,
          })
        );
      }

      // If the staff was *changed*, the previous staff member should also know
      // their booking was reassigned. Fire a separate notification at them.
      if (previous.prev_staff_id !== staff_id) {
        const prevStaffRes = await pool.query(
          `SELECT name, email FROM staff WHERE id = $1 AND tenant_id = $2`,
          [previous.prev_staff_id, tenant_id]
        );
        const prevStaff = prevStaffRes.rows[0];
        if (
          prevStaff?.email &&
          prevStaff.email.toLowerCase() !== ownerEmail?.toLowerCase() &&
          prevStaff.email.toLowerCase() !== staffEmail?.toLowerCase()
        ) {
          const { html } = bookingStaffNotificationEmail({
            recipientName: prevStaff.name,
            recipientRole: "staff",
            salonName: tenant.name,
            clientName: previous.client_name,
            clientEmail: previous.client_email,
            clientPhone: previous.client_phone,
            serviceName: service.name,
            staffName: staff.name,
            bookedAt: startUtc,
            durationMins: service.duration_mins,
            price: Number(service.price),
            dashboardUrl,
            salonTimezone: tenantZone,
          });
          emailJobs.push(
            sendEmail({
              to: prevStaff.email,
              subject: `Booking reassigned — ${previous.client_name}`,
              html,
            })
          );
        }
      }

      const emailResults = await Promise.allSettled(emailJobs);
      emailResults.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error("[update booking] email job rejected", { index, error: result.reason });
        } else if (!result.value) {
          console.error("[update booking] email send returned false", { index });
        }
      });
    }

    return NextResponse.redirect(new URL(`/bookings/${booking_id}`, req.url));
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
