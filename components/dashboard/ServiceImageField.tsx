"use client";

import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useState } from "react";

/**
 * Service-card photos render at 4:3 on the public booking page (see the image
 * box in app/(booking)/page.tsx). Forcing the same ratio here means whatever
 * the salon owner sees in the cropper is exactly what shows up on the card —
 * no surprise crops, no letterboxing, no blurry stretches.
 *
 * Output is fixed at 1200×900 so we get crisp 2× rendering on a typical
 * ~600px-wide card slot. Anything smaller than 800×600 is rejected outright
 * because cropping a tiny source just produces a tiny output.
 */
const SERVICE_CARD_ASPECT = 4 / 3;
const SERVICE_CARD_OUTPUT_WIDTH = 1200;
const SERVICE_CARD_OUTPUT_HEIGHT = 900;
const SERVICE_CARD_MIN_WIDTH = 800;
const SERVICE_CARD_MIN_HEIGHT = 600;

export function ServiceImageField({
  name = "image_url",
  initialValue = "",
  label = "Service image (optional)",
  hint = "Shown on your booking page service card. You'll be asked to crop to 4:3 (1200×900 recommended).",
}: {
  name?: string;
  initialValue?: string;
  label?: string;
  hint?: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <ImageUploadField
      name={name}
      value={value}
      onChange={setValue}
      label={label}
      hint={hint}
      cropAspect={SERVICE_CARD_ASPECT}
      cropOutputWidth={SERVICE_CARD_OUTPUT_WIDTH}
      cropOutputHeight={SERVICE_CARD_OUTPUT_HEIGHT}
      minSourceWidth={SERVICE_CARD_MIN_WIDTH}
      minSourceHeight={SERVICE_CARD_MIN_HEIGHT}
    />
  );
}
