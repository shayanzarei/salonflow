import Link from "next/link";
import {
  MARKETING_BUTTON_GLASS,
  MARKETING_BUTTON_PRIMARY,
} from "@/components/marketing/buttonStyles";

export default function MainSiteCta() {
  return (
    <section
      id="final-cta"
      className="relative overflow-hidden bg-slate-900 px-8 py-32 text-center"
    >
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#11c4b6] opacity-20 mix-blend-multiply blur-[100px]" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="mb-6 text-5xl font-bold tracking-tight text-white">
          Ready to build a more professional business?
        </h2>
        <p className="mb-10 text-xl text-slate-300">
          Join the exclusive group of Dutch solo professionals launching their
          brands on SoloHub.
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/signup"
            className={`${MARKETING_BUTTON_PRIMARY} w-full sm:w-auto`}
          >
            Start your 14-day free trial
          </Link>
          <Link
            href="/book-demo"
            className={`${MARKETING_BUTTON_GLASS} w-full sm:w-auto`}
          >
            Book a founders&apos; demo
          </Link>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          14-day free trial • No credit card required • Personal setup help
          included.
        </p>
      </div>
    </section>
  );
}
