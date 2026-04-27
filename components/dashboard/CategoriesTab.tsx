"use client";

import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export function CategoriesTab({
  initialCategories,
  brand,
  redirectTo,
}: {
  initialCategories: Category[];
  brand: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      } else {
        const cat = await res.json();
        setCategories((prev) => [...prev, cat]);
        setName("");
        setDescription("");
        if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
          router.push(redirectTo);
          return;
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/categories/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <Card variant="outlined">
        <h2 className="mb-4 text-body font-semibold text-ink-900">Add category</h2>
        <form onSubmit={addCategory} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                id="category-name"
                type="text"
                placeholder="Category name (e.g. Bridal, Men's Grooming)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={saving || !name.trim()}
              variant="primary"
              size="md"
              className="shrink-0"
              style={{ backgroundColor: brand }}
            >
              {saving ? "Saving…" : "Add"}
            </Button>
          </div>
          <Input
            id="category-description"
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p className="text-body-sm text-danger-600">{error}</p>}
        </form>
      </Card>

      {/* List */}
      <Card variant="outlined" className="p-0">
        <div className="border-b border-ink-100 px-5 py-4 sm:px-6">
          <h2 className="text-body font-semibold text-ink-900">
            Your categories
            <span className="ml-2 text-body-sm font-normal text-ink-400">
              ({categories.length})
            </span>
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-body-sm text-ink-400">
            No categories yet. Add one above to start organising your services.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-ink-900">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-0.5 truncate text-caption text-ink-400">
                      {cat.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => deleteCategory(cat.id)}
                  disabled={deletingId === cat.id}
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                >
                  {deletingId === cat.id ? "…" : "Delete"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
