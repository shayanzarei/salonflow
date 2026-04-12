import pool from '@/lib/db';
import { bookingReminderEmail } from '@/lib/emails/booking-reminder';
import { sendEmail } from '@/lib/emails/send';
import { inngest } from '@/lib/inngest';

export const sendBookingReminders = inngest.createFunction(
  {
    id: 'send-booking-reminders',
    name: 'Send booking reminders',
    triggers: [{ cron: '*/30 * * * *' }], // every 30 minutes
  },
  async () => {
    const now = new Date();

    // find bookings happening in ~24 hours (between 22 and 26 hours from now)
    const oneDayFrom = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayWindowStart = new Date(oneDayFrom.getTime() - 2 * 60 * 60 * 1000);
    const oneDayWindowEnd = new Date(oneDayFrom.getTime() + 2 * 60 * 60 * 1000);

    // find bookings happening in ~2 hours (between 1.5 and 2.5 hours from now)
    const twoHoursFrom = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const twoHourWindowStart = new Date(twoHoursFrom.getTime() - 30 * 60 * 1000);
    const twoHourWindowEnd = new Date(twoHoursFrom.getTime() + 30 * 60 * 1000);

    // fetch bookings needing 24hr reminder
    const oneDayBookings = await pool.query(
      `SELECT
         b.*,
         s.name AS service_name,
         s.price,
         s.duration_mins,
         st.name AS staff_name,
         t.name AS salon_name,
         t.address AS salon_address,
         t.primary_color,
         t.plan_tier
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       JOIN tenants t ON b.tenant_id = t.id
       WHERE b.booked_at BETWEEN $1 AND $2
         AND b.status = 'confirmed'
         AND b.reminder_24h_sent = false`,
      [oneDayWindowStart, oneDayWindowEnd]
    );

    // fetch bookings needing 2hr reminder
    const twoHourBookings = await pool.query(
      `SELECT
         b.*,
         s.name AS service_name,
         s.price,
         s.duration_mins,
         st.name AS staff_name,
         t.name AS salon_name,
         t.address AS salon_address,
         t.primary_color,
         t.plan_tier
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       JOIN tenants t ON b.tenant_id = t.id
       WHERE b.booked_at BETWEEN $1 AND $2
         AND b.status = 'confirmed'
         AND b.reminder_2h_sent = false`,
      [twoHourWindowStart, twoHourWindowEnd]
    );

    // send 24hr reminders
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

      await sendEmail({
        to: booking.client_email,
        subject,
        html,
      });

      await pool.query(
        `UPDATE bookings SET reminder_24h_sent = true WHERE id = $1`,
        [booking.id]
      );
    }

    // send 2hr reminders
    for (const booking of twoHourBookings.rows) {
      const { subject, html } = bookingReminderEmail({
        clientName: booking.client_name,
        salonName: booking.salon_name,
        serviceName: booking.service_name,
        staffName: booking.staff_name,
        bookedAt: new Date(booking.booked_at),
        salonAddress: booking.salon_address,
        price: parseFloat(booking.price),
        reminderType: '2h',
      });

      await sendEmail({
        to: booking.client_email,
        subject,
        html,
      });

      await pool.query(
        `UPDATE bookings SET reminder_2h_sent = true WHERE id = $1`,
        [booking.id]
      );

      console.log('Now:', now.toISOString());
      console.log('24hr window:', oneDayWindowStart.toISOString(), 'to', oneDayWindowEnd.toISOString());
      console.log('2hr window:', twoHourWindowStart.toISOString(), 'to', twoHourWindowEnd.toISOString());
      console.log('24hr bookings found:', oneDayBookings.rows.length);
      console.log('2hr bookings found:', twoHourBookings.rows.length);

      // debug - check what bookings exist
      const allBookings = await pool.query(
        `SELECT id, client_name, booked_at, reminder_24h_sent FROM bookings WHERE client_name = 'Test Reminder'`
      );
      console.log('Test booking:', JSON.stringify(allBookings.rows));
    }

    return {
      oneDayReminders: oneDayBookings.rows.length,
      twoHourReminders: twoHourBookings.rows.length,
    };
  }
);