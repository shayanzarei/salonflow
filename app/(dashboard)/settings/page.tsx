import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function SettingsPage({
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="mx-auto max-w-3xl pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-gray-500">
          Manage salon profile and branding in one place.
        </p>
      </div>

      <form action="/api/settings" method="POST" className="space-y-5">
        <input type="hidden" name="action" value="profile_and_branding" />
        <input type="hidden" name="redirect_to" value="/settings" />

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">Salon profile</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                type="url"
                name="logo_url"
                defaultValue={tenant.logo_url ?? ""}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Salon name
              </label>
              <input
                type="text"
                name="name"
                required
                defaultValue={tenant.name}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Booking URL slug
              </label>
              <div className="flex overflow-hidden rounded-lg border border-gray-200">
                <span className="border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400">
                  SoloHub.nl/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  defaultValue={tenant.slug}
                  className="min-w-0 flex-1 px-3 py-2.5 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                defaultValue={tenant.tagline ?? ""}
                placeholder="Where beauty meets craft"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                About
              </label>
              <textarea
                name="about"
                defaultValue={tenant.about ?? ""}
                placeholder="Tell your salon's story..."
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={tenant.address ?? ""}
                  placeholder="123 Beauty Lane"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={tenant.phone ?? ""}
                  placeholder="+31 6 1234 5678"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="text-base font-semibold text-gray-900">
              Branding &amp; booking site
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Configure your primary brand color and booking hero image.
            </p>

            <div className="mt-4 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Primary brand color
                </label>
                <BrandingColorPicker
                  name="primary_color"
                  defaultValue={tenant.primary_color ?? "#7C3AED"}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Site preview
                </p>
                <div
                  className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
                  style={{ borderColor: `${brand}33` }}
                >
                  {tenant.hero_image_url?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tenant.hero_image_url}
                      alt="Hero preview"
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-24 items-center justify-center bg-gray-200 text-xs text-gray-500"
                      style={{
                        background: `linear-gradient(135deg, ${brand}22 0%, #f3f4f6 100%)`,
                      }}
                    >
                      Hero image area
                    </div>
                  )}
                  <div className="space-y-3 p-4">
                    <p className="text-center text-sm font-semibold text-gray-900">
                      {tenant.name || "Your salon"}
                    </p>
                    <button
                      type="button"
                      className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm"
                      style={{ backgroundColor: brand }}
                    >
                      Book now
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Hero image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="hero_image_url"
                    defaultValue={tenant.hero_image_url ?? ""}
                    placeholder="https://example.com/hero.jpg"
                    className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled
                    className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400"
                    title="Upload coming later - paste a URL for now"
                  >
                    Upload
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Shown in the hero section of your booking site
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <Link
              href="/settings"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: brand }}
            >
              Save changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
