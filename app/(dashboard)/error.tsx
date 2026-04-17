"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        Something went wrong
      </h2>
      <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-500">
        This page ran into an unexpected error. You can try reloading it — your
        data is safe and unaffected.
      </p>

      {/* Error digest for support reference */}
      {error.digest && (
        <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-400">
          Ref: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex min-h-10 items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)" }}
        >
          Try again
        </button>
        <a
          href="/contact"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
