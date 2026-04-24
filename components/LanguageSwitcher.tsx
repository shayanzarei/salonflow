"use client";

import { cn } from "@/lib/cn";
import { useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const LOCALES: Locale[] = ["en", "nl"];

/**
 * Minimal segmented locale control. Works on marketing, dashboard, and admin.
 *
 * variant="light" — neutral surface (headers, sidebars on white)
 * variant="dark"  — glassy track for dark / high-contrast backgrounds
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

    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });

    setLocale(next);

    startTransition(() => {
      router.refresh();
    });
  }

  const track =
    variant === "light"
      ? "border-ink-200/90 bg-ink-100/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
      : "border-white/15 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

  return (
    <div
      role="group"
      aria-label={t.locale.switchTo}
      title={t.locale.switchTo}
      className={cn(
        "inline-flex items-center rounded-full border p-0.5",
        track,
        isPending && "pointer-events-none opacity-55"
      )}
    >
      {LOCALES.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => void switchTo(l)}
            disabled={isPending}
            aria-pressed={active}
            className={cn(
              "min-w-[2.25rem] rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums tracking-[0.06em] transition-[color,background-color,box-shadow,transform] duration-200 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/35 focus-visible:ring-offset-2",
              variant === "light" && "focus-visible:ring-offset-white",
              variant === "dark" && "focus-visible:ring-offset-transparent",
              variant === "light" &&
                (active
                  ? "bg-ink-0 text-ink-900 shadow-sm ring-1 ring-ink-900/[0.06]"
                  : "text-ink-500 hover:text-ink-800 active:scale-[0.98]"),
              variant === "dark" &&
                (active
                  ? "bg-white/14 text-white shadow-sm ring-1 ring-white/12"
                  : "text-white/50 hover:text-white/85 active:scale-[0.98]")
            )}
          >
            {t.locale[l]}
          </button>
        );
      })}
    </div>
  );
}
