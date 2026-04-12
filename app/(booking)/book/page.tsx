import { formatEUR } from "@/lib/format-currency";
import pool from "@/lib/db";
import { getTenant } from '@/lib/tenant';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ChooseServicePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );
  const services = result.rows;

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Choose a service
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service) => (
          <a
            key={service.id}
            href={`/book/staff?service=${service.id}`}
            className="border border-gray-100 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {service.description}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  {service.duration_mins} mins
                </p>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: tenant.primary_color ?? '#7C3AED' }}
              >
                {formatEUR(Number(service.price))}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}