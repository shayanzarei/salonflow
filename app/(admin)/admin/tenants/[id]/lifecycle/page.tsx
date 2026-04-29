import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Select } from "@/components/ds/Select";
import pool from "@/lib/db";
import { notFound } from "next/navigation";

/**
 * Lifecycle editor — controls trial/active/suspended status, trial dates,
 * and website-status approval workflow. These three concerns share a page
 * because they're entangled: publishing the website usually means promoting
 * to active.
 */
export default async function TenantLifecyclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await pool.query(
    `SELECT id, name, tenant_status, trial_started_at, trial_ends_at,
            website_status, website_review_note, website_published_at
     FROM tenants WHERE id = $1`,
    [id]
  );
  const tenant = result.rows[0];
  if (!tenant) notFound();

  const trialStartedValue = tenant.trial_started_at
    ? new Date(tenant.trial_started_at).toISOString().slice(0, 10)
    : "";
  const trialEndsValue = tenant.trial_ends_at
    ? new Date(tenant.trial_ends_at).toISOString().slice(0, 10)
    : "";

  return (
    <div className="space-y-4">
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">
            Subscription & trial dates
          </h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Sets the tenant&apos;s account state and trial window. Website
            access (and `canAccessPublicWebsite()`) keys off these values.
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
            helperText="Trial blocks publishing once the window expires; suspended hides the public site."
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
          <h2 className="font-semibold text-ink-900">
            Website approval & visibility
          </h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Controls whether the public site is reachable. Publishing also
            promotes a trial tenant to active.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-6">
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
              {tenant.website_status === "published"
                ? "Already published"
                : "Approve & publish"}
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
              {tenant.website_status === "draft"
                ? "Already draft"
                : "Move to draft"}
            </Button>
          </form>
        </div>

        {tenant.website_review_note ? (
          <div className="border-t border-ink-100 px-4 py-3 sm:px-6">
            <p className="text-caption uppercase tracking-wide text-ink-400">
              Latest review note
            </p>
            <p className="mt-1 text-body-sm text-ink-700">
              {tenant.website_review_note}
            </p>
          </div>
        ) : null}

        {tenant.website_published_at ? (
          <div className="border-t border-ink-100 px-4 py-3 text-caption text-ink-500 sm:px-6">
            Last published{" "}
            {new Date(tenant.website_published_at).toLocaleString()}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
