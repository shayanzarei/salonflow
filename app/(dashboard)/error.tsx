"use client";

import { useLocale } from "@/lib/i18n/context";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      {/* Icon */}
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow"
        style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}
      >
        ⚠️
      </div>

      {/* Copy */}
      <h2 className="mb-2 text-xl font-bold text-slate-900">
        {t.errors.title}
      </h2>
      <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-500">
        {t.errors.dashboardDescription}
      </p>

      {/* Error digest for support reference */}
      {error.digest && (
        <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-400">
          {t.errors.digestRef} {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex min-h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--color-brand-600) 0%, var(--color-brand-700) 100%)" }}
        >
          {t.errors.tryAgain}
        </button>
        <a
          href="/contact"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          {t.errors.contactSupport}
        </a>
      </div>
    </div>
  );
}
