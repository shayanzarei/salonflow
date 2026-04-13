import Link from "next/link";

export default function NewTenantPage() {
    return (
      <div className="w-full max-w-lg min-w-0">
        <div className="mb-6 sm:mb-8">
            <Link href="/admin/tenants"
            className="inline-flex min-h-10 items-center text-sm text-gray-400 hover:text-gray-600"
          >
            ← Back
          </Link>
          <h1 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
            Onboard a new salon
          </h1>
        </div>
  
        <form action="/api/admin/tenants" method="POST" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salon name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Glam Studio"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:border-gray-400 focus:outline-none sm:text-sm"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="shrink-0 text-sm text-gray-400">myplatform.com/</span>
              <input
                type="text"
                name="slug"
                required
                placeholder="glam-studio"
                className="min-h-11 w-full flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:border-gray-400 focus:outline-none sm:text-sm"
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              name="plan_tier"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:border-gray-400 focus:outline-none sm:text-sm"
            >
              <option value="starter">Starter — $29/mo</option>
              <option value="pro">Pro — $79/mo</option>
              <option value="enterprise">Enterprise — $199/mo</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand color
            </label>
            <input
              type="color"
              name="primary_color"
              defaultValue="#7C3AED"
              className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial password
            </label>
            <input
              type="text"
              name="password"
              required
              placeholder="Set a password for the salon owner"
              className="min-h-11 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base focus:border-gray-400 focus:outline-none sm:text-sm"
            />
          </div>
  
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-gray-900 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Create salon
          </button>
        </form>
      </div>
    );
  }