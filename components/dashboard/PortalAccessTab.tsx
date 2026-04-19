"use client";

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
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          padding: 32,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px",
            }}
          >
            🔒
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 8px",
            }}
          >
            No Portal Access
          </h3>
          <p style={{ fontSize: 14, color: "#888", margin: 0, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
            This team member cannot log in until they choose their own password.
            We will email them a secure link — you cannot set their password here.
          </p>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#aaa",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 16px",
            }}
          >
            Enable portal by email
          </p>

          <div
            style={{
              background: "#EEF2FF",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 16, color: brand, flexShrink: 0 }}>ℹ</span>
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
              They will log in with:{" "}
              <strong style={{ color: brand }}>{staffEmail}</strong>
            </p>
          </div>

          {sendError ? (
            <p
              style={{
                fontSize: 13,
                color: "#EF4444",
                margin: "0 0 12px",
              }}
            >
              ⚠ {sendError}
            </p>
          ) : null}
          {sendSuccess ? (
            <p
              style={{
                fontSize: 13,
                color: "#10B981",
                margin: "0 0 12px",
              }}
            >
              ✓ {sendSuccess}
            </p>
          ) : null}

          <button
            type="button"
            disabled={sendLoading}
            onClick={() => void handleSendSetupEmail()}
            style={{
              width: "100%",
              padding: "14px",
              background: brand,
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: sendLoading ? "wait" : "pointer",
              opacity: sendLoading ? 0.75 : 1,
            }}
          >
            {sendLoading ? "Sending…" : "Email password setup link"}
          </button>

          <p
            style={{
              fontSize: 12,
              color: "#aaa",
              textAlign: "center",
              margin: "14px 0 0",
            }}
          >
            Link expires after 7 days. You can resend a new link anytime.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px 28px", borderBottom: "1px solid #f5f5f5" }}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 4px",
          }}
        >
          Staff Portal Access
        </h2>
        <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
          Password changes are always done by the staff member via email link.
        </p>
      </div>

      <div
        style={{
          background: "#ECFDF5",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 12,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>
            Portal Access Active
          </span>
        </div>
      </div>

      <div
        style={{
          padding: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#111",
              margin: "0 0 16px",
            }}
          >
            Login
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 16, color: "#aaa" }}>✉</span>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    margin: "0 0 2px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 500,
                  }}
                >
                  Email (username)
                </p>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  {staffEmail}
                </p>
              </div>
            </div>
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16, color: "#aaa" }}>🔑</span>
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      margin: "0 0 2px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 500,
                    }}
                  >
                    Password
                  </p>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#111",
                      margin: 0,
                      letterSpacing: "0.1em",
                    }}
                  >
                    ••••••••
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleSendSetupEmail()}
                disabled={sendLoading}
                style={{
                  fontSize: 13,
                  color: brand,
                  background: "none",
                  border: "none",
                  cursor: sendLoading ? "wait" : "pointer",
                  fontWeight: 500,
                  opacity: sendLoading ? 0.6 : 1,
                }}
              >
                {sendLoading ? "Sending…" : "Email reset link"}
              </button>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#EF4444",
                margin: "0 0 12px",
              }}
            >
              Danger Zone
            </h3>
            <div
              style={{
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  margin: "0 0 12px",
                  lineHeight: 1.6,
                }}
              >
                This will prevent the staff member from logging in to the portal.
              </p>
              <button
                type="button"
                onClick={handleRevoke}
                style={{
                  padding: "9px 18px",
                  background: "white",
                  color: "#EF4444",
                  border: "1px solid #FECACA",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Revoke Access
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#111",
              margin: "0 0 12px",
            }}
          >
            Password & access
          </h3>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 16px", lineHeight: 1.6 }}>
            To set a new password, send them a secure link. They complete the
            change themselves — you never see or type their password.
          </p>

          {sendError ? (
            <p style={{ fontSize: 13, color: "#EF4444", margin: "0 0 12px" }}>
              ⚠ {sendError}
            </p>
          ) : null}
          {sendSuccess ? (
            <p style={{ fontSize: 13, color: "#10B981", margin: "0 0 12px" }}>
              ✓ {sendSuccess}
            </p>
          ) : null}

          <button
            type="button"
            disabled={sendLoading}
            onClick={() => void handleSendSetupEmail()}
            style={{
              padding: "11px 24px",
              background: brand,
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: sendLoading ? "wait" : "pointer",
              opacity: sendLoading ? 0.75 : 1,
            }}
          >
            {sendLoading ? "Sending…" : "Email password setup link"}
          </button>

          {activity.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: "0 0 16px",
                }}
              >
                Recent Activity
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {activity.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 10,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#111",
                          margin: "0 0 2px",
                        }}
                      >
                        {item.action}
                      </p>
                      <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                        {item.device ?? "Unknown device"}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#aaa",
                        margin: 0,
                        flexShrink: 0,
                      }}
                    >
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
    </div>
  );
}
