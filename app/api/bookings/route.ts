import pool from '@/lib/db';
import { bookingConfirmationEmail } from '@/lib/emails/booking-confirmation';
import { bookingStaffNotificationEmail } from '@/lib/emails/booking-staff-notification';
import { sendEmail } from '@/lib/emails/send';
import { createNotification } from '@/lib/notifications';
import { bookableServiceSql } from '@/lib/services/bookable';
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

    if (!tenant_id || !service_id || !staff_id || !booked_at || !client_name || !client_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    if (tenant.website_status !== "published") {
      return NextResponse.json(
        { error: "Booking website is not published yet" },
        { status: 403 }
      );
    }

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

    // Check for double-booking: new slot must not overlap any existing booking
    // for the same staff member (confirmed or pending).
    // Overlap condition: new_start < existing_end AND new_end > existing_start
    const conflictResult = await pool.query(
      `SELECT b.id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1
         AND b.status IN ('confirmed', 'pending')
         AND b.booked_at < ($2::timestamptz + ($3::int || ' minutes')::interval)
         AND (b.booked_at + (s.duration_mins || ' minutes')::interval) > $2::timestamptz
       LIMIT 1`,
      [staff_id, booked_at, service.duration_mins]
    );

    if (conflictResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `INSERT INTO bookings
        (tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone]
    );

    const booking = result.rows[0];

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
      bookedAt: new Date(booked_at),
      price: parseFloat(service.price),
      salonAddress: tenant.address,
      cancellationToken: booking.cancellation_token,
      bookingId: booking.id,
      salonSlug: tenant.slug,
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
        clientPhone: client_phone,
        serviceName: service.name,
        staffName: staff.name,
        bookedAt: new Date(booked_at),
        durationMins: service.duration_mins,
        price: parseFloat(service.price),
        dashboardUrl: bookingDashboardUrl,
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
        clientPhone: client_phone,
        serviceName: service.name,
        staffName: staff.name,
        bookedAt: new Date(booked_at),
        durationMins: service.duration_mins,
        price: parseFloat(service.price),
        dashboardUrl: bookingDashboardUrl,
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
