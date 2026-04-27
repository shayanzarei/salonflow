import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import { PACKAGE_ENTITLEMENTS, type PackageId } from "@/config/packages";
import { SITE_SECTIONS } from "@/config/plans";
import pool from "@/lib/db";
import { getPackageMap, getTenantOverrideEntries } from "@/lib/packages";
import {
  WEBSITE_TEMPLATES,
  normalizeWebsiteTemplate,
} from "@/lib/website-templates";
import { UploadInput } from "@/components/ui/UploadInput";
import AdminDeleteTenantButton from "@/components/admin/AdminDeleteTenantButton";
import Link from "next/link";
import { notFound } from "next/navigation";

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

  const packageMap = await getPackageMap();
  const tenantPackage = packageMap[tenant.plan_tier as PackageId];
  const overrideEntries = await getTenantOverrideEntries(id);
  const overrideMap = Object.fromEntries(
    overrideEntries.map((item) => [item.key, item.value])
  ) as Record<string, boolean | number | null>;

  const statusBadgeVariant: "success" | "warning" | "neutral" =
    tenant.website_status === "published"
      ? "success"
      : tenant.website_status === "pending_approval"
        ? "warning"
        : "neutral";
  const statusLabel =
    tenant.website_status === "pending_approval"
      ? "Pending approval"
      : tenant.website_status === "published"
        ? "Published"
        : "Draft";

  return (
    <>
      <div className="mb-2">
        <Link
          href="/admin/tenants"
          className="inline-flex min-h-9 items-center text-body-sm text-ink-500 hover:text-ink-700"
        >
          ← Back to tenants
        </Link>
      </div>
      <div className="w-full min-w-0 max-w-6xl">
        <Card variant="outlined" className="mb-4 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-body-sm font-semibold text-white"
                  style={{ backgroundColor: tenant.primary_color ?? 'var(--color-brand-600)' }}
                >
                  {tenant.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-h2 font-bold text-ink-900">
                      {tenant.name}
                    </h1>
                    <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
                  </div>
                  <p className="truncate text-caption text-ink-500">
                    {tenant.slug}.SoloHub.nl
                  </p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" variant="secondary" size="sm">
                Copy URL
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href={`https://${tenant.slug}.solohub.nl`} target="_blank">
                  Open live site
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">
                  Website template
                </h2>
                <p className="mt-0.5 text-caption text-ink-400">
                  Select which public website template this salon uses.
                </p>
              </div>
              <form
                action="/api/admin/tenants/template"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />
                <Select
                  id="tenant-website-template"
                  name="website_template"
                  label="Template"
                  defaultValue={selectedTemplate}
                >
                  {WEBSITE_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </Select>
                <div className="flex justify-end">
                  <Button type="submit" variant="dark" size="md">
                    Save template
                  </Button>
                </div>
              </form>
            </Card>

            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">
                  Business experience
                </h2>
                <p className="mt-0.5 text-caption text-ink-400">
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
                  <label
                    htmlFor="tenant-business-started"
                    className="mb-1 block text-label font-medium text-ink-700"
                  >
                    Business started date
                  </label>
                  <input
                    id="tenant-business-started"
                    type="date"
                    name="business_started_at"
                    defaultValue={businessStartedValue}
                    className="min-h-10 w-full rounded-sm border border-ink-200 px-4 py-2.5 text-body-sm focus:border-brand-600 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="dark" size="md">
                    Save date
                  </Button>
                </div>
              </form>
            </Card>

            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">
                  Subscription & lifecycle
                </h2>
                <p className="mt-0.5 text-caption text-ink-400">
                  Control trial dates and account status for testing.
                </p>
              </div>
              <form
                action="/api/admin/tenants/lifecycle"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />

                <Select
                  id="tenant-status"
                  name="tenant_status"
                  label="Tenant status"
                  defaultValue={tenant.tenant_status ?? "trial"}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </Select>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="tenant-trial-started"
                      className="mb-1 block text-label font-medium text-ink-700"
                    >
                      Trial start date
                    </label>
                    <input
                      id="tenant-trial-started"
                      type="date"
                      name="trial_started_at"
                      defaultValue={trialStartedValue}
                      className="min-h-10 w-full rounded-sm border border-ink-200 px-4 py-2.5 text-body-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tenant-trial-ends"
                      className="mb-1 block text-label font-medium text-ink-700"
                    >
                      Trial end date
                    </label>
                    <input
                      id="tenant-trial-ends"
                      type="date"
                      name="trial_ends_at"
                      defaultValue={trialEndsValue}
                      className="min-h-10 w-full rounded-sm border border-ink-200 px-4 py-2.5 text-body-sm focus:border-brand-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="dark" size="md">
                    Save lifecycle
                  </Button>
                </div>
              </form>
            </Card>

            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">Website approval</h2>
                <p className="mt-0.5 text-caption text-ink-400">
                  Control when this tenant&apos;s public site is visible.
                </p>
              </div>
              <div className="space-y-3 p-4 sm:p-6">
                <form action="/api/admin/tenants/website-status" method="POST">
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="website_status" value="published" />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full bg-success-600 hover:bg-success-700"
                    disabled={tenant.website_status === "published"}
                  >
                    Approve & Publish
                  </Button>
                </form>
                <form action="/api/admin/tenants/website-status" method="POST">
                  <input type="hidden" name="tenant_id" value={id} />
                  <input type="hidden" name="website_status" value="draft" />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    className="w-full"
                    disabled={tenant.website_status === "draft"}
                  >
                    Move to Draft
                  </Button>
                </form>
              </div>
            </Card>

            {/* Danger zone */}
            <AdminDeleteTenantButton
              tenantId={id}
              tenantName={tenant.name}
              tenantSlug={tenant.slug}
            />

            {/* Website sections */}
            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">
                  Website sections
                </h2>
                <p className="mt-0.5 text-caption text-ink-400">
                  Toggle visibility of public website blocks.
                </p>
              </div>
              <div className="divide-y divide-ink-50">
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
                        <p className="text-body-sm font-medium text-ink-900">
                          {section.label}
                          {section.required && (
                            <span className="ml-2 text-caption text-ink-400">
                              (always on)
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-caption text-ink-400">
                          {section.description}
                        </p>
                      </div>
                      {section.required ? (
                        <div
                          className="relative h-6 w-11 shrink-0 self-start rounded-full bg-brand-600 opacity-40 sm:self-center"
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
                              background: isEnabled ? 'var(--color-brand-600)' : "#D1D5DB",
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
            </Card>
          </div>

          <div className="space-y-4">
            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">Package overrides</h2>
                <p className="mt-0.5 text-caption text-ink-400">
                  Override this tenant&apos;s package features and limits without changing
                  the shared package defaults.
                </p>
              </div>
              <div className="divide-y divide-ink-50">
                {PACKAGE_ENTITLEMENTS.map((feat) => {
                  const packageValue = tenantPackage?.entitlements[feat.key];
                  const overrideValue = overrideMap[feat.key];
                  const effectiveValue =
                    overrideValue !== undefined ? overrideValue : packageValue;
                  return (
                    <div
                      key={feat.key}
                      className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="min-w-0 pr-0 sm:pr-4">
                        <p className="flex items-center gap-2 text-body-sm font-medium text-ink-900">
                          {feat.label}
                          <Badge variant="brand">Package default</Badge>
                          {overrideValue !== undefined && (
                            <Badge variant="warning">Overridden</Badge>
                          )}
                        </p>
                        <p className="mt-0.5 text-caption text-ink-400">
                          {feat.description}
                        </p>
                        <p className="mt-1 text-caption text-ink-500">
                          Current package value:{" "}
                          <span className="font-medium text-ink-700">
                            {packageValue === null
                              ? "Unlimited"
                              : typeof packageValue === "boolean"
                                ? packageValue
                                  ? "Enabled"
                                  : "Disabled"
                                : packageValue}
                          </span>
                        </p>
                      </div>
                      {feat.type === "boolean" ? (
                        <form
                          action="/api/admin/tenant-entitlements"
                          method="POST"
                          className="shrink-0 self-start sm:self-center"
                        >
                          <input type="hidden" name="tenant_id" value={id} />
                          <input type="hidden" name="key" value={feat.key} />
                          <input type="hidden" name="value_type" value="boolean" />
                          <input
                            type="hidden"
                            name="value"
                            value={effectiveValue ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className="relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors"
                            style={{
                              background: effectiveValue ? 'var(--color-brand-600)' : "#D1D5DB",
                            }}
                            aria-label={
                              effectiveValue
                                ? `Disable ${feat.label}`
                                : `Enable ${feat.label}`
                            }
                          >
                            <span
                              className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]"
                              style={{ left: effectiveValue ? 23 : 3 }}
                            />
                          </button>
                        </form>
                      ) : (
                        <form
                          action="/api/admin/tenant-entitlements"
                          method="POST"
                          className="w-full max-w-[180px] shrink-0 self-start sm:self-center"
                        >
                          <input type="hidden" name="tenant_id" value={id} />
                          <input type="hidden" name="key" value={feat.key} />
                          <input type="hidden" name="value_type" value="limit" />
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                id={`tenant-ent-${feat.key}`}
                                type="number"
                                min="0"
                                name="value"
                                defaultValue={
                                  effectiveValue === null ? "" : String(effectiveValue)
                                }
                                placeholder="Unlimited"
                              />
                            </div>
                            <Button type="submit" variant="dark" size="sm">
                              Save
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Tenant content editor */}
            <Card variant="outlined" className="overflow-hidden p-0">
              <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
                <h2 className="font-semibold text-ink-900">
                  Site content editor
                </h2>
                <p className="mt-0.5 text-caption text-ink-400">
                  Edit this salon&apos;s website content
                </p>
              </div>
              <form
                action="/api/admin/tenants/content"
                method="POST"
                className="space-y-4 p-4 sm:p-6"
              >
                <input type="hidden" name="tenant_id" value={id} />

                <Input
                  id="tenant-content-tagline"
                  type="text"
                  name="tagline"
                  label="Tagline"
                  defaultValue={tenant.tagline ?? ""}
                  placeholder="Where beauty meets craft"
                />

                <Textarea
                  id="tenant-content-about"
                  name="about"
                  label="About"
                  defaultValue={tenant.about ?? ""}
                  placeholder="Tell the salon's story..."
                  rows={3}
                />

                <Input
                  id="tenant-content-address"
                  type="text"
                  name="address"
                  label="Address"
                  defaultValue={tenant.address ?? ""}
                  placeholder="123 Beauty Lane, Amsterdam"
                />

                <Input
                  id="tenant-content-hours"
                  type="text"
                  name="hours"
                  label="Hours"
                  defaultValue={tenant.hours ?? ""}
                  placeholder="Mon–Sat 9am–7pm"
                />

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
                    className="order-2 text-body-sm text-brand-600 hover:text-brand-700 sm:order-1"
                  >
                    Preview site →
                  </Link>
                  <Button
                    type="submit"
                    variant="dark"
                    size="md"
                    className="order-1 w-full sm:order-2 sm:w-auto"
                  >
                    Save content
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
