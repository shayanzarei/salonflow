import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CancelPage({
    searchParams,
}: {
    searchParams: Promise<{ booking?: string; token?: string }>;
}) {
    const { booking, token } = await searchParams;


    if (!booking || !token) notFound();

    // verify token matches
    const result = await pool.query(
        `SELECT * FROM bookings WHERE id = $1 AND cancellation_token = $2`,
        [booking, token]
    );

    const bookingData = result.rows[0];
    if (!bookingData) notFound();

    const alreadyCancelled = bookingData.status === 'cancelled';

    return (
        <div className="max-w-md mx-auto text-center py-16">
            {alreadyCancelled ? (
                <>
                    <div className="text-5xl mb-4">✓</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Already cancelled
                    </h1>
                    <p className="text-gray-500 mb-8">
                        This appointment has already been cancelled.
                    </p>
                </>
            ) : (
                <>
                    <div className="text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Cancel appointment?
                    </h1>
                    <p className="text-gray-500 mb-8">
                        Are you sure you want to cancel this appointment? This cannot be undone.
                    </p>
                    <form action="/api/bookings/cancel" method="POST">
                        <input type="hidden" name="booking_id" value={booking} />
                        <input type="hidden" name="token" value={token} />
                        <div className="flex gap-4 justify-center">

                            <Link href="/"
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Keep appointment
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:opacity-90 transition-opacity"
                            >
                                Yes, cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
            <Link href="/" className="block mt-6 text-sm text-gray-400 hover:text-gray-600">
                Back to home
            </Link>
        </div>
    );
}