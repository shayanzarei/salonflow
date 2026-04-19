import BookingProgress from "@/components/booking/BookingProgress";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  ScissorsIcon,
} from "@/components/ui/Icons";
import pool from "@/lib/db";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const { booking } = await searchParams;
  const { locale, t } = await getServerTranslations();
  const dateLocale = bcp47ForLocale(locale);
  const tenant = await getTenant();
  const brand = tenant?.primary_color ?? "#11c4b6";

  let bookingData: {
    booked_at: string;
    service_name: string;
    duration_mins: number;
    price: string | number;
    staff_name: string;
  } | null = null;

  if (booking) {
    const result = await pool.query(
      `SELECT
         b.*,
         s.name AS service_name,
         s.duration_mins,
         s.price,
         st.name AS staff_name
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.id = $1`,
      [booking]
    );
    bookingData = result.rows[0] ?? null;
  }

  const bookedAt = bookingData ? new Date(bookingData.booked_at) : null;
  const salonName = tenant?.name ?? "the salon";
  const priceNum =
    bookingData != null
      ? typeof bookingData.price === "string"
        ? parseFloat(bookingData.price)
        : Number(bookingData.price)
      : null;
  const priceLabel =
    priceNum != null && !Number.isNaN(priceNum)
      ? `€${priceNum.toFixed(priceNum % 1 === 0 ? 0 : 2)}`
      : bookingData
        ? `€${bookingData.price}`
        : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[560px] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:mb-8"
        >
          {t.booking.backToWebsite}
        </Link>

        <BookingProgress
          step={4}
          brand={brand}
          variant="complete"
          progressLabels={t.booking.progress}
        />

        <div className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-5 flex justify-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm sm:h-[72px] sm:w-[72px]"
              style={{
                background: `linear-gradient(145deg, ${brand} 0%, color-mix(in srgb, ${brand} 75%, #0f172a) 100%)`,
              }}
            >
              <CheckCircleIcon size={34} color="#ffffff" />
            </div>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t.booking.success.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-500 sm:text-base">
            {t.booking.success.subtitle}
          </p>
        </div>

        {bookingData && bookedAt && (
          <div
            className="mb-8 overflow-hidden rounded-[20px] border border-[#f0f0f0] bg-white shadow-sm sm:mb-10"
          >
            <div
              className="px-5 py-4 sm:px-6 sm:py-5"
              style={{ background: brand }}
            >
              <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">
                {salonName}
              </p>
              <p className="text-lg font-bold text-white sm:text-xl">
                {t.booking.success.yourAppointment}
              </p>
            </div>

            <div className="p-5 sm:p-6 md:p-8">
              <div className="mb-6 flex items-start gap-4 border-b border-gray-100 pb-6">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14"
                  style={{ background: `${brand}18` }}
                >
                  <ScissorsIcon size={22} color={brand} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    {bookingData.service_name}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t.booking.success.withStaffPrefix} {bookingData.staff_name}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
                {[
                  {
                    icon: <CalendarIcon size={14} color="#9ca3af" />,
                    label: t.booking.success.dateLabel,
                    value: bookedAt.toLocaleDateString(dateLocale, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  },
                  {
                    icon: <ClockIcon size={14} color="#9ca3af" />,
                    label: t.booking.success.timeLabel,
                    value: bookedAt.toLocaleTimeString(dateLocale, {
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  },
                  {
                    icon: <ClockIcon size={14} color="#9ca3af" />,
                    label: t.booking.success.durationLabel,
                    value: fillTemplate(t.booking.durationMinutes, {
                      n: bookingData.duration_mins,
                    }),
                  },
                  {
                    icon: (
                      <span className="text-xs font-bold text-gray-400">€</span>
                    ),
                    label: t.booking.success.totalLabel,
                    value: priceLabel,
                    accent: true,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                      <span className="flex shrink-0 items-center">{item.icon}</span>
                      {item.label}
                    </p>
                    <p
                      className="text-[15px] font-semibold text-gray-900 sm:text-base"
                      style={item.accent ? { color: brand } : undefined}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {tenant?.address ? (
                <div className="border-t border-gray-100 pt-6">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                    <MapPinIcon size={14} color="#9ca3af" />
                    {t.booking.success.locationLabel}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                    {tenant.address}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <Link
          href="/"
          className="mb-5 flex min-h-12 w-full items-center justify-center rounded-full text-center text-[15px] font-semibold text-white no-underline transition-opacity hover:opacity-90 sm:mb-6"
          style={{ background: brand }}
        >
          {t.booking.success.backToHome}
        </Link>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <a
            href={
              bookedAt
                ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(bookingData?.service_name ?? t.booking.success.calendarEventDefault)}&dates=${bookedAt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z/${bookedAt.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: brand }}
          >
            <CalendarIcon size={16} color={brand} />
            {t.booking.success.addGoogleCalendar}
          </a>
          <span className="hidden h-4 w-px bg-gray-200 sm:block" aria-hidden />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              fillTemplate(t.booking.success.shareWhatsappTemplate, {
                salon: salonName,
              })
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: brand }}
          >
            <span aria-hidden>🔗</span>
            {t.booking.success.share}
          </a>
        </div>
      </div>
    </div>
  );
}
