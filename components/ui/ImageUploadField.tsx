"use client";

import { useRef, useState } from "react";
import { RefreshIcon, UploadCloudIcon } from "@/components/ui/Icons";

interface ImageUploadFieldProps {
  /** Optional form field name to include as hidden input */
  name?: string;
  /** Current image URL */
  value: string;
  /** Called with the new public URL after a successful upload */
  onChange: (url: string) => void;
  /** Label shown above the field */
  label?: string;
  /** Small hint text shown below */
  hint?: string;
  className?: string;
}

export function ImageUploadField({
  name,
  value,
  onChange,
  label,
  hint,
  className,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
      } else {
        onChange(data.url);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={className}>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      {label && (
        <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>
      )}

      {/* ── Preview ── */}
      {value && (
        <div className="mb-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="h-auto w-full object-cover aspect-[16/9] sm:aspect-[4/3]"
          />
        </div>
      )}

      {/* ── Upload zone ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading)
            inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minHeight: 72,
          borderRadius: 10,
          border: `2px dashed ${dragOver ? "#7C3AED" : "#E5E7EB"}`,
          background: dragOver ? "#F5F3FF" : "#F9FAFB",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.65 : 1,
          transition: "border-color 0.15s, background 0.15s",
          padding: "12px 16px",
        }}
      >
        {uploading ? (
          <>
            <RefreshIcon className="h-5 w-5 animate-spin text-violet-600" />
            <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
              Uploading…
            </span>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UploadCloudIcon
                className={`h-[18px] w-[18px] ${dragOver ? "text-violet-600" : "text-slate-400"}`}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: dragOver ? "#7C3AED" : "#374151",
                }}
              >
                {value ? "Replace image" : "Upload image"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>
              JPEG · PNG · WebP · max 10 MB · drag &amp; drop or click
            </span>
          </>
        )}
      </div>

      {error && (
        <p style={{ marginTop: 6, fontSize: 12, color: "#EF4444" }}>{error}</p>
      )}
      {hint && !error && (
        <p style={{ marginTop: 4, fontSize: 12, color: "#9CA3AF" }}>{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onInputChange}
        disabled={uploading}
      />
    </div>
  );
}

