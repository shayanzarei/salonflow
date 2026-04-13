"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/bookings", label: "Bookings", icon: "📅" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/staff", label: "Staff", icon: "👤" },
  { href: "/services", label: "Services", icon: "✂️" },
  { href: "/calendar", label: "Calendar", icon: "🗓" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function SidebarNav({
  brandColor,
  onNavigateAction,
}: {
  brandColor: string;
  /** Close mobile drawer when a nav link is activated */
  onNavigateAction?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigateAction?.()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minHeight: 44,
              padding: "10px 12px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              textDecoration: "none",
              background: isActive ? `${brandColor}15` : "transparent",
              color: isActive ? brandColor : "#666",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
