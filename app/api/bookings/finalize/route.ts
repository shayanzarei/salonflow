import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/bookings/finalize
 *
 * Marks one or more confirmed bookings as `completed` or `no_show`
 * at end-of-day.  Used by the Revenue / Reports page.
 *
 * Body (JSON):
 *   { bookingId: string,  outcome: "completed" | "no_show" }
 *   OR
 *   { bookingIds: string[], outcome: "completed" | "no_show" }   ← bulk finalize
 *
 * Only bookings that belong to the current tenant and have status = 'confirmed'
 * or 'pending' are updated — already-cancelled or finalized rows are silently skipped.
 */
export async function POST(request: NextRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const outcome = body?.outcome as string | undefined;

    if (outcome !== "completed" && outcome !== "no_show") {
      return NextResponse.json(
        { error: "outcome must be 'completed' or 'no_show'" },
        { status: 400 }
      );
    }

    // Support single ID or array
    let ids: string[] = [];
    if (typeof body?.bookingId === "string") {
      ids = [body.bookingId];
    } else if (Array.isArray(body?.bookingIds)) {
      ids = body.bookingIds.filter((id: unknown) => typeof id === "string");
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "bookingId or bookingIds is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE bookings
       SET status = $1, finalized_at = NOW()
       WHERE tenant_id = $2
         AND id = ANY($3::uuid[])
         AND status IN ('confirmed', 'pending')
       RETURNING id`,
      [outcome, tenant.id, ids]
    );

    return NextResponse.json({ ok: true, updated: result.rowCount ?? 0 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to finalize booking.";
    console.error("[finalize-booking]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
