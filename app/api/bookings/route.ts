import pool from '@/lib/db';
import { bookingConfirmationEmail } from '@/lib/emails/booking-confirmation';
import { sendEmail } from '@/lib/emails/send';
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

    const result = await pool.query(
      `INSERT INTO bookings 
        (tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone]
    );

    const booking = result.rows[0];

    const { subject, html } = bookingConfirmationEmail({
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

    await sendEmail({
      to: client_email,
      subject,
      html,
    });

    return NextResponse.redirect(
      new URL(`/book/success?booking=${booking.id}`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}