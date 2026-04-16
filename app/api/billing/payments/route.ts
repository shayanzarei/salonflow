import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { NextResponse } from "next/server";

/**
 * GET /api/billing/payments
 *
 * Returns the Stripe payment logs for the current tenant, ordered newest first.
 * Only returns successful/relevant events shown in the user-facing billing page.
 */
export async function GET() {
  try {
    const tenant = await getTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    if (!tenant.stripe_customer_id) {
      return NextResponse.json({ payments: [] });
    }

    const result = await pool.query(
      `SELECT
         id,
         created_at,
         event_type,
         plan,
         billing_cycle,
         amount_cents,
         currency,
         payment_status,
         invoice_id,
         checkout_session_id,
         livemode
       FROM stripe_payment_logs
       WHERE customer_id = $1
         AND event_type IN (
           'checkout.session.completed',
           'invoice.paid',
           'invoice.payment_failed'
         )
       ORDER BY created_at DESC
       LIMIT 50`,
      [tenant.stripe_customer_id]
    );

    return NextResponse.json({ payments: result.rows });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load payments.";
    console.error("[billing payments]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
