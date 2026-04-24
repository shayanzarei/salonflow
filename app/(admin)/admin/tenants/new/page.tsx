import Link from "next/link";
import { WEBSITE_TEMPLATES } from "@/lib/website-templates";

export default function NewTenantPage() {
  return (
    <div className="w-full max-w-3xl min-w-0">
      <div className="mb-6 sm:mb-8">
        <Link
          href="/admin/tenants"
          className="inline-flex min-h-10 items-center text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to tenants
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          Onboard a new company
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Create tenant, assign plan, and choose website template.
        </p>
      </div>

      <form
        action="/api/admin/tenants"
        method="POST"
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Basic Information</h2>
          <div className="mt-4 h-px w-full bg-gray-100" />

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Nova Studio"
                className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Owner first name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="owner_first_name"
                  required
                  placeholder="John"
                  className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Owner last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="owner_last_name"
                  required
                  placeholder="Doe"
                  className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Owner email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="owner_email"
                  required
                  placeholder="owner@company.com"
                  className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Owner role <span className="text-red-500">*</span>
                </label>
                <select
                  name="owner_role"
                  required
                  defaultValue=""
                  className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
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
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="grid min-h-11 grid-cols-[74px_1fr_98px] overflow-hidden rounded-[10px] border border-gray-200 bg-white text-sm">
                <span className="flex items-center border-r border-gray-200 px-3 text-gray-400">
                  https://
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  placeholder="glamstudio"
                  className="min-w-0 px-3 text-gray-900 outline-none"
                />
                <span className="flex items-center justify-center border-l border-gray-200 px-3 text-gray-500">
                  .SoloHub.nl
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This will be used as your public web address.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <h2 className="text-2xl font-semibold text-gray-900">Configuration</h2>
          <div className="mt-4 h-px w-full bg-gray-100" />

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Plan Tier <span className="text-red-500">*</span>
              </label>
              <select
                name="plan_tier"
                className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
              >
                <option value="solo">Solo</option>
                <option value="hub">Hub</option>
                <option value="agency">Agency</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Website Template <span className="text-red-500">*</span>
              </label>
              <select
                name="website_template"
                defaultValue="signuture"
                className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
              >
                {WEBSITE_TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                You can change this later from Tenant Details.
              </p>
            </div>

            <input type="hidden" name="primary_color" value='var(--color-brand-600)' />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Business Started Date
              </label>
              <input
                type="date"
                name="business_started_at"
                className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used to calculate years of experience on public site.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-7 rounded-xl border border-violet-100 bg-violet-50/70 p-4">
          <p className="text-sm font-medium text-violet-900">
            Password setup is automatic
          </p>
          <p className="mt-1 text-xs text-violet-700">
            After creating this tenant, the owner will receive an email with a secure
            link to set up a new password.
          </p>
        </section>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            href="/admin/tenants"
            className="inline-flex min-h-10 items-center justify-center rounded-[10px] px-4 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-[10px] bg-violet-600 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Create tenant
          </button>
        </div>
      </form>
    </div>
  );
}