import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import EditBookingForm from "@/components/dashboard/EditBookingForm";
import { CalendarIcon, ClockIcon, MapPinIcon, ScissorsIcon, TrashIcon, UserIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import {
  DEFAULT_FALLBACK_TIMEZONE,
  isValidIanaTimezone,
} from "@/lib/timezone";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  // Salon-local IANA zone — used for every Intl call that renders booking
  // times so the wall clock matches the salon's clock, not the server's
  // (UTC on Vercel) or the browser's locale default.
  const tenantZone =
    tenant.iana_timezone && isValidIanaTimezone(tenant.iana_timezone)
      ? tenant.iana_timezone
      : DEFAULT_FALLBACK_TIMEZONE;

  const [bookingResult, servicesResult, staffResult] = await Promise.all([
    pool.query(
      `SELECT
         b.*,
         s.name AS service_name, s.price, s.duration_mins,
         st.name AS staff_name, st.role AS staff_role,
         st.id AS staff_id
       FROM bookings b
       JOIN services s ON b.service_id = s.id
       JOIN staff st ON b.staff_id = st.id
       WHERE b.id = $1 AND b.tenant_id = $2`,
      [id, tenant.id]
    ),
    pool.query(`SELECT * FROM services WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
    pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
      tenant.id,
    ]),
  ]);

  const booking = bookingResult.rows[0];
  if (!booking) notFound();

  const services = servicesResult.rows;
  const staffList = staffResult.rows;

  // get client stats
  const clientStats = await pool.query(
    `SELECT
       COUNT(*) AS total_bookings,
       COALESCE(SUM(s.price), 0) AS total_spent,
       MIN(b.created_at) AS member_since
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     WHERE b.tenant_id = $1 AND b.client_email = $2`,
    [tenant.id, booking.client_email]
  );

  const stats = clientStats.rows[0];

  const statusVariant: Record<string, "success" | "warning" | "danger"> = {
    confirmed: "success",
    pending: "warning",
    cancelled: "danger",
  };

  const badgeVariant = statusVariant[booking.status] ?? "warning";
  const bookingRef = `#BK-${booking.id.split("-")[0].toUpperCase()}`;

  // Salon-local YYYY-MM-DD and HH:MM (24h) for the Edit form defaults. Both
  // are computed via Intl with the tenant zone so they reflect the salon's
  // wall clock, not the server's UTC clock or the browser's locale. We read
  // the canonical booking_start_utc column — the legacy booked_at is
  // maintained read-only by trigger and must not be relied on in app code.
  const bookedAtUtc = new Date(booking.booking_start_utc);
  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tenantZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(bookedAtUtc);
  const initialDate = `${dateParts.find((p) => p.type === "year")!.value}-${dateParts.find((p) => p.type === "month")!.value}-${dateParts.find((p) => p.type === "day")!.value}`;

  const timeParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tenantZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(bookedAtUtc);
  const initialTime = `${timeParts.find((p) => p.type === "hour")!.value}:${timeParts.find((p) => p.type === "minute")!.value}`;

  const detailItems = [
    {
      icon: <ScissorsIcon size={15} color="var(--color-ink-500)" />,
      label: "Service",
      value: booking.service_name,
      colored: false,
    },
    {
      icon: <UserIcon size={15} color="var(--color-ink-500)" />,
      label: "Staff",
      value: booking.staff_name,
      colored: false,
    },
    {
      icon: <CalendarIcon size={15} color="var(--color-ink-500)" />,
      label: "Date",
      colored: false,
      value: new Date(booking.booking_start_utc).toLocaleDateString("en-US", {
        timeZone: tenantZone,
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    },
    {
      icon: <ClockIcon size={15} color="var(--color-ink-500)" />,
      label: "Time",
      colored: false,
      // Read booking_start_utc (TIMESTAMPTZ) and let Intl re-format in the
      // tenant's IANA zone. This is the *only* correct way to display salon
      // wall-clock time; passing a Date through toLocaleTimeString without
      // an explicit timeZone shows the server's local time (UTC on Vercel).
      value: new Date(booking.booking_start_utc).toLocaleTimeString("en-US", {
        timeZone: tenantZone,
        hour: "numeric",
        minute: "2-digit",
      }),
    },
    {
      icon: <ClockIcon size={15} color="var(--color-ink-500)" />,
      label: "Duration",
      value: `${booking.duration_mins} minutes`,
      colored: false,
    },
    {
      icon: <span className="text-caption font-bold text-ink-500">€</span>,
      label: "Price",
      value: `€${booking.price}`,
      colored: true,
    },
    ...(tenant.address
      ? [
          {
            icon: <MapPinIcon size={15} color="var(--color-ink-500)" />,
            label: "Location",
            value: tenant.address,
            colored: false,
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/bookings"
          className="mb-3 inline-flex items-center gap-1.5 text-body-sm text-ink-500 no-underline"
        >
          ← Back to Bookings
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-h1 font-bold text-ink-900">
            Booking {bookingRef}
          </h1>
          <Badge variant={badgeVariant} dot>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        {/* Left column */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* Client info card */}
          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2">
              <UserIcon size={16} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Client Information
              </h2>
            </div>

            <div className="mb-5 flex items-center gap-4">
              <Avatar
                name={booking.client_name}
                size="lg"
                className="h-[52px] w-[52px] text-lg text-white"
                style={{ background: brand }}
              />
              <div>
                <p className="mb-1 text-body-lg font-bold text-ink-900">
                  {booking.client_name}
                </p>
                <p className="mb-0.5 flex items-center gap-1.5 text-caption text-ink-500">
                  <span>✉</span> {booking.client_email}
                </p>
                {booking.client_phone && (
                  <p className="flex items-center gap-1.5 text-caption text-ink-500">
                    <span>📞</span> {booking.client_phone}
                  </p>
                )}
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex gap-2.5">
              {[
                { label: "TOTAL BOOKINGS", value: stats.total_bookings },
                {
                  label: "TOTAL SPENT",
                  value: `€${parseFloat(stats.total_spent).toFixed(0)}`,
                },
                {
                  label: "MEMBER SINCE",
                  value: new Date(stats.member_since).toLocaleDateString(
                    "en-US",
                    { month: "short", year: "numeric" }
                  ),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex-1 rounded-sm bg-ink-50 px-3.5 py-2.5"
                >
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-ink-400">
                    {s.label}
                  </p>
                  <p className="text-body-sm font-bold text-ink-900">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Appointment details card */}
          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2">
              <CalendarIcon size={16} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Appointment Details
              </h2>
            </div>

            <div className="flex flex-col">
              {detailItems.map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between py-3.5 ${
                    i < detailItems.length - 1 ? "border-b border-ink-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex shrink-0">{item.icon}</span>
                    <span className="text-body-sm text-ink-600">
                      {item.label}
                    </span>
                  </div>
                  <span
                    className="text-body-sm font-medium"
                    style={{ color: item.colored ? brand : "var(--color-ink-900)" }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-20 xl:self-start">
          {/* Edit booking card — client component so we can fetch the same
              /api/availability slots used by AddBookingForm and present a
              <Select> dropdown rather than a raw <input type="time"> (which
              has no timezone awareness and is impossible to seed correctly
              from a TIMESTAMPTZ). The form posts salon-local YYYY-MM-DD and
              HH:MM (24h) — /api/bookings/update converts via wallClockToUtc. */}
          {booking.status !== "cancelled" && (
            <EditBookingForm
              bookingId={booking.id}
              tenantId={tenant.id}
              services={services.map((s) => ({
                id: s.id,
                name: s.name,
                duration_mins: s.duration_mins,
              }))}
              staffList={staffList.map((s) => ({ id: s.id, name: s.name }))}
              initialServiceId={booking.service_id}
              initialStaffId={booking.staff_id}
              initialDate={initialDate}
              initialTime={initialTime}
              initialStatus={booking.status}
              brand={brand}
            />
          )}

          {/* Quick actions card */}
          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h2 className="text-body font-semibold text-ink-900">
                Quick Actions
              </h2>
            </div>

            <div className="flex flex-col gap-2.5">
              {booking.status !== "cancelled" && (
                <form action="/api/bookings/update-status" method="POST">
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input type="hidden" name="tenant_id" value={tenant.id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <input
                    type="hidden"
                    name="redirect"
                    value={`/bookings/${booking.id}`}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    className="w-full text-danger-600"
                  >
                    ✕ Cancel Booking
                  </Button>
                </form>
              )}

              <form action="/api/bookings/delete" method="POST">
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="tenant_id" value={tenant.id} />
                <Button
                  type="submit"
                  variant="danger"
                  size="md"
                  className="w-full"
                >
                  <TrashIcon size={15} /> Delete Booking
                </Button>
              </form>

              <p className="mt-1 flex items-center justify-center gap-1 text-center text-caption text-ink-400">
                ⚠ This action cannot be undone
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
