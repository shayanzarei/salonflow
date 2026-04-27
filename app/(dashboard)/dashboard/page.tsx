import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import {
  Table,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DashboardPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [todayBookings, totalRevenue, upcomingBookings, totalCustomers] =
    await Promise.all([
      pool.query(
        `SELECT COUNT(*) FROM bookings
         WHERE tenant_id = $1 AND booked_at BETWEEN $2 AND $3 AND status = 'confirmed'`,
        [tenant.id, todayStart, todayEnd]
      ),
      pool.query(
        `SELECT COALESCE(SUM(s.price), 0) as total
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         WHERE b.tenant_id = $1 AND b.status = 'confirmed'`,
        [tenant.id]
      ),
      pool.query(
        `SELECT
           b.id, b.client_name, b.client_email, b.booked_at, b.status,
           s.name AS service_name, s.duration_mins, s.price,
           st.name AS staff_name
         FROM bookings b
         JOIN services s ON b.service_id = s.id
         JOIN staff st ON b.staff_id = st.id
         WHERE b.tenant_id = $1
           AND b.booked_at >= NOW()
           AND b.status = 'confirmed'
         ORDER BY b.booked_at ASC
         LIMIT 6`,
        [tenant.id]
      ),
      pool.query(
        `SELECT COUNT(DISTINCT client_email) FROM bookings WHERE tenant_id = $1`,
        [tenant.id]
      ),
    ]);

  const stats = {
    todayCount: parseInt(todayBookings.rows[0].count),
    revenue: parseFloat(totalRevenue.rows[0].total),
    customerCount: parseInt(totalCustomers.rows[0].count),
    upcomingCount: upcomingBookings.rows.length,
  };

  const upcoming = upcomingBookings.rows;
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';
  const websiteStatus = tenant.website_status ?? "draft";
  const [servicesCountRes, salonHoursRes, categoriesCountRes] =
    await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS count FROM services WHERE tenant_id = $1`,
        [tenant.id]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
       FROM salon_working_hours
       WHERE tenant_id = $1 AND is_working = true`,
        [tenant.id]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM service_categories WHERE tenant_id = $1`,
        [tenant.id]
      ),
    ]);
  const servicesCount = servicesCountRes.rows[0]?.count ?? 0;
  const salonWorkingDaysCount = salonHoursRes.rows[0]?.count ?? 0;
  const categoriesCount = categoriesCountRes.rows[0]?.count ?? 0;
  const profileComplete = Boolean(
    tenant.tagline?.trim() && tenant.about?.trim() && tenant.address?.trim()
  );
  const workingHoursConfigured = salonWorkingDaysCount > 0;
  const publishSubmitted = websiteStatus === "pending_approval";
  const setupComplete =
    profileComplete &&
    categoriesCount > 0 &&
    servicesCount > 0 &&
    workingHoursConfigured;
  const setupSteps = [
    {
      label: "Complete salon profile",
      done: profileComplete,
      href: "/settings?redirect_to=/dashboard",
      actionLabel: "Complete profile",
    },
    {
      label: "Add category",
      done: categoriesCount > 0,
      href: "/services?tab=categories&redirect_to=/dashboard",
      actionLabel: "Add category",
    },
    {
      label: "Add services",
      done: servicesCount > 0,
      href: "/services/new?redirect_to=/dashboard",
      actionLabel: "Add first service",
    },
    {
      label: "Configure working hours",
      done: workingHoursConfigured,
      href: "/settings/opening-hours?redirect_to=/dashboard",
      actionLabel: "Set working hours",
    },
  ].map((step, index, arr) => ({
    ...step,
    unlocked: index === 0 ? true : arr[index - 1].done,
  }));
  const completedSteps = setupSteps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / setupSteps.length) * 100);
  const nowTime = new Date().getTime();
  const trialDays =
    tenant.trial_ends_at == null
      ? 0
      : Math.max(
          0,
          Math.ceil(
            (new Date(tenant.trial_ends_at).getTime() - nowTime) /
              (1000 * 60 * 60 * 24)
          )
        );
  const showTrialBanner = trialDays > 0;

  if (websiteStatus !== "published") {
    return (
      <div>
        {showTrialBanner ? (
          <div className="mb-5 flex flex-col items-start justify-between gap-3 rounded-lg bg-warning-50 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-body-sm font-semibold text-warning-700">
                {trialDays === 1
                  ? "1 day left in your trial"
                  : `${trialDays} days left in your trial`}
              </p>
              <p className="mt-0.5 text-body-sm text-warning-700">
                Upgrade any time to keep uninterrupted access.
              </p>
            </div>
            <Button asChild variant="accent" size="md">
              <Link href="/settings/billing">View plans</Link>
            </Button>
          </div>
        ) : null}
        <Card variant="outlined" className="mb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-h1 font-bold text-ink-900">
                Welcome to SoloHub,{" "}
                <span style={{ color: brand }}>{tenant.name}</span>! 👋
              </h1>
              <p className="mt-2 text-body-sm text-ink-600">
                Let&apos;s set up your salon in a few steps so you can start
                accepting bookings.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-56 overflow-hidden rounded-full bg-ink-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progressPct}%`, background: brand }}
                  />
                </div>
                <span className="text-body-sm font-medium text-ink-600">
                  {completedSteps}/{setupSteps.length} completed
                </span>
              </div>
            </div>
            <div
              className="grid h-28 w-28 place-items-center rounded-full border-8 border-ink-100 text-h1 font-bold"
              style={{ color: brand }}
            >
              {progressPct}%
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <Card variant="outlined" className="overflow-hidden p-0">
            <div className="border-b border-ink-100 px-5 py-4">
              <h2 className="text-h2 font-semibold text-ink-900">
                Setup Guide
              </h2>
              <p className="mt-1 text-body-sm text-ink-500">
                Complete these steps to activate your booking page.
              </p>
            </div>
            <div className="divide-y divide-ink-100">
              {setupSteps.map((step, index) => (
                <div key={step.label} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-h2 font-semibold ${step.done ? "text-ink-400 line-through" : "text-ink-900"}`}
                    >
                      {index + 1}. {step.label}
                    </p>
                    <Badge variant={step.done ? "success" : "neutral"}>
                      {step.done ? "Done" : "Not started"}
                    </Badge>
                  </div>
                  {!step.done && step.unlocked && (
                    <div className="mt-3">
                      {step.label === "Submit booking site" ? (
                        <form
                          action="/api/dashboard/website/submit"
                          method="POST"
                        >
                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            style={{ backgroundColor: brand }}
                          >
                            {step.actionLabel}
                          </Button>
                        </form>
                      ) : (
                        <Button
                          asChild
                          variant="primary"
                          size="md"
                          style={{ backgroundColor: brand }}
                        >
                          <Link href={step.href}>{step.actionLabel}</Link>
                        </Button>
                      )}
                    </div>
                  )}
                  {!step.done && !step.unlocked && (
                    <p className="mt-3 text-caption text-ink-400">
                      Complete previous step first.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card variant="outlined">
              <h3 className="text-body-lg font-semibold text-ink-900">
                Go-Live Readiness
              </h3>
              <p className="mt-3 text-caption font-semibold uppercase tracking-wide text-ink-400">
                Must-have
              </p>
              <ul className="mt-2 space-y-1 text-body-sm text-ink-700">
                <li>{profileComplete ? "✅" : "○"} Profile complete</li>
                <li>{categoriesCount > 0 ? "✅" : "○"} Category added</li>
                <li>{servicesCount > 0 ? "✅" : "○"} Services added</li>
                <li>{workingHoursConfigured ? "✅" : "○"} Working hours set</li>
              </ul>
              {publishSubmitted ? (
                <div className="mt-4 space-y-3">
                  <Button
                    type="button"
                    disabled
                    variant="secondary"
                    size="md"
                    className="w-full bg-warning-50 text-warning-700"
                  >
                    Pending SoloHub Approval
                  </Button>
                  <div className="rounded-md bg-warning-50 px-3 py-2.5 text-caption text-warning-700">
                    Everything is completed from your side. Your booking site is
                    currently under review by SoloHub and will go live after
                    approval.
                  </div>
                </div>
              ) : setupComplete ? (
                <form
                  action="/api/dashboard/website/submit"
                  method="POST"
                  className="mt-4"
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    style={{ backgroundColor: brand }}
                  >
                    Publish Booking Site
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  disabled
                  variant="secondary"
                  size="md"
                  className="mt-4 w-full"
                >
                  Publish Booking Site
                </Button>
              )}
            </Card>

            <div
              className="rounded-lg p-5"
              style={{
                background: `${brand}12`,
                border: `1px solid ${brand}22`,
              }}
            >
              <h3 className="text-body font-semibold" style={{ color: brand }}>
                Need help setting up?
              </h3>
              <p className="mt-2 text-body-sm text-ink-600">
                Most salons finish their initial setup in about 10 minutes.
              </p>
              <Button asChild variant="secondary" size="md" className="mt-4">
                <a
                  href="https://wa.me/31683103485"
                  target="_blank"
                  rel="noreferrer"
                >
                  Start WhatsApp Chat{" "}
                  <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Revenue", hint: "Data appears after bookings." },
            { label: "Upcoming", hint: "No bookings scheduled yet." },
            { label: "Customers", hint: "Grow your client base." },
          ].map((item) => (
            <Card key={item.label} variant="outlined" className="text-center">
              <p className="text-body-lg font-semibold text-ink-700">
                {item.label}
              </p>
              <p className="mt-1 text-caption text-ink-400">{item.hint}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Today's Bookings",
      value: stats.todayCount,
      icon: <CalendarIcon size={18} color="#6366F1" />,
      iconBg: "#EEF2FF",
      change: "+12%",
    },
    {
      label: "Upcoming",
      value: stats.upcomingCount,
      icon: <ClockIcon size={18} color='var(--color-brand-600)' />,
      iconBg: 'var(--color-brand-50)',
      change: "+8%",
    },
    {
      label: "Total Customers",
      value: stats.customerCount.toLocaleString(),
      icon: <UsersIcon size={18} color='var(--color-accent-500)' />,
      iconBg: "#FFF7ED",
      change: "+23%",
    },
    {
      label: "Total Revenue",
      value: `€${stats.revenue.toLocaleString("en", { minimumFractionDigits: 0 })}`,
      icon: (
        <span style={{ fontSize: 16, fontWeight: 700, color: "#10B981" }}>
          €
        </span>
      ),
      iconBg: "#F0FDF4",
      change: "+18%",
    },
  ];

  return (
    <div>
      {showTrialBanner ? (
        <div className="mb-5 flex flex-col items-start justify-between gap-3 rounded-lg bg-warning-50 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-body-sm font-semibold text-warning-700">
              {trialDays === 1
                ? "1 day left in your trial"
                : `${trialDays} days left in your trial`}
            </p>
            <p className="mt-0.5 text-body-sm text-warning-700">
              Upgrade any time to keep uninterrupted access.
            </p>
          </div>
          <Button asChild variant="accent" size="md">
            <Link href="/settings/billing">View plans</Link>
          </Button>
        </div>
      ) : null}
      {/* Header */}
      <div className="mb-7">
        <h1 className="mb-1 text-h1 font-bold text-ink-900">Overview</h1>
        <p className="text-body-sm text-ink-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="outlined">
            <div className="mb-4 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ background: stat.iconBg }}
              >
                {stat.icon}
              </div>
              <Badge variant="success">{stat.change}</Badge>
            </div>
            <p className="mb-1.5 text-body-sm text-ink-400">{stat.label}</p>
            <p className="text-h1 font-bold text-ink-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Upcoming bookings */}
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-5">
          <h2 className="text-body font-semibold text-ink-900">
            Upcoming Bookings
          </h2>
          <Link
            href="/bookings"
            className="text-body-sm font-medium no-underline"
            style={{ color: brand }}
          >
            View All →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="px-6 py-12 text-center text-body-sm text-ink-400">
            No upcoming bookings yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[640px]">
              <thead>
                <THeadRow>
                  <TH>Client</TH>
                  <TH>Service</TH>
                  <TH>Staff</TH>
                  <TH>Date &amp; Time</TH>
                </THeadRow>
              </thead>
              <tbody>
                {upcoming.map((booking) => (
                  <TBodyRow key={booking.id} interactive={false}>
                    <TD>
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={booking.client_name}
                          size="md"
                          className="text-body-sm text-white"
                          style={{ background: brand }}
                        />
                        <div>
                          <p className="text-body-sm font-medium text-ink-900">
                            {booking.client_name}
                          </p>
                          <p className="text-caption text-ink-400">
                            {booking.client_email}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <p className="text-body-sm text-ink-700">
                        {booking.service_name}
                      </p>
                      <p className="text-caption text-ink-400">
                        {booking.duration_mins} min · €{booking.price}
                      </p>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={booking.staff_name}
                          size="sm"
                          className="bg-ink-100 text-ink-600"
                        />
                        <span className="text-body-sm text-ink-700">
                          {booking.staff_name}
                        </span>
                      </div>
                    </TD>
                    <TD>
                      <p className="text-body-sm font-medium text-ink-900">
                        {new Date(booking.booked_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-caption text-ink-400">
                        {new Date(booking.booked_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </TD>
                  </TBodyRow>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
