import Link from "next/link";

export default function MainSiteHero() {
  return (
    <section
      id="hero"
      className="mx-auto flex min-h-[800px] w-full max-w-7xl flex-col items-center justify-between px-8 pb-20 pt-40 lg:flex-row"
    >
      <div className="flex flex-col space-y-8 pr-0 lg:w-1/2 lg:pr-12">
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
          The ultimate workspace for solo professionals.
        </h1>
        <p className="max-w-lg text-xl leading-relaxed text-slate-600">
          Stop juggling 10 different apps. SoloHub brings your clients, projects,
          and invoices into one unified, beautiful platform.
        </p>

        <div className="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/login"
            className="flex items-center justify-center space-x-2 rounded-full bg-[#11c4b6] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#11c4b6]/30 transition-colors hover:bg-[#0ea5b7]"
          >
            <span>Start Free</span>
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#features"
            className="flex items-center justify-center space-x-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
          >
            <span className="text-sm text-[#11c4b6]" aria-hidden>▶</span>
            <span>See How It Works</span>
          </a>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <div className="flex -space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="" className="h-8 w-8 rounded-full border-2 border-white" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="" className="h-8 w-8 rounded-full border-2 border-white" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" alt="" className="h-8 w-8 rounded-full border-2 border-white" />
          </div>
          <div className="text-sm text-slate-600">
            <div className="text-xs text-yellow-400">★★★★★</div>
            <span>Trusted by 10,000+ freelancers</span>
          </div>
        </div>
      </div>

      <div className="relative mt-16 lg:mt-0 lg:w-1/2">
        <div className="absolute -inset-4 rounded-3xl bg-[#bff4ef] opacity-50 blur-2xl" />
        <div
          className="relative z-10 rounded-2xl p-4"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="h-auto w-full rounded-xl object-cover shadow-sm"
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/76de355dcb-3ad555d5d1bcad1bc414.png"
            alt="Clean, modern SaaS dashboard interface showing projects, revenue charts, and client list, light theme with teal accents"
          />
        </div>
      </div>
    </section>
  );
}
