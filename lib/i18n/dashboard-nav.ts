import type { Translations } from "@/lib/i18n/translations";

/** Mobile header title: best matching dashboard section for the current path. */
export function dashboardTitleFromPath(
  pathname: string,
  t: Translations,
  fallback: string
): string {
  const p = pathname.split("?")[0];

  if (p.startsWith("/settings/billing")) return t.sidebar.planBilling;
  if (p.startsWith("/settings/security")) return t.sidebar.accountSecurity;
  if (p.startsWith("/settings/social-media")) return t.sidebar.socialMedia;
  if (p.startsWith("/settings/opening-hours")) return t.sidebar.openingHours;
  if (p === "/settings") return t.sidebar.profile;

  if (p.startsWith("/bookings")) return t.sidebar.bookings;
  if (p.startsWith("/calendar")) return t.sidebar.calendar;
  if (p.startsWith("/customers")) return t.sidebar.customers;
  if (p.startsWith("/staff")) return t.sidebar.staff;
  if (p.startsWith("/services")) return t.sidebar.services;
  if (p.startsWith("/gallery")) return t.sidebar.gallery;
  if (p.startsWith("/reports")) return t.sidebar.reports;
  if (p.startsWith("/dashboard")) return t.sidebar.overview;

  return fallback;
}
