import pool from "@/lib/db";

export default async function AdminDemoBookingsPage() {
  const result = await pool.query(
    `SELECT
      id,
      focus_area,
      duration_mins,
      scheduled_for,
      first_name,
      last_name,
      work_email,
      company_role,
      status,
      created_at
    FROM demo_bookings
    ORDER BY scheduled_for DESC`
  );

  const bookings = result.rows;

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Demo bookings</h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          All marketing-site demo requests and scheduled slots.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {bookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No demo bookings yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Focus</th>
                  <th className="px-5 py-3.5">Slot</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="text-sm text-gray-800">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">
                        {booking.first_name} {booking.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{booking.work_email}</p>
                      {booking.company_role ? (
                        <p className="text-xs text-gray-500">{booking.company_role}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                        {String(booking.focus_area).replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(booking.scheduled_for).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{booking.duration_mins} min</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium capitalize text-emerald-700">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

