import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function BookingHomePage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`,
    [tenant.id]
  );
  const services = result.rows;

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to {tenant.name}
        </h1>
        <p className="text-gray-500 text-lg">
          Book your appointment online in seconds.
        </p>

        <a
          href="/book"
          className="inline-block mt-6 px-8 py-3 rounded-xl text-white font-medium text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? "#7C3AED" }}>
          Book an appointment
        </a>
      </div>

      {services.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Our services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="border border-gray-100 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {service.name}
                    </h3>
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
                    style={{ color: tenant.primary_color ?? "#7C3AED" }}>
                    ${service.price}
                  </span>
                </div>
                <a
                  href={`/book/staff?service=${service.id}`}
                  className="mt-4 block text-center py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: tenant.primary_color ?? "#7C3AED",
                  }}>
                  Book
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          No services added yet.
        </div>
      )}
    </div>
  );
}
