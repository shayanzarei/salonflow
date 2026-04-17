import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f0fdfc] to-white px-6">
      {/* Logo */}
      <Link href="/" className="mb-12" aria-label="Go to SoloHub home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/SoloHub%20logo%20png.png"
          alt="SoloHub"
          className="h-12 w-auto"
        />
      </Link>

      {/* Illustration number */}
      <div className="relative mb-6 select-none">
        <span
          className="block text-center font-bold leading-none tracking-tight"
          style={{
            fontSize: "clamp(100px, 20vw, 180px)",
            color: "transparent",
            WebkitTextStroke: "2px #11c4b6",
            opacity: 0.18,
          }}
        >
          404
        </span>
      </div>

      {/* Copy */}
      <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mb-10 max-w-md text-center text-base leading-relaxed text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Double-check the URL, or head back to safety.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #11C4B6 0%, #0EA5B7 100%)" }}
        >
          ← Back to home
        </Link>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Contact support
        </Link>
      </div>

      {/* Footer hint */}
      <p className="mt-16 text-xs text-slate-400">
        Error 404 · SoloHub — Built with care in the Netherlands 🇳🇱
      </p>
    </div>
  );
}
