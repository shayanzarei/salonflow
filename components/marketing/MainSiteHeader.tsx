"use client";

import Link from "next/link";
import { useState } from "react";

type NavKey = "home" | "pricing" | "demo" | "contact" | "privacy";

const NAV_ITEMS = [
  { key: "home" as NavKey, label: "Home", href: "/" },
  { key: "pricing" as NavKey, label: "Pricing", href: "/pricing" },
  { key: "demo" as NavKey, label: "Book a Demo", href: "/book-demo" },
  { key: "contact" as NavKey, label: "Contact", href: "/contact" },
  { key: "privacy" as NavKey, label: "Privacy & Terms", href: "/privacy" },
] as const;

export default function MainSiteHeader({ active = "home" }: { active?: NavKey }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="absolute top-0 z-50 w-full px-4 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-lg">
              <span className="text-lg font-bold text-[#11c4b6]">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SoloHub</span>
          </div>

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

          <div className="hidden md:block">
            <Link
              href="/login"
              className="flex items-center justify-center space-x-2 rounded-full bg-[#11c4b6] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#11c4b6]/30 transition-colors hover:bg-[#0ea5b7]"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="text-2xl text-slate-900 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span aria-hidden>{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute right-4 top-20 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
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
            <Link
              href="/login"
              className="mt-3 flex items-center justify-center rounded-full bg-[#11c4b6] px-6 py-3 text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
