"use client";

import {
  ServiceActiveToggle,
  ServiceDurationField,
} from "@/components/dashboard/ServiceEditFormExtras";
import { getCategoryStyle, SERVICE_CATEGORIES } from "@/lib/service-categories";
import Link from "next/link";
import { useMemo, useState } from "react";

type StaffRow = {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
};

export function AddServiceForm({
  brand,
  staff,
}: {
  brand: string;
  staff: StaffRow[];
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [showOnSite, setShowOnSite] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());

  const previewStyle = useMemo(
    () => getCategoryStyle(category || null, name || "Service"),
    [category, name]
  );

  const priceNum = parseFloat(price);
  const priceDisplay =
    price && !Number.isNaN(priceNum) ? priceNum.toFixed(2) : "0.00";

  function toggleStaff(id: string) {
    setSelectedStaff((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const infoMessage =
    showOnSite && !Number.isNaN(priceNum)
      ? "Service will be immediately visible on your booking site after you publish (not when saved as draft)."
      : showOnSite
        ? "Turn on “Show on booking site” and set a price so clients can book this service online."
        : "This service stays hidden from your public booking site until you enable “Show on booking site” on the service page.";

  return (
    <form action="/api/services" method="POST">
      <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <section
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 20 }}>✂</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Basic Information
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Service Name
                </label>
                <input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Signature Haircut"
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "11px 14px",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Category
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "11px 14px",
                    fontSize: 14,
                    background: "white",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe what's included in this service..."
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "11px 14px",
                    fontSize: 14,
                    resize: "vertical",
                    boxSizing: "border-box",
                    minHeight: 100,
                  }}
                />
              </div>
            </div>
          </section>

          <section
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 20 }}>🏷</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Pricing &amp; Duration
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Price
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <span
                    style={{
                      padding: "0 12px",
                      fontSize: 14,
                      color: "#888",
                      fontWeight: 600,
                      borderRight: "1px solid #f0f0f0",
                      background: "#fafafa",
                      lineHeight: "44px",
                    }}
                  >
                    €
                  </span>
                  <input
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    style={{
                      flex: 1,
                      border: "none",
                      padding: "11px 12px",
                      fontSize: 14,
                      outline: "none",
                      minWidth: 0,
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "8px 0 0" }}>
                  Set the price customers will pay
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Duration
                </label>
                <ServiceDurationField
                  initial={durationMins}
                  brand={brand}
                  labelText={null}
                  borderedRow
                  inputSuffix="min"
                  quickSelectionTitle="Quick Selection"
                  required
                  onMinutesChangeAction={setDurationMins}
                />
                <p style={{ fontSize: 12, color: "#9ca3af", margin: "8px 0 0" }}>
                  How long does this service take?
                </p>
              </div>
            </div>
          </section>

          <section
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <span style={{ fontSize: 20 }}>⚙</span>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                Availability
              </h2>
            </div>

            <ServiceActiveToggle
              initial
              brand={brand}
              title="Show on booking site"
              subtitle="Customers can book this service online"
              onActiveChangeAction={setShowOnSite}
            />

            <div style={{ marginTop: 24 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 4,
                }}
              >
                Assign to staff
              </label>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 14px" }}>
                Select which staff members offer this service
              </p>
              {staff.length === 0 ? (
                <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                  Add staff in the Staff section first.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 10,
                  }}
                >
                  {staff.map((member, i) => {
                    const selected = selectedStaff.has(member.id);
                    const colors = [
                      "#7C3AED",
                      "#F59E0B",
                      "#10B981",
                      "#EC4899",
                      "#3B82F6",
                    ];
                    const color = colors[i % colors.length];
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleStaff(member.id)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          padding: "14px 10px",
                          borderRadius: 12,
                          border: selected
                            ? `2px solid ${brand}`
                            : "1px solid #f0f0f0",
                          background: selected ? `${brand}0a` : "#fafafa",
                          cursor: "pointer",
                        }}
                      >
                        {member.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatar_url}
                            alt=""
                            width={44}
                            height={44}
                            style={{
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: color,
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 16,
                              fontWeight: 700,
                            }}
                          >
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#111",
                            textAlign: "center",
                          }}
                        >
                          {member.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {Array.from(selectedStaff).map((id) => (
                <input key={id} type="hidden" name="staff_ids" value={id} />
              ))}
            </div>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 22,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#aaa",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                margin: "0 0 14px",
              }}
            >
              Preview
            </p>
            <div
              style={{
                borderRadius: 14,
                border: "1px solid #f0f0f0",
                padding: 20,
                background: "#fafafa",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  color: previewStyle.color,
                  background: previewStyle.bg,
                  padding: "4px 10px",
                  borderRadius: 100,
                  marginBottom: 12,
                }}
              >
                {previewStyle.icon}{" "}
                {category || "Hair Care"}
              </span>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#111",
                  margin: "0 0 8px",
                }}
              >
                {name || "Service name"}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.5,
                  margin: "0 0 16px",
                  minHeight: 40,
                }}
              >
                {description || "Description will appear here."}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 13, color: "#666" }}>
                  {durationMins} min
                </span>
                <span
                  style={{ fontSize: 16, fontWeight: 700, color: brand }}
                >
                  €{priceDisplay}
                </span>
              </div>
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: brand,
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "default",
                }}
              >
                Book
              </button>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#9ca3af",
                margin: "12px 0 0",
                textAlign: "center",
              }}
            >
              This is how customers will see your service
            </p>
          </div>

          <button
            type="submit"
            name="save_intent"
            value="publish"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: brand,
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✓ Save Service
          </button>

          <button
            type="submit"
            name="save_intent"
            value="draft"
            formNoValidate
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#111",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save as Draft
          </button>

          <Link
            href="/services"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 14,
              color: "#888",
              textDecoration: "none",
            }}
          >
            Cancel
          </Link>

          <div
            style={{
              borderRadius: 12,
              border: "1px solid #BFDBFE",
              background: "#EFF6FF",
              padding: "14px 16px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
            <p style={{ fontSize: 12, color: "#1e40af", margin: 0, lineHeight: 1.5 }}>
              {infoMessage}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
