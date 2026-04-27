import {
  ServiceActiveToggle,
  ServiceDurationField,
} from "@/components/dashboard/ServiceEditFormExtras";
import { ServiceImageField } from "@/components/dashboard/ServiceImageField";
import { Avatar } from "@/components/ds/Avatar";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input, Textarea } from "@/components/ds/Input";
import { Select } from "@/components/ds/Select";
import { CalendarIcon, ClockIcon, StarIcon, TrendingUpIcon, TrashIcon, UsersIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getCategoryStyle } from "@/lib/service-categories";
import { INDUSTRY_AVG_CANCELLATION_PCT, loadServiceDetail } from "@/lib/services/service-detail";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

function formatGrowth(growth: number): { text: string; positive: boolean } {
  if (growth === 0) return { text: "0% vs last month", positive: true };
  const pct = Math.round(Math.abs(growth) * 100);
  const positive = growth >= 0;
  return {
    text: `${positive ? "↑" : "↓"} ${pct}% vs last month`,
    positive,
  };
}

const STAFF_PALETTE = [
  'var(--color-brand-600)',
  'var(--color-accent-500)',
  "var(--color-success-600)",
  "var(--color-danger-600)",
  "var(--color-info-600)",
];

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? 'var(--color-brand-600)';

  const [detail, categoriesResult] = await Promise.all([
    loadServiceDetail(pool, tenant.id, id),
    pool.query(
      `SELECT id, name FROM service_categories WHERE tenant_id = $1 ORDER BY sort_order, name`,
      [tenant.id]
    ),
  ]);
  if (!detail) notFound();

  const customCategories: { id: string; name: string }[] = categoriesResult.rows;
  const catStyle = getCategoryStyle(detail.category, detail.name);
  const bookingsFmt = formatGrowth(detail.performance.bookingsGrowth);
  const revenueFmt = formatGrowth(detail.performance.revenueGrowth);
  const cancelPct = detail.performance.cancellationRate * 100;
  const pop = detail.performance.popularityPercentile;
  const topLabel =
    pop >= 0.85 ? "Top 15%" : pop >= 0.7 ? "Top 30%" : pop >= 0.5 ? "Above average" : "";

  const summaryItems = [
    {
      icon: <ClockIcon size={20} color="var(--color-ink-500)" />,
      label: "Duration",
      value: `${detail.durationMinutes} min`,
    },
    {
      icon: <span className="text-lg font-bold text-ink-500">€</span>,
      label: "Price",
      value: `€${detail.price.toFixed(2)}`,
      colored: true,
    },
    {
      icon: <CalendarIcon size={20} color="var(--color-ink-500)" />,
      label: "Total Bookings",
      value: detail.totalBookings.toString(),
    },
    {
      icon: <StarIcon size={20} color="var(--color-ink-500)" />,
      label: "Avg Rating",
      value:
        detail.reviewCount > 0
          ? `${detail.averageRating.toFixed(1)}`
          : "—",
      sub:
        detail.reviewCount > 0
          ? `${detail.reviewCount} reviews`
          : "No reviews yet",
    },
  ] as const;

  return (
    <div className="-mt-2">
      <div className="mb-5">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-body-sm text-ink-500 no-underline"
        >
          ← Back to Services
        </Link>
      </div>

      {detail.isDraft ? (
        <Card variant="outlined" className="mb-5 bg-warning-50 px-4 py-3 text-caption text-warning-700">
          This service is a <strong>draft</strong> and is not shown on your public
          booking site. Saving changes from this page will publish it.
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
          <Card variant="outlined" className="p-7">
            <div className="mb-5 flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-2xl"
                style={{ background: catStyle.bg }}
              >
                {catStyle.icon}
              </div>
              <div className="min-w-0">
                <h1 className="mb-2 text-h2 font-bold text-ink-900">
                  {detail.name}
                </h1>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium"
                  style={{
                    color: catStyle.color,
                    background: catStyle.bg,
                  }}
                >
                  {catStyle.icon} {detail.category_name ?? detail.category}
                </span>
              </div>
            </div>

            {detail.description ? (
              <p className="mb-5 text-body-sm leading-relaxed text-ink-600">
                {detail.description}
              </p>
            ) : (
              <p className="mb-5 text-body-sm italic text-ink-400">
                No description yet.
              </p>
            )}

            <div className="grid grid-cols-1 gap-3.5 border-t border-ink-100 pt-5 sm:grid-cols-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-sm bg-ink-50 px-4 py-3"
                >
                  <span className="flex shrink-0">{item.icon}</span>
                  <div>
                    <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-400">
                      {item.label}
                    </p>
                    <p
                      className="text-body font-bold"
                      style={{ color: ("colored" in item && item.colored) ? brand : "var(--color-ink-900)" }}
                    >
                      {item.value}
                    </p>
                    {"sub" in item && item.sub ? (
                      <p className="mt-1 text-[11px] text-ink-400">{item.sub}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="outlined" className="p-7">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUpIcon size={16} color="var(--color-ink-500)" />
              <h2 className="text-body font-semibold text-ink-900">
                Performance
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {(
                [
                  {
                    title: "Bookings This Month",
                    value: detail.performance.bookingsThisMonth.toString(),
                    hint: bookingsFmt.text,
                    hintTone: bookingsFmt.positive ? "growth" : "warn",
                  },
                  {
                    title: "Revenue This Month",
                    value: `€${detail.performance.revenueThisMonth.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`,
                    hint: revenueFmt.text,
                    hintTone: revenueFmt.positive ? "growth" : "warn",
                  },
                  {
                    title: "Cancellation Rate",
                    value: `${cancelPct.toFixed(1)}%`,
                    hint: `Industry avg: ${INDUSTRY_AVG_CANCELLATION_PCT.toFixed(1)}%`,
                    hintTone: "muted" as const,
                  },
                ] as const
              ).map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-sm bg-ink-50 px-4 py-3.5 text-left"
                >
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink-400">
                    {stat.title}
                  </p>
                  <p className="mb-1.5 text-h2 font-bold text-ink-900">
                    {stat.value}
                  </p>
                  <p
                    className={`text-[11px] font-medium ${
                      stat.hintTone === "growth"
                        ? "text-success-600"
                        : stat.hintTone === "warn"
                          ? "text-danger-600"
                          : "text-ink-500"
                    }`}
                  >
                    {stat.hint}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-body-sm font-medium text-ink-600">
                  Popularity vs Other Services
                </span>
                {topLabel ? (
                  <span
                    className="text-caption font-semibold"
                    style={{ color: brand }}
                  >
                    {topLabel}
                  </span>
                ) : null}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full transition-[width]"
                  style={{
                    width: `${Math.round(pop * 100)}%`,
                    background: `linear-gradient(90deg, ${brand}aa, ${brand})`,
                    minWidth: pop > 0 ? 4 : 0,
                  }}
                />
              </div>
            </div>
          </Card>

          <Card variant="outlined" className="p-7">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UsersIcon size={16} color="var(--color-ink-500)" />
                <h2 className="text-body font-semibold text-ink-900">
                  Assigned Staff
                </h2>
              </div>
              <Link
                href="/staff"
                className="text-caption font-semibold no-underline"
                style={{ color: brand }}
              >
                Manage
              </Link>
            </div>
            {detail.assignedStaff.length === 0 ? (
              <p className="text-caption text-ink-500">
                Staff appear here once they have bookings for this service.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {detail.assignedStaff.map((member, i) => {
                  const color = STAFF_PALETTE[i % STAFF_PALETTE.length];
                  return (
                    <div
                      key={member.id}
                      className="flex min-w-[160px] items-center gap-2.5 rounded-md border border-ink-100 bg-ink-50 px-3.5 py-2.5"
                    >
                      <Avatar
                        name={member.name}
                        src={member.avatarUrl}
                        size="md"
                        className="h-9 w-9 text-body-sm font-bold text-white"
                        style={{ background: color }}
                      />
                      <div className="min-w-0">
                        <p className="mb-0.5 truncate text-caption font-semibold text-ink-900">
                          {member.name}
                        </p>
                        <p className="truncate text-[11px] text-ink-500">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <Card variant="outlined">
            <h2 className="mb-5 text-body font-semibold text-ink-900">
              Edit Service
            </h2>

            <form
              action="/api/services/update"
              method="POST"
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="id" value={id} />

              <ServiceImageField initialValue={detail.imageUrl ?? ""} />

              <Input
                id="service-edit-name"
                type="text"
                name="name"
                label="Service Name"
                defaultValue={detail.name}
                required
              />

              <div>
                <label
                  htmlFor="service-edit-category"
                  className="mb-2 block text-caption font-semibold uppercase tracking-wider text-ink-400"
                >
                  Category
                </label>
                {customCategories.length > 0 ? (
                  <Select
                    id="service-edit-category"
                    name="category_id"
                    defaultValue={detail.category_id ?? ""}
                  >
                    <option value="">No category</option>
                    {customCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="rounded-sm border border-ink-200 bg-ink-50 px-4 py-2.5 text-caption text-ink-400">
                    No categories yet —{" "}
                    <Link
                      href="/services?tab=categories"
                      className="font-medium no-underline"
                      style={{ color: brand }}
                    >
                      create one first
                    </Link>
                  </div>
                )}
              </div>

              <Textarea
                id="service-edit-description"
                name="description"
                label="Description"
                defaultValue={detail.description ?? ""}
                rows={3}
              />

              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                <Input
                  id="service-edit-price"
                  type="number"
                  name="price"
                  label="Price (€)"
                  defaultValue={detail.price}
                  step="0.01"
                  min="0"
                  required
                />
                <ServiceDurationField initial={detail.durationMinutes} brand={brand} />
              </div>

              <ServiceActiveToggle initial={detail.isActive} brand={brand} />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-1 w-full"
                style={{ backgroundColor: brand }}
              >
                Save Changes
              </Button>
            </form>
          </Card>

          <Card variant="outlined" className="bg-danger-50">
            <h3 className="mb-2 text-body-sm font-bold text-danger-600">
              Delete Service
            </h3>
            <p className="mb-4 text-caption leading-relaxed text-ink-600">
              This permanently removes the service. Existing bookings may still
              reference it depending on your data rules.
            </p>
            <form action="/api/services/delete" method="POST">
              <input type="hidden" name="id" value={id} />
              <Button
                type="submit"
                variant="danger"
                size="md"
                className="w-full"
              >
                <TrashIcon size={15} /> Delete Service
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
