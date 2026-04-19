"use client";

import { RefreshIcon, SearchIcon, TagIcon } from "@/components/ui/Icons";
import { useLocale } from "@/lib/i18n/context";

export default function MainSitePainPoints() {
  const { t } = useLocale();
  const w = t.website;
  const PAIN_POINTS = [
    {
      title: w.pain1Title,
      desc: w.pain1Body,
      Icon: TagIcon,
      iconBg: "#FEF2F2",
      iconColor: "#EF4444",
    },
    {
      title: w.pain2Title,
      desc: w.pain2Body,
      Icon: RefreshIcon,
      iconBg: "#FFF7ED",
      iconColor: "#F97316",
    },
    {
      title: w.pain3Title,
      desc: w.pain3Body,
      Icon: SearchIcon,
      iconBg: "#FAF5FF",
      iconColor: "#A855F7",
    },
  ];
  return (
    <section id="problem" className="bg-white px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900">
            {w.painTitle}
          </h2>
          <p className="text-xl text-slate-600">
            {w.painBody}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PAIN_POINTS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl p-8"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold"
                style={{ backgroundColor: item.iconBg, color: item.iconColor }}
              >
                <item.Icon size={20} />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
