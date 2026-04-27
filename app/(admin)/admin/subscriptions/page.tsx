import {
  Table,
  TableContainer,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
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

      <TableContainer className="rounded-2xl border-gray-100">
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
            <Table className="min-w-[1200px]">
              <thead>
                <THeadRow>
                  <TH>Time</TH>
                  <TH>Source</TH>
                  <TH>Event</TH>
                  <TH>Plan</TH>
                  <TH>Email</TH>
                  <TH>Amount</TH>
                  <TH>Status</TH>
                  <TH>Stripe refs</TH>
                  <TH>Mode</TH>
                  <TH className="text-right">Details</TH>
                </THeadRow>
              </thead>
              <tbody>
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
                    <TBodyRow key={row.id} interactive={false}>
                      <TD className="whitespace-nowrap text-xs text-gray-500">
                        {new Date(row.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </TD>
                      <TD>
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {row.source}
                        </span>
                      </TD>
                      <TD className="max-w-[220px]">
                        <p className="break-words font-medium text-gray-900">
                          {row.event_type}
                        </p>
                        {row.message && (
                          <p className="mt-1 break-words text-xs text-rose-600">
                            {row.message}
                          </p>
                        )}
                      </TD>
                      <TD className="text-xs">
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
                      </TD>
                      <TD className="max-w-[180px] break-all text-xs text-gray-600">
                        {resolvedEmail ?? "—"}
                      </TD>
                      <TD className="whitespace-nowrap text-xs">
                        {amount}
                      </TD>
                      <TD>
                        {row.payment_status ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-800">
                            {row.payment_status.replace(/_/g, " ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TD>
                      <TD className="max-w-[200px] font-mono text-[11px] text-gray-500">
                        {refs || "—"}
                      </TD>
                      <TD className="text-xs">
                        {row.livemode === null
                          ? "—"
                          : row.livemode
                            ? "Live"
                            : "Test"}
                      </TD>
                      <TD className="text-right">
                        <Link
                          href={`/admin/subscriptions/${row.id}`}
                          className="inline-flex rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </TD>
                    </TBodyRow>
                  );
                  });
                })()}
              </tbody>
            </Table>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
