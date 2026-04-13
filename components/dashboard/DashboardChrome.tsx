"use client";

import LogoutButton from "@/components/dashboard/LogoutButton";
import SidebarNav from "@/components/dashboard/SidebarNav";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  brand: string;
  tenantName: string;
  planTier: string;
  children: React.ReactNode;
};

export function DashboardChrome({
  brand,
  tenantName,
  planTier,
  children,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const initials =
    `${tenantName.charAt(0).toUpperCase()}${tenantName.split(" ")[1]?.charAt(0).toUpperCase() ?? ""}`;

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : ""}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:pointer-events-none lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 z-40 flex h-screen w-[min(280px,88vw)] max-w-[280px] flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-200 ease-out lg:w-60 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 lg:py-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
              style={{ background: brand }}
            >
              {initials.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {tenantName}
              </p>
              <p className="truncate text-xs capitalize text-gray-500">
                {planTier} Plan
              </p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <SidebarNav
            brandColor={brand}
            onNavigateAction={() => setMenuOpen(false)}
          />
        </div>

        <div className="border-t border-gray-100 px-3 py-3">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="mb-1 flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            <span className="text-base" aria-hidden>
              🌐
            </span>
            <span>Help &amp; Support</span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-60">
        <header className="sticky top-0 z-20 flex min-h-14 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-2 sm:px-5 lg:min-h-16 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="dashboard-sidebar"
              aria-label="Open navigation menu"
            >
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
            <p className="truncate text-sm font-medium text-gray-600 lg:hidden">
              {tenantName}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-base text-gray-600 hover:bg-gray-50 sm:h-11 sm:w-11"
              aria-label="Notifications"
            >
              🔔
            </button>
            <div
              className="flex h-10 w-10 cursor-default items-center justify-center rounded-full text-sm font-semibold text-white sm:h-11 sm:w-11"
              style={{ background: brand }}
              title={tenantName}
            >
              {tenantName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
