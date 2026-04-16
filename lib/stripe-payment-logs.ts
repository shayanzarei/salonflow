import pool from "@/lib/db";

export type StripePaymentLogInsert = {
  source: "api" | "webhook";
  event_type: string;
  stripe_event_id?: string | null;
  checkout_session_id?: string | null;
  payment_intent_id?: string | null;
  invoice_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  customer_email?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  plan?: string | null;
  billing_cycle?: string | null;
  payment_status?: string | null;
  livemode?: boolean | null;
  message?: string | null;
  metadata?: Record<string, unknown>;
};

export async function insertStripePaymentLog(
  row: StripePaymentLogInsert
): Promise<boolean> {
  const metadata = row.metadata ?? {};
  try {
    const result = await pool.query(
      `INSERT INTO stripe_payment_logs (
        source, event_type, stripe_event_id, checkout_session_id, payment_intent_id,
        invoice_id, customer_id, subscription_id, customer_email, amount_cents,
        currency, plan, billing_cycle, payment_status, livemode, message, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17::jsonb
      )
      ON CONFLICT (stripe_event_id) DO NOTHING`,
      [
        row.source,
        row.event_type,
        row.stripe_event_id ?? null,
        row.checkout_session_id ?? null,
        row.payment_intent_id ?? null,
        row.invoice_id ?? null,
        row.customer_id ?? null,
        row.subscription_id ?? null,
        row.customer_email ?? null,
        row.amount_cents ?? null,
        row.currency ?? null,
        row.plan ?? null,
        row.billing_cycle ?? null,
        row.payment_status ?? null,
        row.livemode ?? null,
        row.message ?? null,
        JSON.stringify(metadata),
      ]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[stripe_payment_logs] insert failed:", err);
    return false;
  }
}
