import BookingProgress from "@/components/booking/BookingProgress";
import TimeSlotPicker from "@/components/booking/TimeSlotPicker";
import pool from "@/lib/db";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ChooseTimePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string }>;
}) {
  const { locale, t } = await getServerTranslations();
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service, staff } = await searchParams;
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const [serviceResult, staffResult] = await Promise.all([
    pool.query(
      `SELECT * FROM services WHERE id = $1 AND tenant_id = $2 AND ${bookableServiceSql()}`,
      [service, tenant.id]
    ),
    pool.query(`SELECT * FROM staff WHERE id = $1 AND tenant_id = $2`, [
      staff,
      tenant.id,
    ]),
  ]);

  const selectedService = serviceResult.rows[0];
  const selectedStaff = staffResult.rows[0];
  if (!selectedService || !selectedStaff) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
        <a
          href={`/book/staff?service=${service}`}
          className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm text-gray-600 no-underline sm:mb-8"
        >
          {t.booking.back}
        </a>

        <BookingProgress
          step={3}
          brand={brand}
          progressLabels={t.booking.progress}
        />

        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-[40px]">
            {t.booking.chooseTimeTitle}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-500 sm:text-base">
            <span className="text-gray-800">{selectedService.name}</span>{" "}
            <span className="text-gray-400">{t.booking.withStaff}</span>{" "}
            <span className="text-gray-800">{selectedStaff.name}</span>
          </p>
        </div>

        <TimeSlotPicker
          service={service!}
          staff={staff!}
          brand={brand}
          picker={t.booking.timePicker}
          localeTag={bcp47ForLocale(locale)}
        />
      </div>
    </div>
  );
}
