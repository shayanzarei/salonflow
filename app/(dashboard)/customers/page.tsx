import pool from "@/lib/db";
import { formatEUR } from "@/lib/format-currency";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import type { Translations } from "@/lib/i18n/translations";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 12;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getStatus(
  totalBookings: number,
  totalSpent: number,
  lastVisit: string
) {
  const daysSinceVisit = Math.floor(
    (Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (totalSpent >= 500 || totalBookings >= 10) return "VIP";
  if (daysSinceVisit >= 60) return "At Risk";
  if (totalBookings <= 1) return "New";
  return "Regular";
}

function getDaysAgo(
  date: string,
  dc: Translations["dashboard"]["customers"]
): string {
  const days = Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return dc.today;
  if (days === 1) return dc.oneDayAgo;
  return fillTemplate(dc.daysAgoTemplate, { n: days });
}

function customerStatusLabel(
  status: string,
  dc: Translations["dashboard"]["customers"]
): string {
  switch (status) {
    case "VIP":
      return dc.statusVip;
    case "Regular":
      return dc.statusRegular;
    case "New":
      return dc.statusNew;
    case "At Risk":
      return dc.statusAtRisk;
    default:
      return status;
  }
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  VIP: { color: "#92400E", bg: "#FEF3C7" },
  Regular: { color: "#374151", bg: "#F3F4F6" },
  New: { color: "#065F46", bg: "#D1FAE5" },
  "At Risk": { color: "#991B1B", bg: "#FEE2E2" },
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { locale, t } = await getServerTranslations();
  const dateLocale = bcp47ForLocale(locale);
  const dc = t.dashboard.customers;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { tab, page } = await searchParams;
  const activeTab = tab ?? "all";
  const currentPage = parseInt(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  // Fetch all customers with aggregated stats
  const result = await pool.query(
    `SELECT
       client_name,
       client_email,
       client_phone,
       COUNT(*) AS total_bookings,
       SUM(s.price) AS total_spent,
       MAX(b.booked_at) AS last_visit,
       MIN(b.booked_at) AS member_since
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.tenant_id = $1
     GROUP BY client_name, client_email, client_phone
     ORDER BY last_visit DESC`,
    [tenant.id]
  );

  const allCustomers = result.rows.map((c) => ({
    ...c,
    total_bookings: parseInt(c.total_bookings),
    total_spent: parseFloat(c.total_spent),
    status: getStatus(
      parseInt(c.total_bookings),
      parseFloat(c.total_spent),
      c.last_visit
    ),
  }));

  // Stat card calculations
  const totalCustomers = allCustomers.length;
  const now = new Date();
  const newThisMonth = allCustomers.filter((c) => {
    const d = new Date(c.member_since);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;
  const prevMonthNew = allCustomers.filter((c) => {
    const d = new Date(c.member_since);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear()
    );
  }).length;
  const newGrowthPct =
    prevMonthNew > 0
      ? Math.round(((newThisMonth - prevMonthNew) / prevMonthNew) * 100)
      : null;
  const avgSpend =
    totalCustomers > 0
      ? allCustomers.reduce((s, c) => s + c.total_spent, 0) / totalCustomers
      : 0;

  // Tab filtering
  let filtered = allCustomers;
  if (activeTab === "vip")
    filtered = allCustomers.filter((c) => c.status === "VIP");
  else if (activeTab === "new")
    filtered = allCustomers.filter((c) => c.status === "New");
  else if (activeTab === "at-risk")
    filtered = allCustomers.filter((c) => c.status === "At Risk");

  const totalFiltered = filtered.length;
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
  const customers = filtered.slice(offset, offset + PAGE_SIZE);

  const tabs = [
    { label: dc.tabAll, value: "all" },
    { label: dc.tabVip, value: "vip" },
    { label: dc.tabNew, value: "new", suffix: dc.tabNewSuffix },
    { label: dc.tabAtRisk, value: "at-risk", suffix: dc.tabAtRiskSuffix },
  ];

  function tabHref(t: string) {
    return t === "all" ? "/customers" : `/customers?tab=${t}`;
  }

  const showingFrom = totalFiltered === 0 ? 0 : offset + 1;
  const showingTo = Math.min(offset + PAGE_SIZE, totalFiltered);

  return (
    <div>
      {/* Header */}
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          {dc.title}
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-7 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px" }}>
              {dc.totalCustomers}
            </p>
            <p
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 2px",
              }}
            >
              {totalCustomers.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              {dc.allTime}
            </p>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `${brand}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                stroke={brand}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke={brand}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                stroke={brand}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* New This Month */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px" }}>
              {dc.newThisMonth}
            </p>
            <p
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 6px",
              }}
            >
              {newThisMonth}
            </p>
            {newGrowthPct !== null && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: newGrowthPct >= 0 ? "#059669" : "#DC2626",
                  background: newGrowthPct >= 0 ? "#D1FAE5" : "#FEE2E2",
                  padding: "2px 8px",
                  borderRadius: 100,
                }}
              >
                {fillTemplate(dc.growthLineTemplate, {
                  arrow: newGrowthPct >= 0 ? "↑" : "↓",
                  n: Math.abs(newGrowthPct),
                  vs: dc.growthVsLastMonth,
                })}
              </span>
            )}
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `${brand}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke={brand}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="7" r="4" stroke={brand} strokeWidth="2" />
              <line
                x1="19"
                y1="8"
                x2="19"
                y2="14"
                stroke={brand}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <line
                x1="22"
                y1="11"
                x2="16"
                y2="11"
                stroke={brand}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Average Spend */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 4px" }}>
              Average Spend
            </p>
            <p
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 2px",
              }}
            >
              {formatEUR(avgSpend)}
            </p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
              {dc.perCustomer}
            </p>
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: `${brand}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 22,
              color: brand,
              fontWeight: 500,
            }}
          >
            €
          </div>
        </div>
      </div>

      {/* Tabs — scroll horizontally on small screens */}
      <div className="-mx-1 mb-5 flex gap-0 overflow-x-auto overflow-y-hidden border-b border-gray-200 px-1 pb-px [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        {tabs.map((t) => {
          const isActive = activeTab === t.value;
          return (
            <Link
              key={t.value}
              href={tabHref(t.value)}
              className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm no-underline sm:px-[18px]"
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? brand : "#6B7280",
                borderBottomColor: isActive ? brand : "transparent",
              }}
            >
              {t.label}
              {t.suffix && (
                <span
                  style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}
                >
                  {t.suffix}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {customers.length === 0 ? (
          allCustomers.length === 0 ? (
            /* ── First-time: no clients yet ── */
            <div style={{ padding: "72px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
                {dc.emptyNoClientsTitle}
              </p>
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px", maxWidth: 380, display: "inline-block", lineHeight: 1.6 }}>
                {dc.emptyNoClientsBody}
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                  href="/bookings/new"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", borderRadius: 10, fontSize: 14,
                    fontWeight: 600, color: "#fff", background: brand,
                    textDecoration: "none",
                  }}
                >
                  {dc.addFirstBooking}
                </Link>
                <Link
                  href="/settings/site"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "10px 20px", borderRadius: 10, fontSize: 14,
                    fontWeight: 600, color: "#475569",
                    border: "1px solid #E2E8F0", textDecoration: "none",
                  }}
                >
                  {dc.setupBookingSite}
                </Link>
              </div>
            </div>
          ) : (
            /* ── Has clients but filter matched nothing ── */
            <div style={{ padding: "48px 24px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
              {dc.emptyFilter}
            </div>
          )
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[960px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[
                      dc.colClient,
                      dc.colContact,
                      dc.colVisits,
                      dc.colLastVisit,
                      dc.colTotalSpent,
                      dc.colStatus,
                      dc.colAction,
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 20px",
                          textAlign: "left",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, i) => {
                    const cfg =
                      STATUS_STYLE[customer.status] ?? STATUS_STYLE.Regular;
                    return (
                      <tr
                        key={customer.client_email + i}
                        style={{
                          borderBottom:
                            i < customers.length - 1
                              ? "1px solid #F9FAFB"
                              : "none",
                        }}
                      >
                        {/* Client */}
                        <td style={{ padding: "16px 20px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: "50%",
                                background: brand,
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(customer.client_name)}
                            </div>
                            <div>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#111827",
                                }}
                              >
                                {customer.client_name}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 12,
                                  color: "#9CA3AF",
                                }}
                              >
                                Member since{" "}
                                {new Date(
                                  customer.member_since
                                ).toLocaleDateString(dateLocale, {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: "16px 20px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13,
                                color: "#374151",
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                  stroke="#9CA3AF"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <polyline
                                  points="22,6 12,13 2,6"
                                  stroke="#9CA3AF"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {customer.client_email}
                            </div>
                            {customer.client_phone && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  fontSize: 13,
                                  color: "#374151",
                                }}
                              >
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.64 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6.06 6.06l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                    stroke="#9CA3AF"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {customer.client_phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Visits */}
                        <td style={{ padding: "16px 20px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            {customer.total_bookings}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: "#9CA3AF",
                            }}
                          >
                            {dc.visitsSubline}
                          </p>
                        </td>

                        {/* Last Visit */}
                        <td style={{ padding: "16px 20px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {new Date(customer.last_visit).toLocaleDateString(
                              dateLocale,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: "#9CA3AF",
                            }}
                          >
                            {getDaysAgo(customer.last_visit, dc)}
                          </p>
                        </td>

                        {/* Total Spent */}
                        <td style={{ padding: "16px 20px" }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 15,
                              fontWeight: 700,
                              color: brand,
                            }}
                          >
                            {formatEUR(customer.total_spent)}
                          </p>
                        </td>

                        {/* Status */}
                        <td style={{ padding: "16px 20px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 12px",
                              borderRadius: 100,
                              fontSize: 12,
                              fontWeight: 600,
                              color: cfg.color,
                              background: cfg.bg,
                            }}
                          >
                            {customerStatusLabel(customer.status, dc)}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ padding: "16px 20px" }}>
                          <Link
                            href={`/bookings?search=${encodeURIComponent(customer.client_name)}`}
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: brand,
                              textDecoration: "none",
                            }}
                          >
                            {dc.viewHistory}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>
                {fillTemplate(dc.showingRangeTemplate, {
                  from: showingFrom,
                  to: showingTo,
                  total: totalFiltered.toLocaleString(dateLocale),
                })}
              </p>

              <div className="flex flex-wrap items-center gap-1 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {/* Prev */}
                {currentPage > 1 ? (
                  <Link
                    href={`/customers?${activeTab !== "all" ? `tab=${activeTab}&` : ""}page=${currentPage - 1}`}
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 14,
                      color: "#374151",
                      textDecoration: "none",
                    }}
                  >
                    ‹
                  </Link>
                ) : (
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 14,
                      color: "#D1D5DB",
                    }}
                  >
                    ‹
                  </span>
                )}

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  const isActive = p === currentPage;
                  return (
                    <Link
                      key={p}
                      href={`/customers?${activeTab !== "all" ? `tab=${activeTab}&` : ""}page=${p}`}
                      style={{
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        border: isActive ? "none" : "1px solid #E5E7EB",
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "white" : "#374151",
                        background: isActive ? brand : "white",
                        textDecoration: "none",
                      }}
                    >
                      {p}
                    </Link>
                  );
                })}

                {totalPages > 5 && (
                  <span
                    style={{ fontSize: 14, color: "#9CA3AF", padding: "0 4px" }}
                  >
                    …
                  </span>
                )}

                {/* Next */}
                {currentPage < totalPages ? (
                  <Link
                    href={`/customers?${activeTab !== "all" ? `tab=${activeTab}&` : ""}page=${currentPage + 1}`}
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 14,
                      color: "#374151",
                      textDecoration: "none",
                    }}
                  >
                    ›
                  </Link>
                ) : (
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                      fontSize: 14,
                      color: "#D1D5DB",
                    }}
                  >
                    ›
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
