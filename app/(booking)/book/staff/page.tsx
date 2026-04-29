import BookingProgress from "@/components/booking/BookingProgress";
import { Avatar } from "@/components/ds/Avatar";
import pool from "@/lib/db";
import { getServerTranslations } from "@/lib/i18n/server";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Mid-flow form step — not a landing page. Belt-and-suspenders with robots.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ChooseStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { t } = await getServerTranslations();
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service } = await searchParams;
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const [staffResult, serviceResult] = await Promise.all([
    service
      ? pool.query(
          `SELECT st.*
           FROM staff st
           WHERE st.tenant_id = $1
           AND (
             NOT EXISTS (
               SELECT 1 FROM service_staff ss
               WHERE ss.service_id = $2::uuid AND ss.tenant_id = $1
             )
             OR EXISTS (
               SELECT 1 FROM service_staff ss
               WHERE ss.service_id = $2::uuid AND ss.staff_id = st.id AND ss.tenant_id = $1
             )
           )
           ORDER BY st.name`,
          [tenant.id, service]
        )
      : pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
          tenant.id,
        ]),
    service
      ? pool.query(
          `SELECT * FROM services WHERE id = $1 AND tenant_id = $2 AND ${bookableServiceSql()}`,
          [service, tenant.id]
        )
      : Promise.resolve({ rows: [] }),
  ]);

  const staffList = staffResult.rows;
  const selectedService = serviceResult.rows[0] ?? null;

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
        <a
          href="/book"
          className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-500 no-underline sm:mb-8"
        >
          {t.booking.back}
        </a>

        <BookingProgress
          step={2}
          brand={brand}
          progressLabels={t.booking.progress}
        />

        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl md:text-[40px]">
            {t.booking.chooseStaffTitle}
          </h1>
          {selectedService && (
            <p className="mt-2 text-sm text-ink-500 sm:text-[15px]">
              {t.booking.selectedLabel}{" "}
              <strong className="text-ink-700">{selectedService.name}</strong>
            </p>
          )}
        </div>

        {/* Staff grid */}
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4"
        >
          {staffList.map((member) => (
            <a
              key={member.id}
              href={`/book/time?service=${service}&staff=${member.id}`}
              className="flex cursor-pointer flex-col items-center rounded-2xl border border-ink-100 bg-white p-6 no-underline transition-shadow hover:border-ink-200 hover:shadow-md sm:p-8"
            >
              {/* Avatar */}
              <Avatar
                name={member.name}
                src={member.avatar_url}
                size="xl"
                className="mb-4 h-20 w-20 text-[28px] text-white"
                style={{ background: brand }}
              />

              {/* Name & role */}
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 6px",
                  textAlign: "center",
                }}
              >
                {member.name}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#888",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                {member.role}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
