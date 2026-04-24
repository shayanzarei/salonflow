import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddBookingForm from '@/components/dashboard/AddBookingForm';

export default async function NewBookingPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const [servicesResult, staffResult] = await Promise.all([
    pool.query(`SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`, [tenant.id]),
    pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [tenant.id]),
  ]);

  return (
    <div className="min-w-0">
      <div className="mb-6 sm:mb-7">
        <Link
          href="/bookings"
          className="mb-3 inline-flex min-h-10 items-center gap-1.5 text-sm text-gray-500 no-underline"
        >
          ← Back to Bookings
        </Link>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Add Booking
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Manually create a booking for a client
        </p>
      </div>

      <AddBookingForm
        services={servicesResult.rows}
        staffList={staffResult.rows}
        brand={tenant.primary_color ?? 'var(--color-brand-600)'}
        tenantId={tenant.id}
      />
    </div>
  );
}