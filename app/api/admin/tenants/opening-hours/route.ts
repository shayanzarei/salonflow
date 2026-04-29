import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * Super-admin variant of the opening-hours endpoint. Mirrors
 * /api/settings/opening-hours but accepts a target tenant_id from the form
 * (admin context, not session) and posts back to the website?tab=hours
 * editor on success.
 *
 * Form encoding from the website?tab=hours form: per day-of-week 0..6 we
 * receive `open_<n>` ("on" if checked, missing if not), `start_<n>` and
 * `end_<n>` as HH:MM. We upsert all 7 days every time so a previously open
 * day that's now unchecked correctly transitions to closed.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tenantId = formData.get("tenant_id") as string;
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (let day = 0; day <= 6; day++) {
        const isWorking = formData.get(`open_${day}`) === "on";
        const startTime =
          (formData.get(`start_${day}`) as string | null) || "09:00";
        const endTime =
          (formData.get(`end_${day}`) as string | null) || "17:00";

        if (isWorking && startTime >= endTime) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            {
              error: `Day ${day}: start time must be before end time`,
            },
            { status: 400 }
          );
        }

        await client.query(
          `INSERT INTO salon_working_hours
             (tenant_id, day_of_week, start_time, end_time, is_working)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (tenant_id, day_of_week)
           DO UPDATE SET
             start_time = EXCLUDED.start_time,
             end_time   = EXCLUDED.end_time,
             is_working = EXCLUDED.is_working,
             updated_at = NOW()`,
          [tenantId, day, startTime, endTime, isWorking]
        );
      }
      await client.query("COMMIT");
    } catch (txErr) {
      await client.query("ROLLBACK");
      throw txErr;
    } finally {
      client.release();
    }

    return NextResponse.redirect(
      new URL(`/admin/tenants/${tenantId}/website?tab=hours`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
