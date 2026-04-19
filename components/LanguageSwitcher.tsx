"use client";

import { useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";
import { Fragment, useTransition } from "react";

/**
 * Compact EN | NL toggle. Works on both the marketing site and the dashboard.
 *
 * variant="light"  → for marketing header (dark text on light bg)
 * variant="dark"   → same styling, kept for future use
 */
export default function LanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const { locale, setLocale, t } = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function switchTo(next: Locale) {
    if (next === locale || isPending) return;

    // Persist in cookie so the server reads it on next render
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });

    // Optimistic client-side switch (instant feedback)
    setLocale(next);

    // Refresh the server component tree so `lang` attr + any SSR text updates
    startTransition(() => {
      router.refresh();
    });
  }

  const buttonBase =
    "px-2 py-0.5 rounded text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11C4B6]";

  const active =
    variant === "light" ? "bg-[#11C4B6] text-white" : "bg-[#11C4B6] text-white";

  const inactive =
    variant === "light"
      ? "text-slate-500 hover:text-slate-800"
      : "text-gray-400 hover:text-gray-700";

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={t.locale.switchTo}
      title={t.locale.switchTo}
    >
      {(["en", "nl"] as Locale[]).map((l, i) => (
        <Fragment key={l}>
          {i > 0 && (
            <span
              key={`sep-${l}`}
              className="text-xs text-gray-300 select-none"
            >
              |
            </span>
          )}
          <button
            key={l}
            type="button"
            onClick={() => void switchTo(l)}
            disabled={isPending}
            className={`${buttonBase} ${locale === l ? active : inactive}`}
            aria-pressed={locale === l}
          >
            {t.locale[l]}
          </button>
        </Fragment>
      ))}
    </div>
  );
}
