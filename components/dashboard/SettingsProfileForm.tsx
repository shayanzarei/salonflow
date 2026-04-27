"use client";

import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
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
      <Card>
        <h2 className="text-body font-semibold text-ink-900">Salon profile</h2>
        {errorCode === "invalid_phone" ? (
          <p className="mt-3 rounded-md bg-danger-50 px-3 py-2 text-body-sm text-danger-700">
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

          <Input
            id="settings-name"
            type="text"
            name="name"
            label="Salon name"
            required
            defaultValue={tenant.name}
          />

          <Input
            id="settings-tagline"
            type="text"
            name="tagline"
            label="Tagline"
            helperText="A short sentence that describes your business. It is shown near your salon name on the public booking site."
            defaultValue={tenant.tagline ?? ""}
            placeholder="Where beauty meets craft"
          />

          <Textarea
            id="settings-about"
            name="about"
            label="About"
            defaultValue={tenant.about ?? ""}
            placeholder="Tell your salon's story..."
            rows={4}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-label font-medium text-ink-700">
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
                  className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 pr-10 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
                />
                {addressLoading ? (
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-ink-400">
                    ...
                  </span>
                ) : null}
                {showAddressSuggestions && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-ink-200 bg-ink-0 shadow-lg">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id || suggestion.label}
                        type="button"
                        className="block w-full border-b border-ink-100 px-3 py-2 text-left text-body-sm text-ink-700 last:border-b-0 hover:bg-ink-50"
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
              <p className="mt-1 text-caption text-ink-500">
                Suggestions are based on Dutch registered addresses.
              </p>
            </div>
            <Input
              id="settings-phone"
              type="tel"
              name="phone"
              label="Contact phone"
              pattern={PHONE_INPUT_PATTERN}
              defaultValue={tenant.phone ?? ""}
              placeholder="+31 6 1234 5678"
              title="Use a valid phone number format."
            />
          </div>
        </div>

        <div className="mt-6 border-t border-ink-100 pt-6">
          <h3 className="text-body font-semibold text-ink-900">
            Branding &amp; booking site
          </h3>
          <p className="mt-1 text-body-sm text-ink-500">
            Configure your primary brand color and booking hero image.
          </p>

          <div className="mt-4 space-y-5">
            <div>
              <label className="mb-2 block text-label font-medium text-ink-700">
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

        <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
          <Link
            href="/settings"
            className="text-body-sm font-medium text-ink-500 hover:text-ink-700"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            style={{ backgroundColor: previewColor }}
          >
            Save changes
          </Button>
        </div>
      </Card>
    </form>
  );
}
