import { formatEUR } from "@/lib/format-currency";
import pool from "@/lib/db";
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string; time?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service, staff, time } = await searchParams;

  const [serviceResult, staffResult] = await Promise.all([
    pool.query(`SELECT * FROM services WHERE id = $1 AND tenant_id = $2`, [service, tenant.id]),
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [staff, tenant.id]),
  ]);

  const selectedService = serviceResult.rows[0];
  const selectedStaff = staffResult.rows[0];

  if (!selectedService || !selectedStaff || !time) notFound();

  const bookedAt = new Date(time);

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <a
          href={`/book/time?service=${service}&staff=${staff}`}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Confirm your booking
        </h1>
      </div>

      {/* Booking summary */}
      <div className="border border-gray-100 rounded-xl p-6 bg-white mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Booking summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-gray-900">{selectedService.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Staff</span>
            <span className="font-medium text-gray-900">{selectedStaff.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">
              {bookedAt.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-900">
              {bookedAt.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium text-gray-900">
              {selectedService.duration_mins} mins
            </span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between">
            <span className="text-gray-500 text-sm">Total</span>
            <span
              className="font-semibold"
              style={{ color: tenant.primary_color ?? '#7C3AED' }}
            >
              {formatEUR(Number(selectedService.price))}
            </span>
          </div>
        </div>
      </div>

      {/* Customer details form */}
      <form action="/api/bookings" method="POST">
        <input type="hidden" name="tenant_id" value={tenant.id} />
        <input type="hidden" name="service_id" value={service} />
        <input type="hidden" name="staff_id" value={staff} />
        <input type="hidden" name="booked_at" value={time} />

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              type="text"
              name="client_name"
              required
              placeholder="Sarah Johnson"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              name="client_phone"
              placeholder="+1 (555) 000-0000"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
        >
          Confirm booking
        </button>
      </form>
    </div>
  );
}