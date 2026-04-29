import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import pool from "@/lib/db";
import { notFound } from "next/navigation";

/**
 * Edits owner identity, plan tier, and the "business started" date that
 * powers the years-of-experience copy on public sites. Distinct from
 * lifecycle (status / trial) and from website content.
 */
export default async function TenantAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await pool.query(
    `SELECT id, owner_email, owner_first_name, owner_last_name, owner_role,
            plan_tier, business_started_at
     FROM tenants WHERE id = $1`,
    [id]
  );
  const tenant = result.rows[0];
  if (!tenant) notFound();

  const businessStartedValue = tenant.business_started_at
    ? new Date(tenant.business_started_at).toISOString().slice(0, 10)
    : "";

  return (
    <div className="space-y-4">
      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Owner</h2>
          <p className="mt-0.5 text-caption text-ink-400">
            The person who signed up. Used for receipts, password resets, and
            transactional email.
          </p>
        </div>
        <form
          action="/api/admin/tenants/access"
          method="POST"
          className="space-y-4 p-4 sm:p-6"
        >
          <input type="hidden" name="tenant_id" value={id} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              id="tenant-owner-first"
              type="text"
              name="owner_first_name"
              label="First name"
              defaultValue={tenant.owner_first_name ?? ""}
              placeholder="Sofia"
            />
            <Input
              id="tenant-owner-last"
              type="text"
              name="owner_last_name"
              label="Last name"
              defaultValue={tenant.owner_last_name ?? ""}
              placeholder="van Dijk"
            />
          </div>

          <Input
            id="tenant-owner-email"
            type="email"
            name="owner_email"
            label="Email"
            defaultValue={tenant.owner_email ?? ""}
            placeholder="owner@salon.com"
            helperText="Changing this also changes the login email."
          />

          <Select
            id="tenant-owner-role"
            name="owner_role"
            label="Owner role"
            defaultValue={tenant.owner_role ?? ""}
            helperText="Optional — used for analytics segmentation."
          >
            <option value="">— not set —</option>
            <option value="freelancer">Freelancer</option>
            <option value="consultant">Consultant</option>
            <option value="agency-owner">Agency owner</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="small-business">Small business owner</option>
            <option value="other">Other</option>
          </Select>

          <div className="flex justify-end">
            <Button type="submit" variant="dark" size="md">
              Save owner
            </Button>
          </div>
        </form>
      </Card>

      <Card variant="outlined" className="overflow-hidden p-0">
        <div className="border-b border-ink-100 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-ink-900">Plan & business</h2>
          <p className="mt-0.5 text-caption text-ink-400">
            Plan tier sets the package defaults — overrides live under{" "}
            <em>Plan & overrides</em>. Business start drives the
            years-of-experience copy.
          </p>
        </div>
        <form
          action="/api/admin/tenants/access"
          method="POST"
          className="space-y-4 p-4 sm:p-6"
        >
          <input type="hidden" name="tenant_id" value={id} />
          {/* Re-post the owner fields so the access route doesn't blank them. */}
          <input
            type="hidden"
            name="owner_first_name"
            value={tenant.owner_first_name ?? ""}
          />
          <input
            type="hidden"
            name="owner_last_name"
            value={tenant.owner_last_name ?? ""}
          />
          <input
            type="hidden"
            name="owner_email"
            value={tenant.owner_email ?? ""}
          />
          <input
            type="hidden"
            name="owner_role"
            value={tenant.owner_role ?? ""}
          />

          <Select
            id="tenant-plan-tier"
            name="plan_tier"
            label="Plan tier"
            defaultValue={tenant.plan_tier ?? "solo"}
          >
            <option value="solo">Solo</option>
            <option value="hub">Hub</option>
            <option value="agency">Agency</option>
          </Select>

          <div>
            <label
              htmlFor="tenant-business-started"
              className="mb-1 block text-label font-medium text-ink-700"
            >
              Business started
            </label>
            <input
              id="tenant-business-started"
              type="date"
              name="business_started_at"
              defaultValue={businessStartedValue}
              className="min-h-10 w-full rounded-sm border border-ink-200 px-4 py-2.5 text-body-sm focus:border-brand-600 focus:outline-none"
            />
            <p className="mt-1 text-caption text-ink-500">
              Drives the &ldquo;X years of experience&rdquo; copy on the public
              site.
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="dark" size="md">
              Save plan & business
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
