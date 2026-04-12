import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function NewBookingPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

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
    <div className="max-w-lg">
      <div className="mb-8">
        <Link
          href="/bookings"
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to bookings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Add booking</h1>
        <p className="text-gray-500 mt-1">
          Manually create a booking for a client
        </p>
      </div>

      <form action="/api/bookings/manual" method="POST" className="space-y-4">
        <input type="hidden" name="tenant_id" value={tenant.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client name
          </label>
          <input
            type="text"
            name="client_name"
            required
            placeholder="Sarah Johnson"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="client_email"
            required
            placeholder="sarah@example.com"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="tel"
            name="client_phone"
            placeholder="+31 6 12345678"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service
          </label>
          <select
            name="service_id"
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — €{s.price}
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
            required
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          >
            <option value="">Select a staff member</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              required
              min={new Date().toISOString().split("T")[0]}
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
              required
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
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          >
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: brand }}
        >
          Create booking
        </button>
      </form>
    </div>
  );
}
