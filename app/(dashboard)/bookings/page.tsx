import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { status } = await searchParams;

  const result = await pool.query(
    `SELECT
       b.id,
       b.client_name,
       b.client_email,
       b.client_phone,
       b.booked_at,
       b.status,
       b.created_at,
       s.name AS service_name,
       s.price,
       s.duration_mins,
       st.name AS staff_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     WHERE b.tenant_id = $1
     ${status ? "AND b.status = $2" : ""}
     ORDER BY b.booked_at DESC`,
    status ? [tenant.id, status] : [tenant.id]
  );

  const bookings = result.rows;

  const filters = [
    { label: "All", value: "" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Pending", value: "pending" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">All appointments</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <a
            key={f.value}
            href={f.value ? `/bookings?status=${f.value}` : "/bookings"}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (status ?? "") === f.value
                ? "text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            style={
              (status ?? "") === f.value
                ? { backgroundColor: tenant.primary_color ?? "#7C3AED" }
                : {}
            }>
            {f.label}
          </a>
        ))}
      </div>

      {/* Bookings table */}
      <div className="bg-white rounded-xl border border-gray-100">
        {bookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No bookings found.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
                    {booking.client_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.client_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.service_name} · {booking.staff_name} ·{" "}
                      {booking.duration_mins} mins
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.client_email}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
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
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-50 text-green-600"
                          : booking.status === "cancelled"
                          ? "bg-red-50 text-red-500"
                          : "bg-yellow-50 text-yellow-600"
                      }`}>
                      {booking.status}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${booking.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
