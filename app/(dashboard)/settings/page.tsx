
import { getTenant } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function SettingsPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your salon profile</p>
      </div>

      <form action="/api/settings" method="POST" className="space-y-6">
        <input type="hidden" name="tenant_id" value={tenant.id} />

        {/* Salon info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Salon info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salon name
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={tenant.name}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
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
                defaultValue={tenant.slug}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Branding</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primary_color"
                defaultValue={tenant.primary_color ?? '#7C3AED'}
                className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-400">
                Used for buttons and accents
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              name="logo_url"
              defaultValue={tenant.logo_url ?? ''}
              placeholder="https://example.com/logo.png"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a link to your logo image
            </p>
          </div>
        </div>

        {/* Plan info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Subscription</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 capitalize">
                {tenant.plan_tier} plan
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {tenant.plan_tier === 'starter'
                  ? 'Online booking + email reminders'
                  : tenant.plan_tier === 'pro'
                    ? 'Everything in Starter + SMS + analytics'
                    : 'All features included'}
              </p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium text-white capitalize"
              style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
            >
              {tenant.plan_tier}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: tenant.primary_color ?? '#7C3AED' }}
        >
          Save changes
        </button>
      </form>
    </div>
  );
}