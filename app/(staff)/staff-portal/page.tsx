import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import pool from '@/lib/db';
import { redirect } from 'next/navigation';
import StaffCalendarView from '@/components/staff/StaffCalendarView';
import { Card } from '@/components/ds/Card';

export default async function StaffPortalPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const staffId = (session as any).staffId;
  if (!staffId) redirect('/dashboard');

  const [staffResult, bookingsResult] = await Promise.all([
    pool.query(
      `SELECT s.*, t.primary_color, t.name AS salon_name
       FROM staff s
       JOIN tenants t ON s.tenant_id = t.id
       WHERE s.id = $1`,
      [staffId]
    ),
    pool.query(
      `SELECT
         b.id,
         b.client_name,
         b.client_email,
         b.booked_at,
         b.status,
         s.name AS service_name,
         s.duration_mins,
         s.price,
         st.name AS staff_name,
         st.id AS staff_id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.staff_id = $1
         AND b.booked_at >= NOW() - INTERVAL '7 days'
         AND b.status = 'confirmed'
       ORDER BY b.booked_at ASC`,
      [staffId]
    ),
  ]);

  const staffMember = staffResult.rows[0];
  if (!staffMember) redirect('/login');

  const bookings = bookingsResult.rows;
  const brand = staffMember.primary_color ?? '#7C3AED';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-ink-900">My schedule</h1>
        <p className="mt-1 text-ink-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        {[
          {
            label: "Today's appointments",
            value: bookings.filter(b => {
              const d = new Date(b.booked_at);
              return d.toDateString() === new Date().toDateString();
            }).length,
          },
          {
            label: 'This week',
            value: bookings.length,
          },
        ].map((stat) => (
          <Card key={stat.label} variant="outlined">
            <p className="text-body-sm text-ink-500">{stat.label}</p>
            <p className="mt-1 text-h2 font-semibold text-ink-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <StaffCalendarView
        bookings={bookings}
        brandColor={brand}
      />
    </div>
  );
}