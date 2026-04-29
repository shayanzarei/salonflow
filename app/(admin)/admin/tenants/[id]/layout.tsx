import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import pool from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * Super-admin tenant editor shell. Renders a header with the tenant identity
 * and a left rail of editor sections so each sub-page (`page.tsx`,
 * `lifecycle/page.tsx`, etc.) only has to focus on its own slice of state.
 *
 * The layout intentionally fetches the tenant once and lets the children
 * re-fetch — Next.js memoizes within a single render pass so the cost is
 * negligible, and it keeps each page self-contained for navigation and link
 * sharing.
 */
export default async function TenantEditorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tenantResult = await pool.query(
    `SELECT id, name, slug, primary_color, website_status, tenant_status
     FROM tenants WHERE id = $1`,
    [id]
  );
  const tenant = tenantResult.rows[0];
  if (!tenant) notFound();

  const websiteBadgeVariant: "success" | "warning" | "neutral" =
    tenant.website_status === "published"
      ? "success"
      : tenant.website_status === "pending_approval"
        ? "warning"
        : "neutral";
  const websiteLabel =
    tenant.website_status === "pending_approval"
      ? "Pending approval"
      : tenant.website_status === "published"
        ? "Published"
        : "Draft";

  const tenantBadgeVariant: "success" | "warning" | "neutral" =
    tenant.tenant_status === "active"
      ? "success"
      : tenant.tenant_status === "suspended"
        ? "warning"
        : "neutral";
  const tenantLabel =
    tenant.tenant_status === "suspended"
      ? "Suspended"
      : tenant.tenant_status === "active"
        ? "Active"
        : "Trial";

  const NAV: { href: string; label: string; description: string }[] = [
    {
      href: `/admin/tenants/${id}`,
      label: "Overview",
      description: "Snapshot of this tenant's status",
    },
    {
      href: `/admin/tenants/${id}/lifecycle`,
      label: "Lifecycle",
      description: "Tenant status, trial dates, approval",
    },
    {
      href: `/admin/tenants/${id}/website`,
      label: "Website",
      description: "Branding, content, contact, hours, sections, SEO",
    },
    {
      href: `/admin/tenants/${id}/access`,
      label: "Access & owner",
      description: "Owner identity, plan, business start",
    },
    {
      href: `/admin/tenants/${id}/entitlements`,
      label: "Plan & overrides",
      description: "Per-tenant feature & limit overrides",
    },
    {
      href: `/admin/tenants/${id}/danger`,
      label: "Danger zone",
      description: "Suspend, archive, or delete",
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-6xl">
      <div className="mb-3">
        <Link
          href="/admin/tenants"
          className="inline-flex min-h-9 items-center text-body-sm text-ink-500 hover:text-ink-700"
        >
          ← Back to tenants
        </Link>
      </div>

      {/* Identity header */}
      <Card variant="outlined" className="mb-4 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-body-sm font-semibold text-white"
                style={{
                  backgroundColor:
                    tenant.primary_color ?? "var(--color-brand-600)",
                }}
              >
                {tenant.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-h2 font-bold text-ink-900">
                    {tenant.name}
                  </h1>
                  <Badge variant={tenantBadgeVariant}>{tenantLabel}</Badge>
                  <Badge variant={websiteBadgeVariant}>{websiteLabel}</Badge>
                </div>
                <p className="truncate text-caption text-ink-500">
                  {tenant.slug}.SoloHub.nl
                </p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="primary" size="sm">
              <Link
                href={`https://${tenant.slug}.solohub.nl`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open live site ↗
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Two-column shell: section nav + editor */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
        <nav className="lg:sticky lg:top-20 lg:self-start">
          <Card variant="outlined" className="p-2">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group block rounded-md px-3 py-2.5 text-body-sm text-ink-700 transition-colors hover:bg-ink-50"
                  >
                    <span className="block font-medium text-ink-900 group-hover:text-ink-900">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-caption text-ink-500">
                      {item.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
