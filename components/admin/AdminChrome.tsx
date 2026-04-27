"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoutButton from "@/components/dashboard/LogoutButton";
import { useLocale } from "@/lib/i18n/context";
import { XIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();

  const NAV = useMemo(
    () => [
      { href: "/admin", label: t.admin.overview },
      { href: "/admin/tenants", label: t.admin.tenants },
      { href: "/admin/packages", label: t.admin.packages },
      { href: "/admin/demo-bookings", label: t.admin.demoBookings },
      { href: "/admin/contacts", label: t.admin.contacts },
      { href: "/admin/subscriptions", label: t.admin.payments },
      { href: "/admin/settings", label: t.admin.settings },
    ],
    [t]
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-ink-50">
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : ""}
        className={`fixed inset-0 z-30 bg-ink-950/40 transition-opacity lg:pointer-events-none lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        id="admin-sidebar"
        className={`fixed left-0 top-0 z-40 flex h-screen w-[min(280px,88vw)] max-w-[280px] flex-col border-r border-ink-100 bg-ink-0 pb-[env(safe-area-inset-bottom)] shadow-xl [height:100dvh] transition-transform duration-200 ease-out lg:w-60 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4 lg:py-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink-900 text-body-sm font-semibold text-white">
              S
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-ink-900">
                SoloHub
              </p>
              <p className="truncate text-caption text-ink-400">{t.admin.superAdmin}</p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <XIcon size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-11 items-center rounded-md px-3 py-2.5 text-body-sm transition-colors ${
                  isActive
                    ? "bg-ink-900 font-semibold text-white"
                    : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-100 px-3 py-3">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-ink-100 bg-ink-0 px-4 py-2 sm:px-5 lg:min-h-16 lg:px-8">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-ink-200 bg-ink-0 text-ink-700 shadow-sm hover:bg-ink-50 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar"
            aria-label="Open navigation menu"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <LanguageSwitcher variant="light" />
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-body-sm font-semibold text-white sm:h-11 sm:w-11">
            S
          </div>
        </header>

        <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
