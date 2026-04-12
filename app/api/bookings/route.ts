import pool from '@/lib/db';
import { bookingConfirmationEmail } from '@/lib/emails/booking-confirmation';
import { sendEmail } from '@/lib/emails/send';
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

    // create the booking
    const result = await pool.query(
      `INSERT INTO bookings 
        (tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone]
    );

    const booking = result.rows[0];

    // fetch details for the email
    const [tenantResult, serviceResult, staffResult] = await Promise.all([
      pool.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]),
      pool.query(`SELECT * FROM services WHERE id = $1`, [service_id]),
      pool.query(`SELECT * FROM staff WHERE id = $1`, [staff_id]),
    ]);

    const tenant = tenantResult.rows[0];
    const service = serviceResult.rows[0];
    const staff = staffResult.rows[0];

    // send confirmation email
    const { subject, html } = bookingConfirmationEmail({
      clientName: client_name,
      salonName: tenant.name,
      serviceName: service.name,
      staffName: staff.name,
      bookedAt: new Date(booked_at),
      price: parseFloat(service.price),
      salonAddress: tenant.address,
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