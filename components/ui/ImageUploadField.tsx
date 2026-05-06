"use client";

import { useRef, useState } from "react";
import { RefreshIcon, UploadCloudIcon } from "@/components/ui/Icons";
import { ImageCropperModal } from "@/components/ui/ImageCropperModal";
import { compressImage } from "@/lib/compress-image";

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

  /**
   * If set, picked images that don't already match this aspect ratio (within
   * a small tolerance) open a cropper before upload. Use the same ratio as the
   * place that renders the image — service cards on /book are 4:3, so passing
   * `4 / 3` here forces the salon owner to frame their photo the way it'll be
   * rendered. Leave undefined for free-form uploads (logos, hero images, etc).
   */
  cropAspect?: number;
  /** Pixel size of the cropped JPEG. Required when cropAspect is set. */
  cropOutputWidth?: number;
  cropOutputHeight?: number;
  /**
   * Reject sources smaller than this even before the cropper opens — cropping
   * a 320×240 photo just produces a blurry 1200×900 file.
   */
  minSourceWidth?: number;
  minSourceHeight?: number;

  /**
   * Run a browser-side compression pass before posting to /api/uploads.
   * Defaults to true. Files that are already small (<256 KB), animated GIFs,
   * SVGs, and PNGs with transparency are auto-bypassed inside compressImage —
   * see lib/compress-image.ts for the full bypass rules. Pass `false` if a
   * caller needs to upload bytes verbatim (e.g. importing a vendor logo whose
   * exact source bytes matter).
   */
  compress?: boolean;
}

export function ImageUploadField({
  name,
  value,
  onChange,
  label,
  hint,
  className,
  cropAspect,
  cropOutputWidth,
  cropOutputHeight,
  minSourceWidth,
  minSourceHeight,
  compress = true,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // When the cropper is open, we hold the picked file's blob URL + name so the
  // modal can render it. `pendingFileName` doubles as a feature flag.
  const [pending, setPending] = useState<{ src: string; fileName: string } | null>(
    null
  );

  // Aspect ratios within ±2% are treated as "already matches" so we don't
  // force the cropper on a photo that's already 4:3.
  const ASPECT_TOLERANCE = 0.02;

  /** Read intrinsic dimensions of a File without uploading. */
  function readDimensions(
    file: File
  ): Promise<{ width: number; height: number; objectUrl: string }> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          objectUrl,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not read image."));
      };
      img.src = objectUrl;
    });
  }

  async function uploadBlob(blob: Blob, fileName: string) {
    setUploading(true);
    try {
      // Wrap the blob as a File so compressImage can read .name/.type/.size.
      // For the as-is path the caller already has a File; for the cropper
      // path we get a fresh JPEG Blob — both work the same after this line.
      const sourceFile =
        blob instanceof File
          ? blob
          : new File([blob], fileName, { type: blob.type });

      // Browser-side compression pass. compressImage returns the original
      // File when nothing's worth doing (already small, GIF/SVG, transparent
      // PNG, or "compressed" output came out larger than the source), so on
      // those branches this is effectively free.
      const toUpload = compress
        ? await compressImage(sourceFile).catch(() => sourceFile)
        : sourceFile;

      const fd = new FormData();
      fd.append("file", toUpload);
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

    // GIFs preserve animation; cropping rasterizes a single frame, which is
    // almost certainly not what the user wants. Treat them as "as-is" uploads.
    const isAnimated = file.type === "image/gif";

    // Free-form mode (logos, hero, etc.): upload as-is.
    if (!cropAspect || isAnimated) {
      await uploadBlob(file, file.name);
      return;
    }

    // Crop mode: inspect dimensions before deciding whether to open the modal.
    let dims: { width: number; height: number; objectUrl: string };
    try {
      dims = await readDimensions(file);
    } catch {
      setError("Couldn't read this image — please try a different file.");
      return;
    }

    // Reject sources that are too small to crop without going blurry.
    if (
      (minSourceWidth && dims.width < minSourceWidth) ||
      (minSourceHeight && dims.height < minSourceHeight)
    ) {
      URL.revokeObjectURL(dims.objectUrl);
      setError(
        `Image is too small — please choose at least ${minSourceWidth ?? 0}×${
          minSourceHeight ?? 0
        }px.`
      );
      return;
    }

    // Skip the modal if the source is already at the target ratio AND big
    // enough — no point making the user click "Save crop" on a perfect file.
    const sourceAspect = dims.width / dims.height;
    const ratioOk =
      Math.abs(sourceAspect - cropAspect) / cropAspect < ASPECT_TOLERANCE;
    const bigEnough =
      cropOutputWidth ? dims.width >= cropOutputWidth : true;
    if (ratioOk && bigEnough) {
      URL.revokeObjectURL(dims.objectUrl);
      await uploadBlob(file, file.name);
      return;
    }

    // Otherwise open the cropper. The modal owns the objectUrl until close.
    setPending({ src: dims.objectUrl, fileName: file.name });
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

  function closeCropper() {
    if (pending) URL.revokeObjectURL(pending.src);
    setPending(null);
  }

  async function handleCropConfirm(blob: Blob, fileName: string) {
    closeCropper();
    await uploadBlob(blob, fileName);
  }

  // Pick the preview's aspect class based on the configured crop. When
  // cropAspect is set we want the preview to mirror what the user just saved.
  const previewAspect =
    cropAspect && Math.abs(cropAspect - 4 / 3) < 0.01
      ? "aspect-[4/3]"
      : cropAspect && Math.abs(cropAspect - 16 / 9) < 0.01
        ? "aspect-[16/9]"
        : "aspect-[16/9] sm:aspect-[4/3]";

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
            className={`h-auto w-full object-cover object-top ${previewAspect}`}
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

      {pending && cropAspect && cropOutputWidth && cropOutputHeight ? (
        <ImageCropperModal
          src={pending.src}
          fileName={pending.fileName}
          aspect={cropAspect}
          outputWidth={cropOutputWidth}
          outputHeight={cropOutputHeight}
          onConfirm={handleCropConfirm}
          onCancel={closeCropper}
        />
      ) : null}
    </div>
  );
}
