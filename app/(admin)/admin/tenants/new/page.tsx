import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import Link from "next/link";
import { WEBSITE_TEMPLATES } from "@/lib/website-templates";

export default function NewTenantPage() {
  return (
    <div className="w-full max-w-3xl min-w-0">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/tenants"
          className="inline-flex min-h-10 items-center text-body-sm text-ink-500 hover:text-ink-700"
        >
          ← Back to tenants
        </Link>
        <h1 className="mt-3 text-h1 font-bold tracking-tight text-ink-900">
          Onboard a new company
        </h1>
        <p className="mt-1 text-body text-ink-500">
          Create tenant, assign plan, and choose website template.
        </p>
      </div>

      <form
        action="/api/admin/tenants"
        method="POST"
      >
        <Card variant="outlined" className="p-5 sm:p-6">
          <section>
            <h2 className="text-h3 font-semibold text-ink-900">Basic Information</h2>
            <div className="mt-4 h-px w-full bg-ink-100" />

            <div className="mt-5 space-y-4">
              <Input
                id="new-tenant-name"
                type="text"
                name="name"
                label="Company Name"
                required
                placeholder="e.g. Nova Studio"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="new-tenant-owner-first"
                  type="text"
                  name="owner_first_name"
                  label="Owner first name"
                  required
                  placeholder="John"
                />
                <Input
                  id="new-tenant-owner-last"
                  type="text"
                  name="owner_last_name"
                  label="Owner last name"
                  required
                  placeholder="Doe"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="new-tenant-owner-email"
                  type="email"
                  name="owner_email"
                  label="Owner email"
                  required
                  placeholder="owner@company.com"
                />
                <Select
                  id="new-tenant-owner-role"
                  name="owner_role"
                  label="Owner role"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select role
                  </option>
                  <option value="freelancer">Freelancer</option>
                  <option value="consultant">Consultant</option>
                  <option value="agency-owner">Agency Owner</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="small-business">Small Business Owner</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1.5 text-label font-medium text-ink-700">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-danger-600" />
                  <span>Slug</span>
                </label>
                <div className="grid min-h-10 grid-cols-[74px_1fr_98px] overflow-hidden rounded-sm border border-ink-200 bg-ink-0 text-body-sm">
                  <span className="flex items-center border-r border-ink-200 px-3 text-ink-400">
                    https://
                  </span>
                  <input
                    type="text"
                    name="slug"
                    required
                    placeholder="glamstudio"
                    className="min-w-0 px-3 text-ink-900 outline-none"
                  />
                  <span className="flex items-center justify-center border-l border-ink-200 px-3 text-ink-500">
                    .SoloHub.nl
                  </span>
                </div>
                <p className="mt-1 text-caption text-ink-500">
                  This will be used as your public web address.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7">
            <h2 className="text-h3 font-semibold text-ink-900">Configuration</h2>
            <div className="mt-4 h-px w-full bg-ink-100" />

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                id="new-tenant-plan"
                name="plan_tier"
                label="Plan Tier"
                required
              >
                <option value="solo">Solo</option>
                <option value="hub">Hub</option>
                <option value="agency">Agency</option>
              </Select>

              <Select
                id="new-tenant-template"
                name="website_template"
                label="Website Template"
                required
                defaultValue="signuture"
                helperText="You can change this later from Tenant Details."
              >
                {WEBSITE_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </Select>

              <input type="hidden" name="primary_color" value='var(--color-brand-600)' />

              <div>
                <label
                  htmlFor="new-tenant-business-started"
                  className="mb-1 block text-label font-medium text-ink-700"
                >
                  Business Started Date
                </label>
                <input
                  id="new-tenant-business-started"
                  type="date"
                  name="business_started_at"
                  className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 py-2.5 text-body-sm text-ink-900 outline-none focus:border-brand-600"
                />
                <p className="mt-1 text-caption text-ink-500">
                  Used to calculate years of experience on public site.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-md border border-brand-100 bg-brand-50 p-4">
            <p className="text-body-sm font-medium text-brand-900">
              Password setup is automatic
            </p>
            <p className="mt-1 text-caption text-brand-700">
              After creating this tenant, the owner will receive an email with a secure
              link to set up a new password.
            </p>
          </section>

          <div className="mt-8 flex items-center justify-end gap-3 border-t border-ink-100 pt-5">
            <Button asChild variant="ghost" size="md">
              <Link href="/admin/tenants">Cancel</Link>
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create tenant
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
