import CalendarView from "@/components/dashboard/CalendarView";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";
import { notFound } from "next/navigation";

export default async function CalendarPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  // Read the canonical booking_start_utc / booking_end_utc columns. The
  // legacy booked_at column still exists (kept in sync by trigger) but app
  // code must not depend on it — see lib/timezone.ts for the rule.
  const result = await pool.query(
    `SELECT
       b.id,
       b.client_name,
       b.client_email,
       b.client_phone,
       b.booking_start_utc,
       b.booking_end_utc,
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
       AND b.booking_start_utc >= NOW() - INTERVAL '7 days'
       AND b.status = 'confirmed'
     ORDER BY b.booking_start_utc ASC`,
    [tenant.id]
  );

  const staffResult = await pool.query(
    `SELECT id, name FROM staff WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );

  // Pass the salon's IANA zone to the client component so every Intl call
  // and every getHours-style bucketing inside is anchored to the salon's
  // wall clock (not the viewer's browser locale or the server's UTC).
  const tenantZone =
    tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
      ? tenant.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;

  return (
    <CalendarView
      bookings={result.rows}
      staff={staffResult.rows}
      brandColor={tenant.primary_color ?? 'var(--color-brand-600)'}
      tenantZone={tenantZone}
    />
  );
}
