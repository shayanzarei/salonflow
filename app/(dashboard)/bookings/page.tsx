import { EyeIcon, PlusIcon, SearchIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 12;

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { status, page, search } = await searchParams;
  const currentPage = parseInt(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;
  const brand = tenant.primary_color ?? "#7C3AED";

  const conditions = [`b.tenant_id = $1`];
  const params: any[] = [tenant.id];
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
      `SELECT
         b.id, b.client_name, b.client_email, b.booked_at, b.status,
         s.name AS service_name, s.price, s.duration_mins,
         st.name AS staff_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE ${whereClause}
       ORDER BY b.booked_at DESC
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
    { label: "All", value: "" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const statusConfig: Record<
    string,
    { color: string; bg: string; dot: string }
  > = {
    confirmed: { color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
    pending: { color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
    cancelled: { color: "#DC2626", bg: "#FEF2F2", dot: "#EF4444" },
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Bookings
          </h1>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:text-[13px]"
            style={{
              color: brand,
              background: `${brand}15`,
            }}
          >
            {totalCount} Total
          </span>
        </div>
        <Link
          href="/bookings/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-[10px] px-4 py-2.5 text-sm font-medium text-white no-underline sm:w-auto"
          style={{ background: brand }}

        >
          <PlusIcon size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          Add Booking
        </Link>
      </div>

      {/* Filters + search */}
      <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        {/* Status filters — horizontal scroll on narrow screens */}
        <div className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
          {filters.map((f) => {
            const isActive = (status ?? "") === f.value;
            return (
              <Link
                key={f.value}
                href={f.value ? `/bookings?status=${f.value}` : "/bookings"}
                className={`shrink-0 rounded-full px-4 py-2 text-sm no-underline ${
                  isActive
                    ? "bg-gray-900 font-semibold text-white"
                    : "border border-gray-200 font-normal text-gray-600"
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
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Search client, service..."
              className="w-full min-w-0 rounded-[10px] border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none sm:w-[220px] md:w-[260px]"
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
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
              {[
                "Client",
                "Service",
                "Staff",
                "Date & Time",
                "Status",
                "Price",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 20px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#aaa",
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
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "#aaa",
                    fontSize: 14,
                  }}
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const sc = statusConfig[booking.status] ?? statusConfig.pending;
                const initials = booking.client_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={booking.id}
                    style={{
                      borderBottom: "1px solid #f9f9f9",
                      transition: "background 0.15s",
                    }}
                  >
                    {/* Client */}
                    <td style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: brand,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#111",
                              margin: 0,
                            }}
                          >
                            {booking.client_name}
                          </p>
                          <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                            {booking.client_email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td style={{ padding: "16px 20px" }}>
                      <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                        {booking.service_name}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {booking.duration_mins} min
                      </p>
                    </td>

                    {/* Staff */}
                    <td style={{ padding: "16px 20px" }}>
                      <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                        {booking.staff_name
                          .split(" ")
                          .map((n: string, i: number) =>
                            i === 0 ? n : n[0] + "."
                          )
                          .join(" ")}
                      </p>
                    </td>

                    {/* Date & Time */}
                    <td style={{ padding: "16px 20px" }}>
                      <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                        {new Date(booking.booked_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {new Date(booking.booked_at).toLocaleTimeString(
                          "en-US",
                          { hour: "numeric", minute: "2-digit" }
                        )}
                      </p>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 13,
                          fontWeight: 500,
                          color: sc.color,
                          background: sc.bg,
                          padding: "4px 10px",
                          borderRadius: 100,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: sc.dot,
                            display: "inline-block",
                          }}
                        />
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "16px 20px" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#111",
                          margin: 0,
                        }}
                      >
                        €{booking.price}
                      </p>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "16px 20px" }}>
                      <Link
                        href={`/bookings/${booking.id}`}
                        style={{
                          fontSize: 13,
                          color: brand,
                          textDecoration: "none",
                          fontWeight: 500,
                          padding: "6px 14px",
                          border: `1px solid ${brand}30`,
                          borderRadius: 8,
                          background: `${brand}08`,
                        }}
                      >
                        <EyeIcon size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span style={{ fontSize: 13, color: "#666" }}>Show</span>
              <select
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 13,
                  color: "#333",
                }}
              >
                <option>12</option>
                <option>24</option>
                <option>48</option>
              </select>
              <span style={{ fontSize: 13, color: "#666" }}>
                of {totalCount} results
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2 [-webkit-overflow-scrolling:touch]">
              {currentPage > 1 && (
                <Link
                  href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${currentPage - 1}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    color: "#666",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
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
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: p === currentPage ? "none" : "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: p === currentPage ? brand : "white",
                    color: p === currentPage ? "white" : "#666",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: p === currentPage ? 600 : 400,
                  }}
                >
                  {p}
                </Link>
              ))}
              {totalPages > 5 && (
                <span style={{ color: "#aaa", fontSize: 14 }}>...</span>
              )}
              {totalPages > 5 && (
                <Link
                  href={`/bookings?page=${totalPages}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    color: "#666",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  {totalPages}
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${currentPage + 1}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    color: "#666",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  ›
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
