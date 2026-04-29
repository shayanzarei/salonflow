import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import {
  Table,
  TableContainer,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
import { EyeIcon, PlusIcon, SearchIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import type { Translations } from "@/lib/i18n/translations";
import { getTenant } from "@/lib/tenant";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";
import Link from "next/link";
import { notFound } from "next/navigation";

function bookingStatusLabel(status: string, t: Translations): string {
  switch (status) {
    case "confirmed":
      return t.dashboard.bookings.statusConfirmed;
    case "pending":
      return t.dashboard.bookings.statusPending;
    case "cancelled":
      return t.dashboard.bookings.statusCancelled;
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

const PAGE_SIZE = 12;

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const { locale, t } = await getServerTranslations();
  const dateLocale = bcp47ForLocale(locale);
  const db = t.dashboard.bookings;
  const tenant = await getTenant();
  if (!tenant) notFound();

  // Resolve the salon's IANA zone once. Every time we render to the user we
  // pass this to Intl so the wall-clock matches the salon's location, not the
  // browser's locale default. Falling back to the helper's default keeps any
  // tenant whose zone is somehow unset on the historic Amsterdam value.
  const tenantZone =
    tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
      ? tenant.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;

  const { status, page, search } = await searchParams;
  const currentPage = parseInt(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const conditions = [`b.tenant_id = $1`];
  const params: string[] = [tenant.id];
  let paramCount = 1;

  if (status) {
    paramCount++;
    conditions.push(`b.status = $${paramCount}`);
    params.push(status);
  }

  if (search) {
    paramCount++;
    conditions.push(
      `(b.client_name ILIKE $${paramCount} OR b.client_email ILIKE $${paramCount} OR s.name ILIKE $${paramCount})`
    );
    params.push(`%${search}%`);
  }

  const whereClause = conditions.join(" AND ");

  const [bookingsResult, countResult] = await Promise.all([
    pool.query(
      // Read the canonical UTC instant (booking_start_utc), never the legacy
      // booked_at — see lib/timezone.ts for the rule. Sorting by start_utc is
      // semantically the same as sorting by booked_at since the trigger keeps
      // them in sync, but reading the UTC column directly avoids any
      // ambiguity if booked_at is later dropped.
      `SELECT
         b.id, b.client_name, b.client_email, b.booking_start_utc, b.status,
         s.name AS service_name, s.price, s.duration_mins,
         st.name AS staff_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE ${whereClause}
       ORDER BY b.booking_start_utc DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    ),
    pool.query(
      `SELECT COUNT(*) FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE ${whereClause}`,
      params
    ),
  ]);

  const bookings = bookingsResult.rows;
  const totalCount = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filters = [
    { label: db.filterAll, value: "" },
    { label: db.filterConfirmed, value: "confirmed" },
    { label: db.filterPending, value: "pending" },
    { label: db.filterCancelled, value: "cancelled" },
  ];

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    confirmed: "success",
    pending: "warning",
    cancelled: "danger",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-h2 font-bold text-ink-900 sm:text-h1">
            {db.title}
          </h1>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-caption font-medium"
            style={{
              color: brand,
              background: `${brand}15`,
            }}
          >
            {fillTemplate(db.totalTemplate, { n: totalCount })}
          </span>
        </div>
        <Button
          asChild
          variant="primary"
          size="md"
          className="shrink-0"
          style={{ backgroundColor: brand }}
        >
          <Link href="/bookings/new">
            <PlusIcon size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            {db.addBooking}
          </Link>
        </Button>
      </div>

      {/* Filters + search */}
      <div className="mb-4 flex flex-col gap-4 rounded-lg border border-ink-100 bg-ink-0 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        {/* Status filters — horizontal scroll on narrow screens */}
        <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          {filters.map((f) => {
            const isActive = (status ?? "") === f.value;
            return (
              <Link
                key={f.value}
                href={f.value ? `/bookings?status=${f.value}` : "/bookings"}
                className={`shrink-0 rounded-full px-4 py-2 text-body-sm no-underline ${
                  isActive
                    ? "bg-ink-900 font-semibold text-ink-0"
                    : "border border-ink-200 font-normal text-ink-600"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* Search */}
        <div className="min-w-0 shrink-0 sm:max-w-full">
          <form
            method="GET"
            action="/bookings"
            className="relative w-full sm:w-auto"
          >
            {status && <input type="hidden" name="status" value={status} />}
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search ?? ""}
              placeholder={db.searchPlaceholder}
              className="min-h-10 w-full min-w-0 rounded-sm border border-ink-200 bg-ink-0 py-2.5 pl-9 pr-4 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none sm:w-[220px] md:w-[260px]"
            />
          </form>
          {/* <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              background: "white",
              fontSize: 14,
              color: "#555",
              cursor: "pointer",
            }}
          >
            🎛 Filters
          </button> */}
        </div>
      </div>

      {/* Table */}
      <TableContainer className="rounded-lg border-ink-100">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <Table className="min-w-[920px]">
          <thead>
            <THeadRow>
              <TH>{db.colClient}</TH>
              <TH>{db.colService}</TH>
              <TH>{db.colStaff}</TH>
              <TH>{db.colDateTime}</TH>
              <TH>{db.colStatus}</TH>
              <TH>{db.colPrice}</TH>
              <TH>{db.colAction}</TH>
            </THeadRow>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-body-sm text-ink-400"
                >
                  {db.noBookings}
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const variant = statusVariant[booking.status] ?? "warning";

                return (
                  <TBodyRow key={booking.id} interactive={false}>
                    {/* Client */}
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={booking.client_name}
                          size="md"
                          className="text-body-sm text-white"
                          style={{ background: brand }}
                        />
                        <div>
                          <p className="text-body-sm font-medium text-ink-900">
                            {booking.client_name}
                          </p>
                          <p className="text-caption text-ink-400">
                            {booking.client_email}
                          </p>
                        </div>
                      </div>
                    </TD>

                    {/* Service */}
                    <TD>
                      <p className="text-body-sm text-ink-700">
                        {booking.service_name}
                      </p>
                      <p className="text-caption text-ink-400">
                        {fillTemplate(db.minShort, {
                          n: booking.duration_mins,
                        })}
                      </p>
                    </TD>

                    {/* Staff */}
                    <TD>
                      <p className="text-body-sm text-ink-700">
                        {booking.staff_name
                          .split(" ")
                          .map((n: string, i: number) =>
                            i === 0 ? n : n[0] + "."
                          )
                          .join(" ")}
                      </p>
                    </TD>

                    {/* Date & Time — both rendered in the salon's wall clock.
                        Reading booking_start_utc (TIMESTAMPTZ) and passing the
                        tenant's IANA zone via Intl is the only way to display
                        the correct salon-local hour. Calling toLocaleString
                        without timeZone would show the SERVER's wall clock,
                        which is UTC on Vercel — that's the "DB has 14:00,
                        UI shows 12" bug. */}
                    <TD>
                      <p className="text-body-sm text-ink-700">
                        {new Date(booking.booking_start_utc).toLocaleDateString(
                          dateLocale,
                          {
                            timeZone: tenantZone,
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-caption text-ink-400">
                        {new Date(booking.booking_start_utc).toLocaleTimeString(
                          dateLocale,
                          {
                            timeZone: tenantZone,
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </TD>

                    {/* Status */}
                    <TD>
                      <Badge variant={variant} dot>
                        {bookingStatusLabel(booking.status, t)}
                      </Badge>
                    </TD>

                    {/* Price */}
                    <TD>
                      <p className="text-body-sm font-semibold text-ink-900">
                        €{booking.price}
                      </p>
                    </TD>

                    {/* Action */}
                    <TD>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1 rounded-md border px-3.5 py-1.5 text-body-sm font-medium no-underline"
                        style={{
                          color: brand,
                          borderColor: `${brand}30`,
                          background: `${brand}08`,
                        }}
                      >
                        <EyeIcon size={13} />{" "}
                        {db.view}
                      </Link>
                    </TD>
                  </TBodyRow>
                );
              })
            )}
          </tbody>
        </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-ink-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-2 text-body-sm text-ink-600">
              <span className="text-body-sm text-ink-600">{db.show}</span>
              <select
                className="cursor-pointer rounded border border-ink-200 px-2 py-1 text-body-sm text-ink-700"
              >
                <option>12</option>
                <option>24</option>
                <option>48</option>
              </select>
              <span className="text-body-sm text-ink-600">
                {fillTemplate(db.ofResultsTemplate, { n: totalCount })}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2 [-webkit-overflow-scrolling:touch]">
              {currentPage > 1 && (
                <Link
                  href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${currentPage - 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-body-sm text-ink-600 no-underline hover:bg-ink-50"
                >
                  ‹
                </Link>
              )}
              {Array.from(
                { length: Math.min(totalPages, 5) },
                (_, i) => i + 1
              ).map((p) => (
                <Link
                  key={p}
                  href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${p}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-body-sm no-underline"
                  style={{
                    border: p === currentPage ? "none" : "1px solid var(--color-ink-200)",
                    background: p === currentPage ? brand : "var(--color-ink-0)",
                    color: p === currentPage ? "white" : "var(--color-ink-600)",
                    fontWeight: p === currentPage ? 600 : 400,
                  }}
                >
                  {p}
                </Link>
              ))}
              {totalPages > 5 && (
                <span className="text-body-sm text-ink-400">...</span>
              )}
              {totalPages > 5 && (
                <Link
                  href={`/bookings?page=${totalPages}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-body-sm text-ink-600 no-underline hover:bg-ink-50"
                >
                  {totalPages}
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${currentPage + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-200 text-body-sm text-ink-600 no-underline hover:bg-ink-50"
                >
                  ›
                </Link>
              )}
            </div>
          </div>
        )}
      </TableContainer>
    </div>
  );
}
