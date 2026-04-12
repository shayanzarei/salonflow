import pool from '@/lib/db';
import { sendEmail } from '@/lib/emails/send';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const booking_id = formData.get('booking_id') as string;
        const token = formData.get('token') as string;

        // verify token
        const result = await pool.query(
            `SELECT b.*, s.name AS service_name, t.name AS salon_name, t.slug AS salon_slug
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN tenants t ON b.tenant_id = t.id
       WHERE b.id = $1 AND b.cancellation_token = $2`,
            [booking_id, token]
        );

        const booking = result.rows[0];
        if (!booking) {
            return NextResponse.json({ error: 'Invalid booking or token' }, { status: 400 });
        }

        // cancel the booking
        await pool.query(
            `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
            [booking_id]
        );

        // send cancellation confirmation email
        await sendEmail({
            to: booking.client_email,
            subject: `Appointment cancelled — ${booking.service_name} at ${booking.salon_name}`,
            html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAF7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:white;border-radius:20px;overflow:hidden;border:1px solid #F0EBE4;">
      <div style="background:#1a1a1a;padding:32px;text-align:center;">
        <p style="color:#9C7B5A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">
          ${booking.salon_name}
        </p>
        <h1 style="color:white;font-size:24px;font-weight:500;margin:0;">
          Appointment cancelled
        </h1>
      </div>
      <div style="padding:32px;text-align:center;">
        <p style="color:#666;font-size:15px;margin:0 0 24px;">
          Hi ${booking.client_name}, your appointment for ${booking.service_name} has been cancelled.
        </p>
        <a href="https://${booking.salon_slug}.salonflow.xyz"
          style="display:inline-block;padding:12px 28px;background:#7C3AED;color:white;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;">
          Book again
        </a>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#bbb;font-size:12px;margin:0;">Powered by SalonFlow</p>
    </div>
  </div>
</body>
</html>
      `,
        });

        return NextResponse.redirect(
            new URL(`/book/cancel?booking=${booking_id}&token=${token}`, req.url)
        );
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}