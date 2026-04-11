import pool from '@/lib/db';
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

    // validate required fields
    if (!tenant_id || !service_id || !staff_id || !booked_at || !client_name || !client_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO bookings 
        (tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
       RETURNING *`,
      [tenant_id, service_id, staff_id, booked_at, client_name, client_email, client_phone]
    );

    const booking = result.rows[0];

    // redirect to success page
    return NextResponse.redirect(
      new URL(`/book/success?booking=${booking.id}`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}