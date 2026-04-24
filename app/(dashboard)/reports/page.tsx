"use client";

import { useLocale } from "@/lib/i18n/context";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { useCallback, useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type DayBooking = {
  id: string;
  client_name: string;
  service_name: string;
  staff_name: string;
  booked_at: string;
  duration_mins: number;
  price: number;
  status: string;
};

type RevenueSummary = {
  today_revenue: number;
  today_completed: number;
  week_revenue: number;
  week_completed: number;
  month_revenue: number;
  month_completed: number;
  today_appointments: DayBooking[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEUR(n: number, localeTag: string) {
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

function fmtTime(iso: string, localeTag: string) {
  return new Date(iso).toLocaleTimeString(localeTag, {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function mkInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  revenue,
  count,
  accent,
  icon,
  localeTag,
  completedOne,
  completedMany,
}: {
  label: string;
  revenue: number;
  count: number;
  accent: string;
  icon: string;
  localeTag: string;
  completedOne: string;
  completedMany: string;
}) {
  const countLine =
    count === 1
      ? fillTemplate(completedOne, { n: count })
      : fillTemplate(completedMany, { n: count });
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      </div>
      <p className="mb-0.5 text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
        {formatEUR(revenue, localeTag)}
      </p>
      <p className="text-sm text-gray-500">
        {countLine}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { locale, t } = useLocale();
  const dr = t.dashboard.reports;
  const localeTag = bcp47ForLocale(locale);
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Local overrides for instant UI feedback before server reloads
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});
  const [finalizing, setFinalizing] = useState<Record<string, boolean>>({});
  const [bulkLoading, setBulkLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/revenue");
      if (!res.ok) throw new Error(dr.loadFailed);
      const json = (await res.json()) as RevenueSummary;
      setData(json);
      setLocalStatus({}); // clear overrides after reload
    } catch (e) {
      setError(e instanceof Error ? e.message : dr.genericError);
    } finally {
      setLoading(false);
    }
  }, [dr.loadFailed, dr.genericError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function finalize(bookingId: string, outcome: "completed" | "no_show") {
    setFinalizing((p) => ({ ...p, [bookingId]: true }));
    try {
      const res = await fetch("/api/bookings/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, outcome }),
      });
      if (res.ok) {
        setLocalStatus((p) => ({ ...p, [bookingId]: outcome }));
        void load();
      }
    } finally {
      setFinalizing((p) => ({ ...p, [bookingId]: false }));
    }
  }

  async function finalizeAll() {
    if (!data) return;
    const toFinalize = data.today_appointments.filter(
      (b) => !localStatus[b.id] && b.status !== "completed" && b.status !== "no_show" && b.status !== "cancelled"
    );
    if (toFinalize.length === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/bookings/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingIds: toFinalize.map((b) => b.id), outcome: "completed" }),
      });
      if (res.ok) {
        const patch: Record<string, "completed"> = {};
        toFinalize.forEach((b) => { patch[b.id] = "completed"; });
        setLocalStatus((p) => ({ ...p, ...patch }));
        // Reload stats after bulk finalize
        void load();
      }
    } finally {
      setBulkLoading(false);
    }
  }

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#E2E8F0" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="#11C4B6" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-sm">{dr.loading}</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-sm text-red-600">
        {error || dr.genericError}
      </div>
    );
  }

  const isActionRequiredStatus = (status: string) =>
    status !== "completed" && status !== "no_show" && status !== "cancelled";
  const today = data.today_appointments
    .slice()
    .sort((a, b) => {
      const aEffective = localStatus[a.id] ?? a.status;
      const bEffective = localStatus[b.id] ?? b.status;
      const aActionRequired = isActionRequiredStatus(aEffective);
      const bActionRequired = isActionRequiredStatus(bEffective);
      if (aActionRequired !== bActionRequired) {
        return aActionRequired ? -1 : 1;
      }
      return (
        new Date(a.booked_at).getTime() - new Date(b.booked_at).getTime()
      );
    });
  const pendingCount = today.filter((b) => {
    const effective = localStatus[b.id] ?? b.status;
    return isActionRequiredStatus(effective);
  }).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{dr.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {dr.subtitle}
          </p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={finalizeAll}
            disabled={bulkLoading}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#11C4B6,#0EA5B7)" }}
          >
            {bulkLoading
              ? dr.finalizing
              : fillTemplate(dr.completeAllTemplate, { n: pendingCount })}
          </button>
        )}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={dr.statToday}
          revenue={data.today_revenue}
          count={data.today_completed}
          accent="#11C4B6"
          icon="📅"
          localeTag={localeTag}
          completedOne={dr.completedAppointmentsOne}
          completedMany={dr.completedAppointmentsMany}
        />
        <StatCard
          label={dr.statWeek}
          revenue={data.week_revenue}
          count={data.week_completed}
          accent="#6366F1"
          icon="📆"
          localeTag={localeTag}
          completedOne={dr.completedAppointmentsOne}
          completedMany={dr.completedAppointmentsMany}
        />
        <StatCard
          label={dr.statMonth}
          revenue={data.month_revenue}
          count={data.month_completed}
          accent="#F59E0B"
          icon="🗓️"
          localeTag={localeTag}
          completedOne={dr.completedAppointmentsOne}
          completedMany={dr.completedAppointmentsMany}
        />
      </div>

      {/* Today's appointment list */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">{dr.todayAppointmentsTitle}</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {dr.todayAppointmentsHint}
            </p>
          </div>
          {pendingCount === 0 && today.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {dr.allDone}
            </span>
          )}
        </div>

        {today.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
              📅
            </div>
            <p className="font-semibold text-gray-700">{dr.emptyTodayTitle}</p>
            <p className="max-w-xs text-sm text-gray-400">
              {dr.emptyTodayBody}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {today.map((booking) => {
              const effectiveStatus = localStatus[booking.id] ?? booking.status;
              const isBusy = finalizing[booking.id] ?? false;
              const isDone = effectiveStatus === "completed" || effectiveStatus === "no_show";
              const isCancelled = effectiveStatus === "cancelled";

              return (
                <div
                  key={booking.id}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    effectiveStatus === "completed"
                      ? "bg-emerald-50/40"
                      : effectiveStatus === "no_show"
                        ? "bg-gray-50/70"
                        : isCancelled
                          ? "opacity-50"
                          : "bg-white"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg,#11C4B6,#0EA5B7)" }}
                  >
                    {mkInitials(booking.client_name)}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {booking.client_name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {booking.service_name} · {booking.staff_name} ·{" "}
                      {fmtTime(booking.booked_at, localeTag)}
                    </p>
                  </div>

                  {/* Price + duration */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-sm font-bold text-gray-900">
                      {formatEUR(booking.price, localeTag)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {fillTemplate(dr.minShort, { n: booking.duration_mins })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    {isDone || isCancelled ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          effectiveStatus === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : effectiveStatus === "no_show"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {effectiveStatus === "completed"
                          ? dr.statusCompleted
                          : effectiveStatus === "no_show"
                            ? dr.statusNoShow
                            : dr.statusCancelled}
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => void finalize(booking.id, "completed")}
                          disabled={isBusy}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {isBusy ? "…" : dr.done}
                        </button>
                        <button
                          onClick={() => void finalize(booking.id, "no_show")}
                          disabled={isBusy}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        >
                          {dr.noShow}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explainer */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4">
        <p className="text-sm leading-relaxed text-blue-700">
          {dr.explainer}
        </p>
      </div>

    </div>
  );
}
