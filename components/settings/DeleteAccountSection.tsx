"use client";

import { Button } from "@/components/ds/Button";
import { Modal } from "@/components/ds/Modal";
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
      <div className="rounded-lg border border-danger-600/20 bg-danger-50 p-6">
        <h2 className="text-body-sm font-semibold text-danger-700">Danger zone</h2>
        <p className="mt-1 text-body-sm text-danger-600">
          Permanently delete your account and all data. This is irreversible
          and required by GDPR if you request erasure of your information.
        </p>

        <div className="mt-5 flex items-start justify-between gap-4 rounded-md border border-danger-600/30 bg-ink-0 px-4 py-4">
          <div>
            <p className="text-body-sm font-medium text-ink-900">
              Delete account and all data
            </p>
            <p className="mt-0.5 text-caption text-ink-500">
              Removes your account, workspace, bookings, clients, and all
              associated data. This action cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            onClick={openDialog}
            variant="danger"
            size="sm"
            className="shrink-0"
          >
            Delete account
          </Button>
        </div>
      </div>

      {/* ── Confirmation dialog ───────────────────────────────────────────── */}
      <Modal open={open} onClose={closeDialog} size="sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-danger-50 text-2xl">
          🗑️
        </div>
        <h2 className="text-h3 font-bold text-ink-900">
          Delete your account?
        </h2>
        <p className="mt-2 text-body-sm leading-relaxed text-ink-500">
          This will permanently erase{" "}
          <span className="font-semibold text-ink-700">{tenantName}</span>{" "}
          and all its data — bookings, clients, services, invoices, and
          everything else. There is{" "}
          <span className="font-semibold text-danger-600">no way to undo</span>{" "}
          this.
        </p>

        {/* Confirmation input */}
        <div className="mt-5">
          <label className="mb-1.5 block text-caption font-medium text-ink-500">
            Type{" "}
            <span className="rounded-sm bg-ink-100 px-1.5 py-0.5 font-mono text-caption font-semibold text-ink-900">
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
            className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-danger-600 focus-visible:shadow-focus focus-visible:outline-none"
          />
        </div>

        {error ? (
          <p className="mt-3 text-body-sm font-medium text-danger-600">{error}</p>
        ) : null}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            onClick={closeDialog}
            disabled={loading}
            variant="secondary"
            size="md"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            variant="danger"
            size="md"
            className="flex-1"
          >
            {loading ? "Deleting…" : "Yes, delete everything"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
