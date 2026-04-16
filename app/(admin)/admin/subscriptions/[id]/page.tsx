import pool from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

type PaymentDetailRow = {
  id: string;
  created_at: Date;
  source: string;
  event_type: string;
  stripe_event_id: string | null;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
  invoice_id: string | null;
  customer_id: string | null;
  subscription_id: string | null;
  customer_email: string | null;
  amount_cents: number | null;
  currency: string | null;
  plan: string | null;
  billing_cycle: string | null;
  payment_status: string | null;
  livemode: boolean | null;
  message: string | null;
  metadata: Record<string, unknown>;
};

function detailItem(label: string, value: string | null) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

export default async function AdminPaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await pool.query(
    `SELECT
      id,
      created_at,
      source,
      event_type,
      stripe_event_id,
      checkout_session_id,
      payment_intent_id,
      invoice_id,
      customer_id,
      subscription_id,
      customer_email,
      amount_cents,
      currency,
      plan,
      billing_cycle,
      payment_status,
      livemode,
      message,
      metadata
    FROM stripe_payment_logs
    WHERE id = $1
    LIMIT 1`,
    [id]
  );

  const row = result.rows[0] as PaymentDetailRow | undefined;
  if (!row) notFound();

  const amount =
    row.amount_cents != null && row.currency
      ? new Intl.NumberFormat("nl-NL", {
          style: "currency",
          currency: row.currency.toUpperCase(),
        }).format(row.amount_cents / 100)
      : null;

  const metadata = row.metadata ?? {};
  const metadataEmail =
    (typeof metadata.customer_email === "string" && metadata.customer_email) ||
    (typeof metadata.customer_details_email === "string" &&
      metadata.customer_details_email) ||
    null;
  const shownEmail = row.customer_email ?? metadataEmail ?? null;

  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Payment Detail</h1>
          <p className="mt-1 text-sm text-gray-500">
            Inspect one Stripe payment log event in depth.
          </p>
        </div>
        <Link
          href="/admin/subscriptions"
          className="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Back to payments
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {row.source}
          </span>
          <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            {row.event_type}
          </span>
          {row.payment_status ? (
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
              {row.payment_status.replace(/_/g, " ")}
            </span>
          ) : null}
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            {row.livemode === null ? "—" : row.livemode ? "Live" : "Test"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {detailItem("Log Id", row.id)}
          {detailItem(
            "Created at",
            new Date(row.created_at).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          )}
          {detailItem("Email", shownEmail)}
          {detailItem("Amount", amount)}
          {detailItem(
            "Plan",
            row.plan
              ? `${row.plan}${row.billing_cycle ? ` · ${row.billing_cycle}` : ""}`
              : null
          )}
          {detailItem("Stripe Event Id", row.stripe_event_id)}
          {detailItem("Checkout Session Id", row.checkout_session_id)}
          {detailItem("Payment Intent Id", row.payment_intent_id)}
          {detailItem("Invoice Id", row.invoice_id)}
          {detailItem("Customer Id", row.customer_id)}
          {detailItem("Subscription Id", row.subscription_id)}
          {detailItem("Message", row.message)}
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-900">Raw metadata</h2>
          <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-700">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
