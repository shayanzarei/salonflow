import { Button } from "@/components/ds/Button";
import { getServerTranslations } from "@/lib/i18n/server";
import Link from "next/link";

export default async function NotFound() {
  const { t } = await getServerTranslations();
  const e = t.errors;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#f0fdfc] to-white px-6">
      <Link href="/" className="mb-12" aria-label={e.notFoundHomeAria}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/solohub%20logo2%20%281%29.png"
          alt="SoloHub"
          className="h-12 w-auto"
        />
      </Link>

      <div className="relative mb-6 select-none">
        <span
          className="block text-center font-bold leading-none tracking-tight"
          style={{
            fontSize: "clamp(100px, 20vw, 180px)",
            color: "transparent",
            WebkitTextStroke: "2px #7C3AED",
            opacity: 0.18,
          }}
        >
          404
        </span>
      </div>

      <h1 className="mb-3 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {e.notFoundTitle}
      </h1>
      <p className="mb-10 max-w-md text-center text-base leading-relaxed text-slate-500">
        {e.notFoundBody}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="primary" size="lg">
          <Link href="/">{e.notFoundBack}</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/contact">{e.notFoundContact}</Link>
        </Button>
      </div>

      <p className="mt-16 text-xs text-slate-400">{e.notFoundFooter}</p>
    </div>
  );
}
