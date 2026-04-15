const PAIN_POINTS = [
  {
    title: "Chasing Payments",
    desc: "Spending hours tracking down unpaid invoices instead of doing billable work.",
    icon: "$",
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",
  },
  {
    title: "App Fatigue",
    desc: "Paying for and switching between 5 different tools just to manage one project.",
    icon: "◈",
    iconBg: "#FFF7ED",
    iconColor: "#F97316",
  },
  {
    title: "Lost Time",
    desc: "Wasting 10+ hours a week on admin tasks that should be automated.",
    icon: "◷",
    iconBg: "#FAF5FF",
    iconColor: "#A855F7",
  },
];

export default function MainSitePainPoints() {
  return (
    <section id="problem" className="bg-white px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900">
            Running a solo business shouldn&apos;t mean doing the work of 5 people.
          </h2>
          <p className="text-xl text-slate-600">
          You started your business for freedom, not to become a full-time administrator.
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
                {item.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
