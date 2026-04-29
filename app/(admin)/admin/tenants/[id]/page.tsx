import { Badge } from "@/components/ds/Badge";
import { Card } from "@/components/ds/Card";
import pool from "@/lib/db";
import { getPackageMap } from "@/lib/packages";
import type { PackageId } from "@/config/packages";
import { autoTitle, autoDescription } from "@/lib/seo/auto-meta";
import {
  WEBSITE_TEMPLATES,
  normalizeWebsiteTemplate,
} from "@/lib/website-templates";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * Read-only snapshot of a tenant. Uses the layout's left rail for navigation
 * to specific editors — no forms here. The point of this page is "I just
 * landed on this tenant; what state are they in?".
 */
export default async function TenantOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tenantResult, servicesResult, bookingsResult] = await Promise.all([
    pool.query(`SELECT * FROM tenants WHERE id = $1`, [id]),
    pool.query(
      `SELECT id, name, category FROM services WHERE tenant_id = $1`,
      [id]
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (
                WHERE booking_start_utc >= NOW() - INTERVAL '30 days'
              )::int AS last_30
       FROM bookings WHERE tenant_id = $1`,
      [id]
    ),
  ]);

  const tenant = tenantResult.rows[0];
  if (!tenant) notFound();

  const services = servicesResult.rows;
  const bookingStats = bookingsResult.rows[0] ?? { total: 0, last_30: 0 };

  const packageMap = await getPackageMap();
  const tenantPackage = packageMap[tenant.plan_tier as PackageId];
  const selectedTemplate = normalizeWebsiteTemplate(tenant.website_template);
  const templateLabel =
    WEBSITE_TEMPLATES.find((t) => t.id === selectedTemplate)?.label ??
    selectedTemplate;

  const previewTitle = autoTitle(tenant);
  const previewDescription = autoDescription(tenant, services);

  const memberSince = tenant.created_at
    ? new Date(tenant.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const businessStarted = tenant.business_started_at
    ? new Date(tenant.business_started_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

  return (
    <div className="space-y-4">
      {/* Headline summary tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label="Plan"
          value={
            tenantPackage?.name ?? (tenant.plan_tier as string).toUpperCase()
          }
          hint={`Tier: ${tenant.plan_tier}`}
        />
        <Tile
          label="Bookings (30d)"
          value={String(bookingStats.last_30)}
          hint={`${bookingStats.total} all-time`}
        />
        <Tile label="Services" value={String(services.length)} />
        <Tile
          label="Member since"
          value={memberSince}
          hint={`Business started ${businessStarted}`}
        />
      </div>

      {/* Quick facts */}
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Snapshot</h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Read-only summary. Use the left rail to edit individual sections.
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 p-4 sm:grid-cols-2 sm:p-6">
          <Fact label="Subdomain" value={`${tenant.slug}.solohub.nl`} mono />
          <Fact label="Template" value={templateLabel} />
          <Fact
            label="Owner"
            value={
              [tenant.owner_first_name, tenant.owner_last_name]
                .filter(Boolean)
                .join(" ") || "—"
            }
          />
          <Fact label="Owner email" value={tenant.owner_email ?? "—"} mono />
          <Fact label="Phone" value={tenant.phone ?? "—"} />
          <Fact label="City / address" value={tenant.address ?? "—"} />
          <Fact label="Time zone" value={tenant.iana_timezone ?? "—"} mono />
          <Fact
            label="Brand color"
            value={
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded border border-ink-200"
                  style={{
                    backgroundColor:
                      tenant.primary_color ?? "var(--color-brand-600)",
                  }}
                />
                <span className="font-mono text-caption text-ink-700">
                  {tenant.primary_color ?? "—"}
                </span>
              </span>
            }
          />
        </dl>
      </Card>

      {/* SEO preview — auto-generated unless overridden */}
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold text-ink-900">SEO preview</h2>
            <p className="mt-0.5 text-caption text-ink-400">
              How this site will appear in search results today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {tenant.seo_title ? (
              <Badge variant="warning">Title overridden</Badge>
            ) : (
              <Badge variant="neutral">Title auto</Badge>
            )}
            {tenant.meta_description ? (
              <Badge variant="warning">Description overridden</Badge>
            ) : (
              <Badge variant="neutral">Description auto</Badge>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <p className="truncate text-body font-semibold text-brand-700">
            {previewTitle}
          </p>
          <p className="mt-0.5 truncate text-caption text-ink-500">
            https://{tenant.slug}.solohub.nl/
          </p>
          <p className="mt-1.5 text-body-sm leading-relaxed text-ink-700">
            {previewDescription}
          </p>
          <div className="mt-4">
            <Link
              href={`/admin/tenants/${id}/website?tab=seo`}
              className="text-body-sm font-medium text-brand-700 hover:text-brand-800"
            >
              Edit SEO →
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Jump to</h2>
        </div>
        <ul className="divide-y divide-ink-50">
          {[
            {
              href: `/admin/tenants/${id}/website?tab=branding`,
              label: "Edit branding & template",
              hint: "Logo, primary color, hero image, template",
            },
            {
              href: `/admin/tenants/${id}/website?tab=hours`,
              label: "Set opening hours",
              hint: "Salon-level availability per day",
            },
            {
              href: `/admin/tenants/${id}/lifecycle`,
              label: "Approve & publish",
              hint: "Move from draft to published",
            },
            {
              href: `/admin/tenants/${id}/access`,
              label: "Update owner & plan",
              hint: "Owner email, name, plan tier",
            },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-12 items-center justify-between gap-4 px-4 py-3 text-body-sm hover:bg-ink-50 sm:px-6"
              >
                <div>
                  <p className="font-medium text-ink-900">{item.label}</p>
                  <p className="mt-0.5 text-caption text-ink-500">
                    {item.hint}
                  </p>
                </div>
                <span aria-hidden className="text-ink-400">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card variant="outlined" className="p-4">
      <p className="text-caption uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p className="mt-1 text-h3 font-bold text-ink-900">{value}</p>
      {hint ? <p className="mt-0.5 text-caption text-ink-500">{hint}</p> : null}
    </Card>
  );
}

function Fact({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-caption uppercase tracking-wide text-ink-400">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-body-sm text-ink-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
