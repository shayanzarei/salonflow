"use client";

import { Button } from "@/components/ds/Button";
import { Modal } from "@/components/ds/Modal";
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
      <div className="overflow-hidden rounded-lg bg-danger-50">
        <div className="border-b border-danger-600/20 px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-danger-700">Danger zone</h2>
          <p className="mt-0.5 text-caption text-danger-600">
            Irreversible actions — proceed with caution.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
          <div>
            <p className="text-body-sm font-medium text-ink-900">
              Permanently delete this tenant
            </p>
            <p className="mt-0.5 text-caption text-ink-500">
              Deletes{" "}
              <span className="font-semibold text-ink-700">{tenantName}</span>{" "}
              and all associated data: bookings, clients, services, staff,
              gallery, notifications, tokens, and Stripe subscription. This
              cannot be undone.
            </p>
          </div>
          <Button
            type="button"
            onClick={openDialog}
            variant="danger"
            size="sm"
            className="shrink-0"
          >
            Delete tenant
          </Button>
        </div>
      </div>

      {/* ── Confirmation dialog ───────────────────────────────────────────── */}
      <Modal open={open} onClose={closeDialog} size="sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-danger-50 text-2xl">
          ⚠️
        </div>
        <h2 className="text-h3 font-bold text-ink-900">
          Delete {tenantName}?
        </h2>
        <p className="mt-2 text-body-sm leading-relaxed text-ink-500">
          You are about to permanently erase this tenant account and{" "}
          <span className="font-semibold text-danger-600">all its data</span>.
          Stripe subscription will be cancelled immediately. This action is{" "}
          <span className="font-semibold text-danger-600">irreversible</span>.
        </p>

        <div className="mt-5">
          <label className="mb-1.5 block text-caption font-medium text-ink-500">
            Type{" "}
            <span className="rounded-sm bg-ink-100 px-1.5 py-0.5 font-mono text-caption font-semibold text-ink-900">
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
            className="min-h-10 w-full rounded-sm border border-ink-200 bg-ink-0 px-4 text-body-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-danger-600 focus-visible:shadow-focus focus-visible:outline-none"
          />
        </div>

        {error ? (
          <p className="mt-3 text-body-sm font-medium text-danger-600">{error}</p>
        ) : null}

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
            {loading ? "Deleting…" : "Delete permanently"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
