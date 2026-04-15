const FEATURE_ITEMS = [
  {
    title: "Onboard Clients",
    desc: "Send beautiful proposals and contracts that get signed in minutes.",
  },
  {
    title: "Manage Work",
    desc: "Track tasks, time, and files in dedicated client portals.",
  },
  {
    title: "Get Paid Fast",
    desc: "Automate invoices and accept payments with zero friction.",
  },
];

export default function MainSiteFeatures() {
  return (
    <section id="solution" className="px-8 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-16 lg:flex-row">
          <div className="lg:w-1/2">
            <h2 className="mb-6 text-4xl font-bold text-slate-900">
            Everything you need, in one place.
            </h2>
            <p className="mb-10 text-xl text-slate-600">
              SoloHub replaces your scattered tools with a single, elegant workflow designed specifically for solo professionals.
            </p>

            <div className="space-y-8">
              {FEATURE_ITEMS.map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d9f8f5] font-bold text-[#0ea5b7]">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-bold text-slate-900">{item.title}</h4>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div
              className="rounded-2xl p-4"
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
                className="w-full rounded-xl"
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/a17817755f-0a427d7b5cc418650756.png"
                alt="SaaS interface showing a kanban board with project steps from proposal to payment, clean UI"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
