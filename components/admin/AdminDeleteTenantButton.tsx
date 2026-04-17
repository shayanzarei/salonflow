"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
}

/**
 * Super-admin "Delete tenant" danger button with two-step confirmation.
 * Calls DELETE /api/admin/tenants/[id] and redirects to /admin/tenants on success.
 */
export default function AdminDeleteTenantButton({
  tenantId,
  tenantName,
  tenantSlug,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openDialog() {
    setConfirmText("");
    setError("");
    setOpen(true);
  }

  function closeDialog() {
    if (loading) return;
    setOpen(false);
    setConfirmText("");
    setError("");
  }

  async function handleDelete() {
    if (confirmText.trim().toLowerCase() !== tenantSlug.toLowerCase()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to delete tenant. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/admin/tenants");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isConfirmed =
    confirmText.trim().toLowerCase() === tenantSlug.toLowerCase();

  return (
    <>
      {/* ── Danger zone card ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-red-200 bg-red-50/50">
        <div className="border-b border-red-200 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-red-700">Danger zone</h2>
          <p className="mt-0.5 text-xs text-red-500">
            Irreversible actions — proceed with caution.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Permanently delete this tenant
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Deletes{" "}
              <span className="font-semibold text-gray-700">{tenantName}</span>{" "}
              and all associated data: bookings, clients, services, staff,
              gallery, notifications, tokens, and Stripe subscription. This
              cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={openDialog}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Delete tenant
          </button>
        </div>
      </div>

      {/* ── Confirmation dialog ───────────────────────────────────────────── */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Delete {tenantName}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              You are about to permanently erase this tenant account and{" "}
              <span className="font-semibold text-red-600">all its data</span>.
              Stripe subscription will be cancelled immediately. This action is{" "}
              <span className="font-semibold text-red-600">irreversible</span>.
            </p>

            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Type{" "}
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-800">
                  {tenantSlug}
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isConfirmed && !loading) {
                    void handleDelete();
                  }
                }}
                placeholder={tenantSlug}
                autoFocus
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-red-400"
              />
            </div>

            {error ? (
              <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
            ) : null}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || loading}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
