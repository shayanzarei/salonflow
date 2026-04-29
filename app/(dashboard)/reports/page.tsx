"use client";

import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
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
  /** IANA zone the API used to compute "today/this week/this month". */
  tenant_iana_timezone?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatEUR(n: number, localeTag: string) {
  return new Intl.NumberFormat(localeTag, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}

// Render an appointment's UTC instant in the salon's wall clock. Falls back to
// Europe/Amsterdam only if the API didn't echo the tenant's zone (older
// deployment); never silently to the browser's local zone, which would
// misrepresent times for any salon abroad.
function fmtTime(iso: string, localeTag: string, salonZone?: string) {
  const tz = salonZone || "Europe/Amsterdam";
  return new Date(iso).toLocaleTimeString(localeTag, {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
    <Card variant="outlined" className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-caption font-semibold uppercase tracking-widest text-ink-400">{label}</p>
      </div>
      <p className="mb-0.5 text-3xl font-extrabold tracking-tight" style={{ color: accent }}>
        {formatEUR(revenue, localeTag)}
      </p>
      <p className="text-body-sm text-ink-500">
        {countLine}
      </p>
    </Card>
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
        <div className="flex flex-col items-center gap-3 text-ink-400">
          <svg className="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--color-ink-200)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke='var(--color-brand-600)' strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="text-body-sm">{dr.loading}</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card variant="outlined" className="bg-danger-50 p-8 text-center text-body-sm text-danger-600">
        {error || dr.genericError}
      </Card>
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
          <h1 className="text-h1 font-bold text-ink-900">{dr.title}</h1>
          <p className="mt-1 text-body-sm text-ink-500">
            {dr.subtitle}
          </p>
        </div>
        {pendingCount > 0 && (
          <Button
            onClick={finalizeAll}
            disabled={bulkLoading}
            variant="primary"
            size="md"
          >
            {bulkLoading
              ? dr.finalizing
              : fillTemplate(dr.completeAllTemplate, { n: pendingCount })}
          </Button>
        )}
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={dr.statToday}
          revenue={data.today_revenue}
          count={data.today_completed}
          accent='var(--color-brand-600)'
          icon="📅"
          localeTag={localeTag}
          completedOne={dr.completedAppointmentsOne}
          completedMany={dr.completedAppointmentsMany}
        />
        <StatCard
          label={dr.statWeek}
          revenue={data.week_revenue}
          count={data.week_completed}
          accent="var(--color-info-600)"
          icon="📆"
          localeTag={localeTag}
          completedOne={dr.completedAppointmentsOne}
          completedMany={dr.completedAppointmentsMany}
        />
        <StatCard
          label={dr.statMonth}
          revenue={data.month_revenue}
          count={data.month_completed}
          accent='var(--color-accent-500)'
          icon="🗓️"
          localeTag={localeTag}
          completedOne={dr.completedAppointmentsOne}
          completedMany={dr.completedAppointmentsMany}
        />
      </div>

      {/* Today's appointment list */}
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-ink-900">{dr.todayAppointmentsTitle}</h2>
            <p className="mt-0.5 text-caption text-ink-400">
              {dr.todayAppointmentsHint}
            </p>
          </div>
          {pendingCount === 0 && today.length > 0 && (
            <Badge variant="success">{dr.allDone}</Badge>
          )}
        </div>

        {today.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-ink-50 text-3xl">
              📅
            </div>
            <p className="font-semibold text-ink-700">{dr.emptyTodayTitle}</p>
            <p className="max-w-xs text-body-sm text-ink-400">
              {dr.emptyTodayBody}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
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
                      ? "bg-success-50/40"
                      : effectiveStatus === "no_show"
                        ? "bg-ink-50/70"
                        : isCancelled
                          ? "opacity-50"
                          : "bg-ink-0"
                  }`}
                >
                  {/* Avatar */}
                  <Avatar
                    name={booking.client_name}
                    size="md"
                    className="h-10 w-10 shrink-0 text-body-sm font-bold text-white"
                    style={{ background: "var(--color-brand-600)" }}
                  />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-semibold text-ink-900">
                      {booking.client_name}
                    </p>
                    <p className="truncate text-caption text-ink-500">
                      {booking.service_name} · {booking.staff_name} ·{" "}
                      {fmtTime(booking.booked_at, localeTag, data?.tenant_iana_timezone)}
                    </p>
                  </div>

                  {/* Price + duration */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-body-sm font-bold text-ink-900">
                      {formatEUR(booking.price, localeTag)}
                    </p>
                    <p className="text-caption text-ink-400">
                      {fillTemplate(dr.minShort, { n: booking.duration_mins })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    {isDone || isCancelled ? (
                      <Badge
                        variant={
                          effectiveStatus === "completed"
                            ? "success"
                            : effectiveStatus === "no_show"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {effectiveStatus === "completed"
                          ? dr.statusCompleted
                          : effectiveStatus === "no_show"
                            ? dr.statusNoShow
                            : dr.statusCancelled}
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => void finalize(booking.id, "completed")}
                          disabled={isBusy}
                          variant="primary"
                          size="sm"
                          style={{ backgroundColor: "var(--color-success-600)" }}
                        >
                          {isBusy ? "…" : dr.done}
                        </Button>
                        <Button
                          onClick={() => void finalize(booking.id, "no_show")}
                          disabled={isBusy}
                          variant="secondary"
                          size="sm"
                        >
                          {dr.noShow}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Explainer */}
      <Card variant="outlined" className="bg-info-50 px-5 py-4">
        <p className="text-body-sm leading-relaxed text-info-600">
          {dr.explainer}
        </p>
      </Card>

    </div>
  );
}
