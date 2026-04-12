import { formatEUR } from "@/lib/format-currency";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT
       b.*,
       s.name AS service_name,
       s.price,
       s.duration_mins,
       st.name AS staff_name,
       st.id AS staff_id
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     WHERE b.id = $1 AND b.tenant_id = $2`,
    [id, tenant.id]
  );

  const booking = result.rows[0];
  if (!booking) notFound();

  // fetch all services and staff for edit form
  const [servicesResult, staffResult] = await Promise.all([
    pool.query(`SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
    pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
  ]);

  const services = servicesResult.rows;
  const staffList = staffResult.rows;
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/bookings"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Back to bookings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Booking details
          </h1>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium ${
            booking.status === "confirmed"
              ? "bg-green-50 text-green-600"
              : booking.status === "cancelled"
                ? "bg-red-50 text-red-500"
                : "bg-yellow-50 text-yellow-600"
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Client info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Client</h2>
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
            style={{ backgroundColor: brand }}
          >
            {booking.client_name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{booking.client_name}</p>
            <p className="text-sm text-gray-400">{booking.client_email}</p>
            {booking.client_phone && (
              <p className="text-sm text-gray-400">{booking.client_phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Appointment</h2>
        <div className="space-y-3">
          {[
            { label: "Service", value: booking.service_name },
            { label: "Staff", value: booking.staff_name },
            {
              label: "Date",
              value: new Date(booking.booked_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Time",
              value: new Date(booking.booked_at).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
            },
            { label: "Duration", value: `${booking.duration_mins} mins` },
            { label: "Price", value: formatEUR(booking.price) },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {booking.status !== "cancelled" && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Edit booking</h2>
          <form
            action="/api/bookings/update"
            method="POST"
            className="space-y-4"
          >
            <input type="hidden" name="booking_id" value={booking.id} />
            <input type="hidden" name="tenant_id" value={tenant.id} />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  name="service_id"
                  defaultValue={booking.service_id}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff
                </label>
                <select
                  name="staff_id"
                  defaultValue={booking.staff_id}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={
                    new Date(booking.booked_at).toISOString().split("T")[0]
                  }
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  defaultValue={new Date(booking.booked_at)
                    .toTimeString()
                    .slice(0, 5)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                defaultValue={booking.status}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: brand }}
            >
              Save changes
            </button>
          </form>
        </div>
      )}

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">
          These actions cannot be undone
        </p>
        <div className="flex gap-3">
          {booking.status !== "cancelled" && (
            <form action="/api/bookings/update-status" method="POST">
              <input type="hidden" name="booking_id" value={booking.id} />
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <input type="hidden" name="status" value="cancelled" />
              <input
                type="hidden"
                name="redirect"
                value={`/bookings/${booking.id}`}
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cancel booking
              </button>
            </form>
          )}
          <form action="/api/bookings/delete" method="POST">
            <input type="hidden" name="booking_id" value={booking.id} />
            <input type="hidden" name="tenant_id" value={tenant.id} />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
