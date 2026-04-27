"use client";

import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import { ScissorsIcon } from "@/components/ui/Icons";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
  ServiceActiveToggle,
  ServiceDurationField,
} from "@/components/dashboard/ServiceEditFormExtras";
import { getCategoryStyle } from "@/lib/service-categories";
import Link from "next/link";
import { useMemo, useState } from "react";

type StaffRow = {
  id: string;
  name: string;
  role: string;
  avatar_url: string | null;
};

type CategoryRow = {
  id: string;
  name: string;
};

export function AddServiceForm({
  brand,
  staff,
  categories = [],
  redirectTo = "",
}: {
  brand: string;
  staff: StaffRow[];
  categories?: CategoryRow[];
  redirectTo?: string;
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [showOnSite, setShowOnSite] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<Set<string>>(new Set());

  // For the preview chip: use custom category name if selected, otherwise infer from service name
  const previewStyle = useMemo(
    () => getCategoryStyle(null, name || "Service"),
    [name]
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

  const staffAccentColors = [
    "var(--color-brand-600)",
    "var(--color-warning-600)",
    "var(--color-success-600)",
    "var(--color-accent-500)",
    "var(--color-info-600)",
  ];

  return (
    <form action="/api/services" method="POST">
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2.5">
              <ScissorsIcon size={20} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Basic Information
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                id="add-service-name"
                type="text"
                name="name"
                label="Service Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Signature Haircut"
              />

              <div>
                <label className="mb-2 block text-label font-semibold text-ink-700">
                  Category
                </label>
                {categories.length > 0 ? (
                  <Select
                    id="add-service-category"
                    name="category_id"
                    value={categoryId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const selectedName = categories.find((c) => c.id === selectedId)?.name ?? "";
                      setCategoryId(selectedId);
                      setCategoryName(selectedName);
                    }}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="rounded-sm border border-ink-200 bg-ink-50 px-4 py-2.5 text-body-sm text-ink-400">
                    No categories yet —{" "}
                    <a
                      href="/services?tab=categories"
                      className="font-medium no-underline"
                      style={{ color: brand }}
                    >
                      create one first
                    </a>
                  </div>
                )}
              </div>

              <Textarea
                id="add-service-description"
                name="description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what's included in this service..."
              />

              <ImageUploadField
                name="image_url"
                label="Service image (optional)"
                value={imageUrl}
                onChange={setImageUrl}
                hint="Shown on your booking page service card"
              />
            </div>
          </Card>

          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="text-xl">🏷</span>
              <h2 className="text-body font-semibold text-ink-900">
                Pricing &amp; Duration
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-label font-semibold text-ink-700">
                  Price
                </label>
                <div className="flex items-center overflow-hidden rounded-sm border border-ink-200 bg-ink-0 focus-within:border-brand-600 focus-within:shadow-focus">
                  <span className="border-r border-ink-100 bg-ink-50 px-3 py-2.5 text-body-sm font-semibold leading-relaxed text-ink-500">
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
                    className="min-h-10 min-w-0 flex-1 border-none bg-transparent px-3 py-2.5 text-body-sm text-ink-900 outline-none"
                  />
                </div>
                <p className="mt-2 text-caption text-ink-400">
                  Set the price customers will pay
                </p>
              </div>

              <div>
                <label className="mb-2 block text-label font-semibold text-ink-700">
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
                <p className="mt-2 text-caption text-ink-400">
                  How long does this service take?
                </p>
              </div>
            </div>
          </Card>

          <Card variant="outlined">
            <div className="mb-5 flex items-center gap-2.5">
              <span className="text-xl">⚙</span>
              <h2 className="text-body font-semibold text-ink-900">
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

            <div className="mt-6">
              <label className="mb-1 block text-label font-semibold text-ink-700">
                Assign to staff
              </label>
              <p className="mb-3.5 text-caption text-ink-400">
                Select which staff members offer this service
              </p>
              {staff.length === 0 ? (
                <p className="text-body-sm text-ink-500">
                  Add staff in the Staff section first.
                </p>
              ) : (
                <div
                  className="grid gap-2.5"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  }}
                >
                  {staff.map((member, i) => {
                    const selected = selectedStaff.has(member.id);
                    const color = staffAccentColors[i % staffAccentColors.length];
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleStaff(member.id)}
                        className="flex cursor-pointer flex-col items-center gap-2 rounded-md p-3"
                        style={{
                          border: selected
                            ? `2px solid ${brand}`
                            : "1px solid var(--color-ink-100)",
                          background: selected ? `${brand}0a` : "var(--color-ink-50)",
                        }}
                      >
                        <Avatar
                          name={member.name}
                          src={member.avatar_url}
                          size="md"
                          className="h-11 w-11 text-base font-bold text-white"
                          style={{ background: color }}
                        />
                        <span className="text-center text-caption font-semibold text-ink-900">
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
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <Card variant="outlined">
            <p className="mb-3.5 text-caption font-semibold uppercase tracking-wider text-ink-400">
              Preview
            </p>
            <div className="rounded-md border border-ink-100 bg-ink-50 p-5">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="mb-3 h-[120px] w-full rounded-sm object-cover"
                />
              ) : null}
              <span
                className="mb-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  color: previewStyle.color,
                  background: previewStyle.bg,
                }}
              >
                {previewStyle.icon}{" "}
                {categoryName || "No category"}
              </span>
              <h3 className="mb-2 text-body-lg font-bold text-ink-900">
                {name || "Service name"}
              </h3>
              <p className="mb-4 min-h-[40px] text-body-sm leading-relaxed text-ink-600">
                {description || "Description will appear here."}
              </p>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-body-sm text-ink-600">
                  {durationMins} min
                </span>
                <span
                  className="text-body font-bold"
                  style={{ color: brand }}
                >
                  €{priceDisplay}
                </span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full cursor-default"
                style={{ backgroundColor: brand }}
              >
                Book
              </Button>
            </div>
            <p className="mt-3 text-center text-caption text-ink-400">
              This is how customers will see your service
            </p>
          </Card>

          <Button
            type="submit"
            name="save_intent"
            value="publish"
            variant="primary"
            size="lg"
            className="w-full"
            style={{ backgroundColor: brand }}
          >
            ✓ Save Service
          </Button>

          <Button
            type="submit"
            name="save_intent"
            value="draft"
            formNoValidate
            variant="secondary"
            size="md"
            className="w-full"
          >
            Save as Draft
          </Button>

          <Link
            href="/services"
            className="block text-center text-body-sm text-ink-500 no-underline hover:text-ink-700"
          >
            Cancel
          </Link>

          <div className="flex items-start gap-2.5 rounded-md bg-info-50 px-4 py-3.5">
            <span className="shrink-0 text-base">ℹ️</span>
            <p className="text-caption leading-relaxed text-info-600">
              {infoMessage}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
