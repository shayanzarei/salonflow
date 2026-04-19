"use client";

import {
  MARKETING_BUTTON_PRIMARY,
  MARKETING_BUTTON_SECONDARY,
} from "@/components/marketing/buttonStyles";
import { ArrowRightIcon, PlayIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";
import Link from "next/link";

export default function MainSiteHero() {
  const { t } = useLocale();
  const w = t.website;
  return (
    <section
      id="hero"
      className="mx-auto flex min-h-[800px] w-full max-w-7xl flex-col items-center justify-between px-8 pb-20 pt-40 lg:flex-row"
    >
      {/* ── Left: copy ───────────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-8 pr-0 lg:w-1/2 lg:pr-12">
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 lg:text-7xl">
          {w.heroTitle}
        </h1>
        <p className="max-w-lg text-xl leading-relaxed text-slate-600">
          {w.heroBody}
        </p>

        <div className="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link
            href="/signup"
            className={`${MARKETING_BUTTON_PRIMARY} space-x-2`}
          >
            <span>{w.heroStartFree}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className={`${MARKETING_BUTTON_SECONDARY} space-x-2`}
          >
            <PlayIcon className="h-3.5 w-3.5 text-[#11c4b6]" />
            <span>{w.heroSeeHow}</span>
          </a>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <div className="text-sm text-slate-600">
            <div className="text-sm font-bold">
              🇳🇱 {w.heroSupport}
            </div>
            <div className="text-sm">{w.heroBuiltInNl}</div>
          </div>
        </div>
      </div>

      {/* ── Right: laptop mockup ──────────────────────────────────────────── */}
      <div className="relative mt-16 flex w-full items-center justify-center lg:mt-0 lg:w-1/2">
        {/* Ambient glow */}
        <div className="absolute -inset-8 rounded-3xl bg-[#bff4ef] opacity-55 blur-3xl" />

        {/* Floating badge — top right */}
        <div
          className="absolute right-6 top-1 z-30 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl"
          style={{ border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-50 text-base">
            ✅
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{w.heroBadgeTitle}</p>
            <p className="text-[10px] text-gray-400">{w.heroBadgeMeta}</p>
          </div>
        </div>

        {/* ── Laptop shell ─────────────────────────────────────────────── */}
        <div className="relative z-10 w-full">
          {/* Lid (screen) */}
          <div
            className="overflow-hidden rounded-t-[16px]"
            style={{
              background: "linear-gradient(160deg, #2d3347 0%, #1a1f2e 100%)",
              padding: "10px 10px 0 10px",
              boxShadow:
                "0 -2px 0 rgba(255,255,255,0.06) inset, 0 30px 60px -10px rgba(0,0,0,0.5)",
            }}
          >
            {/* Camera dot */}
            <div className="mb-2 flex justify-center">
              <div
                className="h-[5px] w-[5px] rounded-full"
                style={{
                  background: "#4a5060",
                  boxShadow: "0 0 0 1px #3a3f50",
                }}
              />
            </div>

            {/* Browser chrome + screenshot */}
            <div className="overflow-hidden rounded-t-[8px]">
              {/* macOS-style toolbar */}
              <div
                className="flex items-center gap-1.5 px-3 py-[7px]"
                style={{
                  background:
                    "linear-gradient(180deg, #f5f5f7 0%, #ebebed 100%)",
                  borderBottom: "1px solid #d1d1d6",
                }}
              >
                {/* Traffic lights */}
                <span
                  className="h-[10px] w-[10px] rounded-full"
                  style={{
                    background: "#ff5f57",
                    boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)",
                  }}
                />
                <span
                  className="h-[10px] w-[10px] rounded-full"
                  style={{
                    background: "#febc2e",
                    boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)",
                  }}
                />
                <span
                  className="h-[10px] w-[10px] rounded-full"
                  style={{
                    background: "#28c840",
                    boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)",
                  }}
                />

                {/* Address bar */}
                <div
                  className="mx-3 flex flex-1 items-center gap-1 rounded-[5px] px-2.5 py-[3px] text-[10px] text-gray-400"
                  style={{
                    background: "rgba(0,0,0,0.07)",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <svg
                    className="h-2.5 w-2.5 shrink-0 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>app.solohub.nl</span>
                </div>
              </div>

              {/* The actual screenshot */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="block w-full"
                src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/11111.png"
                alt="SoloHub dashboard showing bookings, revenue and client overview"
                style={{
                  maxHeight: 420,
                  objectFit: "cover",
                  objectPosition: "top",
                }}
              />
            </div>
          </div>

          {/* Hinge line */}
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, #0d0f16 0%, #2a2f40 50%, #0d0f16 100%)",
            }}
          />

          {/* Keyboard base */}
          <div
            style={{
              height: 20,
              background:
                "linear-gradient(180deg, #2a2f40 0%, #1a1f2e 60%, #141720 100%)",
              borderRadius: "0 0 8px 8px",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 32px -4px rgba(0,0,0,0.5)",
              position: "relative",
            }}
          >
            {/* Trackpad indent */}
            <div
              style={{
                position: "absolute",
                bottom: 4,
                left: "50%",
                transform: "translateX(-50%)",
                width: "22%",
                height: 4,
                borderRadius: 3,
                background: "rgba(0,0,0,0.25)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
              }}
            />
          </div>

          {/* Desk shadow */}
          <div
            style={{
              height: 8,
              marginLeft: "4%",
              marginRight: "4%",
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, transparent 75%)",
              borderRadius: "0 0 50% 50%",
            }}
          />
        </div>
      </div>
    </section>
  );
}
