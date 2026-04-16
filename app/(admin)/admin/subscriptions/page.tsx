import pool from "@/lib/db";
import Link from "next/link";

type PaymentLogRow = {
  id: string;
  created_at: Date;
  source: string;
  event_type: string;
  stripe_event_id: string | null;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
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

function resolveEmail(
  row: PaymentLogRow,
  byCheckoutSession: Map<string, string>,
  byCustomer: Map<string, string>,
  bySubscription: Map<string, string>
) {
  if (row.customer_email) return row.customer_email;
  const metadata = row.metadata ?? {};
  const metadataEmail =
    (typeof metadata.customer_email === "string" && metadata.customer_email) ||
    (typeof metadata.customer_details_email === "string" &&
      metadata.customer_details_email) ||
    (typeof metadata.email === "string" && metadata.email) ||
    null;
  if (metadataEmail) return metadataEmail;
  if (row.checkout_session_id && byCheckoutSession.has(row.checkout_session_id)) {
    return byCheckoutSession.get(row.checkout_session_id) ?? null;
  }
  if (row.customer_id && byCustomer.has(row.customer_id)) {
    return byCustomer.get(row.customer_id) ?? null;
  }
  if (row.subscription_id && bySubscription.has(row.subscription_id)) {
    return bySubscription.get(row.subscription_id) ?? null;
  }
  return null;
}

export default async function AdminPaymentsPage() {
  let rows: PaymentLogRow[] = [];
  let loadError: string | null = null;
  try {
    const result = await pool.query(
      `SELECT
        id,
        created_at,
        source,
        event_type,
        stripe_event_id,
        checkout_session_id,
        payment_intent_id,
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
      ORDER BY created_at DESC
      LIMIT 500`
    );
    rows = result.rows as PaymentLogRow[];
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load payment logs.";
  }

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Payments
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Stripe checkout starts and webhook events. Apply migration{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">
            010_stripe_payment_logs.sql
          </code>{" "}
          if queries fail or the table is missing.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {loadError && (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-900">
            <p className="font-medium">Could not read payment logs</p>
            <p className="mt-1 font-mono text-xs break-all opacity-90">
              {loadError}
            </p>
          </div>
        )}
        {rows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No payment log entries yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[1200px] border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Source</th>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Stripe refs</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(() => {
                  const byCheckoutSession = new Map<string, string>();
                  const byCustomer = new Map<string, string>();
                  const bySubscription = new Map<string, string>();
                  for (const item of rows) {
                    const metadata = item.metadata ?? {};
                    const metadataEmail =
                      (typeof metadata.customer_email === "string" && metadata.customer_email) ||
                      (typeof metadata.customer_details_email === "string" &&
                        metadata.customer_details_email) ||
                      null;
                    const resolved = item.customer_email ?? metadataEmail ?? null;
                    if (!resolved) continue;
                    if (item.checkout_session_id && !byCheckoutSession.has(item.checkout_session_id)) {
                      byCheckoutSession.set(item.checkout_session_id, resolved);
                    }
                    if (item.customer_id && !byCustomer.has(item.customer_id)) {
                      byCustomer.set(item.customer_id, resolved);
                    }
                    if (item.subscription_id && !bySubscription.has(item.subscription_id)) {
                      bySubscription.set(item.subscription_id, resolved);
                    }
                  }

                  return rows.map((row) => {
                    const resolvedEmail = resolveEmail(
                      row,
                      byCheckoutSession,
                      byCustomer,
                      bySubscription
                    );
                  const amount =
                    row.amount_cents != null && row.currency
                      ? new Intl.NumberFormat("nl-NL", {
                          style: "currency",
                          currency: row.currency.toUpperCase(),
                        }).format(row.amount_cents / 100)
                      : "—";
                  const refs = [
                    row.checkout_session_id && `cs:…${row.checkout_session_id.slice(-8)}`,
                    row.payment_intent_id && `pi:…${row.payment_intent_id.slice(-8)}`,
                    row.subscription_id && `sub:…${row.subscription_id.slice(-8)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <tr key={row.id} className="text-sm text-gray-800">
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-500">
                        {new Date(row.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {row.source}
                        </span>
                      </td>
                      <td className="max-w-[220px] px-5 py-3">
                        <p className="break-words font-medium text-gray-900">
                          {row.event_type}
                        </p>
                        {row.message && (
                          <p className="mt-1 break-words text-xs text-rose-600">
                            {row.message}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {row.plan ? (
                          <span className="capitalize text-gray-900">
                            {row.plan}
                            {row.billing_cycle
                              ? ` · ${row.billing_cycle}`
                              : ""}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="max-w-[180px] px-5 py-3 break-all text-xs text-gray-600">
                        {resolvedEmail ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs">
                        {amount}
                      </td>
                      <td className="px-5 py-3">
                        {row.payment_status ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-800">
                            {row.payment_status.replace(/_/g, " ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="max-w-[200px] px-5 py-3 font-mono text-[11px] text-gray-500">
                        {refs || "—"}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {row.livemode === null
                          ? "—"
                          : row.livemode
                            ? "Live"
                            : "Test"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/subscriptions/${row.id}`}
                          className="inline-flex rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
