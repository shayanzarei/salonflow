import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const [staffResult, bookingsResult] = await Promise.all([
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [
      id,
      tenant.id,
    ]),
    pool.query(
      `SELECT
         b.id,
         b.client_name,
         b.booked_at,
         b.status,
         s.name AS service_name,
         s.price,
         s.duration_mins
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       WHERE b.staff_id = $1
         AND b.tenant_id = $2
         AND b.booked_at >= NOW()
         AND b.status = 'confirmed'
       ORDER BY b.booked_at ASC
       LIMIT 10`,
      [id, tenant.id]
    ),
  ]);

  const member = staffResult.rows[0];
  if (!member) notFound();

  const upcomingBookings = bookingsResult.rows;
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link
          href="/staff"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to staff
        </Link>
      </div>

      {/* Staff profile */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-full flex items-center justify-center text-white font-semibold text-xl"
              style={{ backgroundColor: brand }}
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-gray-500 text-sm">{member.role}</p>
              <p className="text-gray-400 text-sm">{member.email}</p>
            </div>
          </div>
          <Link
            href={`/staff/${id}/edit`}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {upcomingBookings.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">
              {member.password_hash ? "✓" : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Portal access</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 capitalize">
              {member.role}
            </p>
            <p className="text-xs text-gray-400 mt-1">Role</p>
          </div>
        </div>
      </div>

      {/* Staff portal access */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-1">
          Staff portal access
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Set a password so {member.name} can log in and view their schedule
        </p>
        <form
          action="/api/staff/set-password"
          method="POST"
          className="flex gap-3"
        >
          <input type="hidden" name="staff_id" value={id} />
          <input type="hidden" name="tenant_id" value={tenant.id} />
          <input
            type="text"
            name="password"
            required
            placeholder="Set a new password"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Set password
          </button>
        </form>
        {member.password_hash && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Portal access enabled — login with slug: {member.email}
          </p>
        )}
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Upcoming appointments</h2>
        </div>
        {upcomingBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No upcoming appointments.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                    {booking.client_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.client_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {booking.service_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">
                    {new Date(booking.booked_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(booking.booked_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
