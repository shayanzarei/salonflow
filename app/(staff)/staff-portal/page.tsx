import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import pool from '@/lib/db';
import { redirect } from 'next/navigation';
import StaffCalendarView from '@/components/staff/StaffCalendarView';
import { Card } from '@/components/ds/Card';
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from '@/lib/timezone';

export default async function StaffPortalPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const staffId = (session as any).staffId;
  if (!staffId) redirect('/dashboard');

  const [staffResult, bookingsResult] = await Promise.all([
    // We pull the salon's iana_timezone here too so every UI element below
    // (header date, "today's appointments" filter, calendar) renders against
    // the salon's wall clock — never the staff member's browser zone.
    pool.query(
      `SELECT s.*, t.primary_color, t.name AS salon_name, t.iana_timezone
       FROM staff s
       JOIN tenants t ON s.tenant_id = t.id
       WHERE s.id = $1`,
      [staffId]
    ),
    // Read the canonical booking_start_utc column (TIMESTAMPTZ). booked_at
    // is the legacy mirror kept in sync by trigger and must not be relied
    // on in app code — see lib/timezone.ts.
    pool.query(
      `SELECT
         b.id,
         b.client_name,
         b.client_email,
         b.booking_start_utc,
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
         AND b.booking_start_utc >= NOW() - INTERVAL '7 days'
         AND b.status = 'confirmed'
       ORDER BY b.booking_start_utc ASC`,
      [staffId]
    ),
  ]);

  const staffMember = staffResult.rows[0];
  if (!staffMember) redirect('/login');

  const bookings = bookingsResult.rows;
  const brand = staffMember.primary_color ?? '#7C3AED';
  const tenantZone =
    staffMember.iana_timezone && isValidIanaTimezone(staffMember.iana_timezone)
      ? staffMember.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;

  // "Today" must be evaluated in the salon's zone, not the server's. We
  // compute the salon-local YYYY-MM-DD once and compare against each
  // booking's salon-local date string for the count below.
  const todayLocal = new Intl.DateTimeFormat('en-CA', {
    timeZone: tenantZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const ymdInTenantZone = (instant: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tenantZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(instant);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-ink-900">My schedule</h1>
        <p className="mt-1 text-ink-500">
          {new Date().toLocaleDateString('en-US', {
            timeZone: tenantZone,
            weekday: 'long', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        {[
          {
            label: "Today's appointments",
            value: bookings.filter((b) =>
              ymdInTenantZone(new Date(b.booking_start_utc)) === todayLocal
            ).length,
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
        tenantZone={tenantZone}
      />
    </div>
  );
}