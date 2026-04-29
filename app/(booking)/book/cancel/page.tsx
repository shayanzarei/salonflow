import { CalendarIcon, ClockIcon, MapPinIcon, ScissorsIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import { getGoogleMapsSearchUrl } from "@/lib/maps";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";
import { notFound } from "next/navigation";

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; token?: string }>;
}) {
  const { booking, token } = await searchParams;
  const { locale, t } = await getServerTranslations();
  const dateLocale = bcp47ForLocale(locale);
  const c = t.booking.cancel;

  if (!booking || !token) notFound();

  // Pull `booking_start_utc` (the canonical UTC column) and the salon's
  // IANA zone so the times below render in the salon's wall clock — what
  // the customer expects to see for an in-person appointment, regardless
  // of where their browser thinks they are.
  const result = await pool.query(
    `SELECT
       b.id,
       b.status,
       b.booking_start_utc,
       s.name AS service_name,
       s.price,
       s.duration_mins,
       st.name AS staff_name,
       t.primary_color,
       t.address,
       t.iana_timezone
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     JOIN tenants t ON b.tenant_id = t.id
     WHERE b.id = $1 AND b.cancellation_token = $2`,
    [booking, token]
  );

  const bookingData = result.rows[0];
  if (!bookingData) notFound();

  const alreadyCancelled = bookingData.status === "cancelled";
  const brand = bookingData.primary_color ?? 'var(--color-brand-600)';
  const tenantZone =
    bookingData.iana_timezone && isValidIanaTimezone(bookingData.iana_timezone)
      ? bookingData.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;
  const bookedAt = new Date(bookingData.booking_start_utc);

  if (alreadyCancelled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 py-10 sm:px-6 sm:py-12">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 36 }}>✓</span>
        </div>
        <h1 className="mb-3 text-center text-2xl font-bold text-ink-900 sm:text-3xl">
          {c.alreadyTitle}
        </h1>
        <p className="mb-8 text-center text-sm text-ink-500 sm:text-base">
          {c.alreadyBody}
        </p>
        <a
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white no-underline sm:px-10 sm:text-[15px]"
          style={{ background: brand }}
        >
          {t.booking.success.backToHome}
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 py-10 sm:px-6 sm:py-12">
      {/* Warning icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "#EF4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <span style={{ color: "white", fontSize: 36 }}>⚠</span>
      </div>

      {/* Title */}
      <h1 className="mb-3 max-w-md text-balance text-center text-2xl font-bold text-ink-900 sm:text-3xl md:text-4xl">
        {c.cancelTitle}
      </h1>
      <p className="mb-8 max-w-md text-center text-sm leading-relaxed text-ink-500 sm:mb-9 sm:text-base">
        {c.cancelBody}
      </p>

      <div className="mb-4 w-full max-w-md rounded-[20px] border border-ink-100 bg-white p-5 sm:p-7">
        <p
          style={{
            fontSize: 12,
            color: "#aaa",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 20px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ℹ {c.appointmentDetails}
        </p>

        <div className="mb-6 flex flex-col gap-4 border-b border-ink-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${brand}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ScissorsIcon size={18} color={brand} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 4px",
                }}
              >
                {bookingData.service_name}
              </h3>
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                {c.withStaffPrefix} {bookingData.staff_name}
              </p>
            </div>
          </div>
          <span className="text-lg font-bold sm:text-xl" style={{ color: brand }}>
            €{bookingData.price}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p
              style={{
                fontSize: 12,
                color: "#aaa",
                margin: "0 0 4px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CalendarIcon size={12} /> {c.date}
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {bookedAt.toLocaleDateString(dateLocale, {
                timeZone: tenantZone,
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                color: "#aaa",
                margin: "0 0 4px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ClockIcon size={12} /> {c.time}
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {bookedAt.toLocaleTimeString(dateLocale, {
                timeZone: tenantZone,
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                color: "#aaa",
                margin: "0 0 4px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ClockIcon size={12} /> {c.duration}
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: 0,
              }}
            >
              {fillTemplate(c.minutesUnit, { n: bookingData.duration_mins })}
            </p>
          </div>
          {bookingData.address && (
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#aaa",
                  margin: "0 0 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MapPinIcon size={12} /> {c.location}
              </p>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                {bookingData.address.split(",")[0]}
              </p>
              <a
                href={getGoogleMapsSearchUrl(bookingData.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex text-xs font-semibold text-accent-600 hover:underline"
              >
                Get directions
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation policy */}
      <div className="mb-7 w-full max-w-md rounded-2xl border border-danger-50 bg-danger-50 p-4 sm:p-5">
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#DC2626",
            margin: "0 0 6px",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ⚠ {c.policyTitle}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#DC2626",
            margin: 0,
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          {c.policyBody}
        </p>
      </div>

      <div className="mb-5 flex w-full max-w-md flex-col gap-3 sm:mb-6 sm:flex-row sm:gap-3">
        <a
          href="/"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-700 no-underline sm:text-[15px]"
        >
          {c.keepAppointment}
        </a>
        <form action="/api/bookings/cancel" method="POST" className="flex-1">
          <input type="hidden" name="booking_id" value={booking} />
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-none bg-danger-600 px-4 py-3 text-sm font-semibold text-white"
          >
            {c.confirmCancel}
          </button>
        </form>
      </div>

      {/* Reschedule link */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, color: "#888", margin: "0 0 8px" }}>
          {c.reschedulePrompt}
        </p>
        <a
          href="/book"
          style={{
            fontSize: 14,
            color: brand,
            fontWeight: 500,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CalendarIcon size={14} /> {c.rescheduleLink}
        </a>
      </div>
    </div>
  );
}
