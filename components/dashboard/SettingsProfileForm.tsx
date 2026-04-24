"use client";

import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import { PHONE_INPUT_PATTERN } from "@/lib/phone";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Tenant {
  name: string;
  tagline: string | null;
  about: string | null;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  about_image_url: string | null;
  primary_color: string | null;
}

type AddressSuggestion = {
  id: string;
  label: string;
};

export function SettingsProfileForm({
  tenant,
  redirectTo = "/settings",
  errorCode,
}: {
  tenant: Tenant;
  redirectTo?: string;
  errorCode?: string;
}) {
  const brand = tenant.primary_color ?? "#7C3AED";
  const [previewColor, setPreviewColor] = useState(brand);
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url ?? "");
  const [heroUrl, setHeroUrl] = useState(tenant.hero_image_url ?? "");
  const [aboutImageUrl, setAboutImageUrl] = useState(tenant.about_image_url ?? "");
  const [address, setAddress] = useState(tenant.address ?? "");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (address.trim().length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setAddressLoading(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setAddressLoading(true);
      try {
        const res = await fetch(
          `/api/address/suggest?q=${encodeURIComponent(address.trim())}`,
          { cache: "no-store" }
        );
        const payload = (await res.json()) as { suggestions?: AddressSuggestion[] };
        if (!active) return;
        const suggestions = payload.suggestions ?? [];
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(suggestions.length > 0);
      } catch {
        if (!active) return;
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      } finally {
        if (active) setAddressLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [address]);

  return (
    <form action="/api/settings" method="POST" className="space-y-5">
      <input type="hidden" name="action" value="profile_and_branding" />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">Salon profile</h2>
        {errorCode === "invalid_phone" ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Invalid phone number format. Use a valid number like `+31 6 1234 5678`.
          </p>
        ) : null}

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
              Tagline
            </label>
            <p className="mb-2 text-xs text-gray-500">
              A short sentence that describes your business. It is shown near
              your salon name on the public booking site.
            </p>
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
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) setShowAddressSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowAddressSuggestions(false), 120);
                  }}
                  placeholder="Search Dutch address (e.g. Kokgriend 92)"
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
                />
                {addressLoading ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    ...
                  </span>
                ) : null}
                {showAddressSuggestions && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id || suggestion.label}
                        type="button"
                        className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 last:border-b-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setAddress(suggestion.label);
                          setShowAddressSuggestions(false);
                        }}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Suggestions are based on Dutch registered addresses.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Contact phone
              </label>
              <input
                type="tel"
                name="phone"
                pattern={PHONE_INPUT_PATTERN}
                defaultValue={tenant.phone ?? ""}
                placeholder="+31 6 1234 5678"
                title="Use a valid phone number format."
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

            <ImageUploadField
              name="about_image_url"
              label="About section image"
              value={aboutImageUrl}
              onChange={setAboutImageUrl}
              hint="Shown beside your About text on the booking site"
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
