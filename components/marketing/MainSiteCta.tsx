import Link from "next/link";

export default function MainSiteCta() {
  return (
    <section
      id="final-cta"
      className="relative overflow-hidden bg-slate-900 px-8 py-32 text-center"
    >
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#11c4b6] opacity-20 mix-blend-multiply blur-[100px]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="mb-6 text-5xl font-bold tracking-tight text-white">
          Ready to take back your time?
        </h2>
        <p className="mb-10 text-xl text-slate-300">
          Join thousands of solo professionals who run their business on SoloHub.
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/login"
            className="w-full rounded-full bg-[#11c4b6] px-10 py-5 text-lg font-bold text-white shadow-lg shadow-[#11c4b6]/20 transition-colors hover:bg-[#4ddad0] sm:w-auto"
          >
            Start your 1month free trial
          </Link>
          <Link
            href="/login"
            className="w-full rounded-full border border-slate-700 bg-slate-800 px-10 py-5 text-lg font-bold text-white transition-colors hover:bg-slate-700 sm:w-auto"
          >
            Book a Demo
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-400">1 month free trial. No credit card required.</p>
      </div>
    </section>
  );
}
