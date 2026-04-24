"use client";

import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry) when you add one.
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f0fdfc] to-white px-6">
      {/* Logo */}
      <Link href="/" className="mb-12" aria-label={t.errors.goHomeAria}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/solohub%20logo2%20%281%29.png"
          alt="SoloHub"
          className="h-12 w-auto"
        />
      </Link>

      {/* Icon */}
      <div className="mb-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
          }}
        >
          ⚡
        </div>
      </div>

      {/* Copy */}
      <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {t.errors.title}
      </h1>
      <p className="mb-10 max-w-md text-center text-base leading-relaxed text-slate-500">
        {t.errors.globalDescription}
      </p>

      {/* Error digest — only visible in prod so users can quote it to support */}
      {error.digest && (
        <p className="mb-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-500">
          {t.errors.errorId} {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          }}
        >
          {t.errors.tryAgain}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          {t.errors.backToHome}
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          {t.errors.contactSupport}
        </Link>
      </div>

      {/* Footer hint */}
      <p className="mt-16 text-xs text-slate-400">{t.errors.footerNote}</p>
    </div>
  );
}
