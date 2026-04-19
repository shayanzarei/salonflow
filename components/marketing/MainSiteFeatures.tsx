"use client";

import { useLocale } from "@/lib/i18n/context";

export default function MainSiteFeatures() {
  const { t } = useLocale();
  const w = t.website;
  const FEATURE_ITEMS = [
    { title: w.feat1Title, desc: w.feat1Body },
    { title: w.feat2Title, desc: w.feat2Body },
    { title: w.feat3Title, desc: w.feat3Body },
  ];
  return (
    <section id="solution" className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="mb-6 text-4xl font-bold text-slate-900">
              {w.featuresTitle}
            </h2>
            <p className="mb-10 text-xl text-slate-600">
              {w.featuresBody}
            </p>

            <div className="space-y-8">
              {FEATURE_ITEMS.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9f8f5] font-bold text-[#0ea5b7]">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center lg:w-1/2">
            {/* Ambient glow */}
            <div className="absolute -inset-8 rounded-3xl bg-[#bff4ef] opacity-55 blur-3xl" />

            {/* Floating badge — top right */}
            <div
              className="absolute right-6 top-1 z-30 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-base">
                🌐
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{w.featureBadgeTitle}</p>
                <p className="text-[10px] text-gray-400">{w.featureBadgeMeta}</p>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div
              className="absolute -bottom-2 left-4 z-30 flex items-center gap-2.5 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-base">
                ✨
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{w.templatesBadgeTitle}</p>
                <p className="text-[10px] text-gray-400">{w.templatesBadgeMeta}</p>
              </div>
            </div>

            {/* Laptop shell */}
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
                    style={{ background: "#4a5060", boxShadow: "0 0 0 1px #3a3f50" }}
                  />
                </div>

                {/* Browser chrome + screenshot */}
                <div className="overflow-hidden rounded-t-[8px]">
                  {/* macOS-style toolbar */}
                  <div
                    className="flex items-center gap-1.5 px-3 py-[7px]"
                    style={{
                      background: "linear-gradient(180deg, #f5f5f7 0%, #ebebed 100%)",
                      borderBottom: "1px solid #d1d1d6",
                    }}
                  >
                    <span
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ background: "#ff5f57", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }}
                    />
                    <span
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ background: "#febc2e", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }}
                    />
                    <span
                      className="h-[10px] w-[10px] rounded-full"
                      style={{ background: "#28c840", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.12)" }}
                    />
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
                      <span>deltashop8.solohub.nl</span>
                    </div>
                  </div>

                  {/* The actual screenshot */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="block w-full"
                    src="https://6vgmy5o5gznqt4ax.public.blob.vercel-storage.com/uploads/Screenshot%202026-04-16%20at%2023.30.36.png"
                    alt="SaaS interface showing a website template with a clean, modern design"
                    style={{ maxHeight: 380, objectFit: "cover", objectPosition: "top" }}
                  />
                </div>
              </div>

              {/* Hinge line */}
              <div
                style={{
                  height: 2,
                  background: "linear-gradient(90deg, #0d0f16 0%, #2a2f40 50%, #0d0f16 100%)",
                }}
              />

              {/* Keyboard base */}
              <div
                style={{
                  height: 20,
                  background: "linear-gradient(180deg, #2a2f40 0%, #1a1f2e 60%, #141720 100%)",
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
        </div>
      </div>
    </section>
  );
}
