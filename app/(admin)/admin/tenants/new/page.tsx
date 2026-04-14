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
          Onboard a new salon
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
                Salon Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Glam Studio"
                className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
              />
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
                  .salonflow.xyz
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
                <option value="starter">Starter — $29/mo</option>
                <option value="pro">Pro — $79/mo</option>
                <option value="enterprise">Enterprise — $199/mo</option>
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

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Brand Color <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="primary_color"
                  defaultValue="#7C3AED"
                  className="h-10 w-11 rounded-[10px] border border-gray-200 bg-white p-1"
                />
                <input
                  type="text"
                  value="#7C3AED"
                  readOnly
                  className="min-h-10 w-28 rounded-[10px] border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600"
                />
              </div>
            </div>

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

        <section className="mt-7">
          <h2 className="text-2xl font-semibold text-gray-900">Owner Credentials</h2>
          <div className="mt-4 h-px w-full bg-gray-100" />

          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="password"
              required
              placeholder="Create a secure password"
              className="min-h-11 w-full rounded-[10px] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-violet-400"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters.</p>
          </div>
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