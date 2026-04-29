import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import StaffCalendarGrid from "@/components/staff/StaffCalendarGrid";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";

export default async function StaffCalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const staffId = (session as { staffId?: string }).staffId;
  if (!staffId) redirect("/dashboard");

  const [staffResult, bookingsResult] = await Promise.all([
    // Pull iana_timezone alongside the staff row so the calendar grid renders
    // every booking in the salon's wall clock — same rule as the owner view.
    pool.query(
      `SELECT s.*, t.primary_color, t.name AS salon_name, t.iana_timezone
       FROM staff s
       JOIN tenants t ON s.tenant_id = t.id
       WHERE s.id = $1`,
      [staffId]
    ),
    // Read the canonical booking_start_utc column. The legacy booked_at is
    // maintained read-only by trigger; app code must not depend on it.
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
         AND b.booking_start_utc <= NOW() + INTERVAL '60 days'
         AND b.status IN ('confirmed', 'pending')
       ORDER BY b.booking_start_utc ASC`,
      [staffId]
    ),
  ]);

  const staffMember = staffResult.rows[0];
  if (!staffMember) redirect("/login");

  const bookings = bookingsResult.rows;
  const brand = staffMember.primary_color ?? "#7C3AED";
  const tenantZone =
    staffMember.iana_timezone && isValidIanaTimezone(staffMember.iana_timezone)
      ? staffMember.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-h2 font-bold text-ink-900">Calendar</h1>
        <p className="mt-1 text-ink-500">Your upcoming appointments for the next 60 days</p>
      </div>

      <StaffCalendarGrid
        bookings={bookings}
        brandColor={brand}
        tenantZone={tenantZone}
      />
    </div>
  );
}
