import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ChooseStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service } = await searchParams;

  // fetch staff for this tenant
  const staffResult = await pool.query(
    `SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );

  // fetch the selected service so we can show its name
  const serviceResult = service
    ? await pool.query(
        `SELECT * FROM services WHERE id = $1 AND tenant_id = $2`,
        [service, tenant.id]
      )
    : { rows: [] };

  const staffList = staffResult.rows;
  const selectedService = serviceResult.rows[0] ?? null;

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Choose a staff member
        </h1>
        {selectedService && (
          <p className="text-gray-500 mt-1">
            for {selectedService.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {staffList.map((member) => (
          <a
            key={member.id}
            href={`/book/time?service=${service}&staff=${member.id}`}
            className="border border-gray-100 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow flex items-center gap-4"
          >
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
              style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
            >
              {member.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}