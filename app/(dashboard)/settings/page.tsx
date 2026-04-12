import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function SettingsPage() {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your salon profile and website
        </p>
      </div>

      {/* Salon info */}
      <form action="/api/settings" method="POST" className="space-y-4 mb-4">
        <input type="hidden" name="tenant_id" value={tenant.id} />
        <input type="hidden" name="action" value="info" />

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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your booking URL
            </label>
            <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden">
              <span className="px-3 py-2.5 bg-gray-50 text-sm text-gray-400 border-r border-gray-200 whitespace-nowrap">
                salonflow.xyz/
              </span>
              <input
                type="text"
                name="slug"
                required
                defaultValue={tenant.slug}
                className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Changing this will break existing links to your site
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tagline
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={tenant.tagline ?? ""}
              placeholder="Where beauty meets craft"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About
            </label>
            <textarea
              name="about"
              defaultValue={tenant.about ?? ""}
              placeholder="Tell your salon's story..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                defaultValue={tenant.address ?? ""}
                placeholder="123 Beauty Lane, Amsterdam"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opening hours
              </label>
              <input
                type="text"
                name="hours"
                defaultValue={tenant.hours ?? ""}
                placeholder="Mon–Sat 9am–7pm"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Save salon info
          </button>
        </div>
      </form>

      {/* Branding */}
      <form action="/api/settings" method="POST" className="space-y-4 mb-4">
        <input type="hidden" name="tenant_id" value={tenant.id} />
        <input type="hidden" name="action" value="branding" />

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
                defaultValue={tenant.primary_color ?? "#7C3AED"}
                className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-sm text-gray-400">
                Used for buttons and accents across your site
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
              defaultValue={tenant.logo_url ?? ""}
              placeholder="https://example.com/logo.png"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero image URL
            </label>
            <input
              type="url"
              name="hero_image_url"
              defaultValue={tenant.hero_image_url ?? ""}
              placeholder="https://example.com/hero.jpg"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Shown in the hero section of your booking site
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Save branding
          </button>
        </div>
      </form>

      {/* Change password */}
      <form
        action="/api/settings/password"
        method="POST"
        className="space-y-4 mb-4"
      >
        <input type="hidden" name="tenant_id" value={tenant.id} />

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Change password</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current password
            </label>
            <input
              type="password"
              name="current_password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              name="new_password"
              required
              placeholder="••••••••"
              minLength={8}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: brand }}
          >
            Update password
          </button>
        </div>
      </form>

      {/* Plan info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Subscription</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {tenant.plan_tier} plan
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {tenant.plan_tier === "starter"
                ? "Online booking + email reminders"
                : tenant.plan_tier === "pro"
                  ? "Everything in Starter + SMS + analytics"
                  : "All features included"}
            </p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium text-white capitalize"
            style={{ backgroundColor: brand }}
          >
            {tenant.plan_tier}
          </span>
        </div>
      </div>
    </div>
  );
}
