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
    <div>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/bookings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', textDecoration: 'none', marginBottom: 12 }}
        >
          ← Back to Bookings
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: '0 0 4px' }}>Add Booking</h1>
        <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Manually create a booking for a client</p>
      </div>

      <AddBookingForm
        services={servicesResult.rows}
        staffList={staffResult.rows}
        brand={tenant.primary_color ?? '#7C3AED'}
        tenantId={tenant.id}
      />
    </div>
  );
}