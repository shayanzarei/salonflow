import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

type OpeningHourInput = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working: boolean;
};

export async function GET() {
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pool.query(
    `SELECT day_of_week, start_time, end_time, is_working
     FROM salon_working_hours
     WHERE tenant_id = $1
     ORDER BY day_of_week`,
    [tenant.id]
  );

  return NextResponse.json({ hours: result.rows });
}

export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    hours: OpeningHourInput[];
    redirect_to?: string;
  };
  const hours = body.hours;
  const redirectToRaw = body.redirect_to ?? "";
  const redirectTo =
    redirectToRaw.startsWith("/") && !redirectToRaw.startsWith("//")
      ? redirectToRaw
      : "";

  if (!Array.isArray(hours)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const hour of hours) {
    if (
      typeof hour.day_of_week !== "number" ||
      hour.day_of_week < 0 ||
      hour.day_of_week > 6
    ) {
      return NextResponse.json(
        { error: "Invalid day_of_week value" },
        { status: 400 }
      );
    }

    if (hour.is_working && hour.start_time >= hour.end_time) {
      return NextResponse.json(
        { error: "start_time must be before end_time" },
        { status: 400 }
      );
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const staffResult = await client.query(
      `SELECT id FROM staff WHERE tenant_id = $1 ORDER BY created_at ASC`,
      [tenant.id]
    );
    const singleStaffId =
      staffResult.rows.length === 1 ? (staffResult.rows[0].id as string) : null;

    for (const hour of hours) {
      await client.query(
        `INSERT INTO salon_working_hours
          (tenant_id, day_of_week, start_time, end_time, is_working)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tenant_id, day_of_week)
         DO UPDATE SET
           start_time = EXCLUDED.start_time,
           end_time = EXCLUDED.end_time,
           is_working = EXCLUDED.is_working,
           updated_at = NOW()`,
        [
          tenant.id,
          hour.day_of_week,
          hour.start_time,
          hour.end_time,
          hour.is_working,
        ]
      );

      // Keep staff and business hours aligned when there's only one staff member.
      if (singleStaffId) {
        await client.query(
          `INSERT INTO staff_working_hours
            (tenant_id, staff_id, day_of_week, start_time, end_time, is_working)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (staff_id, day_of_week)
           DO UPDATE SET
             start_time = EXCLUDED.start_time,
             end_time = EXCLUDED.end_time,
             is_working = EXCLUDED.is_working`,
          [
            tenant.id,
            singleStaffId,
            hour.day_of_week,
            hour.start_time,
            hour.end_time,
            hour.is_working,
          ]
        );
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return NextResponse.json({ success: true, redirect_to: redirectTo || null });
}
