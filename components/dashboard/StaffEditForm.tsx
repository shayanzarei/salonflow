"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const COLORS = [
  "#7C3AED",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#3B82F6",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const ROLES = [
  "Senior Stylist",
  "Colorist",
  "Junior Stylist",
  "Nail Technician",
  "Massage Therapist",
  "Receptionist",
  "Other",
];

interface StaffEditFormProps {
  staffId: string;
  tenantId: string;
  brand: string;
  hasPortal: boolean;
  initial: {
    name: string;
    role: string;
    email: string;
    phone: string;
    avatar_url: string;
    avatar_color: string;
    bio: string;
  };
}

export default function StaffEditForm({
  staffId,
  tenantId,
  brand,
  hasPortal,
  initial,
}: StaffEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [role, setRole] = useState(initial.role);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url);
  const [avatarColor, setAvatarColor] = useState(initial.avatar_color || brand);
  const [bio, setBio] = useState(initial.bio);
  const [loading, setLoading] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

  const labelStyle = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    marginBottom: 8,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("staff_id", staffId);
    formData.append("tenant_id", tenantId);
    formData.append("name", name);
    formData.append("role", role);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("avatar_url", avatarUrl);
    formData.append("avatar_color", avatarColor);
    formData.append("bio", bio);

    await fetch("/api/staff/update", { method: "POST", body: formData });
    router.push(`/staff/${staffId}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Personal Information */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 16 }}>👤</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Personal Information
              </h2>
            </div>

            {/* Avatar + color picker */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 20,
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: "0 0 10px",
                  }}
                >
                  Avatar Color
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: c,
                        border: avatarColor === c ? "2px solid white" : "none",
                        boxShadow:
                          avatarColor === c ? `0 0 0 2px ${c}` : "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {avatarColor === c && (
                        <span
                          style={{
                            color: "white",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Primary Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...inputStyle, appearance: "none" as const }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                  <option value={role}>
                    {ROLES.includes(role) ? "" : role}
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Phone Number{" "}
                    <span style={{ textTransform: "none", fontWeight: 400 }}>
                      (optional)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 16 }}>⚙️</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Additional Settings
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Custom Avatar URL</label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 14,
                      color: "#aaa",
                    }}
                  >
                    🔗
                  </span>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    style={{ ...inputStyle, paddingLeft: 36 }}
                  />
                </div>
                <p style={{ fontSize: 12, color: "#aaa", margin: "6px 0 0" }}>
                  Optional — paste a link to an external profile photo.
                  Overrides the colored circle.
                </p>
              </div>

              <div>
                <label style={labelStyle}>Bio / Internal Notes</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add a short bio or internal notes about this staff member..."
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "none" as const,
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "sticky",
            top: 80,
          }}
        >
          {/* Live preview */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#aaa",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 20px",
              }}
            >
              Live Preview
            </p>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 22,
                  margin: "0 auto 16px",
                  overflow: "hidden",
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initials
                )}
              </div>
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 4px",
                }}
              >
                {name || "Staff Name"}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: avatarColor,
                  margin: "0 0 6px",
                  fontWeight: 500,
                }}
              >
                {role || "Role"}
              </p>
              <p style={{ fontSize: 12, color: "#aaa", margin: "0 0 12px" }}>
                {email || "email@example.com"}
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "4px 12px",
                  borderRadius: 100,
                  background: hasPortal ? "#ECFDF5" : "#f5f5f5",
                  color: hasPortal ? "#059669" : "#999",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: hasPortal ? "#10B981" : "#ccc",
                  }}
                />
                Portal Access {hasPortal ? "Active" : "Not set"}
              </span>
            </div>
            {/* Actions */}
            <div
              style={{
                marginTop: 20,
              }}
            >
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: brand,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginBottom: 10,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "white",
                  color: "#555",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #FECACA",
              padding: 24,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#EF4444",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 8px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ⚠ Danger Zone
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#666",
                margin: "0 0 16px",
                lineHeight: 1.6,
              }}
            >
              Permanently delete this staff member and all their data.{" "}
              <strong style={{ color: "#111" }}>
                This action cannot be undone.
              </strong>
            </p>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Are you sure? This cannot be undone.")) return;
                const fd = new FormData();
                fd.append("id", staffId);
                fd.append("tenant_id", tenantId);
                await fetch("/api/staff/delete", { method: "POST", body: fd });
                window.location.href = "/staff";
              }}
              style={{
                width: "100%",
                padding: "11px",
                background: "white",
                color: "#EF4444",
                border: "1px solid #FECACA",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              🗑 Delete Staff Member
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
