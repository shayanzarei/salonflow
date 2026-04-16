import pool from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!(session as any)?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const result = await pool.query(
    `SELECT
      id, created_at, source, event_type, stripe_event_id,
      checkout_session_id, payment_intent_id, invoice_id,
      customer_id, subscription_id, customer_email,
      amount_cents, currency, plan, billing_cycle,
      payment_status, livemode, message, metadata
    FROM stripe_payment_logs
    WHERE id = $1
    LIMIT 1`,
    [id]
  );

  const row = result.rows[0] ?? null;
  return NextResponse.json({ row });
}
