import StarRating from '@/components/booking/StarRating';
import pool from '@/lib/db';
import { getTenant } from '@/lib/tenant';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ReviewPage({
    searchParams,
}: {
    searchParams: Promise<{ booking?: string; token?: string; rating?: string }>;
}) {
    const { booking, token, rating } = await searchParams;
    const tenant = await getTenant();

    if (!booking || !token) notFound();

    const result = await pool.query(
        `SELECT b.*, s.name AS service_name, st.name AS staff_name
     FROM bookings b
     JOIN services s ON b.service_id = s.id
     JOIN staff st ON b.staff_id = st.id
     WHERE b.id = $1 AND b.review_token = $2`,
        [booking, token]
    );

    const bookingData = result.rows[0];
    if (!bookingData) notFound();

    // check if already reviewed
    const existingReview = await pool.query(
        `SELECT * FROM reviews WHERE tenant_id = $1 AND client_name = $2
     AND created_at > $3`,
        [
            bookingData.tenant_id,
            bookingData.client_name,
            new Date(bookingData.booked_at),
        ]
    );

    const alreadyReviewed = existingReview.rows.length > 0;
    const brand = tenant?.primary_color ?? '#7C3AED';
    const preselectedRating = rating ? parseInt(rating) : null;

    return (
        <div className="max-w-lg mx-auto py-16 px-6">
            {alreadyReviewed ? (
                <div className="text-center">
                    <div className="text-5xl mb-4">🌟</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Thanks for your review!
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Your feedback means a lot to us.
                    </p>

                    <Link href="/"
                        className="inline-block px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: brand }}
                    >
                        Back to home
                    </Link>
                </div>
            ) : (
                <div>
                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            How was your visit?
                        </h1>
                        <p className="text-gray-500">
                            {bookingData.service_name} with {bookingData.staff_name}
                        </p>
                    </div>

                    <form action="/api/reviews" method="POST" className="space-y-6">
                        <input type="hidden" name="booking_id" value={booking} />
                        <input type="hidden" name="token" value={token} />
                        <input type="hidden" name="tenant_id" value={bookingData.tenant_id} />
                        <input type="hidden" name="client_name" value={bookingData.client_name} />

                        {/* Star rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Your rating
                            </label>
                            <StarRating defaultRating={preselectedRating ?? 0} />
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Your review
                            </label>
                            <textarea
                                name="comment"
                                required
                                rows={4}
                                placeholder="Tell us about your experience..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
                            style={{ backgroundColor: brand }}
                        >
                            Submit review
                        </button>
                    </form>
                </div>
            )
            }
        </div >
    );
}