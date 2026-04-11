import Link from "next/link";

export default function NewTenantPage() {
    return (
      <div className="max-w-lg">
        <div className="mb-8">
          
            <Link href="/admin/tenants"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">myplatform.com/</span>
              <input
                type="text"
                name="slug"
                required
                placeholder="glam-studio"
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              name="plan_tier"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
  
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Create salon
          </button>
        </form>
      </div>
    );
  }