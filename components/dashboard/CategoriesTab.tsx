"use client";

import { useState } from "react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export function CategoriesTab({
  initialCategories,
  brand,
}: {
  initialCategories: Category[];
  brand: string;
}) {
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
      <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Add category</h2>
        <form onSubmit={addCategory} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Category name (e.g. Bridal, Men's Grooming)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="min-h-11 flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: brand }}
            >
              {saving ? "Saving…" : "Add"}
            </button>
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-purple-400 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-gray-900">
            Your categories
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({categories.length})
            </span>
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            No categories yet. Add one above to start organising your services.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  {cat.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {cat.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  disabled={deletingId === cat.id}
                  className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-red-200 hover:text-red-500 disabled:opacity-40"
                >
                  {deletingId === cat.id ? "…" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
