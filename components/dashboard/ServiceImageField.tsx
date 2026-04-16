"use client";

import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useState } from "react";

export function ServiceImageField({
  name = "image_url",
  initialValue = "",
  label = "Service image (optional)",
  hint = "Shown on your booking page service card",
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
    />
  );
}
