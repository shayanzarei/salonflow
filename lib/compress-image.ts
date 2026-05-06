/**
 * Browser-side image compression for uploads.
 *
 * Why this exists: salon owners regularly drop 10 MB phone photos into the
 * upload field. They take forever to upload over hotel Wi-Fi, eat Vercel Blob
 * storage, and then `next/image` has to optimize a giant source on every cache
 * miss. The whole pipeline gets cheaper if we shrink the file *before* it
 * leaves the browser.
 *
 * Behaviour, in order:
 *   1. Pass-through for formats we can't or shouldn't re-encode safely:
 *      GIF (preserve animation), SVG (vector — would lose data), and very
 *      small files (< MIN_BYTES). Also honours `disabled: true`.
 *   2. Decode the image with EXIF orientation respected — phone portraits
 *      arrive flagged as landscape with an orientation tag; we need the
 *      *rotated* pixels in the canvas, not the raw sensor read.
 *   3. If the source is already smaller than the long-edge cap on both axes,
 *      skip the resize but still consider re-encoding.
 *   4. Detect transparency by sampling the decoded pixels. If alpha < 255
 *      anywhere, stay on PNG (turning a transparent logo into JPEG would
 *      paint the background black/white). Otherwise re-encode to JPEG.
 *   5. If the "compressed" output is larger than the original (rare — happens
 *      for already-optimised JPEGs at high quality), return the original.
 *
 * Returns the original `File` reference when nothing changed, so callers can
 * cheaply check `result === input` to log "no compression needed".
 */

const MIN_BYTES = 256 * 1024; // 256 KB — below this, compressing rarely helps
const MAX_LONG_EDGE = 1600; // px — covers retina hero rendering on most pages
const JPEG_QUALITY = 0.85;

const PASSTHROUGH_TYPES = new Set([
  "image/gif", // animated, would lose frames
  "image/svg+xml", // vector, must not be rasterised
]);

export interface CompressOptions {
  /** Skip compression entirely. Useful for callers that need the raw bytes. */
  disabled?: boolean;
  /** Override the long-edge cap. Defaults to 1600 px. */
  maxLongEdge?: number;
  /** JPEG quality, 0..1. Defaults to 0.85. */
  quality?: number;
}

/**
 * Decode a File into an ImageBitmap with EXIF orientation applied. Falls back
 * to a plain <img> + canvas decode for browsers that don't yet support
 * `imageOrientation: 'from-image'` (older Safari).
 */
async function decodeOriented(file: File): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close: () => void;
}> {
  // Modern path: createImageBitmap with EXIF rotation baked in.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        close: () => bitmap.close(),
      };
    } catch {
      // Some browsers (older Safari) don't support imageOrientation. Try
      // again without the option — the rotation will be wrong, but we'll fall
      // through to the <img> path below for a second attempt.
    }
  }

  // Fallback: <img> with a blob: URL. Browsers honour EXIF orientation when
  // *rendering* an <img>, so drawing the rendered <img> to canvas comes out
  // upright on every modern engine.
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      close: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/** Sample canvas pixels to determine whether any are non-opaque. */
function hasTransparency(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // For speed: sample every 8th pixel. Logos with transparency are full of
  // alpha-zero pixels, so a sparse sweep finds them immediately. This avoids
  // walking 4 MB of pixel data on a 1600×1600 image.
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4 * 8) {
    if (data[i] < 255) return true;
  }
  return false;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  if (options.disabled) return file;

  // Bypass for formats we shouldn't touch.
  if (PASSTHROUGH_TYPES.has(file.type)) return file;
  if (!file.type.startsWith("image/")) return file;

  // Tiny files: not worth the CPU.
  if (file.size < MIN_BYTES) return file;

  const maxLongEdge = options.maxLongEdge ?? MAX_LONG_EDGE;
  const quality = options.quality ?? JPEG_QUALITY;

  let decoded: Awaited<ReturnType<typeof decodeOriented>>;
  try {
    decoded = await decodeOriented(file);
  } catch {
    // If we can't decode it, hand the original to the server — at worst the
    // upload endpoint rejects it with a clear error message.
    return file;
  }

  try {
    // Decide on output dimensions.
    const long = Math.max(decoded.width, decoded.height);
    const scale = long > maxLongEdge ? maxLongEdge / long : 1;
    const targetW = Math.round(decoded.width * scale);
    const targetH = Math.round(decoded.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    decoded.draw(ctx, targetW, targetH);

    // Pick the output format. PNG with transparency must stay PNG; everything
    // else becomes JPEG (best size for photographs and flat illustrations).
    const isPng = file.type === "image/png";
    const keepPng = isPng && hasTransparency(ctx, targetW, targetH);
    const outType = keepPng ? "image/png" : "image/jpeg";
    const outQuality = keepPng ? undefined : quality;

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, outQuality)
    );
    if (!blob) return file;

    // If our "compressed" output is somehow larger than the source, keep the
    // original. Happens with already-optimised photographs at high quality.
    if (blob.size >= file.size) return file;

    // Build the new filename. Strip the existing extension and add the right
    // one for the new MIME so the server's extension check is happy.
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const ext = keepPng ? "png" : "jpg";
    return new File([blob], `${baseName}.${ext}`, {
      type: outType,
      lastModified: Date.now(),
    });
  } finally {
    decoded.close();
  }
}
