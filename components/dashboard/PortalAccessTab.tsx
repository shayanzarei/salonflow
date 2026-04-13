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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // password strength
  function getStrength(pwd: string) {
    if (pwd.length === 0) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }

  const strength = getStrength(password);
  const strengthLabels = ["", "Weak", "Medium", "Strong", "Very Strong"];
  const strengthColors = ["", "#EF4444", "#F59E0B", "#7C3AED", "#10B981"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("staff_id", staffId);
    fd.append("tenant_id", tenantId);
    fd.append("password", password);

    await fetch("/api/staff/set-password", { method: "POST", body: fd });
    setSuccess(
      hasPortal ? "Password updated successfully" : "Portal access enabled"
    );
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
    setTimeout(() => window.location.reload(), 1000);
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

  const inputStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    color: "#111",
    background: "white",
    outline: "none",
    boxSizing: "border-box" as const,
  };

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
        {/* No access state */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
          <p style={{ fontSize: 14, color: "#888", margin: 0 }}>
            This staff member cannot log in yet. Set a password to enable
            access.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: 480, margin: "0 auto" }}
        >
          {/* Section label */}
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
            Enable Portal Access
          </p>

          {/* Info box */}
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
              Staff will log in using their email:{" "}
              <strong style={{ color: brand }}>{staffEmail}</strong>
            </p>
          </div>

          {/* Password inputs */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#111",
                marginBottom: 8,
              }}
            >
              Create Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#aaa",
                }}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 500,
                color: "#111",
                marginBottom: 8,
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#aaa",
                }}
              >
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {password.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 100,
                      background:
                        strength >= level
                          ? strengthColors[strength]
                          : "#e5e7eb",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: strengthColors[strength],
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {strengthLabels[strength]}
              </p>
            </div>
          )}

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "#EF4444",
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ⚠ {error}
            </p>
          )}

          {success && (
            <p
              style={{
                fontSize: 13,
                color: "#10B981",
                margin: "0 0 12px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ✓ {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: brand,
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 12,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Enabling..." : "Enable Portal Access"}
          </button>

          <p
            style={{
              fontSize: 12,
              color: "#aaa",
              textAlign: "center",
              margin: 0,
            }}
          >
            Note: Staff member will receive login instructions via email
          </p>
        </form>
      </div>
    );
  }

  // Portal active state
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
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
          Manage login access for this staff member
        </p>
      </div>

      {/* Active banner */}
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
        <span style={{ fontSize: 13, color: "#888" }}>
          Last login: recently
        </span>
      </div>

      <div
        style={{
          padding: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        {/* Left: credentials + danger */}
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#111",
              margin: "0 0 16px",
            }}
          >
            Login Credentials
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
                  Email (Username)
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
                style={{
                  fontSize: 13,
                  color: brand,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Change
              </button>
            </div>
          </div>

          {/* Danger zone */}
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
                This will prevent the staff member from logging in to the
                portal.
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

        {/* Right: update password + activity */}
        <div>
          <form onSubmit={handleSubmit}>
            <h3
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: "0 0 16px",
              }}
            >
              Update Password
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
                {password.length > 0 && (
                  <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: 4,
                          borderRadius: 100,
                          background:
                            strength >= level
                              ? strengthColors[strength]
                              : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#555",
                    marginBottom: 8,
                  }}
                >
                  Confirm New Password
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#EF4444", margin: "0 0 12px" }}>
                ⚠ {error}
              </p>
            )}
            {success && (
              <p style={{ fontSize: 13, color: "#10B981", margin: "0 0 12px" }}>
                ✓ {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 24px",
                background: brand,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          {/* Recent activity */}
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
