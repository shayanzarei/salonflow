import BookingProgress from "@/components/booking/BookingProgress";
import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { MapPinIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import { getGoogleMapsSearchUrl } from "@/lib/maps";
import { PHONE_INPUT_PATTERN } from "@/lib/phone";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";
import { notFound } from "next/navigation";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; staff?: string; time?: string }>;
}) {
  const { locale, t } = await getServerTranslations();
  const dateLocale = bcp47ForLocale(locale);
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { service, staff, time } = await searchParams;
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
  if (!selectedService || !selectedStaff || !time) notFound();

  // The customer-facing booking widget always renders times in the salon's
  // wall clock — that's what the customer expects to see for an in-person
  // appointment, and it matches the slot labels they already picked from
  // TimeSlotPicker. Falling through to the default zone keeps older tenants
  // (with iana_timezone unset) showing something sensible rather than
  // silently rendering in the server's UTC zone.
  const tenantZone =
    tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
      ? tenant.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;

  // `time` is a UTC ISO string (Z-suffixed) emitted by lib/availability —
  // safe to parse with `new Date(...)` and re-format with timeZone.
  const bookedAt = new Date(time);

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
        <a
          href={`/book/time?service=${service}&staff=${staff}`}
          className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm text-ink-500 no-underline sm:mb-8"
        >
          {t.booking.back}
        </a>

        <BookingProgress
          step={4}
          brand={brand}
          progressLabels={t.booking.progress}
        />

        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl md:text-[40px]">
            {t.booking.confirmTitle}
          </h1>
          <p className="mt-2 text-sm text-ink-500 sm:text-base">
            {t.booking.confirmSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6 lg:items-start">
          {/* Left — Booking summary */}
          <div
            style={{
              background: "white",
              border: "1px solid #f0f0f0",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="px-5 py-6 sm:px-8 sm:py-7" style={{ background: brand }}>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: "0 0 6px",
                }}
              >
                {tenant.name}
              </p>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "white",
                  margin: 0,
                }}
              >
                {t.booking.summaryHeading}
              </h2>
            </div>

            {/* Details */}
            <div className="p-5 sm:p-6 md:p-8">
              {/* Staff */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 28,
                  paddingBottom: 28,
                  borderBottom: "1px solid #f5f5f5",
                }}
              >
                <Avatar
                  name={selectedStaff.name}
                  size="lg"
                  className="h-[52px] w-[52px] text-lg text-white"
                  style={{ background: brand }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#111",
                      margin: "0 0 2px",
                    }}
                  >
                    {selectedStaff.name}
                  </p>
                  <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                    {selectedStaff.role}
                  </p>
                </div>
              </div>

              {/* Rows */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  { label: t.booking.rowService, value: selectedService.name },
                  {
                    label: t.booking.rowDate,
                    value: bookedAt.toLocaleDateString(dateLocale, {
                      timeZone: tenantZone,
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  {
                    label: t.booking.rowTime,
                    value: bookedAt.toLocaleTimeString(dateLocale, {
                      timeZone: tenantZone,
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  },
                  {
                    label: t.booking.rowDuration,
                    value: fillTemplate(t.booking.durationMinsShort, {
                      n: selectedService.duration_mins,
                    }),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <span className="shrink-0 text-sm text-ink-500">
                      {item.label}
                    </span>
                    <span className="min-w-0 text-sm font-medium text-ink-900 sm:text-right">
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontSize: 15, fontWeight: 600, color: "#111" }}
                  >
                    {t.booking.rowTotal}
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: brand }}>
                    €{selectedService.price}
                  </span>
                </div>
              </div>

              {/* Location */}
              {tenant.address && (
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 24,
                    borderTop: "1px solid #f5f5f5",
                  }}
                >
                  <p
                    style={{
                      fontSize: 12,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      margin: "0 0 8px",
                    }}
                  >
                    {t.booking.rowLocation}
                  </p>
                  <p style={{ fontSize: 14, color: "#555", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPinIcon size={13} /> {tenant.address}
                  </p>
                  <a
                    href={getGoogleMapsSearchUrl(tenant.address)}
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

          {/* Right — Customer form */}
          <div className="rounded-[20px] border border-ink-100 bg-white p-5 sm:p-6 md:p-8">
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#111",
                margin: "0 0 6px",
              }}
            >
              {t.booking.yourDetails}
            </h2>
            <p style={{ fontSize: 14, color: "#888", margin: "0 0 28px" }}>
              {t.booking.yourDetailsHint}
            </p>

            <form
              action="/api/bookings"
              method="POST"
              className="flex flex-col gap-5"
            >
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <input type="hidden" name="service_id" value={service} />
              <input type="hidden" name="staff_id" value={staff} />
              <input type="hidden" name="booked_at" value={time} />

              <Input
                id="confirm-client-name"
                name="client_name"
                type="text"
                required
                label={t.booking.fullName}
                placeholder={t.booking.placeholderName}
              />

              <Input
                id="confirm-client-email"
                name="client_email"
                type="email"
                required
                label={t.booking.emailAddress}
                placeholder={t.booking.placeholderEmail}
              />

              <Input
                id="confirm-client-phone"
                name="client_phone"
                type="tel"
                pattern={PHONE_INPUT_PATTERN}
                title="Use a valid phone number format."
                label={t.booking.phoneNumber}
                optionalLabel={t.booking.phoneOptional}
                placeholder={t.booking.placeholderPhone}
              />

              {/* Cancellation policy */}
              <div className="rounded-xl bg-ink-50 px-4 py-3.5">
                <p className="m-0 text-xs leading-relaxed text-ink-500">
                  {t.booking.confirmPolicyNotice}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-1 w-full rounded-full"
                style={{ backgroundColor: brand }}
              >
                {t.booking.confirmBookingCta}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
