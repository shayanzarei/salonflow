import pool from '@/lib/db';
import { bookingReminderEmail } from '@/lib/emails/booking-reminder';
import { sendEmail } from '@/lib/emails/send';
import { inngest } from '@/lib/inngest';

export const sendBookingReminders = inngest.createFunction(
  {
    id: 'send-booking-reminders',
    name: 'Send booking reminders',
    triggers: [{ cron: '*/30 * * * *' }],
  },
  async () => {
    const now = new Date();

    const oneDayFrom = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayWindowStart = new Date(oneDayFrom.getTime() - 2 * 60 * 60 * 1000);
    const oneDayWindowEnd = new Date(oneDayFrom.getTime() + 2 * 60 * 60 * 1000);

    const twoHoursFrom = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const twoHourWindowStart = new Date(twoHoursFrom.getTime() - 30 * 60 * 1000);
    const twoHourWindowEnd = new Date(twoHoursFrom.getTime() + 30 * 60 * 1000);

    console.log('Now:', now.toISOString());
    console.log('24hr window:', oneDayWindowStart.toISOString(), 'to', oneDayWindowEnd.toISOString());
    console.log('2hr window:', twoHourWindowStart.toISOString(), 'to', twoHourWindowEnd.toISOString());

    const oneDayBookings = await pool.query(
      `SELECT
         b.*,
         s.name AS service_name,
         st.name AS staff_name,
         t.name AS salon_name,
         t.address AS salon_address
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       JOIN tenants t ON b.tenant_id = t.id
       WHERE b.booked_at BETWEEN $1 AND $2
         AND b.status = 'confirmed'
         AND b.reminder_24h_sent = false`,
      [oneDayWindowStart, oneDayWindowEnd]
    );

    const twoHourBookings = await pool.query(
      `SELECT
         b.*,
         s.name AS service_name,
         st.name AS staff_name,
         t.name AS salon_name,
         t.address AS salon_address
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       JOIN tenants t ON b.tenant_id = t.id
       WHERE b.booked_at BETWEEN $1 AND $2
         AND b.status = 'confirmed'
         AND b.reminder_2h_sent = false`,
      [twoHourWindowStart, twoHourWindowEnd]
    );

    console.log('24hr bookings found:', oneDayBookings.rows.length);
    console.log('2hr bookings found:', twoHourBookings.rows.length);

    for (const booking of oneDayBookings.rows) {
      const { subject, html } = bookingReminderEmail({
        clientName: booking.client_name,
        salonName: booking.salon_name,
        serviceName: booking.service_name,
        staffName: booking.staff_name,
        bookedAt: new Date(booking.booked_at),
        price: parseFloat(booking.price),
        salonAddress: booking.salon_address,
        reminderType: '24h',
      });

      await sendEmail({ to: booking.client_email, subject, html });

      await pool.query(
        `UPDATE bookings SET reminder_24h_sent = true WHERE id = $1`,
        [booking.id]
      );
    }

    for (const booking of twoHourBookings.rows) {
      const { subject, html } = bookingReminderEmail({
        clientName: booking.client_name,
        salonName: booking.salon_name,
        serviceName: booking.service_name,
        staffName: booking.staff_name,
        bookedAt: new Date(booking.booked_at),
        price: parseFloat(booking.price),
        salonAddress: booking.salon_address,
        reminderType: '2h',
      });

      await sendEmail({ to: booking.client_email, subject, html });

      await pool.query(
        `UPDATE bookings SET reminder_2h_sent = true WHERE id = $1`,
        [booking.id]
      );
    }

    return {
      oneDayReminders: oneDayBookings.rows.length,
      twoHourReminders: twoHourBookings.rows.length,
    };
  }
);