"use client";

import LogoutButton from "@/components/dashboard/LogoutButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  brand: string;
  staffName: string;
  salonName: string;
  children: React.ReactNode;
};

const NAV_ITEMS = [
  {
    href: "/staff-portal",
    label: "My schedule",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/staff-portal/calendar",
    label: "Calendar",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export function StaffChrome({ brand, staffName, salonName, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:pointer-events-none lg:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        id="staff-sidebar"
        className={`fixed left-0 top-0 z-40 flex h-screen w-[min(280px,88vw)] max-w-[280px] flex-col border-r border-gray-100 bg-white shadow-xl transition-transform duration-200 ease-out lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: brand }}
            >
              {staffName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {staffName}
              </p>
              <p className="truncate text-xs text-gray-400">{salonName}</p>
            </div>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                style={
                  isActive
                    ? { backgroundColor: brand + "18", color: brand, fontWeight: 600 }
                    : { color: "#4B5563" }
                }
              >
                <span
                  style={isActive ? { color: brand } : { color: "#9CA3AF" }}
                  className="shrink-0"
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 px-4 py-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 py-2 lg:hidden">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm"
            onClick={() => setMenuOpen(true)}
            aria-controls="staff-sidebar"
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
              <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
              <span className="block h-0.5 w-5 rounded-full bg-gray-700" />
            </span>
          </button>
          <span className="truncate text-sm font-medium text-gray-700">
            {NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Staff portal"}
          </span>
        </header>

        <div className="mx-auto min-w-0 w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
