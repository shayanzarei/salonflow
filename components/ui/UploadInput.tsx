"use client";

/**
 * Drop-in replacement for <input type="url"> inside a native form POST.
 * Renders an image upload widget + a hidden <input name={name}> whose value
 * is the resulting blob URL, so it participates in normal form submission.
 */
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useState } from "react";

interface UploadInputProps {
  /** The form field name (used in the POST body) */
  name: string;
  /** Initial URL value */
  defaultValue?: string;
  /** Label above the dropzone */
  label?: string;
  /** Small hint below the dropzone */
  hint?: string;
  className?: string;
}

export function UploadInput({
  name,
  defaultValue = "",
  label,
  hint,
  className,
}: UploadInputProps) {
  const [url, setUrl] = useState(defaultValue);

  return (
    <>
      <ImageUploadField
        name={name}
        label={label}
        value={url}
        onChange={setUrl}
        hint={hint}
        className={className}
      />
    </>
  );
}
