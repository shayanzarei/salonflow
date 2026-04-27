import { CategoriesTab } from "@/components/dashboard/CategoriesTab";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import {
  Table,
  TBodyRow,
  TD,
  TH,
  THeadRow,
} from "@/components/ds/Table";
import {
  ClockIcon,
  EyeIcon,
  PlusIcon,
  ScissorsIcon,
  TrophyIcon,
} from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getPackageLimit } from "@/lib/packages";
import { getCategoryStyle } from "@/lib/service-categories";
import { getTenant } from "@/lib/tenant";
import Link from "next/link";
import { notFound } from "next/navigation";

const PAGE_SIZE = 10;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string; redirect_to?: string }>;
}) {
  const tenant = await getTenant();
  if (!tenant) notFound();

  const { page, tab, redirect_to } = await searchParams;
  const activeTab = tab === "categories" ? "categories" : "services";
  const currentPage = parseInt(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;
  const brand = tenant.primary_color ?? 'var(--color-brand-600)';
  const redirectTo =
    redirect_to && redirect_to.startsWith("/") && !redirect_to.startsWith("//")
      ? redirect_to
      : "";

  const [servicesResult, countResult, statsResult, categoriesResult] =
    await Promise.all([
      pool.query(
        `SELECT
         s.*,
         sc.name AS category_name,
         COUNT(b.id) AS booking_count
       FROM services s
       LEFT JOIN service_categories sc ON sc.id = s.category_id
       LEFT JOIN bookings b ON b.service_id = s.id
       WHERE s.tenant_id = $1
       GROUP BY s.id, sc.name
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
      pool.query(
        `SELECT * FROM service_categories WHERE tenant_id = $1 ORDER BY sort_order, name`,
        [tenant.id]
      ),
    ]);

  const services = servicesResult.rows;
  const totalCount = parseInt(countResult.rows[0].count);
  const maxServices = await getPackageLimit(tenant, "max_services");
  const canAddService = maxServices === null || totalCount < maxServices;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const stats = statsResult.rows[0];
  const categories = categoriesResult.rows;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="text-h1 font-bold text-ink-900">Services</h1>
          <Badge variant="brand">{totalCount} Services</Badge>
        </div>
        {activeTab === "services" &&
          (canAddService ? (
            <Button
              asChild
              variant="primary"
              size="md"
              style={{ backgroundColor: brand }}
            >
              <Link
                href={`/services/new${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`}
              >
                <PlusIcon size={14} /> Add Service
              </Link>
            </Button>
          ) : (
            <Badge variant="neutral">
              Service limit reached ({maxServices})
            </Badge>
          ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex w-fit gap-1 rounded-md border border-ink-100 bg-ink-0 p-1">
        {[
          { key: "services", label: "Services" },
          { key: "categories", label: "Categories" },
        ].map((tabItem) => (
          <Link
            key={tabItem.key}
            href={
              tabItem.key === "services"
                ? `/services${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`
                : `/services?tab=categories${redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : ""}`
            }
            className="rounded-sm px-4 py-2 text-body-sm font-medium no-underline transition-colors"
            style={
              activeTab === tabItem.key
                ? { background: brand, color: "white" }
                : { color: "var(--color-ink-500)" }
            }
          >
            {tabItem.label}
          </Link>
        ))}
      </div>

      {/* Categories tab */}
      {activeTab === "categories" && (
        <CategoriesTab
          initialCategories={categories}
          brand={brand}
          redirectTo={redirectTo}
        />
      )}

      {/* Services tab content below */}
      {activeTab === "services" && (
        <>
          {/* Stats cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card variant="outlined" className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50">
                <ScissorsIcon size={20} color='var(--color-brand-600)' />
              </div>
              <div>
                <p className="mb-1 text-caption text-ink-500">Active services</p>
                <p className="text-h2 font-bold text-ink-900">{stats.total}</p>
              </div>
            </Card>

            <Card variant="outlined" className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-warning-50">
                <TrophyIcon size={20} color='var(--color-accent-600)' />
              </div>
              <div>
                <p className="mb-1 text-caption text-ink-500">Most booked</p>
                <p className="text-body font-bold text-ink-900">
                  {stats.most_popular ?? "—"}
                </p>
              </div>
            </Card>

            <Card variant="outlined" className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-success-50 text-body font-bold text-success-600">
                €
              </div>
              <div>
                <p className="mb-1 text-caption text-ink-500">Avg Service Price</p>
                <p className="text-h2 font-bold text-ink-900">
                  €{parseFloat(stats.avg_price).toFixed(2)}
                </p>
              </div>
            </Card>
          </div>

          {/* Services table */}
          <Card variant="outlined" className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <h2 className="text-body-sm font-semibold text-ink-900">
                All Services
              </h2>
            </div>

            <div className="-mx-1 overflow-x-auto sm:mx-0">
              <Table className="min-w-[640px]">
                <thead>
                  <THeadRow>
                    <TH>Service</TH>
                    <TH>Description</TH>
                    <TH>Duration</TH>
                    <TH>Price</TH>
                    <TH>Bookings</TH>
                    <TH>Action</TH>
                  </THeadRow>
                </thead>
                <tbody>
                  {services.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-14 text-center"
                      >
                        <div className="mb-3 flex justify-center">
                          <ScissorsIcon size={32} color="var(--color-ink-300)" />
                        </div>
                        <p className="mb-1.5 text-body font-semibold text-ink-900">
                          No services yet
                        </p>
                        <p className="mb-5 text-body-sm text-ink-500">
                          Add your first service to start accepting bookings
                        </p>
                        {canAddService ? (
                          <Button
                            asChild
                            variant="primary"
                            size="md"
                            style={{ backgroundColor: brand }}
                          >
                            <Link
                              href={`/services/new${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ""}`}
                            >
                              <PlusIcon size={14} /> Add Service
                            </Link>
                          </Button>
                        ) : (
                          <Badge variant="neutral">
                            Service limit reached ({maxServices})
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => {
                      const catStyle = getCategoryStyle(
                        service.category,
                        service.name
                      );
                      return (
                        <TBodyRow key={service.id} interactive={false}>
                          {/* Service */}
                          <TD>
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-lg"
                                style={{ background: catStyle.bg }}
                              >
                                {catStyle.icon}
                              </div>
                              <div>
                                <p className="mb-0.5 flex flex-wrap items-center gap-2 text-body-sm font-semibold text-ink-900">
                                  {service.name}
                                  {service.is_draft ? (
                                    <Badge variant="warning">Draft</Badge>
                                  ) : null}
                                </p>
                                <p
                                  className="text-[11px] font-medium"
                                  style={{ color: catStyle.color }}
                                >
                                  {service.category_name ??
                                    service.category ??
                                    catStyle.label}
                                </p>
                              </div>
                            </div>
                          </TD>

                          {/* Description */}
                          <TD className="max-w-[240px]">
                            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-caption text-ink-500">
                              {service.description ?? "—"}
                            </p>
                          </TD>

                          {/* Duration */}
                          <TD>
                            <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ink-700">
                              <ClockIcon size={14} /> {service.duration_mins} min
                            </span>
                          </TD>

                          {/* Price */}
                          <TD>
                            <span
                              className="text-body-sm font-bold"
                              style={{ color: brand }}
                            >
                              €{service.price}
                            </span>
                          </TD>

                          {/* Bookings */}
                          <TD>
                            <span className="text-caption text-ink-500">
                              {service.booking_count} total
                            </span>
                          </TD>

                          <TD>
                            <Link
                              href={`/services/${service.id}`}
                              className="inline-flex items-center gap-1 rounded-sm px-3.5 py-1.5 text-caption font-medium no-underline"
                              style={{
                                color: brand,
                                border: `1px solid ${brand}30`,
                                background: `${brand}08`,
                              }}
                            >
                              <EyeIcon size={13} /> View
                            </Link>
                          </TD>
                        </TBodyRow>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4">
                <p className="text-caption text-ink-500">
                  Showing {offset + 1} to{" "}
                  {Math.min(offset + PAGE_SIZE, totalCount)} of {totalCount}{" "}
                  entries
                </p>
                <div className="flex items-center gap-1.5">
                  {currentPage > 1 && (
                    <Link
                      href={`/services?page=${currentPage - 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 text-body-sm text-ink-600 no-underline"
                    >
                      ‹
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => {
                      const isActive = p === currentPage;
                      if (isActive) {
                        return (
                          <Link
                            key={p}
                            href={`/services?page=${p}`}
                            className="flex h-8 w-8 items-center justify-center rounded-sm text-body-sm font-semibold text-white no-underline"
                            style={{ background: brand }}
                          >
                            {p}
                          </Link>
                        );
                      }
                      return (
                        <Link
                          key={p}
                          href={`/services?page=${p}`}
                          className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 bg-ink-0 text-body-sm text-ink-600 no-underline"
                        >
                          {p}
                        </Link>
                      );
                    }
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={`/services?page=${currentPage + 1}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-ink-200 text-body-sm text-ink-600 no-underline"
                    >
                      ›
                    </Link>
                  )}
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
