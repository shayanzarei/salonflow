import {
  findConflictingBooking,
  isExclusionViolation,
} from '@/lib/conflict-check';
import pool from '@/lib/db';
import { bookingConfirmationEmail } from '@/lib/emails/booking-confirmation';
import { bookingStaffNotificationEmail } from '@/lib/emails/booking-staff-notification';
import { sendEmail } from '@/lib/emails/send';
import { createNotification } from '@/lib/notifications';
import { isValidPhone, normalizePhoneInput } from '@/lib/phone';
import { bookableServiceSql } from '@/lib/services/bookable';
import { canAccessPublicWebsite } from '@/lib/tenant';
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isoHasExplicitZone,
  isValidIanaTimezone,
} from '@/lib/timezone';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tenant_id = formData.get('tenant_id') as string;
    const service_id = formData.get('service_id') as string;
    const staff_id = formData.get('staff_id') as string;
    const booked_at = formData.get('booked_at') as string;
    const client_name = formData.get('client_name') as string;
    const client_email = formData.get('client_email') as string;
    const client_phone = formData.get('client_phone') as string | null;
    const normalizedPhone = normalizePhoneInput(client_phone);

    if (!tenant_id || !service_id || !staff_id || !booked_at || !client_name || !client_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }
    // Hard-reject naked local-time strings ("2026-04-28T13:00:00") at the API
    // boundary. The booking widget always serialises a UTC instant (Z-suffixed),
    // so an unzoned string here is either a stale client or a probe — fail fast
    // rather than silently parsing in server-local time.
    if (!isoHasExplicitZone(booked_at)) {
      return NextResponse.json(
        {
          error:
            "Booking time must be sent as a UTC ISO string with 'Z' or an explicit ±HH:MM offset.",
        },
        { status: 400 }
      );
    }
    const bookingDate = new Date(booked_at);
    if (Number.isNaN(bookingDate.getTime()) || bookingDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "Booking time must be in the future." },
        { status: 400 }
      );
    }

    const [tenantResult, serviceResult, staffResult] = await Promise.all([
      pool.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]),
      pool.query(
        `SELECT * FROM services WHERE id = $1 AND tenant_id = $2 AND ${bookableServiceSql()}`,
        [service_id, tenant_id]
      ),
      pool.query(
        `SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`,
        [staff_id, tenant_id]
      ),
    ]);

    const tenant = tenantResult.rows[0];
    const service = serviceResult.rows[0];
    const staff = staffResult.rows[0];

    if (!tenant || !service || !staff) {
      return NextResponse.json(
        { error: 'Invalid booking selection' },
        { status: 400 }
      );
    }
    if (!canAccessPublicWebsite(tenant)) {
      return NextResponse.json(
        { error: "Booking website is not available" },
        { status: 403 }
      );
    }

    // The salon's IANA zone — used for *_utc bookkeeping and for rendering the
    // confirmation emails with the correct local clock + zone label.
    const tenantZone =
      tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
        ? (tenant.iana_timezone as string)
        : DEFAULT_FALLBACK_TIMEZONE;

    const durationMins = Number(service.duration_mins);
    const bookingEndUtc = new Date(bookingDate.getTime() + durationMins * 60_000);

    const assignResult = await pool.query(
      `SELECT
         NOT EXISTS (SELECT 1 FROM service_staff ss WHERE ss.service_id = $1)
         OR EXISTS (
           SELECT 1 FROM service_staff ss
           WHERE ss.service_id = $1 AND ss.staff_id = $2::uuid
         ) AS allowed`,
      [service_id, staff_id]
    );
    if (assignResult.rows[0] && !assignResult.rows[0].allowed) {
      return NextResponse.json(
        { error: 'Selected staff does not offer this service' },
        { status: 400 }
      );
    }

    // Single source of truth for the overlap rule (see lib/conflict-check.ts).
    // Inlining the query here used to drift out of sync with the manual/update
    // endpoints and with availability — producing "looks free, returns 409"
    // bugs.
    const conflictId = await findConflictingBooking(pool, {
      staffId: staff_id,
      startUtc: bookingDate.toISOString(),
      endUtc: bookingEndUtc.toISOString(),
    });
    if (conflictId) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }

    // The application-level conflict check above isn't enough on its own:
    // two concurrent requests can both pass it before either commits. The
    // `bookings_no_overlap` exclusion constraint (migration 017) is the
    // backstop — it raises SQLSTATE 23P01 if a race slips through. Translate
    // that to 409 Conflict so the client sees the same error shape regardless
    // of whether it lost the race in app code or in the DB.
    let booking;
    try {
      const result = await pool.query(
        `INSERT INTO bookings
          (tenant_id, service_id, staff_id,
           booking_start_utc, booking_end_utc, provider_iana_timezone,
           client_name, client_email, client_phone, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
         RETURNING *`,
        [
          tenant_id,
          service_id,
          staff_id,
          bookingDate,
          bookingEndUtc,
          tenantZone,
          client_name,
          client_email,
          normalizedPhone,
        ]
      );
      booking = result.rows[0];
    } catch (err) {
      if (isExclusionViolation(err)) {
        return NextResponse.json(
          { error: 'This time slot was just booked by someone else. Please choose another time.' },
          { status: 409 }
        );
      }
      throw err;
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.solohub.nl').replace(/\/$/, '');
    const bookingDashboardUrl = `${appUrl}/bookings`;

    // ── In-platform notifications (owner + assigned staff) ────────────────────
    // Fire-and-forget — a notification failure must never block the booking response.
    void createNotification({
      tenantId: tenant_id,
      type: "booking_created",
      title: "New booking confirmed",
      message: `${client_name} booked ${service.name} with ${staff.name}.`,
      linkUrl: `/bookings`,
      data: {
        bookingId: booking.id,
        serviceId: service_id,
        staffId: staff_id,
      },
      recipients: [
        { role: "owner", id: tenant_id },
        { role: "staff", id: staff_id },
      ],
    }).catch((err) => console.error('[booking] createNotification failed', err));

    // ── Email to client — booking confirmation ────────────────────────────────
    const { subject: clientSubject, html: clientHtml } = bookingConfirmationEmail({
      clientName: client_name,
      salonName: tenant.name,
      serviceName: service.name,
      staffName: staff.name,
      bookedAt: bookingDate,
      price: parseFloat(service.price),
      salonAddress: tenant.address,
      cancellationToken: booking.cancellation_token,
      bookingId: booking.id,
      salonSlug: tenant.slug,
      cancelBaseUrl: req.nextUrl.origin,
      brandColor: tenant.primary_color,
      salonTimezone: tenantZone,
    });

    void sendEmail({
      to: client_email,
      subject: clientSubject,
      html: clientHtml,
    }).catch((err) => console.error('[booking] client confirmation email failed', err));

    // ── Email to owner — new booking alert ────────────────────────────────────
    const ownerEmail = tenant.owner_email as string | null;
    if (ownerEmail) {
      const { subject: ownerSubject, html: ownerHtml } = bookingStaffNotificationEmail({
        recipientName: tenant.owner_first_name ?? tenant.name,
        recipientRole: 'owner',
        salonName: tenant.name,
        clientName: client_name,
        clientEmail: client_email,
        clientPhone: normalizedPhone,
        serviceName: service.name,
        staffName: staff.name,
        bookedAt: bookingDate,
        durationMins: service.duration_mins,
        price: parseFloat(service.price),
        dashboardUrl: bookingDashboardUrl,
        salonTimezone: tenantZone,
      });

      void sendEmail({
        to: ownerEmail,
        subject: ownerSubject,
        html: ownerHtml,
        from: 'SoloHub <bookings@solohub.nl>',
      }).catch((err) => console.error('[booking] owner notification email failed', err));
    }

    // ── Email to assigned staff member — only if they have an email and it
    //    differs from the owner (avoid duplicate email to solo operators) ──────
    const staffEmail = staff.email as string | null;
    if (staffEmail && staffEmail.toLowerCase() !== ownerEmail?.toLowerCase()) {
      const { subject: staffSubject, html: staffHtml } = bookingStaffNotificationEmail({
        recipientName: staff.name,
        recipientRole: 'staff',
        salonName: tenant.name,
        clientName: client_name,
        clientEmail: client_email,
        clientPhone: normalizedPhone,
        serviceName: service.name,
        staffName: staff.name,
        bookedAt: bookingDate,
        durationMins: service.duration_mins,
        price: parseFloat(service.price),
        dashboardUrl: bookingDashboardUrl,
        salonTimezone: tenantZone,
      });

      void sendEmail({
        to: staffEmail,
        subject: staffSubject,
        html: staffHtml,
        from: 'SoloHub <bookings@solohub.nl>',
      }).catch((err) => console.error('[booking] staff notification email failed', err));
    }

    return NextResponse.redirect(
      new URL(`/book/success?booking=${booking.id}`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
