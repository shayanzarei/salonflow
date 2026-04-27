"use client";

import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
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
    <div className="rounded-md border border-ink-100 bg-ink-50 p-3">
      <p className="text-caption uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 break-all text-body-sm font-medium text-ink-900">{value || "—"}</p>
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
        <div className="h-8 w-48 rounded-sm bg-ink-100" />
        <div className="h-64 rounded-lg bg-ink-100" />
      </div>
    );
  }

  if (!row) {
    return <p className="text-body-sm text-ink-500">Payment log not found.</p>;
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
          <h1 className="text-h2 font-bold text-ink-900">Payment Detail</h1>
          <p className="mt-1 text-body-sm text-ink-500">
            Inspect one Stripe payment log event in depth.
          </p>
        </div>
        <Button asChild variant="secondary" size="md">
          <Link href="/admin/subscriptions">Back to payments</Link>
        </Button>
      </div>

      {/* Resync banner */}
      {canResync && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning-600/30 bg-warning-50 px-4 py-3">
          <div>
            <p className="text-body-sm font-semibold text-warning-700">Manual provisioning</p>
            <p className="mt-0.5 text-caption text-warning-700">
              If the webhook was missed, click resync to manually link this checkout to the user account.
            </p>
            {resyncResult && (
              <p className="mt-1.5 text-body-sm font-medium text-ink-900">{resyncResult}</p>
            )}
          </div>
          <Button
            type="button"
            onClick={handleResync}
            disabled={resyncing}
            variant="primary"
            size="md"
            className="shrink-0"
          >
            {resyncing ? "Running…" : "Resync provisioning"}
          </Button>
        </div>
      )}

      <Card variant="outlined">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{row.source}</Badge>
          <Badge variant="info">{row.event_type}</Badge>
          {row.payment_status ? (
            <Badge variant="success" className="capitalize">
              {row.payment_status.replace(/_/g, " ")}
            </Badge>
          ) : null}
          <Badge variant="neutral">
            {row.livemode === null ? "—" : row.livemode ? "Live" : "Test"}
          </Badge>
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
          <h2 className="text-body-sm font-semibold text-ink-900">Raw metadata</h2>
          <pre className="mt-2 overflow-x-auto rounded-md border border-ink-100 bg-ink-50 p-4 text-caption text-ink-700">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      </Card>
    </div>
  );
}
