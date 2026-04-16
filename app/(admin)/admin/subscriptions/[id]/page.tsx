"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentDetailRow = {
  id: string;
  created_at: string;
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

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

export default function AdminPaymentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [row, setRow] = useState<PaymentDetailRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [resyncing, setResyncing] = useState(false);
  const [resyncResult, setResyncResult] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/subscriptions/${id}`)
      .then((r) => r.json())
      .then((data) => { setRow(data.row ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleResync() {
    if (!row?.checkout_session_id) return;
    setResyncing(true);
    setResyncResult(null);
    try {
      const res = await fetch("/api/admin/stripe/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: row.checkout_session_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResyncResult(`❌ ${data.error ?? "Failed"}`);
      } else {
        setResyncResult(
          data.created
            ? "✅ New account created and setup email sent."
            : "✅ Existing account updated — plan and Stripe IDs linked."
        );
      }
    } catch {
      setResyncResult("❌ Network error");
    } finally {
      setResyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-100" />
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!row) {
    return <p className="text-sm text-gray-500">Payment log not found.</p>;
  }

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

  const canResync =
    row.checkout_session_id !== null &&
    (row.event_type === "checkout.session.completed" ||
      row.event_type === "checkout.session.created");

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

      {/* Resync banner */}
      {canResync && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">Manual provisioning</p>
            <p className="text-xs text-amber-700 mt-0.5">
              If the webhook was missed, click resync to manually link this checkout to the user account.
            </p>
            {resyncResult && (
              <p className="mt-1.5 text-sm font-medium text-gray-800">{resyncResult}</p>
            )}
          </div>
          <button
            onClick={handleResync}
            disabled={resyncing}
            className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {resyncing ? "Running…" : "Resync provisioning"}
          </button>
        </div>
      )}

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
          <DetailItem label="Log Id" value={row.id} />
          <DetailItem
            label="Created at"
            value={new Date(row.created_at).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          />
          <DetailItem label="Email" value={shownEmail} />
          <DetailItem label="Amount" value={amount} />
          <DetailItem
            label="Plan"
            value={
              row.plan
                ? `${row.plan}${row.billing_cycle ? ` · ${row.billing_cycle}` : ""}`
                : null
            }
          />
          <DetailItem label="Stripe Event Id" value={row.stripe_event_id} />
          <DetailItem label="Checkout Session Id" value={row.checkout_session_id} />
          <DetailItem label="Payment Intent Id" value={row.payment_intent_id} />
          <DetailItem label="Invoice Id" value={row.invoice_id} />
          <DetailItem label="Customer Id" value={row.customer_id} />
          <DetailItem label="Subscription Id" value={row.subscription_id} />
          <DetailItem label="Message" value={row.message} />
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
