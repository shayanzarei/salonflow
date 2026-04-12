import pool from '@/lib/db';
import { bookingReminderEmail } from '@/lib/emails/booking-reminder';
import { reviewRequestEmail } from '@/lib/emails/review-request';
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

    // 48hr window
    const twoDaysFrom = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const twoDayWindowStart = new Date(twoDaysFrom.getTime() - 2 * 60 * 60 * 1000);
    const twoDayWindowEnd = new Date(twoDaysFrom.getTime() + 2 * 60 * 60 * 1000);

    // 24hr window
    const oneDayFrom = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayWindowStart = new Date(oneDayFrom.getTime() - 2 * 60 * 60 * 1000);
    const oneDayWindowEnd = new Date(oneDayFrom.getTime() + 2 * 60 * 60 * 1000);

    // 2hr window (before appointment)
    const twoHoursFrom = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const twoHourWindowStart = new Date(twoHoursFrom.getTime() - 30 * 60 * 1000);
    const twoHourWindowEnd = new Date(twoHoursFrom.getTime() + 30 * 60 * 1000);

    // 2hr window AFTER appointment (for review request)
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const reviewWindowStart = new Date(twoHoursAgo.getTime() - 30 * 60 * 1000);
    const reviewWindowEnd = new Date(twoHoursAgo.getTime() + 30 * 60 * 1000);

    const bookingQuery = `
      SELECT
        b.*,
        s.name AS service_name,
        st.name AS staff_name,
        t.name AS salon_name,
        t.address AS salon_address,
        t.slug AS salon_slug
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN staff st ON b.staff_id = st.id
      JOIN tenants t ON b.tenant_id = t.id
      WHERE b.booked_at BETWEEN $1 AND $2
        AND b.status = 'confirmed'
        AND b.{flag} = false
    `;

    const [twoDayBookings, oneDayBookings, twoHourBookings, reviewBookings] =
      await Promise.all([
        pool.query(
          bookingQuery.replace('{flag}', 'reminder_48h_sent'),
          [twoDayWindowStart, twoDayWindowEnd]
        ),
        pool.query(
          bookingQuery.replace('{flag}', 'reminder_24h_sent'),
          [oneDayWindowStart, oneDayWindowEnd]
        ),
        pool.query(
          bookingQuery.replace('{flag}', 'reminder_2h_sent'),
          [twoHourWindowStart, twoHourWindowEnd]
        ),
        pool.query(
          bookingQuery.replace('{flag}', 'review_sent'),
          [reviewWindowStart, reviewWindowEnd]
        ),
      ]);

    async function sendReminders(
      bookings: any[],
      reminderType: '48h' | '24h' | '2h',
      flag: string
    ) {
      for (const booking of bookings) {
        const { subject, html } = bookingReminderEmail({
          clientName: booking.client_name,
          salonName: booking.salon_name,
          serviceName: booking.service_name,
          staffName: booking.staff_name,
          bookedAt: new Date(booking.booked_at),
          salonAddress: booking.salon_address,
          cancellationToken: booking.cancellation_token,
          bookingId: booking.id,
          salonSlug: booking.salon_slug,
          reminderType,
          price: parseFloat(booking.price),
        });

        await sendEmail({ to: booking.client_email, subject, html });
        await pool.query(
          `UPDATE bookings SET ${flag} = true WHERE id = $1`,
          [booking.id]
        );
      }
    }

    await sendReminders(twoDayBookings.rows, '48h', 'reminder_48h_sent');
    await sendReminders(oneDayBookings.rows, '24h', 'reminder_24h_sent');
    await sendReminders(twoHourBookings.rows, '2h', 'reminder_2h_sent');

    // send review requests
    for (const booking of reviewBookings.rows) {
      const { subject, html } = reviewRequestEmail({
        clientName: booking.client_name,
        salonName: booking.salon_name,
        serviceName: booking.service_name,
        staffName: booking.staff_name,
        bookingId: booking.id,
        reviewToken: booking.review_token,
        salonSlug: booking.salon_slug,
      });

      await sendEmail({ to: booking.client_email, subject, html });
      await pool.query(
        `UPDATE bookings SET review_sent = true, review_requested_at = NOW() WHERE id = $1`,
        [booking.id]
      );
    }

    return {
      fortyEightHourReminders: twoDayBookings.rows.length,
      oneDayReminders: oneDayBookings.rows.length,
      twoHourReminders: twoHourBookings.rows.length,
      reviewRequests: reviewBookings.rows.length,
    };
  }
);