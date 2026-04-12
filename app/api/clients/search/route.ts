import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenant();
    if (!tenant) return NextResponse.json([], { status: 401 });

    const q = req.nextUrl.searchParams.get("q") ?? "";

    const result = await pool.query(
      `SELECT DISTINCT ON (client_email)
         client_name,
         client_email,
         client_phone
       FROM bookings
       WHERE tenant_id = $1
         AND client_name ILIKE $2
       ORDER BY client_email, created_at DESC
       LIMIT 5`,
      [tenant.id, `%${q}%`]
    );

    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
