"use client";

import { Button } from "@/components/ds/Button";
import { CheckoutResultLayout } from "@/components/marketing/CheckoutResultLayout";
import { CheckCircleIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { useEffect, useState } from "react";

type SessionPayload = {
  status: string;
  payment_status: string;
  customer_email: string | null;
  plan: string | null;
  billing_cycle: string | null;
  amount_total: number | null;
  currency: string | null;
  provisioned: boolean;
  provisioning_error: string | null;
  error?: string;
};

export function CheckoutSuccessContent({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<SessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/stripe/checkout/session?session_id=${encodeURIComponent(sessionId)}`
        );
        const json = (await res.json()) as SessionPayload;
        if (!res.ok) {
          throw new Error(json.error ?? "Could not confirm your payment.");
        }
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const amountLabel =
    data?.amount_total != null && data.currency
      ? new Intl.NumberFormat("nl-NL", {
          style: "currency",
          currency: data.currency.toUpperCase(),
        }).format(data.amount_total / 100)
      : null;

  const pendingAsync =
    !loading &&
    !error &&
    data &&
    (data.status !== "complete" ||
      (data.payment_status !== "paid" &&
        data.payment_status !== "no_payment_required"));

  return (
    <CheckoutResultLayout>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <div
          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${
            pendingAsync
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <CheckCircleIcon size={36} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {loading
            ? "Setting up your account…"
            : pendingAsync
              ? "Almost there"
              : "You're all set!"}
        </h1>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          {loading
            ? "Confirming your payment and activating your subscription…"
            : error
              ? error
              : pendingAsync
                ? "Your bank is still confirming this payment. Your account will be activated automatically once it clears."
                : data?.provisioned
                  ? "Your subscription is active. Sign in below to access your account."
                  : "Payment confirmed. If your account isn't updated yet, please contact support."}
        </p>

        {!loading && !error && data && (
          <div className="mt-8 w-full rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-left shadow-sm backdrop-blur-sm">
            <dl className="space-y-3 text-sm">
              {data.plan && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Plan</dt>
                  <dd className="font-medium capitalize text-slate-900">
                    {data.plan}
                    {data.billing_cycle
                      ? ` · ${data.billing_cycle === "annual" ? "Annual" : "Monthly"}`
                      : ""}
                  </dd>
                </div>
              )}
              {amountLabel && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Total</dt>
                  <dd className="font-medium text-slate-900">{amountLabel}</dd>
                </div>
              )}
              {data.customer_email && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Email</dt>
                  <dd className="break-all font-medium text-slate-900">
                    {data.customer_email}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Payment status</dt>
                <dd className="font-medium capitalize text-slate-900">
                  {data.payment_status?.replace(/_/g, " ") ?? "—"}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-slate-500">
              {pendingAsync
                ? "You can leave this page open or return later; no need to pay again."
                : "If you used a bank redirect (such as iDEAL), your bank confirms the payment asynchronously. We finalize access from Stripe webhooks—you may receive confirmation email shortly after returning here."}
            </p>
          </div>
        )}

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {!loading && !error && data?.provisioned && (
            <Button asChild variant="primary" size="lg">
              <Link href="/login">Sign in to your account →</Link>
            </Button>
          )}
          <Button
            asChild
            variant={data?.provisioned ? "secondary" : "primary"}
            size="lg"
          >
            <Link href="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </CheckoutResultLayout>
  );
}
