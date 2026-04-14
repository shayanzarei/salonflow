"use client";

import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import Link from "next/link";
import { useState } from "react";

interface Tenant {
  name: string;
  slug: string;
  tagline: string | null;
  about: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  primary_color: string | null;
}

export function SettingsProfileForm({ tenant }: { tenant: Tenant }) {
  const brand = tenant.primary_color ?? "#7C3AED";
  const [previewColor, setPreviewColor] = useState(brand);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? "");
  const [heroUrl, setHeroUrl] = useState(tenant.hero_image_url ?? "");

  return (
    <form action="/api/settings" method="POST" className="space-y-5">
      <input type="hidden" name="action" value="profile_and_branding" />
      <input type="hidden" name="redirect_to" value="/settings" />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Salon profile</h2>

        <div className="mt-5 space-y-4">
          <ImageUploadField
            name="logo_url"
            label="Logo"
            value={logoUrl}
            onChange={setLogoUrl}
            hint="Shown in the header of your booking site"
          />

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
                onColorChangeAction={setPreviewColor}
              />
            </div>

            <ImageUploadField
              name="hero_image_url"
              label="Hero image"
              value={heroUrl}
              onChange={setHeroUrl}
              hint="Shown in the hero section of your booking site"
            />
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
            style={{ backgroundColor: previewColor }}
          >
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}
