import StarRating from "@/components/booking/StarRating";
import { Button } from "@/components/ds/Button";
import { Textarea } from "@/components/ds/Input";
import { StarIcon } from "@/components/ui/Icons";
import pool from "@/lib/db";
import { getTenant } from "@/lib/tenant";
import { notFound } from "next/navigation";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; token?: string; rating?: string }>;
}) {
  const { booking, token, rating } = await searchParams;
  const tenant = await getTenant();

  if (!booking || !token) notFound();

  // Read the canonical UTC column. The legacy `booked_at` is mirrored by
  // trigger and must not be referenced in app code.
  const result = await pool.query(
    `SELECT
       b.id,
       b.tenant_id,
       b.client_name,
       b.review_token,
       b.booking_start_utc,
       s.name AS service_name,
       st.name AS staff_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     WHERE b.id = $1 AND b.review_token = $2`,
    [booking, token]
  );

  const bookingData = result.rows[0];
  if (!bookingData) notFound();

  const existingReview = await pool.query(
    `SELECT * FROM reviews WHERE tenant_id = $1 AND client_name = $2
     AND created_at > $3`,
    [
      bookingData.tenant_id,
      bookingData.client_name,
      new Date(bookingData.booking_start_utc),
    ]
  );

  const alreadyReviewed = existingReview.rows.length > 0;
  const brand = tenant?.primary_color ?? 'var(--color-brand-600)';
  const preselectedRating = rating ? parseInt(rating) : null;

  if (alreadyReviewed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: brand,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StarIcon size={32} color="white" />
          </div>
          <div
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: 'var(--color-accent-500)',
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>
              1
            </span>
          </div>
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 12px",
          }}
        >
          Thanks for your review!
        </h1>
        <p style={{ fontSize: 16, color: "#888", margin: "0 0 32px" }}>
          Your feedback means a lot to us.
        </p>
        <a
          href="/"
          style={{
            padding: "14px 36px",
            background: brand,
            color: "white",
            borderRadius: 100,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back to home
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #f0f0f0",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        maxWidth: 500,
        marginBottom: 16,
      }}
    >
      <form action="/api/reviews" method="POST">
        <input type="hidden" name="booking_id" value={booking} />
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="tenant_id" value={bookingData.tenant_id} />
        <input
          type="hidden"
          name="client_name"
          value={bookingData.client_name}
        />

        {/* Stars */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#555",
              margin: "0 0 16px",
            }}
          >
            Rate your experience
          </p>
          <StarRating defaultRating={preselectedRating ?? 0} size="large" />
        </div>

        {/* Review text */}
        <div style={{ marginBottom: 24 }}>
          <Textarea
            id="review-comment"
            name="comment"
            required
            rows={5}
            label="Your review"
            placeholder="Share details of your experience... What did you love? What could be improved?"
            helperText="Optional — Help others by sharing more details"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full gap-2 rounded-full"
          style={{ backgroundColor: brand }}
        >
          ✈ Submit review
        </Button>
      </form>
    </div>
  );
}
