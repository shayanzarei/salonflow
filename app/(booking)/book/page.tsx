import BookingProgress from "@/components/booking/BookingProgress";
import pool from "@/lib/db";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { getServerTranslations } from "@/lib/i18n/server";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ChooseServicePage() {
  const { t } = await getServerTranslations();
  const tenant = await getTenant();
  if (!tenant) notFound();

  const result = await pool.query(
    `SELECT * FROM services WHERE tenant_id = $1 AND ${bookableServiceSql()} ORDER BY name`,
    [tenant.id]
  );
  const services = result.rows;
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[860px] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
        {/* Back */}
        <a
          href="/"
          className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm text-gray-600 no-underline sm:mb-8"
        >
          {t.booking.backToWebsite}
        </a>

        {/* Progress */}
        <BookingProgress
          step={1}
          brand={brand}
          progressLabels={t.booking.progress}
        />

        {/* Title */}
        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-[40px]">
            {t.booking.chooseServiceTitle}
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            {t.booking.chooseServiceSubtitle}
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 md:gap-5">
          {services.map((service) => (
            <a
              key={service.id}
              href={`/book/staff?service=${service.id}`}
              className="block min-h-[44px] rounded-2xl border border-gray-100 bg-white p-5 no-underline transition-shadow hover:border-gray-200 hover:shadow-md sm:p-6 md:p-7"
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 10px",
                }}
              >
                {service.name}
              </h3>
              {service.description && (
                <p
                  style={{
                    fontSize: 14,
                    color: "#888",
                    lineHeight: 1.6,
                    margin: "0 0 24px",
                  }}
                >
                  {service.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-gray-400 sm:text-[13px]">
                  {fillTemplate(t.booking.minutesShort, {
                    n: service.duration_mins,
                  })}
                </span>
                <span
                  className="text-lg font-bold sm:text-xl md:text-[22px]"
                  style={{ color: brand }}
                >
                  €{service.price}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
