"use client";

/**
 * Self-contained, zero-dependency image cropper.
 *
 * Why this exists: service-card photos must be a fixed aspect ratio (the
 * booking page renders every card at 4:3) but salon owners upload anything —
 * portraits, square logos, panoramas. This modal forces them to pick the
 * framing before we accept the image. The cropped output is a JPEG Blob the
 * caller can wrap in a File and POST to /api/uploads.
 *
 * The interaction model:
 *   - The picked image is shown inside a viewport overlay sized to `aspect`.
 *   - User drags the image to pan, uses the zoom slider to zoom.
 *   - "Save crop" → we draw the visible viewport region into an offscreen
 *     <canvas> at `outputWidth × outputHeight` and resolve a JPEG Blob.
 */

import { useMemo, useRef, useState } from "react";

interface ImageCropperModalProps {
  /** Object URL or data URL of the picked image. */
  src: string;
  /** Original filename — used to derive the cropped file name. */
  fileName: string;
  /** Aspect ratio of the crop viewport. e.g. 4/3. */
  aspect: number;
  /** Pixel size of the resulting JPEG. */
  outputWidth: number;
  outputHeight: number;
  /** JPEG quality, 0..1 — defaults to 0.9. */
  quality?: number;
  /** User confirmed crop. Receives a JPEG Blob plus the suggested filename. */
  onConfirm: (blob: Blob, fileName: string) => void;
  /** User dismissed the modal without saving. */
  onCancel: () => void;
}

const VIEWPORT_WIDTH = 480; // CSS pixels; viewport height is derived from aspect

export function ImageCropperModal({
  src,
  fileName,
  aspect,
  outputWidth,
  outputHeight,
  quality = 0.9,
  onConfirm,
  onCancel,
}: ImageCropperModalProps) {
  const viewportHeight = Math.round(VIEWPORT_WIDTH / aspect);

  // Natural image dims, set once the image loads.
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);

  // The smallest zoom that still covers the viewport (no letterboxing).
  const minZoom = useMemo(() => {
    if (!imgW || !imgH) return 1;
    return Math.max(VIEWPORT_WIDTH / imgW, viewportHeight / imgH);
  }, [imgW, imgH, viewportHeight]);
  const maxZoom = useMemo(() => Math.max(minZoom * 4, 4), [minZoom]);

  // Current zoom (CSS scale of the rendered image inside the viewport).
  const [zoom, setZoom] = useState(1);
  // Top-left offset of the rendered image inside the viewport, in CSS pixels.
  // Negative values are normal — the image is larger than the viewport.
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  /**
   * Initialise zoom + offset once we know the image's natural size.
   * Called from the <img>'s onLoad handler — doing it here (event-driven)
   * instead of a derived useEffect avoids the cascading-render warning under
   * React 19's stricter rules.
   */
  function initFromDimensions(naturalW: number, naturalH: number) {
    setImgW(naturalW);
    setImgH(naturalH);
    const z = Math.max(VIEWPORT_WIDTH / naturalW, viewportHeight / naturalH);
    setZoom(z);
    const renderedW = naturalW * z;
    const renderedH = naturalH * z;
    setOffset({
      x: (VIEWPORT_WIDTH - renderedW) / 2,
      y: (viewportHeight - renderedH) / 2,
    });
  }

  // Keep the image inside the viewport — never let the viewport see whitespace.
  function clampOffset(
    next: { x: number; y: number },
    z: number
  ): { x: number; y: number } {
    const renderedW = imgW * z;
    const renderedH = imgH * z;
    const minX = VIEWPORT_WIDTH - renderedW; // most negative x allowed
    const minY = viewportHeight - renderedH;
    return {
      x: Math.min(0, Math.max(minX, next.x)),
      y: Math.min(0, Math.max(minY, next.y)),
    };
  }

  // ── Pointer-based panning ──
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent) {
    if (!imgW) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(
        { x: dragRef.current.baseX + dx, y: dragRef.current.baseY + dy },
        zoom
      )
    );
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  // ── Zoom slider ──
  function onZoomChange(next: number) {
    // Re-anchor zoom around the viewport centre so the user doesn't see the
    // image jump to a corner when they drag the slider.
    const cx = VIEWPORT_WIDTH / 2;
    const cy = viewportHeight / 2;
    const imageX = (cx - offset.x) / zoom;
    const imageY = (cy - offset.y) / zoom;
    const newOffset = {
      x: cx - imageX * next,
      y: cy - imageY * next,
    };
    setZoom(next);
    setOffset(clampOffset(newOffset, next));
  }

  // ── Save: rasterize the current viewport into a JPEG Blob ──
  async function handleSave() {
    if (!imgW || !imgH) return;
    // The portion of the *natural* image currently visible in the viewport.
    const sourceX = -offset.x / zoom;
    const sourceY = -offset.y / zoom;
    const sourceW = VIEWPORT_WIDTH / zoom;
    const sourceH = viewportHeight / zoom;

    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      onCancel();
      return;
    }
    // High-quality downscale.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await new Promise<void>((resolve, reject) => {
      if (img.complete) {
        resolve();
        return;
      }
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load"));
    });

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceW,
      sourceH,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onCancel();
          return;
        }
        const base = fileName.replace(/\.[^.]+$/, "");
        onConfirm(blob, `${base}-cropped.jpg`);
      },
      "image/jpeg",
      quality
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crop image"
      className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        // Click on the backdrop closes — but not clicks inside the panel.
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-3">
          <h2 className="text-body font-semibold text-ink-900">
            Crop your photo
          </h2>
          <p className="mt-1 text-caption text-ink-500">
            Drag to position, then save. The grey area outside the box will be
            trimmed.
          </p>
        </div>

        {/* Stage */}
        <div
          ref={stageRef}
          className="relative mx-auto touch-none select-none overflow-hidden rounded-md bg-ink-900"
          style={{ width: VIEWPORT_WIDTH, height: viewportHeight, maxWidth: "100%" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              initFromDimensions(el.naturalWidth, el.naturalHeight);
            }}
            style={{
              position: "absolute",
              left: offset.x,
              top: offset.y,
              width: imgW * zoom,
              height: imgH * zoom,
              maxWidth: "none",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-caption text-ink-500">Zoom</span>
          <input
            type="range"
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="flex-1 accent-brand-600"
            aria-label="Zoom"
            disabled={!imgW}
          />
        </div>

        {/* Buttons */}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-ink-200 bg-white px-4 py-2 text-body-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!imgW}
            className="rounded-md bg-brand-600 px-4 py-2 text-body-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Save crop
          </button>
        </div>
      </div>
    </div>
  );
}
