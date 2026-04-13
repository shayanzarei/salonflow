"use client";

import { BrandingColorPicker } from "@/components/dashboard/BrandingColorPicker";
import Link from "next/link";
import { useState } from "react";

type SectionFlags = {
  section_services: boolean;
  section_team: boolean;
  section_reviews: boolean;
};

export function SettingsBrandingForm({
  defaultColor,
  heroImageUrl,
  salonName,
  sections,
  saveButtonLabel = "Save branding",
}: {
  defaultColor: string;
  heroImageUrl: string;
  salonName: string;
  sections: SectionFlags;
  saveButtonLabel?: string;
}) {
  const [previewColor, setPreviewColor] = useState(
    defaultColor || "#7C3AED"
  );

  return (
    <form action="/api/settings" method="POST" className="space-y-5">
      <input type="hidden" name="action" value="branding" />

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
        <p className="mb-2 text-sm font-medium text-gray-700">Site preview</p>
        <div
          className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
          style={{ borderColor: `${previewColor}33` }}
        >
          <div
            className="flex h-24 items-center justify-center bg-gray-200 text-xs text-gray-500"
            style={{
              background: `linear-gradient(135deg, ${previewColor}22 0%, #f3f4f6 100%)`,
            }}
          >
            Hero image area
          </div>
          <div className="space-y-3 p-4">
            <p className="text-center text-sm font-semibold text-gray-900">
              {salonName || "Your salon"}
            </p>
            <button
              type="button"
              className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: previewColor }}
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
            defaultValue={heroImageUrl}
            placeholder="https://example.com/hero.jpg"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
          />
          <button
            type="button"
            disabled
            className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400"
            title="Upload coming later — paste a URL for now"
          >
            Upload
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Shown in the hero section of your booking site
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">
          Visible site sections
        </p>
        <div className="space-y-3">
          {(
            [
              {
                key: "section_services" as const,
                label: "Services menu",
                checked: sections.section_services,
              },
              {
                key: "section_team" as const,
                label: "Staff profiles",
                checked: sections.section_team,
              },
              {
                key: "section_reviews" as const,
                label: "Client reviews",
                checked: sections.section_reviews,
              },
            ] as const
          ).map(({ key, label, checked }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/80 px-4 py-3"
            >
              <span className="text-sm text-gray-800">{label}</span>
              <input
                type="checkbox"
                name={key}
                value="true"
                defaultChecked={checked}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4">
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
          {saveButtonLabel}
        </button>
      </div>
    </form>
  );
}
