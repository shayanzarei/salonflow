"use client";

import { Avatar } from "@/components/ds/Avatar";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import { TrashIcon, UserIcon } from "@/components/ui/Icons";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
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
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* Personal Information */}
          <Card variant="outlined" className="p-7">
            <div className="mb-6 flex items-center gap-2">
              <UserIcon size={16} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Personal Information
              </h2>
            </div>

            {/* Avatar + color picker */}
            <div className="mb-6 flex items-center gap-6">
              <Avatar
                name={name || "?"}
                src={avatarUrl}
                size="lg"
                className="h-16 w-16 flex-shrink-0 text-xl font-bold text-white"
                style={{ background: avatarColor }}
              />
              <div>
                <p className="mb-2.5 text-caption font-semibold uppercase tracking-wider text-ink-400">
                  Avatar Color
                </p>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full"
                      style={{
                        background: c,
                        border: avatarColor === c ? "2px solid white" : "none",
                        boxShadow:
                          avatarColor === c ? `0 0 0 2px ${c}` : "none",
                      }}
                    >
                      {avatarColor === c && (
                        <span className="text-caption font-bold text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              <Input
                id="staff-edit-name"
                type="text"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Select
                id="staff-edit-role"
                label="Primary Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                {!ROLES.includes(role) && role ? (
                  <option value={role}>{role}</option>
                ) : null}
              </Select>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Input
                  id="staff-edit-email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  id="staff-edit-phone"
                  type="tel"
                  label="Phone Number (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Additional Settings */}
          <Card variant="outlined" className="p-7">
            <div className="mb-6 flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <h2 className="text-body font-semibold text-ink-900">
                Additional Settings
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <ImageUploadField
                label="Profile photo"
                value={avatarUrl}
                onChange={setAvatarUrl}
                hint="Optional — upload a profile photo. Overrides the colored circle."
              />

              <Textarea
                id="staff-edit-bio"
                label="Bio / Internal Notes"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Add a short bio or internal notes about this staff member..."
                rows={4}
              />
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="sticky top-20 flex flex-col gap-4">
          {/* Live preview */}
          <Card variant="outlined">
            <p className="mb-5 text-caption font-semibold uppercase tracking-wider text-ink-400">
              Live Preview
            </p>
            <div className="text-center">
              <Avatar
                name={name || "?"}
                src={avatarUrl}
                size="xl"
                className="mx-auto mb-4 h-[72px] w-[72px] text-[22px] font-bold text-white"
                style={{ background: avatarColor }}
              />
              <p className="mb-1 text-body-lg font-bold text-ink-900">
                {name || "Staff Name"}
              </p>
              <p
                className="mb-1.5 text-body-sm font-medium"
                style={{ color: avatarColor }}
              >
                {role || "Role"}
              </p>
              <p className="mb-3 text-caption text-ink-400">
                {email || "email@example.com"}
              </p>
              <Badge variant={hasPortal ? "success" : "neutral"} dot>
                Portal Access {hasPortal ? "Active" : "Not set"}
              </Badge>
            </div>
            {/* Actions */}
            <div className="mt-5 space-y-2.5">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                size="lg"
                className="w-full"
                style={{ backgroundColor: brand }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                onClick={() => router.back()}
                variant="secondary"
                size="md"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </Card>

          {/* Danger zone */}
          <Card variant="outlined" className="bg-danger-50">
            <p className="mb-2 flex items-center gap-1.5 text-caption font-bold uppercase tracking-wider text-danger-600">
              ⚠ Danger Zone
            </p>
            <p className="mb-4 text-body-sm leading-relaxed text-ink-600">
              Permanently delete this staff member and all their data.{" "}
              <strong className="text-ink-900">
                This action cannot be undone.
              </strong>
            </p>
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full justify-center text-danger-600"
              onClick={async () => {
                if (!confirm("Are you sure? This cannot be undone.")) return;
                const fd = new FormData();
                fd.append("id", staffId);
                fd.append("tenant_id", tenantId);
                await fetch("/api/staff/delete", { method: "POST", body: fd });
                window.location.href = "/staff";
              }}
            >
              <TrashIcon size={15} /> Delete Staff Member
            </Button>
          </Card>
        </div>
      </div>
    </form>
  );
}
