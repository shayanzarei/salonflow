import { SettingsBrandingForm } from "@/components/dashboard/SettingsBrandingForm";
import pool from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { notFound } from "next/navigation";

async function loadSectionFlags(tenantId: string) {
  const defaults = {
    section_services: true,
    section_team: true,
    section_reviews: true,
  };
  const keys = Object.keys(defaults);
  const { rows } = await pool.query(
    `SELECT feature, enabled FROM feature_flags
     WHERE tenant_id = $1 AND feature = ANY($2::text[])`,
    [tenantId, keys]
  );
  const out = { ...defaults };
  for (const r of rows) {
    const f = r.feature as keyof typeof out;
    if (f in out) out[f] = Boolean(r.enabled);
  }
  return out;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const session = await getServerSession(authOptions);
  const qp = await searchParams;

  const brand = tenant.primary_color ?? "#7C3AED";
  const sections = await loadSectionFlags(tenant.id);

  const planLabel =
    tenant.plan_tier === "starter"
      ? "Starter"
      : tenant.plan_tier === "pro"
        ? "Pro"
        : "Enterprise";
  const planPrice =
    tenant.plan_tier === "starter"
      ? "$19/mo"
      : tenant.plan_tier === "pro"
        ? "$49/mo"
        : "Custom";

  const planFeatures =
    tenant.plan_tier === "starter"
      ? ["Online booking", "Email reminders", "Up to 5 staff"]
      : tenant.plan_tier === "pro"
        ? [
            "Unlimited bookings",
            "Up to 10 staff members",
            "SMS notifications",
            "Analytics",
          ]
        : ["All features", "Dedicated support", "Custom limits"];

  return (
    <div className="mx-auto max-w-6xl pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">
          Manage your salon profile, booking site, and account
        </p>
      </div>

      {qp.success === "password_updated" ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Password updated successfully.
        </div>
      ) : null}
      {qp.error === "wrong_password" ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Current password is incorrect.
        </div>
      ) : null}
      {qp.error === "password_mismatch" ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          New password and confirmation do not match.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          {/* Salon profile */}
          <form action="/api/settings" method="POST" className="space-y-5">
          <input type="hidden" name="action" value="info" />

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Salon profile
            </h2>

            <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-200 bg-gray-50 text-2xl font-bold text-gray-400">
                {tenant.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tenant.logo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  tenant.name.charAt(0)
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  <button
                    type="button"
                    disabled
                    className="font-medium text-purple-600 opacity-50"
                    title="Paste a logo URL below for now"
                  >
                    Upload logo
                  </button>{" "}
                  <span className="text-gray-400">— URL field below</span>
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo_url"
                  defaultValue={tenant.logo_url ?? ""}
                  placeholder="https://example.com/logo.png"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Salon name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={tenant.name}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Booking URL slug
                </label>
                <div className="flex overflow-hidden rounded-lg border border-gray-200">
                  <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400">
                    salonflow.xyz/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    required
                    defaultValue={tenant.slug}
                    className="min-w-0 flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Changing this will break existing links to your site
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  defaultValue={tenant.tagline ?? ""}
                  placeholder="Where beauty meets craft"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  About
                </label>
                <textarea
                  name="about"
                  defaultValue={tenant.about ?? ""}
                  placeholder="Tell your salon's story..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={tenant.address ?? ""}
                    placeholder="123 Beauty Lane"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Contact phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={tenant.phone ?? ""}
                    placeholder="+31 6 1234 5678"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Opening hours
                </label>
                <input
                  type="text"
                  name="hours"
                  defaultValue={tenant.hours ?? ""}
                  placeholder="Mon–Sat 9am–7pm"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <Link
                href="/settings"
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: brand }}
              >
                Save profile
              </button>
            </div>
          </div>
        </form>

          {/* Branding & booking site */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Branding &amp; booking site
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Colors and sections on your public booking page
            </p>
            <div className="mt-6">
              <SettingsBrandingForm
                defaultColor={tenant.primary_color ?? "#7C3AED"}
                heroImageUrl={tenant.hero_image_url ?? ""}
                salonName={tenant.name}
                sections={sections}
              />
            </div>
          </div>
        </div>

        {/* Account, plan, notifications */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Account &amp; security
            </h2>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Login
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {session?.user?.email ?? tenant.slug}
                </p>
                <p className="text-xs text-gray-500">
                  You sign in with this ID and your password
                </p>
              </div>
              <button
                type="button"
                disabled
                className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-400"
                title="Coming soon"
              >
                Change
              </button>
            </div>

            <form
              action="/api/settings/password"
              method="POST"
              className="mt-6 space-y-4 border-t border-gray-100 pt-6"
            >
              <h3 className="text-sm font-semibold text-gray-800">
                Change password
              </h3>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Current password
                </label>
                <input
                  type="password"
                  name="current_password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  New password
                </label>
                <input
                  type="password"
                  name="new_password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Confirm new password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-purple-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: brand }}
              >
                Update password
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Two-factor authentication
                </p>
                <p className="text-xs text-gray-500">Extra security for your account</p>
              </div>
              <button
                type="button"
                disabled
                className="relative h-7 w-12 shrink-0 rounded-full bg-gray-200"
                aria-disabled
              >
                <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow" />
              </button>
            </div>
          </div>

          {/* Plan & billing */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">
              Plan &amp; billing
            </h2>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: brand }}
                >
                  {planLabel} plan
                </span>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {planPrice}
                </p>
                <p className="text-sm text-gray-500">
                  Next billing: <span className="text-gray-700">—</span>
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {planFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <span className="text-green-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/settings/billing"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 sm:flex-none"
              >
                Manage billing
              </Link>
              <Link
                href="/settings/billing"
                className="inline-flex flex-1 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 sm:flex-none"
                style={{ backgroundColor: `${brand}E6` }}
              >
                Upgrade plan
              </Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative rounded-2xl border border-gray-100 bg-white p-6 opacity-90 shadow-sm">
            <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Coming soon
            </span>
            <h2 className="text-base font-semibold text-gray-900">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Email and SMS preferences for your salon
            </p>
            <div className="mt-5 space-y-3">
              <label className="flex cursor-not-allowed items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
                <span className="text-sm text-gray-700">New booking alerts</span>
                <input type="checkbox" disabled className="h-4 w-4 rounded" />
              </label>
              <label className="flex cursor-not-allowed items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 opacity-60">
                <span className="text-sm text-gray-700">Daily summary</span>
                <input type="checkbox" disabled className="h-4 w-4 rounded" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
