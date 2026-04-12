import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import CalendarView from '@/components/dashboard/CalendarView';

export default async function CalendarPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  // fetch all upcoming bookings with details
  const result = await pool.query(
    `SELECT
       b.id,
       b.client_name,
       b.client_email,
       b.client_phone,
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
     WHERE b.tenant_id = $1
       AND b.booked_at >= NOW() - INTERVAL '7 days'
       AND b.status = 'confirmed'
     ORDER BY b.booked_at ASC`,
    [tenant.id]
  );

  const staffResult = await pool.query(
    `SELECT id, name FROM staff WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">Your weekly schedule</p>
      </div>
      <CalendarView
        bookings={result.rows}
        staff={staffResult.rows}
        brandColor={tenant.primary_color ?? '#7C3AED'}
      />
    </div>
  );
}