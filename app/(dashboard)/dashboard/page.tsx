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
  const brand = tenant.primary_color ?? "#7C3AED";
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
          <div className="mb-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {trialDays === 1
                  ? "1 day left in your trial"
                  : `${trialDays} days left in your trial`}
              </p>
              <p className="mt-0.5 text-sm text-amber-800">
                Upgrade any time to keep uninterrupted access.
              </p>
            </div>
            <Link
              href="/settings/billing"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              View plans
            </Link>
          </div>
        ) : null}
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to SoloHub,{" "}
                <span style={{ color: brand }}>{tenant.name}</span>! 👋
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Let&apos;s set up your salon in a few steps so you can start
                accepting bookings.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-56 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progressPct}%`, background: brand }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {completedSteps}/{setupSteps.length} completed
                </span>
              </div>
            </div>
            <div
              className="grid h-28 w-28 place-items-center rounded-full border-8 border-gray-100 text-3xl font-bold"
              style={{ color: brand }}
            >
              {progressPct}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-2xl font-semibold text-gray-900">
                Setup Guide
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Complete these steps to activate your booking page.
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {setupSteps.map((step, index) => (
                <div key={step.label} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      className={`text-2xl font-semibold ${step.done ? "text-gray-400 line-through" : "text-gray-900"}`}
                    >
                      {index + 1}. {step.label}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        step.done
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {step.done ? "Done" : "Not started"}
                    </span>
                  </div>
                  {!step.done && step.unlocked && (
                    <div className="mt-3">
                      {step.label === "Submit booking site" ? (
                        <form
                          action="/api/dashboard/website/submit"
                          method="POST"
                        >
                          <button
                            type="submit"
                            className="rounded-[10px] px-4 py-2 text-sm font-semibold text-white"
                            style={{ background: brand }}
                          >
                            {step.actionLabel}
                          </button>
                        </form>
                      ) : (
                        <Link
                          href={step.href}
                          className="inline-flex rounded-[10px] px-4 py-2 text-sm font-semibold text-white"
                          style={{ background: brand }}
                        >
                          {step.actionLabel}
                        </Link>
                      )}
                    </div>
                  )}
                  {!step.done && !step.unlocked && (
                    <p className="mt-3 text-xs text-gray-400">
                      Complete previous step first.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="text-xl font-semibold text-gray-900">
                Go-Live Readiness
              </h3>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Must-have
              </p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>{profileComplete ? "✅" : "○"} Profile complete</li>
                <li>{categoriesCount > 0 ? "✅" : "○"} Category added</li>
                <li>{servicesCount > 0 ? "✅" : "○"} Services added</li>
                <li>{workingHoursConfigured ? "✅" : "○"} Working hours set</li>
              </ul>
              {publishSubmitted ? (
                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-[10px] bg-amber-100 py-2.5 text-sm font-semibold text-amber-800"
                    disabled
                  >
                    Pending SoloHub Approval
                  </button>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
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
                  <button
                    type="submit"
                    className="w-full rounded-[10px] py-2.5 text-sm font-semibold text-white"
                    style={{ background: brand }}
                  >
                    Publish Booking Site
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="mt-4 w-full rounded-[10px] bg-gray-200 py-2.5 text-sm font-semibold text-gray-500"
                  disabled
                >
                  Publish Booking Site
                </button>
              )}
            </div>

            <div
              className="rounded-2xl p-5"
              style={{
                background: `${brand}12`,
                border: `1px solid ${brand}22`,
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: brand }}>
                Need help setting up?
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Most salons finish their initial setup in about 10 minutes.
              </p>
              <a
                href="https://wa.me/31683103485"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 mt-4"
              >
                Start WhatsApp Chat{" "}
                <ArrowRightIcon className="ml-1 h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Revenue", hint: "Data appears after bookings." },
            { label: "Upcoming", hint: "No bookings scheduled yet." },
            { label: "Customers", hint: "Grow your client base." },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 text-center"
            >
              <p className="text-lg font-semibold text-gray-700">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-gray-400">{item.hint}</p>
            </div>
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
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
    {
      label: "Upcoming",
      value: stats.upcomingCount,
      icon: <ClockIcon size={18} color="#7C3AED" />,
      iconBg: "#F5F3FF",
      change: "+8%",
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
    {
      label: "Total Customers",
      value: stats.customerCount.toLocaleString(),
      icon: <UsersIcon size={18} color="#F59E0B" />,
      iconBg: "#FFF7ED",
      change: "+23%",
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
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
      changeBg: "#ECFDF5",
      changeColor: "#10B981",
    },
  ];

  return (
    <div>
      {showTrialBanner ? (
        <div className="mb-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {trialDays === 1
                ? "1 day left in your trial"
                : `${trialDays} days left in your trial`}
            </p>
            <p className="mt-0.5 text-sm text-amber-800">
              Upgrade any time to keep uninterrupted access.
            </p>
          </div>
          <Link
            href="/settings/billing"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            View plans
          </Link>
        </div>
      ) : null}
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 4px",
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: 14, color: "#999", margin: 0 }}>
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
          <div
            key={stat.label}
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: stat.changeColor,
                  background: stat.changeBg,
                  padding: "3px 8px",
                  borderRadius: 100,
                }}
              >
                {stat.change}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#999", margin: "0 0 6px" }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#111",
                margin: 0,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming bookings */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f5f5f5",
          }}
        >
          <h2
            style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: 0 }}
          >
            Upcoming Bookings
          </h2>
          <Link
            href="/bookings"
            style={{
              fontSize: 13,
              color: brand,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View All →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#aaa",
              fontSize: 14,
            }}
          >
            No upcoming bookings yet.
          </div>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
                  {["Client", "Service", "Staff", "Date & Time"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 500,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.map((booking) => (
                  <tr
                    key={booking.id}
                    style={{ borderBottom: "1px solid #f9f9f9" }}
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: brand,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {booking.client_name.charAt(0)}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#111",
                              margin: 0,
                            }}
                          >
                            {booking.client_name}
                          </p>
                          <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                            {booking.client_email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <p style={{ fontSize: 14, color: "#333", margin: 0 }}>
                        {booking.service_name}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {booking.duration_mins} min · €{booking.price}
                      </p>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#555",
                          }}
                        >
                          {booking.staff_name.charAt(0)}
                        </div>
                        <span style={{ fontSize: 14, color: "#333" }}>
                          {booking.staff_name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#111",
                          margin: 0,
                        }}
                      >
                        {new Date(booking.booked_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {new Date(booking.booked_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
