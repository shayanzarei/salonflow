import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT id, current_tools, biggest_challenge
     FROM demo_bookings
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Demo booking not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      currentTools?: string;
      biggestChallenge?: string;
    };

    const currentTools = body.currentTools?.trim() ?? "";
    const biggestChallenge = body.biggestChallenge?.trim() ?? "";

    const result = await pool.query(
      `UPDATE demo_bookings
       SET current_tools = $2,
           biggest_challenge = $3,
           updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id, currentTools || null, biggestChallenge || null]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Demo booking not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating demo booking prep details", error);
    return NextResponse.json({ error: "Failed to update booking details" }, { status: 500 });
  }
}

