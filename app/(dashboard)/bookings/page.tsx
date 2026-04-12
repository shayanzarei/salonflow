import pool from "@/lib/db";
import { formatEUR } from "@/lib/format-currency";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 10;

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
      `(b.client_name ILIKE $${paramCount} OR b.client_email ILIKE $${paramCount})`
    );
    params.push(`%${search}%`);
  }

  const whereClause = conditions.join(" AND ");

  const [bookingsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
         b.id,
         b.client_name,
         b.client_email,
         b.client_phone,
         b.booked_at,
         b.status,
         s.name AS service_name,
         s.price,
         s.duration_mins,
         st.name AS staff_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE ${whereClause}
       ORDER BY b.booked_at DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      params
    ),
    pool.query(`SELECT COUNT(*) FROM bookings b WHERE ${whereClause}`, params),
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 mt-1">{totalCount} total bookings</p>
        </div>
        <Link
          href="/bookings/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? "#7C3AED" }}
        >
          Add booking
        </Link>
      </div>

      {/* Filters and search */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex gap-2">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/bookings?status=${f.value}` : "/bookings"}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={
                (status ?? "") === f.value
                  ? {
                      backgroundColor: tenant.primary_color ?? "#7C3AED",
                      color: "white",
                    }
                  : {
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      color: "#6B7280",
                    }
              }
            >
              {f.label}
            </Link>
          ))}
        </div>

        <form method="GET" action="/bookings">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search by name or email..."
            className="border border-gray-200 rounded-lg px-4 py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400 w-64"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No bookings found.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Price
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                        {booking.client_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.client_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.client_email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {booking.service_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.duration_mins} mins
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {booking.staff_name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {new Date(booking.booked_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(booking.booked_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-50 text-green-600"
                          : booking.status === "cancelled"
                            ? "bg-red-50 text-red-500"
                            : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatEUR(booking.price)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} of{" "}
            {totalCount}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${currentPage - 1}`}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${p}`}
                className="px-3 py-1.5 text-sm border rounded-lg"
                style={
                  p === currentPage
                    ? {
                        backgroundColor: tenant.primary_color ?? "#7C3AED",
                        color: "white",
                        borderColor: "transparent",
                      }
                    : { borderColor: "#E5E7EB", color: "#6B7280" }
                }
              >
                {p}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/bookings?${status ? `status=${status}&` : ""}${search ? `search=${search}&` : ""}page=${currentPage + 1}`}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
