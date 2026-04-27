"use client";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoutButton from "@/components/dashboard/LogoutButton";
import NotificationsBell from "@/components/dashboard/NotificationsBell";
import SidebarNav from "@/components/dashboard/SidebarNav";
import { Avatar } from "@/components/ds/Avatar";
import { dashboardTitleFromPath } from "@/lib/i18n/dashboard-nav";
import { useLocale } from "@/lib/i18n/context";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { HelpCircleIcon, XIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Props = {
  brand: string;
  tenantName: string;
  tenantLogoUrl?: string | null;
  planTier: string;
  galleryEnabled: boolean;
  children: React.ReactNode;
};

export function DashboardChrome({
  brand,
  tenantName,
  tenantLogoUrl,
  planTier,
  galleryEnabled,
  children,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();

  const activeLabel = useMemo(
    () => dashboardTitleFromPath(pathname, t, tenantName),
    [pathname, t, tenantName]
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const initials = `${tenantName.charAt(0).toUpperCase()}${tenantName.split(" ")[1]?.charAt(0).toUpperCase() ?? ""}`;

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label={menuOpen ? t.dashboard.chrome.closeNavMenu : ""}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:pointer-events-none lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-40 flex h-screen w-[min(280px,88vw)] max-w-[280px] flex-col border-r border-ink-100 bg-ink-0 pb-[env(safe-area-inset-bottom)] shadow-xl [height:100dvh] transition-transform duration-200 ease-out lg:w-60 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4 lg:py-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-base font-bold text-white"
              style={{ background: tenantLogoUrl ? "transparent" : brand }}
            >
              {tenantLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tenantLogoUrl}
                  alt={`${tenantName} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials.slice(0, 2)
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-ink-900">
                {tenantName}
              </p>
              <p className="truncate text-caption capitalize text-ink-500">
                {fillTemplate(t.dashboard.chrome.planLineTemplate, {
                  tier: planTier,
                })}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border-none bg-transparent text-ink-500 hover:bg-ink-100 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label={t.dashboard.chrome.closeNavMenu}
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <SidebarNav
            brandColor={brand}
            galleryEnabled={galleryEnabled}
            onNavigateAction={() => setMenuOpen(false)}
          />
        </div>

        <div className="border-t border-ink-100 px-3 py-3">
          <div className="mb-2 flex justify-center px-3 lg:hidden">
            <LanguageSwitcher variant="light" />
          </div>
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="mb-1 flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2.5 text-body-sm text-ink-600 hover:bg-ink-50"
          >
            <HelpCircleIcon size={16} />
            <span>{t.sidebar.helpSupport}</span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-ink-100 bg-ink-0 px-4 py-2 sm:px-5 lg:min-h-16 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border border-ink-200 bg-ink-0 text-ink-700 shadow-sm hover:bg-ink-50 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="dashboard-sidebar"
              aria-label={t.dashboard.chrome.openNavMenu}
            >
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
            <p className="truncate text-body-sm font-medium text-ink-600 lg:hidden">
              {activeLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="light" />
            <NotificationsBell />
            <Link
              href="/settings"
              title={tenantName}
              className="cursor-pointer no-underline"
            >
              <Avatar
                name={tenantName}
                size="md"
                className="h-10 w-10 text-body-sm font-semibold text-white sm:h-11 sm:w-11"
                style={{ background: brand }}
              />
            </Link>
          </div>
        </header>

        <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
