"use client";

import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import Link from "next/link";
import { useState } from "react";

export function SettingsBrandingForm({
  defaultColor,
  heroImageUrl,
  salonName,
  saveButtonLabel = "Save branding",
  cancelHref = "/settings",
}: {
  defaultColor: string;
  heroImageUrl: string;
  salonName: string;
  saveButtonLabel?: string;
  cancelHref?: string;
}) {
  const [previewColor, setPreviewColor] = useState(
    defaultColor || "#7C3AED"
  );
  const [previewHeroImageUrl, setPreviewHeroImageUrl] = useState(
    heroImageUrl ?? ""
  );

  return (
    <form action="/api/settings" method="POST" className="space-y-5">
      <input type="hidden" name="action" value="branding" />
      <input type="hidden" name="redirect_to" value={cancelHref} />

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Primary brand color
        </label>
        <BrandingColorPicker
          name="primary_color"
          defaultValue={defaultColor}
          onColorChangeAction={setPreviewColor}
        />
      </div>

      <div>
        <ImageUploadField
          name="hero_image_url"
          label="Hero image"
          value={previewHeroImageUrl}
          onChange={setPreviewHeroImageUrl}
          hint="Shown in the hero section of your booking site"
        />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
        <Link
          href={cancelHref}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: previewColor }}
        >
          {saveButtonLabel}
        </button>
      </div>
    </form>
  );
}
