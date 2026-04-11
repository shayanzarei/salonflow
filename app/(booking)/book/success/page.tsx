import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Booking confirmed!
      </h1>
      <p className="text-gray-500 mb-8">
        We&apos;ll send you a confirmation email shortly.
      </p>

      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-xl bg-purple-600 text-white font-medium hover:opacity-90 transition-opacity">
        Back to home
      </Link>
    </div>
  );
}
