import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import {
  Table,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
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

type BadgeVariant = "neutral" | "info" | "success" | "warning" | "danger" | "brand";
const STATUS_VARIANT: Record<string, BadgeVariant> = {
  VIP: "warning",
  Regular: "neutral",
  New: "success",
  "At Risk": "danger",
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
        <h1 className="text-h2 font-bold text-ink-900 sm:text-h1">
          {dc.title}
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-7 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <Card variant="outlined" className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-caption text-ink-500">{dc.totalCustomers}</p>
            <p className="mb-0.5 text-3xl font-bold text-ink-900">
              {totalCustomers.toLocaleString()}
            </p>
            <p className="text-caption text-ink-400">{dc.allTime}</p>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${brand}18` }}
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
        </Card>

        {/* New This Month */}
        <Card variant="outlined" className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-caption text-ink-500">{dc.newThisMonth}</p>
            <p className="mb-1.5 text-3xl font-bold text-ink-900">
              {newThisMonth}
            </p>
            {newGrowthPct !== null && (
              <Badge variant={newGrowthPct >= 0 ? "success" : "danger"}>
                {fillTemplate(dc.growthLineTemplate, {
                  arrow: newGrowthPct >= 0 ? "↑" : "↓",
                  n: Math.abs(newGrowthPct),
                  vs: dc.growthVsLastMonth,
                })}
              </Badge>
            )}
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${brand}18` }}
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
        </Card>

        {/* Average Spend */}
        <Card variant="outlined" className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-caption text-ink-500">Average Spend</p>
            <p className="mb-0.5 text-3xl font-bold text-ink-900">
              {formatEUR(avgSpend)}
            </p>
            <p className="text-caption text-ink-400">{dc.perCustomer}</p>
          </div>
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-medium"
            style={{ background: `${brand}18`, color: brand }}
          >
            €
          </div>
        </Card>
      </div>

      {/* Tabs — scroll horizontally on small screens */}
      <div className="-mx-1 mb-5 flex gap-0 overflow-x-auto overflow-y-hidden border-b border-ink-200 px-1 pb-px [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        {tabs.map((tabItem) => {
          const isActive = activeTab === tabItem.value;
          return (
            <Link
              key={tabItem.value}
              href={tabHref(tabItem.value)}
              className="shrink-0 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-body-sm no-underline sm:px-[18px]"
              style={{
                fontWeight: isActive ? 600 : 400,
                color: isActive ? brand : "var(--color-ink-500)",
                borderBottomColor: isActive ? brand : "transparent",
              }}
            >
              {tabItem.label}
              {tabItem.suffix && (
                <span className="ml-1 font-normal text-ink-400">
                  {tabItem.suffix}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <Card variant="outlined" className="overflow-hidden p-0">
        {customers.length === 0 ? (
          allCustomers.length === 0 ? (
            /* ── First-time: no clients yet ── */
            <div className="px-6 py-[72px] text-center">
              <div className="mb-4 text-5xl">👥</div>
              <p className="mb-2 text-body-lg font-bold text-ink-900">
                {dc.emptyNoClientsTitle}
              </p>
              <p className="mb-6 inline-block max-w-[380px] text-body-sm leading-relaxed text-ink-500">
                {dc.emptyNoClientsBody}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild variant="primary" size="md" style={{ backgroundColor: brand }}>
                  <Link href="/bookings/new">{dc.addFirstBooking}</Link>
                </Button>
                <Button asChild variant="secondary" size="md">
                  <Link href="/settings/site">{dc.setupBookingSite}</Link>
                </Button>
              </div>
            </div>
          ) : (
            /* ── Has clients but filter matched nothing ── */
            <div className="px-6 py-12 text-center text-body-sm text-ink-400">
              {dc.emptyFilter}
            </div>
          )
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <Table className="min-w-[960px]">
                <thead>
                  <THeadRow>
                    <TH>{dc.colClient}</TH>
                    <TH>{dc.colContact}</TH>
                    <TH>{dc.colVisits}</TH>
                    <TH>{dc.colLastVisit}</TH>
                    <TH>{dc.colTotalSpent}</TH>
                    <TH>{dc.colStatus}</TH>
                    <TH>{dc.colAction}</TH>
                  </THeadRow>
                </thead>
                <tbody>
                  {customers.map((customer, i) => {
                    const variant =
                      STATUS_VARIANT[customer.status] ?? STATUS_VARIANT.Regular;
                    return (
                      <TBodyRow
                        key={customer.client_email + i}
                        interactive={false}
                      >
                        {/* Client */}
                        <TD>
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={customer.client_name}
                              size="md"
                              className="text-body-sm text-white"
                              style={{ background: brand }}
                            />
                            <div>
                              <p className="text-body-sm font-semibold text-ink-900">
                                {customer.client_name}
                              </p>
                              <p className="text-caption text-ink-400">
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
                        </TD>

                        {/* Contact */}
                        <TD>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-caption text-ink-700">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                                  stroke="var(--color-ink-400)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <polyline
                                  points="22,6 12,13 2,6"
                                  stroke="var(--color-ink-400)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {customer.client_email}
                            </div>
                            {customer.client_phone && (
                              <div className="flex items-center gap-1.5 text-caption text-ink-700">
                                <svg
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.64 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6.06 6.06l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                    stroke="var(--color-ink-400)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                {customer.client_phone}
                              </div>
                            )}
                          </div>
                        </TD>

                        {/* Visits */}
                        <TD>
                          <p className="text-body-sm font-semibold text-ink-900">
                            {customer.total_bookings}
                          </p>
                          <p className="text-caption text-ink-400">
                            {dc.visitsSubline}
                          </p>
                        </TD>

                        {/* Last Visit */}
                        <TD>
                          <p className="text-body-sm font-medium text-ink-900">
                            {new Date(customer.last_visit).toLocaleDateString(
                              dateLocale,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-caption text-ink-400">
                            {getDaysAgo(customer.last_visit, dc)}
                          </p>
                        </TD>

                        {/* Total Spent */}
                        <TD>
                          <p
                            className="text-body-sm font-bold"
                            style={{ color: brand }}
                          >
                            {formatEUR(customer.total_spent)}
                          </p>
                        </TD>

                        {/* Status */}
                        <TD>
                          <Badge variant={variant}>
                            {customerStatusLabel(customer.status, dc)}
                          </Badge>
                        </TD>

                        {/* Action */}
                        <TD>
                          <Link
                            href={`/bookings?search=${encodeURIComponent(customer.client_name)}`}
                            className="text-caption font-semibold no-underline"
                            style={{ color: brand }}
                          >
                            {dc.viewHistory}
                          </Link>
                        </TD>
                      </TBodyRow>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-ink-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-caption text-ink-500">
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
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 text-body-sm text-ink-700 no-underline"
                  >
                    ‹
                  </Link>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 text-body-sm text-ink-300">
                    ‹
                  </span>
                )}

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  const isActive = p === currentPage;
                  if (isActive) {
                    return (
                      <Link
                        key={p}
                        href={`/customers?${activeTab !== "all" ? `tab=${activeTab}&` : ""}page=${p}`}
                        className="flex h-8 w-8 items-center justify-center rounded-sm text-body-sm font-bold text-white no-underline"
                        style={{ background: brand }}
                      >
                        {p}
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={p}
                      href={`/customers?${activeTab !== "all" ? `tab=${activeTab}&` : ""}page=${p}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 bg-ink-0 text-body-sm text-ink-700 no-underline"
                    >
                      {p}
                    </Link>
                  );
                })}

                {totalPages > 5 && (
                  <span className="px-1 text-body-sm text-ink-400">…</span>
                )}

                {/* Next */}
                {currentPage < totalPages ? (
                  <Link
                    href={`/customers?${activeTab !== "all" ? `tab=${activeTab}&` : ""}page=${currentPage + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 text-body-sm text-ink-700 no-underline"
                  >
                    ›
                  </Link>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 text-body-sm text-ink-300">
                    ›
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
