"use client";

import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import { Button } from "@/components/ds/Button";
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
        <label className="mb-2 block text-label font-medium text-ink-700">
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

      <div className="flex items-center justify-between gap-4 border-t border-ink-100 pt-4">
        <Link
          href={cancelHref}
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
          {saveButtonLabel}
        </Button>
      </div>
    </form>
  );
}
