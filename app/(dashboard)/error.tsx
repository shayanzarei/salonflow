"use client";

import { Button } from "@/components/ds/Button";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
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
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-warning-50 text-3xl shadow-sm">
        ⚠️
      </div>

      {/* Copy */}
      <h2 className="mb-2 text-h2 font-bold text-ink-900">
        {t.errors.title}
      </h2>
      <p className="mb-8 max-w-sm text-center text-body-sm leading-relaxed text-ink-500">
        {t.errors.dashboardDescription}
      </p>

      {/* Error digest for support reference */}
      {error.digest && (
        <p className="mb-6 rounded-sm border border-ink-200 bg-ink-50 px-3 py-1.5 font-mono text-caption text-ink-400">
          {t.errors.digestRef} {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={reset} variant="primary" size="md">
          {t.errors.tryAgain}
        </Button>
        <Button asChild variant="secondary" size="md">
          <Link href="/contact">{t.errors.contactSupport}</Link>
        </Button>
      </div>
    </div>
  );
}
