import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";
import { NextResponse } from "next/server";

/**
 * GET /api/reports/revenue
 *
 * Returns:
 *  - Completed-booking revenue totals for today / this calendar week / this month
 *  - All of today's bookings (confirmed + pending + completed + no_show) so the
 *    Day Overview can show them for finalization
 *
 * "Today", "this week" and "this month" are evaluated in the **tenant's** IANA
 * zone (`tenants.iana_timezone`) so the numbers always match what the salon
 * owner sees on their wall clock — never the server's clock or a hardcoded
 * value. Migration 016 backfills tenants.iana_timezone with the helper's
 * default for any pre-migration row.
 *
 * Time-zone is passed as a parameter (`$2`) rather than inlined into the SQL
 * to avoid any chance of SQL injection via the tenant's stored zone string.
 * `AT TIME ZONE` accepts a TEXT expression, so this is straightforward.
 */
export async function GET() {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantZone =
      tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
        ? tenant.iana_timezone
        : DEFAULT_FALLBACK_TIMEZONE;

    const [revenueResult, todayResult] = await Promise.all([
      // Revenue aggregates — only count status = 'completed'.
      // Uses booking_start_utc (post-016) and falls back to booked_at — the
      // trigger keeps these in sync for legacy rows during the transition.
      pool.query(
        `SELECT
           -- Today
           COALESCE(SUM(s.price) FILTER (
             WHERE (b.booking_start_utc AT TIME ZONE $2)::date = (NOW() AT TIME ZONE $2)::date
               AND b.status = 'completed'
           ), 0)::float AS today_revenue,

           COUNT(*) FILTER (
             WHERE (b.booking_start_utc AT TIME ZONE $2)::date = (NOW() AT TIME ZONE $2)::date
               AND b.status = 'completed'
           )::int AS today_completed,

           -- This calendar week (Mon–Sun)
           COALESCE(SUM(s.price) FILTER (
             WHERE date_trunc('week', b.booking_start_utc AT TIME ZONE $2)
                 = date_trunc('week', NOW() AT TIME ZONE $2)
               AND b.status = 'completed'
           ), 0)::float AS week_revenue,

           COUNT(*) FILTER (
             WHERE date_trunc('week', b.booking_start_utc AT TIME ZONE $2)
                 = date_trunc('week', NOW() AT TIME ZONE $2)
               AND b.status = 'completed'
           )::int AS week_completed,

           -- This calendar month
           COALESCE(SUM(s.price) FILTER (
             WHERE date_trunc('month', b.booking_start_utc AT TIME ZONE $2)
                 = date_trunc('month', NOW() AT TIME ZONE $2)
               AND b.status = 'completed'
           ), 0)::float AS month_revenue,

           COUNT(*) FILTER (
             WHERE date_trunc('month', b.booking_start_utc AT TIME ZONE $2)
                 = date_trunc('month', NOW() AT TIME ZONE $2)
               AND b.status = 'completed'
           )::int AS month_completed

         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.tenant_id = $1`,
        [tenant.id, tenantZone]
      ),

      // All of today's appointments for the Day Overview panel
      pool.query(
        `SELECT
           b.id,
           b.client_name,
           b.booking_start_utc AS booked_at,
           b.status,
           s.name   AS service_name,
           s.price::float AS price,
           s.duration_mins,
           st.name  AS staff_name
         FROM bookings b
         JOIN services s  ON b.service_id  = s.id
         JOIN staff    st ON b.staff_id    = st.id
         WHERE b.tenant_id = $1
           AND (b.booking_start_utc AT TIME ZONE $2)::date = (NOW() AT TIME ZONE $2)::date
           AND b.status NOT IN ('cancelled')
        ORDER BY
          CASE
            WHEN b.status IN ('completed', 'no_show', 'cancelled') THEN 1
            ELSE 0
          END ASC,
          b.booking_start_utc ASC`,
        [tenant.id, tenantZone]
      ),
    ]);

    const rev = revenueResult.rows[0];

    return NextResponse.json({
      // Echo the resolved zone so the client can render times against the
      // salon's wall clock rather than the browser's locale default.
      tenant_iana_timezone: tenantZone,
      today_revenue:    Number(rev.today_revenue),
      today_completed:  Number(rev.today_completed),
      week_revenue:     Number(rev.week_revenue),
      week_completed:   Number(rev.week_completed),
      month_revenue:    Number(rev.month_revenue),
      month_completed:  Number(rev.month_completed),
      today_appointments: todayResult.rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load revenue";
    console.error("[reports/revenue]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
