"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function normalizeHex(input: string): string {
  let h = input.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (/^#([0-9A-Fa-f]{3})$/.test(h)) {
    const [, x] = h.match(/^#([0-9A-Fa-f]{3})$/)!;
    return `#${x[0]}${x[0]}${x[1]}${x[1]}${x[2]}${x[2]}`.toUpperCase();
  }
  if (/^#([0-9A-Fa-f]{6})$/.test(h)) return h.toUpperCase();
  return "#7C3AED";
}

type Props = {
  name: string;
  defaultValue: string;
  onColorChangeAction?: (hex: string) => void;
};

/**
 * Flexible brand color: native color input (full spectrum) + hex text field.
 * No preset swatch list.
 */
export function BrandingColorPicker({
  name,
  defaultValue,
  onColorChangeAction,
}: Props) {
  const initial = useMemo(
    () => normalizeHex(defaultValue || "#7C3AED"),
    [defaultValue]
  );
  const [hex, setHex] = useState(initial);

  const effectiveHex = /^#[0-9A-Fa-f]{6}$/i.test(hex)
    ? hex.toUpperCase()
    : initial;

  useEffect(() => {
    onColorChangeAction?.(effectiveHex);
  }, [effectiveHex, onColorChangeAction]);

  const onHexInput = useCallback((raw: string) => {
    const v = raw.trim();
    if (v === "" || v === "#") {
      setHex(v || "#");
      return;
    }
    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
      setHex(v);
    }
  }, []);

  const onHexBlur = useCallback(() => {
    setHex((h) => normalizeHex(h.length < 4 ? initial : h));
  }, [initial]);

  const colorInputValue = effectiveHex;

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={effectiveHex} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="sr-only">Pick brand color</span>
          <input
            type="color"
            value={colorInputValue}
            onChange={(e) => setHex(e.target.value.toUpperCase())}
            className="h-12 w-16 cursor-pointer rounded-md border border-ink-200 bg-ink-0 p-1 shadow-sm"
            title="Open color picker"
          />
        </label>
        <div className="flex min-w-[200px] flex-1 items-center gap-2">
          <span className="text-caption font-medium uppercase tracking-wide text-ink-400">
            Hex
          </span>
          <input
            type="text"
            value={hex}
            onChange={(e) => onHexInput(e.target.value)}
            onBlur={onHexBlur}
            placeholder="#7C3AED"
            spellCheck={false}
            autoComplete="off"
            className="min-h-10 flex-1 rounded-sm border border-ink-200 bg-ink-0 px-4 font-mono text-body-sm text-ink-900 hover:border-ink-300 focus-visible:border-brand-600 focus-visible:shadow-focus focus-visible:outline-none"
            aria-label="Brand color hex value"
          />
        </div>
      </div>
      <p className="text-caption text-ink-400">
        Use the swatch to open your system color picker, or type any{" "}
        <code className="rounded bg-ink-100 px-1">#RRGGBB</code> value.
      </p>
    </div>
  );
}
