"use client";

import { useEffect, useState } from "react";

type Plan = "solo" | "hub" | "agency";
type BillingCycle = "monthly" | "annual";

type TenantBilling = {
  plan_tier: Plan;
  tenant_status: "trial" | "active" | "suspended";
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  primary_color: string | null;
};

type Payment = {
  id: string;
  created_at: string;
  event_type: string;
  plan: string | null;
  billing_cycle: string | null;
  amount_cents: number | null;
  currency: string | null;
  payment_status: string | null;
  invoice_id: string | null;
  livemode: boolean;
};

const PLAN_META: Record<
  Plan,
  {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    features: string[];
  }
> = {
  solo: {
    name: "Solo",
    monthlyPrice: 17,
    annualPrice: 156,
    features: [
      "1 Staff Profile",
      "100 Bookings/mo",
      "Professional Booking Page",
      "Website Builder (1 template)",
      "Booking Confirmations",
      "Email Support",
    ],
  },
  hub: {
    name: "Hub",
    monthlyPrice: 37,
    annualPrice: 348,
    features: [
      "Up to 5 Staff Members",
      "Unlimited Bookings",
      "Professional Booking Page",
      "Website Builder (6 templates)",
      "Automated Email Reminders",
      "Full Staff Portals",
      "Booking Confirmations",
      "Email Support",
    ],
  },
  agency: {
    name: "Agency",
    monthlyPrice: 67,
    annualPrice: 636,
    features: [
      "Up to 15 Staff Members",
      "Unlimited Bookings",
      "Custom Domain Support",
      "Website Builder (6 templates)",
      "Automated Email Reminders",
      "Full Staff Portals",
      "Advanced Customer Data",
      "Priority Email Support",
    ],
  },
};

const UPGRADE_ORDER: Plan[] = ["solo", "hub", "agency"];

function formatCents(cents: number | null, currency: string | null) {
  if (cents === null) return "—";
  const amount = cents / 100;
  const cur = (currency ?? "eur").toUpperCase();
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: cur,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysLeft(dateStr: string | null) {
  if (!dateStr) return 0;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function eventLabel(event_type: string) {
  if (event_type === "checkout.session.completed")
    return "Subscription started";
  if (event_type === "invoice.paid") return "Invoice paid";
  if (event_type === "invoice.payment_failed") return "Payment failed";
  return event_type;
}

function statusBadge(event_type: string) {
  if (event_type === "invoice.payment_failed") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
      Paid
    </span>
  );
}

export default function BillingPage() {
  const [tenant, setTenant] = useState<TenantBilling | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [managingPortal, setManagingPortal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Read URL params for expired/suspended banners
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isExpired = params?.get("expired") === "1";
  const isSuspended = params?.get("suspended") === "1";

  useEffect(() => {
    async function load() {
      const [tenantRes, paymentsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/billing/payments"),
      ]);
      const tenantData = await tenantRes.json();
      const paymentsData = await paymentsRes.json();
      setTenant(tenantData);
      setPayments(paymentsData.payments ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpgrade() {
    if (!selectedPlan) return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billingCycle: selectedCycle,
          email: undefined,
          // Pass trial end so Stripe won't charge until the trial period finishes.
          trialEndsAt:
            isTrialing && trialDays > 0 ? tenant?.trial_ends_at : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setUpgrading(false);
    }
  }

  async function handleManagePortal() {
    setManagingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setManagingPortal(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pb-12 animate-pulse">
        <div className="h-8 w-48 rounded bg-gray-100" />
        <div className="h-40 rounded-2xl bg-gray-100" />
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!tenant) return null;

  const brand = tenant.primary_color ?? "#11C4B6";
  const plan = tenant.plan_tier;
  const meta = PLAN_META[plan];
  const trialDays = daysLeft(tenant.trial_ends_at);
  const hasActiveTrialWindow = trialDays > 0 && Boolean(tenant.trial_ends_at);
  const isTrialing = tenant.tenant_status === "trial" || hasActiveTrialWindow;
  const isActive =
    tenant.tenant_status === "active" && !!tenant.stripe_subscription_id;
  const isSuspendedStatus = tenant.tenant_status === "suspended";
  const trialUrgent = trialDays <= 3;

  const availableUpgrades = UPGRADE_ORDER.filter(
    (p) => UPGRADE_ORDER.indexOf(p) > UPGRADE_ORDER.indexOf(plan)
  );
  const availableDowngrades = UPGRADE_ORDER.filter(
    (p) => UPGRADE_ORDER.indexOf(p) < UPGRADE_ORDER.indexOf(plan)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan & billing</h1>
        <p className="mt-1 text-gray-500">
          Manage your subscription and view payment history.
        </p>
      </div>

      {/* Trial expired banner */}
      {(isExpired || (isTrialing && trialDays === 0)) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">
              Your free trial has ended
            </p>
            <p className="text-sm text-red-700 mt-0.5">
              Choose a plan below to keep access to your account.
            </p>
          </div>
        </div>
      )}

      {/* Suspended banner */}
      {(isSuspended || isSuspendedStatus) && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4 flex items-start gap-3">
          <span className="text-orange-500 text-lg">🔒</span>
          <div>
            <p className="font-semibold text-orange-800">
              Your account is suspended
            </p>
            <p className="text-sm text-orange-700 mt-0.5">
              Please update your payment method to restore access.
            </p>
          </div>
        </div>
      )}

      {/* Trial countdown */}
      {isTrialing && trialDays > 0 && (
        <div
          className="rounded-xl border px-5 py-4 flex items-center justify-between gap-3"
          style={{
            borderColor: trialUrgent ? "#FED7AA" : "#A7F3D0",
            backgroundColor: trialUrgent ? "#FFF7ED" : "#ECFDF5",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{trialUrgent ? "⏰" : "🎉"}</span>
            <div>
              <p
                className="font-semibold"
                style={{ color: trialUrgent ? "#9A3412" : "#065F46" }}
              >
                {trialDays === 1
                  ? "Last day of your free trial"
                  : `${trialDays} days left in your free trial`}
              </p>
              <p
                className="text-sm mt-0.5"
                style={{ color: trialUrgent ? "#C2410C" : "#047857" }}
              >
                You have full Hub access until your trial ends.
              </p>
            </div>
          </div>
          {trialUrgent && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-orange-100 border border-orange-300 px-3 py-1 text-xs font-bold text-orange-800">
              Expires soon
            </span>
          )}
        </div>
      )}

      {/* Current plan card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span
              className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: brand }}
            >
              {meta.name} plan{" "}
              {isTrialing ? "· Trial" : isActive ? "· Active" : ""}
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              €{meta.monthlyPrice}
              <span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
            {isActive && (
              <p className="text-sm text-gray-500 mt-0.5">
                Subscription active — manage renewals and payment method below.
              </p>
            )}
          </div>

          {isActive && (
            <button
              onClick={handleManagePortal}
              disabled={managingPortal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {managingPortal ? "Opening…" : "Manage subscription ↗"}
            </button>
          )}
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {meta.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <span className="text-green-500 font-bold">✓</span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade / change plan section — shown when trialing or when they want to switch */}
      {(!isActive ||
        availableUpgrades.length > 0 ||
        availableDowngrades.length > 0) && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isActive ? "Change your plan" : "Choose a plan"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {isActive
                ? "Upgrade or downgrade at any time — changes take effect on your next billing cycle."
                : "Subscribe to keep full access after your trial ends."}
            </p>
          </div>

          {/* Billing cycle toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
            {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setSelectedCycle(cycle)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  selectedCycle === cycle
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Annual"}
                {cycle === "annual" && (
                  <span className="ml-1.5 text-xs font-bold text-green-600">
                    Save 20%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {UPGRADE_ORDER.map((p) => {
              const m = PLAN_META[p];
              const price =
                selectedCycle === "monthly"
                  ? m.monthlyPrice
                  : Math.round(m.annualPrice / 12);
              const isCurrent = p === plan;
              // Only visually dim + disable the card when the user has an active paid subscription on this plan.
              // If they're trialing (or trial expired) they should still be able to select their current plan tier.
              const showAsCurrent = isCurrent && isActive;
              const isSelected = selectedPlan === p;

              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlan(p === selectedPlan ? null : p)}
                  disabled={showAsCurrent}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#11C4B6] bg-[#F0FDFC]"
                      : showAsCurrent
                        ? "border-gray-200 bg-gray-50 opacity-60 cursor-default"
                        : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {showAsCurrent && (
                    <span className="absolute top-2 right-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-bold text-gray-600">
                      Current
                    </span>
                  )}
                  <p className="font-bold text-gray-900">{m.name}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    €{price}
                    <span className="text-xs font-normal text-gray-500">
                      /mo
                    </span>
                  </p>
                  {selectedCycle === "annual" && (
                    <p className="text-xs text-gray-400">€{m.annualPrice}/yr</p>
                  )}
                </button>
              );
            })}
          </div>

          {selectedPlan && (selectedPlan !== plan || !isActive) && (
            <div className="space-y-3">
              {/* Trial carry-over notice */}
              {isTrialing && trialDays > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <span className="font-semibold">
                    Your {trialDays} remaining trial day
                    {trialDays !== 1 ? "s" : ""} carry over.
                  </span>{" "}
                  We&apos;ll collect your card details now but won&apos;t charge
                  you until{" "}
                  <span className="font-semibold">
                    {new Date(tenant.trial_ends_at!).toLocaleDateString(
                      "nl-NL",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </span>
                  .
                </div>
              )}
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: brand }}
              >
                {upgrading
                  ? "Redirecting to checkout…"
                  : `Subscribe to ${PLAN_META[selectedPlan].name} — €${
                      selectedCycle === "monthly"
                        ? PLAN_META[selectedPlan].monthlyPrice
                        : Math.round(PLAN_META[selectedPlan].annualPrice / 12)
                    }/mo`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment history */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Payment history</h2>
        </div>

        {payments.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400">No payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-6 py-3 text-gray-800 font-medium">
                      {eventLabel(p.event_type)}
                    </td>
                    <td className="px-6 py-3 text-gray-600 capitalize">
                      {p.plan
                        ? `${p.plan}${p.billing_cycle ? ` · ${p.billing_cycle}` : ""}`
                        : "—"}
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-900">
                      {formatCents(p.amount_cents, p.currency)}
                    </td>
                    <td className="px-6 py-3">{statusBadge(p.event_type)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
