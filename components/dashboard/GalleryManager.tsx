"use client";

import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useState } from "react";

interface GalleryItem {
  id: string;
  before_url: string;
  after_url: string;
  caption: string | null;
}

export function GalleryManager({
  initialItems,
  brand,
}: {
  initialItems: GalleryItem[];
  brand: string;
}) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!beforeUrl.trim() || !afterUrl.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          before_url: beforeUrl.trim(),
          after_url: afterUrl.trim(),
          caption: caption.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      } else {
        const item = await res.json();
        setItems((prev) => [...prev, item]);
        setBeforeUrl("");
        setAfterUrl("");
        setCaption("");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <Card variant="outlined">
        <h2 className="mb-1 text-body font-semibold text-ink-900">Add before / after</h2>
        <p className="mb-4 text-caption text-ink-400">
          Paste a URL for the before image and one for the after image. These will be
          displayed side-by-side in the Gallery section of your booking site.
        </p>
        <form onSubmit={addItem} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ImageUploadField
              label="Before image"
              value={beforeUrl}
              onChange={setBeforeUrl}
              hint="Upload the before photo"
            />
            <ImageUploadField
              label="After image"
              value={afterUrl}
              onChange={setAfterUrl}
              hint="Upload the after photo"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                id="gallery-caption"
                type="text"
                placeholder="Caption (optional) — e.g. Balayage transformation"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !beforeUrl.trim() || !afterUrl.trim()}
              variant="primary"
              size="md"
              className="shrink-0"
              style={{ backgroundColor: brand }}
            >
              {saving ? "Saving…" : "Add"}
            </Button>
          </div>
          {error && <p className="text-body-sm text-danger-600">{error}</p>}
        </form>
      </Card>

      {/* Grid */}
      <Card variant="outlined" className="p-0">
        <div className="border-b border-ink-100 px-5 py-4 sm:px-6">
          <h2 className="text-body font-semibold text-ink-900">
            Gallery items
            <span className="ml-2 text-body-sm font-normal text-ink-400">
              ({items.length})
            </span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-12 text-center text-body-sm text-ink-400">
            No gallery items yet. Add a before/after pair above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-md border border-ink-100 bg-ink-50"
              >
                {/* Before / After images */}
                <div className="grid grid-cols-2">
                  <div className="relative">
                    <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-ink-0">
                      Before
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.before_url}
                      alt="Before"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                  <div className="relative">
                    <span
                      className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-ink-0"
                      style={{ backgroundColor: brand }}
                    >
                      After
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.after_url}
                      alt="After"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <p className="min-w-0 truncate text-caption text-ink-500">
                    {item.caption ?? "No caption"}
                  </p>
                  <Button
                    onClick={() => deleteItem(item.id)}
                    disabled={deletingId === item.id}
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-ink-400 hover:text-danger-600"
                  >
                    {deletingId === item.id ? "…" : "✕"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
