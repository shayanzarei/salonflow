import {
  ServiceActiveToggle,
  ServiceDurationField,
} from "@/components/dashboard/ServiceEditFormExtras";
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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tenant = await getTenant();
  if (!tenant) notFound();

  const brand = tenant.primary_color ?? "#7C3AED";

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

  return (
    <div style={{ marginTop: -8 }}>
      <div style={{ marginBottom: 20 }}>
        <Link
          href="/services"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#888",
            textDecoration: "none",
          }}
        >
          ← Back to Services
        </Link>
      </div>

      {detail.isDraft ? (
        <div
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 12,
            background: "#FFFBEB",
            border: "1px solid #FDE68A",
            fontSize: 13,
            color: "#92400E",
          }}
        >
          This service is a <strong>draft</strong> and is not shown on your public
          booking site. Saving changes from this page will publish it.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
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
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: catStyle.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {catStyle.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111",
                    margin: "0 0 8px",
                  }}
                >
                  {detail.name}
                </h1>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 500,
                    color: catStyle.color,
                    background: catStyle.bg,
                    padding: "3px 10px",
                    borderRadius: 100,
                  }}
                >
                  {catStyle.icon} {detail.category_name ?? detail.category}
                </span>
              </div>
            </div>

            {detail.description ? (
              <p
                style={{
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 1.7,
                  margin: "0 0 22px",
                }}
              >
                {detail.description}
              </p>
            ) : (
              <p
                style={{
                  fontSize: 14,
                  color: "#aaa",
                  fontStyle: "italic",
                  margin: "0 0 22px",
                }}
              >
                No description yet.
              </p>
            )}

            <div
              className="grid grid-cols-1 gap-3.5 border-t border-gray-100 pt-5 sm:grid-cols-2"
            >
              {[
                {
                  icon: <ClockIcon size={20} color="#6B7280" />,
                  label: "Duration",
                  value: `${detail.durationMinutes} min`,
                },
                {
                  icon: <span style={{ fontSize: 18, fontWeight: 700, color: "#6B7280" }}>€</span>,
                  label: "Price",
                  value: `€${detail.price.toFixed(2)}`,
                  colored: true,
                },
                {
                  icon: <CalendarIcon size={20} color="#6B7280" />,
                  label: "Total Bookings",
                  value: detail.totalBookings.toString(),
                },
                {
                  icon: <StarIcon size={20} color="#6B7280" />,
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
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "12px 16px",
                  }}
                >
                  <span style={{ display: "flex", flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        margin: "0 0 2px",
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: item.colored ? brand : "#111",
                        margin: 0,
                      }}
                    >
                      {item.value}
                    </p>
                    {"sub" in item && item.sub ? (
                      <p
                        style={{
                          fontSize: 11,
                          color: "#aaa",
                          margin: "4px 0 0",
                        }}
                      >
                        {item.sub}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                marginBottom: 20,
              }}
            >
              <TrendingUpIcon size={16} color="#6B7280" />
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
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
                  style={{
                    background: "#f9fafb",
                    borderRadius: 10,
                    padding: "14px 16px",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 8px",
                      fontWeight: 500,
                    }}
                  >
                    {stat.title}
                  </p>
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#111",
                      margin: "0 0 6px",
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      margin: 0,
                      color:
                        stat.hintTone === "growth"
                          ? "#10B981"
                          : stat.hintTone === "warn"
                            ? "#EF4444"
                            : "#888",
                      fontWeight: 500,
                    }}
                  >
                    {stat.hint}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: "#555" }}>
                  Popularity vs Other Services
                </span>
                {topLabel ? (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: brand,
                    }}
                  >
                    {topLabel}
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 4,
                  background: "#eef0f2",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(pop * 100)}%`,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${brand}aa, ${brand})`,
                    minWidth: pop > 0 ? 4 : 0,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          </div>

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
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UsersIcon size={16} color="#6B7280" />
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#111",
                    margin: 0,
                  }}
                >
                  Assigned Staff
                </h2>
              </div>
              <Link
                href="/staff"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: brand,
                  textDecoration: "none",
                }}
              >
                Manage
              </Link>
            </div>
            {detail.assignedStaff.length === 0 ? (
              <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                Staff appear here once they have bookings for this service.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                {detail.assignedStaff.map((member, i) => {
                  const colors = [
                    "#7C3AED",
                    "#F59E0B",
                    "#10B981",
                    "#EC4899",
                    "#3B82F6",
                  ];
                  const color = colors[i % colors.length];
                  return (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        border: "1px solid #f0f0f0",
                        borderRadius: 12,
                        background: "#fafafa",
                        minWidth: 160,
                      }}
                    >
                      {member.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatarUrl}
                          alt=""
                          width={36}
                          height={36}
                          style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111",
                            margin: "0 0 2px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {member.name}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#888",
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {member.role}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-20 xl:self-start">
          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #f0f0f0",
              padding: 24,
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#111",
                margin: "0 0 20px",
              }}
            >
              Edit Service
            </h2>

            <form
              action="/api/services/update"
              method="POST"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <input type="hidden" name="id" value={id} />

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Service Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={detail.name}
                  required
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: "#111",
                    background: "white",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Category
                </label>
                {customCategories.length > 0 ? (
                  <select
                    name="category_id"
                    defaultValue={detail.category_id ?? ""}
                    style={{
                      width: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "#111",
                      background: "white",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">No category</option>
                    {customCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    style={{
                      padding: "10px 14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: 13,
                      color: "#9CA3AF",
                      background: "#F9FAFB",
                    }}
                  >
                    No categories yet —{" "}
                    <a
                      href="/services?tab=categories"
                      style={{ color: brand, textDecoration: "none", fontWeight: 500 }}
                    >
                      create one first
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={detail.description ?? ""}
                  rows={3}
                  style={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 14,
                    color: "#111",
                    background: "white",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#aaa",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 8,
                    }}
                  >
                    Price (€)
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={detail.price}
                    step="0.01"
                    min="0"
                    required
                    style={{
                      width: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: 14,
                      color: "#111",
                      background: "white",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <ServiceDurationField initial={detail.durationMinutes} brand={brand} />
              </div>

              <ServiceActiveToggle initial={detail.isActive} brand={brand} />

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: brand,
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Save Changes
              </button>
            </form>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 16,
              border: "1px solid #FECACA",
              padding: 24,
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#EF4444",
                margin: "0 0 8px",
              }}
            >
              Delete Service
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "#666",
                margin: "0 0 16px",
                lineHeight: 1.6,
              }}
            >
              This permanently removes the service. Existing bookings may still
              reference it depending on your data rules.
            </p>
            <form action="/api/services/delete" method="POST">
              <input type="hidden" name="id" value={id} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "11px",
                  background: "#EF4444",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <TrashIcon size={15} /> Delete Service
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
