import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextResponse } from "next/server";

/**
 * GET /api/reports/revenue
 *
 * Returns:
 *  - Completed-booking revenue totals for today / this calendar week / this month
 *  - All of today's bookings (confirmed + pending + completed + no_show) so the
 *    Day Overview can show them for finalization
 *
 * All times are evaluated in Europe/Amsterdam timezone so "today" matches what
 * the salon owner sees on their clock.
 */
export async function GET() {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [revenueResult, todayResult] = await Promise.all([
      // Revenue aggregates — only count status = 'completed'
      pool.query(
        `SELECT
           -- Today
           COALESCE(SUM(s.price) FILTER (
             WHERE b.booked_at::date = (NOW() AT TIME ZONE 'Europe/Amsterdam')::date
               AND b.status = 'completed'
           ), 0)::float AS today_revenue,

           COUNT(*) FILTER (
             WHERE b.booked_at::date = (NOW() AT TIME ZONE 'Europe/Amsterdam')::date
               AND b.status = 'completed'
           )::int AS today_completed,

           -- This calendar week (Mon–Sun)
           COALESCE(SUM(s.price) FILTER (
             WHERE date_trunc('week', b.booked_at AT TIME ZONE 'Europe/Amsterdam')
                 = date_trunc('week', NOW() AT TIME ZONE 'Europe/Amsterdam')
               AND b.status = 'completed'
           ), 0)::float AS week_revenue,

           COUNT(*) FILTER (
             WHERE date_trunc('week', b.booked_at AT TIME ZONE 'Europe/Amsterdam')
                 = date_trunc('week', NOW() AT TIME ZONE 'Europe/Amsterdam')
               AND b.status = 'completed'
           )::int AS week_completed,

           -- This calendar month
           COALESCE(SUM(s.price) FILTER (
             WHERE date_trunc('month', b.booked_at AT TIME ZONE 'Europe/Amsterdam')
                 = date_trunc('month', NOW() AT TIME ZONE 'Europe/Amsterdam')
               AND b.status = 'completed'
           ), 0)::float AS month_revenue,

           COUNT(*) FILTER (
             WHERE date_trunc('month', b.booked_at AT TIME ZONE 'Europe/Amsterdam')
                 = date_trunc('month', NOW() AT TIME ZONE 'Europe/Amsterdam')
               AND b.status = 'completed'
           )::int AS month_completed

         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.tenant_id = $1`,
        [tenant.id]
      ),

      // All of today's appointments for the Day Overview panel
      pool.query(
        `SELECT
           b.id,
           b.client_name,
           b.booked_at,
           b.status,
           s.name   AS service_name,
           s.price::float AS price,
           s.duration_mins,
           st.name  AS staff_name
         FROM bookings b
         JOIN services s  ON b.service_id  = s.id
         JOIN staff    st ON b.staff_id    = st.id
         WHERE b.tenant_id = $1
           AND b.booked_at::date = (NOW() AT TIME ZONE 'Europe/Amsterdam')::date
           AND b.status NOT IN ('cancelled')
         ORDER BY b.booked_at ASC`,
        [tenant.id]
      ),
    ]);

    const rev = revenueResult.rows[0];

    return NextResponse.json({
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
