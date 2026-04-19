"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { MARKETING_BUTTON_PRIMARY } from "@/components/marketing/buttonStyles";
import { MenuIcon, XIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";
import { useState } from "react";

type NavKey = "home" | "pricing" | "demo" | "faq" | "contact" | "privacy";

export default function MainSiteHeader({
  active = "home",
}: {
  active?: NavKey;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLocale();

  const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
    { key: "home", label: t.nav.home, href: "/" },
    { key: "pricing", label: t.nav.pricing, href: "/pricing" },
    { key: "demo", label: t.nav.demo, href: "/book-demo" },
    { key: "contact", label: t.nav.contact, href: "/contact" },
    { key: "faq", label: t.nav.faq, href: "/faq" },
    { key: "privacy", label: t.nav.privacy, href: "/privacy" },
  ];

  return (
    <>
      <header className="absolute top-0 z-50 w-full px-4 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center"
            aria-label={t.website.homeAria}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
              alt="SoloHub"
              className="h-14 w-auto"
            />
          </Link>

          <nav className="hidden items-center space-x-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={
                  item.key === active
                    ? "border-b-2 border-[#11c4b6] pb-1 text-sm font-semibold text-[#0ea5b7]"
                    : "text-sm text-slate-600 transition-colors hover:text-[#0ea5b7]"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher variant="light" />
            <Link href="/signup" className={MARKETING_BUTTON_PRIMARY}>
              {t.nav.getStarted}
            </Link>
          </div>

          <button
            type="button"
            className="text-2xl text-slate-900 md:hidden mr-4"
            aria-label={mobileOpen ? t.website.closeMenu : t.website.openMenu}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <XIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute right-8 top-20 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 flex items-center justify-between">
              <LanguageSwitcher variant="light" />
              <Link
                href="/signup"
                className={`${MARKETING_BUTTON_PRIMARY} px-6`}
                onClick={() => setMobileOpen(false)}
              >
                {t.nav.getStarted}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
