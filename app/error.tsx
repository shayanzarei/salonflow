"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry) when you add one.
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f0fdfc] to-white px-6">
      {/* Logo */}
      <Link href="/" className="mb-12" aria-label="Go to SoloHub home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
          alt="SoloHub"
          className="h-12 w-auto"
        />
      </Link>

      {/* Icon */}
      <div className="mb-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)" }}
        >
          ⚡
        </div>
      </div>

      {/* Copy */}
      <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mb-10 max-w-md text-center text-base leading-relaxed text-slate-500">
        An unexpected error occurred. This has been noted and we&apos;ll look into it.
        You can try again or go back to the home page.
      </p>

      {/* Error digest — only visible in prod so users can quote it to support */}
      {error.digest && (
        <p className="mb-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-xs text-slate-500">
          Error ID: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)" }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          ← Back to home
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Contact support
        </Link>
      </div>

      {/* Footer hint */}
      <p className="mt-16 text-xs text-slate-400">
        Error 500 · SoloHub — Built with care in the Netherlands 🇳🇱
      </p>
    </div>
  );
}
