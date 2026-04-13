import pool from "@/lib/db";
import { getCategoryStyle } from "@/lib/service-categories";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 10;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { page } = await searchParams;
  const currentPage = parseInt(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;
  const brand = tenant.primary_color ?? "#7C3AED";

  const [servicesResult, countResult, statsResult] = await Promise.all([
    pool.query(
      `SELECT
         s.*,
         COUNT(b.id) AS booking_count
       FROM services s
       LEFT JOIN bookings b ON b.service_id = s.id
       WHERE s.tenant_id = $1
       GROUP BY s.id
       ORDER BY s.name
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
      [tenant.id]
    ),
    pool.query(`SELECT COUNT(*) FROM services WHERE tenant_id = $1`, [
      tenant.id,
    ]),
    pool.query(
      `SELECT
         COUNT(*) AS total,
         COALESCE(AVG(price), 0) AS avg_price,
         (SELECT name FROM services WHERE tenant_id = $1
          ORDER BY (SELECT COUNT(*) FROM bookings WHERE service_id = services.id) DESC
          LIMIT 1) AS most_popular
       FROM services WHERE tenant_id = $1`,
      [tenant.id]
    ),
  ]);

  const services = servicesResult.rows;
  const totalCount = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const stats = statsResult.rows[0];

  return (
    <div>
      {/* Header */}
      <div
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1
            style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: 0 }}
          >
            Services
          </h1>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: brand,
              background: `${brand}15`,
              padding: "3px 10px",
              borderRadius: 100,
            }}
          >
            {totalCount} Services
          </span>
        </div>
        <Link
          href="/services/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            background: brand,
            color: "white",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + Add Service
        </Link>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#F5F3FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            ✂
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px" }}>
              Active services
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#111",
                margin: 0,
              }}
            >
              {stats.total}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#FFFBEB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🏆
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px" }}>
              Most booked
            </p>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#111",
                margin: 0,
              }}
            >
              {stats.most_popular ?? "—"}
            </p>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            €
          </div>
          <div>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 4px" }}>
              Avg Service Price
            </p>
            <p
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#111",
                margin: 0,
              }}
            >
              €{parseFloat(stats.avg_price).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Services table */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "1px solid #f0f0f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{ fontSize: 15, fontWeight: 600, color: "#111", margin: 0 }}
          >
            All Services
          </h2>
          {/* <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: "white",
                fontSize: 13,
                color: "#555",
                cursor: "pointer",
              }}
            >
              🎛 Filter
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: "white",
                fontSize: 13,
                color: "#555",
                cursor: "pointer",
              }}
            >
              ↕ Sort
            </button>
          </div> */}
        </div>

        <div className="-mx-1 overflow-x-auto sm:mx-0">
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f5f5f5" }}>
              {[
                "Service",
                "Description",
                "Duration",
                "Price",
                "Bookings",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "12px 20px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#aaa",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: "60px 24px", textAlign: "center" }}
                >
                  <p style={{ fontSize: 28, margin: "0 0 12px" }}>✂</p>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#111",
                      margin: "0 0 6px",
                    }}
                  >
                    No services yet
                  </p>
                  <p
                    style={{ fontSize: 14, color: "#888", margin: "0 0 20px" }}
                  >
                    Add your first service to start accepting bookings
                  </p>
                  <Link
                    href="/services/new"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 20px",
                      background: brand,
                      color: "white",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    + Add Service
                  </Link>
                </td>
              </tr>
            ) : (
              services.map((service) => {
                const catStyle = getCategoryStyle(service.category, service.name);
                return (
                  <tr
                    key={service.id}
                    style={{ borderBottom: "1px solid #f9f9f9" }}
                  >
                    {/* Service */}
                    <td style={{ padding: "16px 20px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: catStyle.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            flexShrink: 0,
                          }}
                        >
                          {catStyle.icon}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: "#111",
                              margin: "0 0 2px",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            {service.name}
                            {service.is_draft ? (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                  color: "#B45309",
                                  background: "#FEF3C7",
                                  padding: "2px 8px",
                                  borderRadius: 100,
                                }}
                              >
                                Draft
                              </span>
                            ) : null}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: catStyle.color,
                              margin: 0,
                              fontWeight: 500,
                            }}
                          >
                            {service.category ?? catStyle.label}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ padding: "16px 20px", maxWidth: 240 }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#888",
                          margin: 0,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {service.description ?? "—"}
                      </p>
                    </td>

                    {/* Duration */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#333",
                        }}
                      >
                        🕐 {service.duration_mins} min
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ padding: "16px 20px" }}>
                      <span
                        style={{ fontSize: 15, fontWeight: 700, color: brand }}
                      >
                        €{service.price}
                      </span>
                    </td>

                    {/* Bookings */}
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ fontSize: 13, color: "#888" }}>
                        {service.booking_count} total
                      </span>
                    </td>

                    <td style={{ padding: "16px 20px" }}>
                      <Link
                        href={`/services/${service.id}`}
                        style={{
                          padding: "6px 14px",
                          border: `1px solid ${brand}30`,
                          borderRadius: 8,
                          fontSize: 12,
                          color: brand,
                          textDecoration: "none",
                          fontWeight: 500,
                          background: `${brand}08`,
                        }}
                      >
                        View 👀
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              Showing {offset + 1} to {Math.min(offset + PAGE_SIZE, totalCount)}{" "}
              of {totalCount} entries
            </p>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {currentPage > 1 && (
                <Link
                  href={`/services?page=${currentPage - 1}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    color: "#666",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  ‹
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/services?page=${p}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: p === currentPage ? "none" : "1px solid #e5e7eb",
                    borderRadius: 8,
                    background: p === currentPage ? brand : "white",
                    color: p === currentPage ? "white" : "#666",
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: p === currentPage ? 600 : 400,
                  }}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={`/services?page=${currentPage + 1}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    color: "#666",
                    textDecoration: "none",
                    fontSize: 14,
                  }}
                >
                  ›
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
