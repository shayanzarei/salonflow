import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Select } from "@/components/ds/Select";
import { CalendarIcon, ClockIcon, MapPinIcon, ScissorsIcon, TrashIcon, UserIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
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
      value: new Date(booking.booked_at).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      ),
    },
    {
      icon: <ClockIcon size={15} color="var(--color-ink-500)" />,
      label: "Time",
      colored: false,
      value: new Date(booking.booked_at).toLocaleTimeString(
        "en-US",
        { hour: "numeric", minute: "2-digit" }
      ),
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
          {/* Edit booking card */}
          {booking.status !== "cancelled" && (
            <Card variant="outlined">
              <div className="mb-5 flex items-center gap-2">
                <span className="text-base">✏️</span>
                <h2 className="text-body font-semibold text-ink-900">
                  Edit Booking
                </h2>
              </div>

              <form
                action="/api/bookings/update"
                method="POST"
                className="flex flex-col gap-4"
              >
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="tenant_id" value={tenant.id} />

                <Select
                  id="booking-edit-service"
                  name="service_id"
                  label="Service"
                  defaultValue={booking.service_id}
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>

                <Select
                  id="booking-edit-staff"
                  name="staff_id"
                  label="Staff"
                  defaultValue={booking.staff_id}
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="booking-edit-date"
                      className="mb-2 block text-caption font-semibold uppercase tracking-wider text-ink-400"
                    >
                      Date
                    </label>
                    <input
                      id="booking-edit-date"
                      type="date"
                      name="date"
                      defaultValue={
                        new Date(booking.booked_at).toISOString().split("T")[0]
                      }
                      className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 py-2.5 text-body-sm text-ink-900 outline-none hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-edit-time"
                      className="mb-2 block text-caption font-semibold uppercase tracking-wider text-ink-400"
                    >
                      Time
                    </label>
                    <input
                      id="booking-edit-time"
                      type="time"
                      name="time"
                      defaultValue={new Date(booking.booked_at)
                        .toTimeString()
                        .slice(0, 5)}
                      className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 py-2.5 text-body-sm text-ink-900 outline-none hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus"
                    />
                  </div>
                </div>

                <Select
                  id="booking-edit-status"
                  name="status"
                  label="Status"
                  defaultValue={booking.status}
                >
                  <option value="confirmed">● Confirmed</option>
                  <option value="pending">● Pending</option>
                  <option value="cancelled">● Cancelled</option>
                </Select>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="mt-1 w-full"
                  style={{ backgroundColor: brand }}
                >
                  Save Changes
                </Button>
              </form>
            </Card>
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
