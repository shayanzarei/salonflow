import { requireOwner } from "@/lib/require-owner";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

// GET /api/staff/hours?staffId=X
export async function GET(req: NextRequest) {
  const tenant = await getTenant();
  if (!tenant)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staffId = new URL(req.url).searchParams.get("staffId");
  if (!staffId)
    return NextResponse.json({ error: "staffId required" }, { status: 400 });

  const result = await pool.query(
    `SELECT day_of_week, start_time, end_time, is_working
     FROM staff_working_hours
     WHERE staff_id = $1 AND tenant_id = $2
     ORDER BY day_of_week`,
    [staffId, tenant.id]
  );

  return NextResponse.json({ hours: result.rows });
}

// POST /api/staff/hours
// Body: { staffId, hours: [{ day_of_week, start_time, end_time, is_working }] }
export async function POST(req: NextRequest) {
  const guard = await requireOwner();
  if (guard.error) return guard.error;

  const tenant = await getTenant();
  if (!tenant)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    staffId: string;
    hours: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_working: boolean;
    }[];
  };

  const { staffId, hours } = body;

  if (!staffId || !Array.isArray(hours)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Validate hours entries
  for (const h of hours) {
    if (
      typeof h.day_of_week !== "number" ||
      h.day_of_week < 0 ||
      h.day_of_week > 6
    ) {
      return NextResponse.json(
        { error: "Invalid day_of_week value" },
        { status: 400 }
      );
    }
    if (h.is_working && h.start_time >= h.end_time) {
      return NextResponse.json(
        { error: "start_time must be before end_time" },
        { status: 400 }
      );
    }
  }

  // Verify staff belongs to this tenant
  const staffCheck = await pool.query(
    `SELECT id FROM staff WHERE id = $1 AND tenant_id = $2`,
    [staffId, tenant.id]
  );
  if (!staffCheck.rows[0]) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const h of hours) {
      await client.query(
        `INSERT INTO staff_working_hours
           (tenant_id, staff_id, day_of_week, start_time, end_time, is_working)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (staff_id, day_of_week)
         DO UPDATE SET
           start_time = EXCLUDED.start_time,
           end_time   = EXCLUDED.end_time,
           is_working = EXCLUDED.is_working`,
        [tenant.id, staffId, h.day_of_week, h.start_time, h.end_time, h.is_working]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return NextResponse.json({ success: true });
}
