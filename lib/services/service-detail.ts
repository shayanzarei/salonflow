import type { Pool } from "pg";

export const DEFAULT_SERVICE_CURRENCY = "EUR";
export const INDUSTRY_AVG_CANCELLATION_PCT = 5.5;

export type ServiceDetailApi = {
  id: string;
  name: string;
  imageUrl: string | null;
  category: string;
  category_id: string | null;
  category_name: string | null;
  description: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  totalBookings: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  isDraft: boolean;
  performance: {
    bookingsThisMonth: number;
    bookingsGrowth: number;
    revenueThisMonth: number;
    revenueGrowth: number;
    cancellationRate: number;
    industryAvgCancellationRate: number;
    popularityPercentile: number;
  };
  assignedStaff: Array<{
    id: string;
    name: string;
    role: string;
    avatarUrl: string | null;
  }>;
};

function growthRatio(current: number, previous: number): number {
  if (previous > 0) return (current - previous) / previous;
  if (current > 0) return 1;
  return 0;
}

export async function loadServiceDetail(
  pool: Pool,
  tenantId: string,
  serviceId: string
): Promise<ServiceDetailApi | null> {
  const [serviceRow, staffRows, reviewRow, rankRows] = await Promise.all([
    pool.query(
      `SELECT
         s.*,
         sc.id   AS cat_id,
         sc.name AS cat_name,
         COUNT(b.id)::int AS total_bookings,
         COUNT(b.id) FILTER (WHERE b.booked_at >= date_trunc('month', NOW()))::int AS month_bookings,
         COUNT(b.id) FILTER (
           WHERE b.booked_at >= date_trunc('month', NOW() - interval '1 month')
             AND b.booked_at < date_trunc('month', NOW())
         )::int AS prev_month_bookings,
         COALESCE(
           SUM(s2.price) FILTER (
             WHERE b.status = 'confirmed' AND b.booked_at >= date_trunc('month', NOW())
           ),
           0
         )::numeric AS month_revenue,
         COALESCE(
           SUM(s2.price) FILTER (
             WHERE b.status = 'confirmed'
               AND b.booked_at >= date_trunc('month', NOW() - interval '1 month')
               AND b.booked_at < date_trunc('month', NOW())
           ),
           0
         )::numeric AS prev_month_revenue,
         COUNT(b.id) FILTER (WHERE b.status = 'cancelled')::int AS cancelled_count
       FROM services s
       LEFT JOIN bookings b ON b.service_id = s.id AND b.tenant_id = s.tenant_id
       LEFT JOIN services s2 ON s2.id = b.service_id
       LEFT JOIN service_categories sc ON sc.id = s.category_id
       WHERE s.id = $1 AND s.tenant_id = $2
       GROUP BY s.id, sc.id, sc.name`,
      [serviceId, tenantId]
    ),
    pool.query(
      `(
         SELECT st.id, st.name, st.role, st.avatar_url
         FROM service_staff ss
         JOIN staff st ON st.id = ss.staff_id AND st.tenant_id = ss.tenant_id
         WHERE ss.service_id = $1 AND ss.tenant_id = $2
       )
       UNION
       (
         SELECT DISTINCT st.id, st.name, st.role, st.avatar_url
         FROM staff st
         INNER JOIN bookings b ON b.staff_id = st.id AND b.tenant_id = st.tenant_id
         WHERE b.service_id = $1 AND b.tenant_id = $2
           AND NOT EXISTS (
             SELECT 1 FROM service_staff ss2
             WHERE ss2.service_id = $1 AND ss2.tenant_id = $2
           )
       )
       ORDER BY name`,
      [serviceId, tenantId]
    ),
    pool.query(
      `SELECT
         COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
         COUNT(*)::int AS review_count
       FROM reviews r
       WHERE r.tenant_id = $1 AND r.service_id = $2`,
      [tenantId, serviceId]
    ),
    pool.query(
      `SELECT s.id AS service_id, COUNT(b.id)::int AS booking_count
       FROM services s
       LEFT JOIN bookings b ON b.service_id = s.id AND b.tenant_id = s.tenant_id
       WHERE s.tenant_id = $1
       GROUP BY s.id`,
      [tenantId]
    ),
  ]);

  const row = serviceRow.rows[0];
  if (!row) return null;

  const totalBookings = row.total_bookings ?? 0;
  const cancelledCount = row.cancelled_count ?? 0;
  const cancellationRate =
    totalBookings > 0 ? (100 * cancelledCount) / totalBookings : 0;

  const monthBookings = row.month_bookings ?? 0;
  const prevMonthBookings = row.prev_month_bookings ?? 0;
  const monthRevenue = parseFloat(String(row.month_revenue ?? 0));
  const prevMonthRevenue = parseFloat(String(row.prev_month_revenue ?? 0));

  const counts = rankRows.rows.map((r) => ({
    id: r.service_id as string,
    c: r.booking_count as number,
  }));
  const thisCount = counts.find((x) => x.id === serviceId)?.c ?? 0;
  const maxCount = Math.max(0, ...counts.map((x) => x.c));
  const popularityPercentile =
    maxCount <= 0 ? 0 : Math.min(1, thisCount / maxCount);

  const rev = reviewRow.rows[0];
  const averageRating = parseFloat(String(rev?.avg_rating ?? 0));
  const reviewCount = rev?.review_count ?? 0;

  const category_id   = (row.cat_id   as string | null) ?? null;
  const category_name = (row.cat_name as string | null) ?? null;
  const category = category_name ?? (row.category as string)?.trim() ?? "Other";

  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url ?? null,
    category,
    category_id,
    category_name,
    description: row.description ?? null,
    durationMinutes: row.duration_mins,
    price: parseFloat(String(row.price)),
    currency: DEFAULT_SERVICE_CURRENCY,
    totalBookings,
    averageRating,
    reviewCount,
    isActive: row.is_active !== false,
    isDraft: row.is_draft === true,
    performance: {
      bookingsThisMonth: monthBookings,
      bookingsGrowth: growthRatio(monthBookings, prevMonthBookings),
      revenueThisMonth: monthRevenue,
      revenueGrowth: growthRatio(monthRevenue, prevMonthRevenue),
      cancellationRate: cancellationRate / 100,
      industryAvgCancellationRate: INDUSTRY_AVG_CANCELLATION_PCT / 100,
      popularityPercentile,
    },
    assignedStaff: staffRows.rows.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      avatarUrl: s.avatar_url ?? null,
    })),
  };
}
