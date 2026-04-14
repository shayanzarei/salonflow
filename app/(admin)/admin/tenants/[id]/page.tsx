import { PLANS, SITE_SECTIONS } from "@/config/plans";
import pool from "@/lib/db";
import {
  WEBSITE_TEMPLATES,
  normalizeWebsiteTemplate,
} from "@/lib/website-templates";
import { UploadInput } from "@/components/ui/UploadInput";
import Link from "next/link";
import { notFound } from "next/navigation";

const ALL_PLAN_FEATURES = [
  {
    key: "online_booking",
    label: "Online booking",
    description: "Clients can book appointments online",
  },
  {
    key: "email_reminders",
    label: "Email reminders",
    description: "Automated booking confirmation & reminder emails",
  },
  {
    key: "sms_reminders",
    label: "SMS reminders",
    description: "SMS notifications for bookings",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Revenue, popular services & busy-hours charts",
  },
  {
    key: "custom_branding",
    label: "Custom branding",
    description: "Custom primary colour & hero image",
  },
  {
    key: "gift_cards",
    label: "Gift cards",
    description: "Sell & redeem gift cards",
  },
  {
    key: "multi_location",
    label: "Multi-location",
    description: "Manage multiple salon locations",
  },
  {
    key: "api_access",
    label: "API access",
    description: "Direct API access for integrations",
  },
] as const;

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenantResult = await pool.query(`SELECT * FROM tenants WHERE id = $1`, [
    id,
  ]);

  const tenant = tenantResult.rows[0];
  if (!tenant) notFound();
  const selectedTemplate = normalizeWebsiteTemplate(tenant.website_template);
  const businessStartedValue = tenant.business_started_at
    ? new Date(tenant.business_started_at).toISOString().slice(0, 10)
    : "";
  const trialStartedValue = tenant.trial_started_at
    ? new Date(tenant.trial_started_at).toISOString().slice(0, 10)
    : "";
  const trialEndsValue = tenant.trial_ends_at
    ? new Date(tenant.trial_ends_at).toISOString().slice(0, 10)
    : "";

  // fetch ALL flags for this tenant
  const flagsResult = await pool.query(
    `SELECT feature, enabled FROM feature_flags WHERE tenant_id = $1`,
    [id]
  );

  // build a map of flag -> enabled
  const flagMap: Record<string, boolean> = {};
  flagsResult.rows.forEach((row) => {
    flagMap[row.feature] = row.enabled;
  });

  // Which features the plan already includes
  const planFeatures = new Set(
    PLANS[tenant.plan_tier as keyof typeof PLANS]?.features ?? []
  );

  return (
    <>
      <div className="mb-2">
        <Link
          href="/admin/tenants"
          className="inline-flex min-h-9 items-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to tenants
        </Link>
      </div>
      <div className="w-full min-w-0 max-w-6xl">
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: tenant.primary_color ?? "#7C3AED" }}
                >
                  {tenant.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-2xl font-bold text-gray-900">
                      {tenant.name}
                    </h1>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        tenant.website_status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : tenant.website_status === "pending_approval"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tenant.website_status === "pending_approval"
                        ? "Pending approval"
                        : tenant.website_status === "published"
                          ? "Published"
                          : "Draft"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {tenant.slug}.SoloHub.nl
                  </p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-10 items-center rounded-[10px] border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700"
              >
                Copy URL
              </button>
              <Link
                href={`https://${tenant.slug}.solohub.nl`}
                target="_blank"
                className="inline-flex min-h-10 items-center rounded-[10px] bg-violet-600 px-3 text-xs font-medium text-white hover:opacity-90"
              >
                Open live site
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">
                  Website template
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select which public website template this salon uses.
                </p>
              </div>
              <form
                action="/api/admin/tenants/template"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template
                  </label>
                  <select
                    name="website_template"
                    defaultValue={selectedTemplate}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:border-gray-400 focus:outline-none sm:text-sm"
                  >
                    {WEBSITE_TEMPLATES.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Save template
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">
                  Business experience
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Set when this salon business started. Public site shows this
                  as years of experience.
                </p>
              </div>
              <form
                action="/api/admin/tenants/business"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business started date
                  </label>
                  <input
                    type="date"
                    name="business_started_at"
                    defaultValue={businessStartedValue}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:border-gray-400 focus:outline-none sm:text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="min-h-11 rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Save date
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">
                  Subscription & lifecycle
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Control trial dates and account status for testing.
                </p>
              </div>
              <form
                action="/api/admin/tenants/lifecycle"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant status
                  </label>
                  <select
                    name="tenant_status"
                    defaultValue={tenant.tenant_status ?? "trial"}
                    className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trial start date
                    </label>
                    <input
                      type="date"
                      name="trial_started_at"
                      defaultValue={trialStartedValue}
                      className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trial end date
                    </label>
                    <input
                      type="date"
                      name="trial_ends_at"
                      defaultValue={trialEndsValue}
                      className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="min-h-10 rounded-[10px] bg-gray-900 px-4 text-sm font-semibold text-white hover:opacity-90"
                  >
                    Save lifecycle
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">Website approval</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Control when this tenant&apos;s public site is visible.
                </p>
              </div>
              <div className="space-y-3 p-4 sm:p-6">
                <form action="/api/admin/tenants/website-status" method="POST">
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="website_status" value="published" />
                  <button
                    type="submit"
                    className="min-h-10 w-full rounded-[10px] bg-emerald-600 px-4 text-sm font-semibold text-white hover:opacity-90"
                    disabled={tenant.website_status === "published"}
                  >
                    Approve & Publish
                  </button>
                </form>
                <form action="/api/admin/tenants/website-status" method="POST">
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="website_status" value="draft" />
                  <button
                    type="submit"
                    className="min-h-10 w-full rounded-[10px] border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={tenant.website_status === "draft"}
                  >
                    Move to Draft
                  </button>
                </form>
              </div>
            </div>

            {/* Website sections */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">
                  Website sections
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Toggle visibility of public website blocks.
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {SITE_SECTIONS.map((section) => {
                  const isEnabled = section.required
                    ? true
                    : (flagMap[section.key] ?? true);

                  return (
                    <div
                      key={section.key}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0 pr-0 sm:pr-4">
                        <p className="text-sm font-medium text-gray-900">
                          {section.label}
                          {section.required && (
                            <span className="ml-2 text-xs text-gray-400">
                              (always on)
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {section.description}
                        </p>
                      </div>
                      {section.required ? (
                        <div
                          className="relative h-6 w-11 shrink-0 self-start rounded-full bg-violet-600 opacity-40 sm:self-center"
                          aria-hidden
                        >
                          <span className="absolute left-[23px] top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
                        </div>
                      ) : (
                        <form
                          action="/api/admin/sections"
                          method="POST"
                          className="shrink-0 self-start sm:self-center"
                        >
                          <input type="hidden" name="tenant_id" value={id} />
                          <input
                            type="hidden"
                            name="feature"
                            value={section.key}
                          />
                          <input
                            type="hidden"
                            name="enabled"
                            value={isEnabled ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors"
                            style={{
                              background: isEnabled ? "#7C3AED" : "#D1D5DB",
                            }}
                            aria-label={
                              isEnabled
                                ? `Disable ${section.label}`
                                : `Enable ${section.label}`
                            }
                          >
                            <span
                              className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]"
                              style={{ left: isEnabled ? 23 : 3 }}
                            />
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">Feature flags</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Override individual features for this salon regardless of
                  plan. Features already included in their plan are shown but
                  cannot be disabled here — downgrade the plan first.
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {ALL_PLAN_FEATURES.map((feat) => {
                  const inPlan = planFeatures.has(feat.key as never);
                  // Override enabled = DB flag if set; otherwise falls back to plan
                  const isEnabled = inPlan || (flagMap[feat.key] ?? false);

                  return (
                    <div
                      key={feat.key}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0 pr-0 sm:pr-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          {feat.label}
                          {inPlan && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
                              In plan
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {feat.description}
                        </p>
                      </div>
                      {inPlan ? (
                        <div
                          className="relative h-6 w-11 shrink-0 self-start rounded-full bg-violet-600 opacity-40 sm:self-center"
                          aria-hidden
                        >
                          <span className="absolute left-[23px] top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
                        </div>
                      ) : (
                        <form
                          action="/api/admin/sections"
                          method="POST"
                          className="shrink-0 self-start sm:self-center"
                        >
                          <input type="hidden" name="tenant_id" value={id} />
                          <input
                            type="hidden"
                            name="feature"
                            value={feat.key}
                          />
                          <input
                            type="hidden"
                            name="enabled"
                            value={isEnabled ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors"
                            style={{
                              background: isEnabled ? "#7C3AED" : "#D1D5DB",
                            }}
                            aria-label={
                              isEnabled
                                ? `Disable ${feat.label}`
                                : `Enable ${feat.label}`
                            }
                          >
                            <span
                              className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]"
                              style={{ left: isEnabled ? 23 : 3 }}
                            />
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tenant content editor */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-gray-900">
                  Site content editor
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  Edit this salon&apos;s website content
                </p>
              </div>
              <form
                action="/api/admin/tenants/content"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    name="tagline"
                    defaultValue={tenant.tagline ?? ""}
                    placeholder="Where beauty meets craft"
                    className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About
                  </label>
                  <textarea
                    name="about"
                    defaultValue={tenant.about ?? ""}
                    placeholder="Tell the salon's story..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={tenant.address ?? ""}
                    placeholder="123 Beauty Lane, Amsterdam"
                    className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours
                  </label>
                  <input
                    type="text"
                    name="hours"
                    defaultValue={tenant.hours ?? ""}
                    placeholder="Mon–Sat 9am–7pm"
                    className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-base text-gray-900 focus:border-purple-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <div>
                  <UploadInput
                    name="hero_image_url"
                    defaultValue={tenant.hero_image_url ?? ""}
                    label="Hero image"
                    hint="Shown in the hero section of the tenant's booking site"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={`https://${tenant.slug}.solohub.nl`}
                    target="_blank"
                    className="order-2 text-sm text-purple-600 hover:text-purple-700 sm:order-1"
                  >
                    Preview site →
                  </Link>
                  <button
                    type="submit"
                    className="order-1 min-h-11 w-full rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:order-2 sm:w-auto"
                  >
                    Save content
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
