"use client";

import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { useState } from "react";

interface Activity {
  id: string;
  action: string;
  device: string | null;
  created_at: string;
}

export default function PortalAccessTab({
  staffId,
  tenantId,
  staffEmail,
  staffName,
  hasPortal,
  brand,
  activity,
}: {
  staffId: string;
  tenantId: string;
  staffEmail: string;
  staffName: string;
  hasPortal: boolean;
  brand: string;
  activity: Activity[];
}) {
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  async function handleSendSetupEmail() {
    setSendError("");
    setSendSuccess("");
    setSendLoading(true);
    try {
      const res = await fetch("/api/staff/send-setup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, tenantId }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not send email.");
      }
      setSendSuccess(
        hasPortal
          ? "We sent them a link to set a new password."
          : "We sent them a link to set their password and enable portal access."
      );
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSendLoading(false);
    }
  }

  async function handleRevoke() {
    if (
      !confirm(
        `Revoke portal access for ${staffName}? They will no longer be able to log in.`
      )
    )
      return;
    const fd = new FormData();
    fd.append("staff_id", staffId);
    fd.append("tenant_id", tenantId);
    await fetch("/api/staff/revoke-portal", { method: "POST", body: fd });
    window.location.reload();
  }

  if (!hasPortal) {
    return (
      <Card variant="outlined" className="p-8">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ink-100 text-2xl">
            🔒
          </div>
          <h3 className="mb-2 text-body-lg font-bold text-ink-900">
            No Portal Access
          </h3>
          <p className="mx-auto max-w-md text-body-sm text-ink-500">
            This team member cannot log in until they choose their own password.
            We will email them a secure link — you cannot set their password here.
          </p>
        </div>

        <div className="mx-auto max-w-lg">
          <p className="mb-4 text-caption font-bold uppercase tracking-wider text-ink-400">
            Enable portal by email
          </p>

          <div className="mb-5 flex items-center gap-2.5 rounded-md bg-info-50 px-4 py-3">
            <span className="shrink-0 text-base" style={{ color: brand }}>
              ℹ
            </span>
            <p className="text-body-sm text-ink-700">
              They will log in with:{" "}
              <strong style={{ color: brand }}>{staffEmail}</strong>
            </p>
          </div>

          {sendError ? (
            <p className="mb-3 text-body-sm text-danger-600">⚠ {sendError}</p>
          ) : null}
          {sendSuccess ? (
            <p className="mb-3 text-body-sm text-success-600">✓ {sendSuccess}</p>
          ) : null}

          <Button
            type="button"
            disabled={sendLoading}
            onClick={() => void handleSendSetupEmail()}
            variant="primary"
            size="lg"
            className="w-full"
            style={{ backgroundColor: brand }}
          >
            {sendLoading ? "Sending…" : "Email password setup link"}
          </Button>

          <p className="mt-3.5 text-center text-caption text-ink-400">
            Link expires after 7 days. You can resend a new link anytime.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className="overflow-hidden p-0">
      <div className="border-b border-ink-100 px-7 py-5">
        <h2 className="mb-1 text-body font-bold text-ink-900">
          Staff Portal Access
        </h2>
        <p className="text-body-sm text-ink-500">
          Password changes are always done by the staff member via email link.
        </p>
      </div>

      <div className="flex items-center justify-between bg-success-50 px-7 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success-600 text-caption text-ink-0">
            ✓
          </div>
          <span className="text-body-sm font-semibold text-success-700">
            Portal Access Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 p-7 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-body font-semibold text-ink-900">Login</h3>

          <div className="mb-8 flex flex-col gap-2.5">
            <div className="flex items-center gap-3 rounded-md border border-ink-100 px-4 py-3.5">
              <span className="text-base text-ink-400">✉</span>
              <div>
                <p className="mb-0.5 text-caption font-medium uppercase tracking-wide text-ink-400">
                  Email (username)
                </p>
                <p className="text-body-sm font-medium text-ink-900">
                  {staffEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-ink-100 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-base text-ink-400">🔑</span>
                <div>
                  <p className="mb-0.5 text-caption font-medium uppercase tracking-wide text-ink-400">
                    Password
                  </p>
                  <p className="text-body-sm tracking-widest text-ink-900">
                    ••••••••
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleSendSetupEmail()}
                disabled={sendLoading}
                className="cursor-pointer border-none bg-transparent text-body-sm font-medium disabled:cursor-wait disabled:opacity-60"
                style={{ color: brand }}
              >
                {sendLoading ? "Sending…" : "Email reset link"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-body font-semibold text-danger-600">
              Danger Zone
            </h3>
            <div className="rounded-md bg-danger-50 p-4">
              <p className="mb-3 text-body-sm leading-relaxed text-ink-600">
                This will prevent the staff member from logging in to the portal.
              </p>
              <Button
                type="button"
                onClick={handleRevoke}
                variant="secondary"
                size="sm"
                className="text-danger-600"
              >
                Revoke Access
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-body font-semibold text-ink-900">
            Password &amp; access
          </h3>
          <p className="mb-4 text-body-sm leading-relaxed text-ink-600">
            To set a new password, send them a secure link. They complete the
            change themselves — you never see or type their password.
          </p>

          {sendError ? (
            <p className="mb-3 text-body-sm text-danger-600">⚠ {sendError}</p>
          ) : null}
          {sendSuccess ? (
            <p className="mb-3 text-body-sm text-success-600">✓ {sendSuccess}</p>
          ) : null}

          <Button
            type="button"
            disabled={sendLoading}
            onClick={() => void handleSendSetupEmail()}
            variant="primary"
            size="md"
            style={{ backgroundColor: brand }}
          >
            {sendLoading ? "Sending…" : "Email password setup link"}
          </Button>

          {activity.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-body font-semibold text-ink-900">
                Recent Activity
              </h3>
              <div className="flex flex-col gap-2">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-ink-100 px-4 py-3"
                  >
                    <div>
                      <p className="mb-0.5 text-body-sm font-medium text-ink-900">
                        {item.action}
                      </p>
                      <p className="text-caption text-ink-400">
                        {item.device ?? "Unknown device"}
                      </p>
                    </div>
                    <p className="shrink-0 text-caption text-ink-400">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      ,{" "}
                      {new Date(item.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
