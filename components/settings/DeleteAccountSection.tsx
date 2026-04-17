"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface Props {
  slug: string;
  tenantName: string;
}

/**
 * Danger-zone card shown at the bottom of Settings → Account & security.
 *
 * Implements GDPR Art. 17 (right to erasure) — lets the user permanently
 * delete their account and all associated data.
 *
 * A two-step confirmation dialog (type-to-confirm) guards against accidents.
 */
export default function DeleteAccountSection({ slug, tenantName }: Props) {
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
    if (confirmText.trim().toLowerCase() !== slug.toLowerCase()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText.trim() }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to delete account. Please try again.");
        setLoading(false);
        return;
      }

      // Account deleted — sign out and redirect to home page
      await signOut({ callbackUrl: "/?deleted=1" });
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isConfirmed = confirmText.trim().toLowerCase() === slug.toLowerCase();

  return (
    <>
      {/* ── Danger zone card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-red-100 bg-red-50/40 p-6">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-red-600/80">
          Permanently delete your account and all data. This is irreversible
          and required by GDPR if you request erasure of your information.
        </p>

        <div className="mt-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-white px-4 py-4">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Delete account and all data
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Removes your account, workspace, bookings, clients, and all
              associated data. This action cannot be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={openDialog}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
          >
            Delete account
          </button>
        </div>
      </div>

      {/* ── Confirmation dialog ───────────────────────────────────────────── */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon + title */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl">
              🗑️
            </div>
            <h2 className="text-lg font-bold text-gray-900">
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              This will permanently erase{" "}
              <span className="font-semibold text-gray-700">{tenantName}</span>{" "}
              and all its data — bookings, clients, services, invoices, and
              everything else. There is{" "}
              <span className="font-semibold text-red-600">no way to undo</span>{" "}
              this.
            </p>

            {/* Confirmation input */}
            <div className="mt-5">
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Type{" "}
                <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-800">
                  {slug}
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
                placeholder={slug}
                autoFocus
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-red-400"
              />
            </div>

            {error ? (
              <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
            ) : null}

            {/* Actions */}
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
                className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ backgroundColor: "#dc2626" }}
              >
                {loading ? "Deleting…" : "Yes, delete everything"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
