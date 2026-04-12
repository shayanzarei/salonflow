"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/bookings", label: "Bookings" },
  { href: "/calendar", label: "Calendar" },
  { href: "/staff", label: "Staff" },
  { href: "/services", label: "Services" },
  { href: "/customers", label: "Customers" },
  { href: "/settings", label: "Settings" },
];

export default function SidebarNav({ brandColor }: { brandColor: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/overview" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-3 py-2 rounded-lg text-sm transition-colors"
            style={
              isActive
                ? {
                    backgroundColor: `${brandColor}15`,
                    color: brandColor,
                    fontWeight: 500,
                  }
                : { color: "#6B7280" }
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
