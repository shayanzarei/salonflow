import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function ServicesPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );
  const services = result.rows;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage your salon services</p>
        </div>
        <a
          href="/services/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
        >
          Add service
        </a>
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        {services.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No services yet. Add your first service.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {services.map((service) => (
              <div
                key={service.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {service.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {service.duration_mins} mins
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: tenant.primary_color ?? '#7C3AED' }}
                  >
                    ${service.price}
                  </span>
                  <form action="/api/services/delete" method="POST">
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="tenant_id" value={tenant.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}