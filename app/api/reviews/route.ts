import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const booking_id = formData.get("booking_id") as string;
    const token = formData.get("token") as string;
    const tenant_id = formData.get("tenant_id") as string;
    const client_name = formData.get("client_name") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    // verify token
    const bookingResult = await pool.query(
      `SELECT * FROM bookings WHERE id = $1 AND review_token = $2`,
      [booking_id, token]
    );

    if (!bookingResult.rows[0]) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // save review
    await pool.query(
      `INSERT INTO reviews (tenant_id, client_name, rating, comment)
       VALUES ($1, $2, $3, $4)`,
      [tenant_id, client_name, rating, comment]
    );

    return NextResponse.redirect(
      new URL(`/review?booking=${booking_id}&token=${token}`, req.url)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
