import BookingProgress from "@/components/booking/BookingProgress";
import { MapPinIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { fillTemplate } from "@/lib/i18n/interpolate";
import { bcp47ForLocale } from "@/lib/i18n/locale-format";
import { getServerTranslations } from "@/lib/i18n/server";
import { getGoogleMapsSearchUrl } from "@/lib/maps";
import { PHONE_INPUT_PATTERN } from "@/lib/phone";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
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

  const bookedAt = new Date(time);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 sm:py-10 md:py-12">
        <a
          href={`/book/time?service=${service}&staff=${staff}`}
          className="mb-6 inline-flex min-h-10 items-center gap-1.5 text-sm text-gray-600 no-underline sm:mb-8"
        >
          {t.booking.back}
        </a>

        <BookingProgress
          step={4}
          brand={brand}
          progressLabels={t.booking.progress}
        />

        <div className="mb-8 text-center sm:mb-10 md:mb-12">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-[40px]">
            {t.booking.confirmTitle}
          </h1>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
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
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: brand,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 18,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {selectedStaff.name.charAt(0)}
                </div>
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
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                  {
                    label: t.booking.rowTime,
                    value: bookedAt.toLocaleTimeString(dateLocale, {
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
                    <span className="shrink-0 text-sm text-gray-500">
                      {item.label}
                    </span>
                    <span className="min-w-0 text-sm font-medium text-gray-900 sm:text-right">
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
          <div className="rounded-[20px] border border-gray-100 bg-white p-5 sm:p-6 md:p-8">
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
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <input type="hidden" name="tenant_id" value={tenant.id} />
              <input type="hidden" name="service_id" value={service} />
              <input type="hidden" name="staff_id" value={staff} />
              <input type="hidden" name="booked_at" value={time} />

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  {t.booking.fullName}
                </label>
                <input
                  type="text"
                  name="client_name"
                  required
                  placeholder={t.booking.placeholderName}
                  className="box-border w-full min-h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  {t.booking.emailAddress}
                </label>
                <input
                  type="email"
                  name="client_email"
                  required
                  placeholder={t.booking.placeholderEmail}
                  className="box-border w-full min-h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#444",
                    marginBottom: 8,
                  }}
                >
                  {t.booking.phoneNumber}{" "}
                  <span style={{ color: "#bbb", fontWeight: 400 }}>
                    {t.booking.phoneOptional}
                  </span>
                </label>
                <input
                  type="tel"
                  name="client_phone"
                  pattern={PHONE_INPUT_PATTERN}
                  title="Use a valid phone number format."
                  placeholder={t.booking.placeholderPhone}
                  className="box-border w-full min-h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none"
                />
              </div>

              {/* Cancellation policy */}
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#888",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {t.booking.confirmPolicyNotice}
                </p>
              </div>

              <button
                type="submit"
                className="mt-1 w-full min-h-12 rounded-full border-none py-4 text-base font-semibold text-white"
                style={{ background: brand, cursor: "pointer" }}
              >
                {t.booking.confirmBookingCta}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
