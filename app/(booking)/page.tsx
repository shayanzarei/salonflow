import pool from "@/lib/db";
import { bookableServiceSql } from "@/lib/services/bookable";
import { getTenant } from "@/lib/tenant";
import Image from "next/image";
import { redirect } from "next/navigation";

async function getSectionFlags(tenantId: string) {
  const result = await pool.query(
    `SELECT feature, enabled FROM feature_flags
     WHERE tenant_id = $1 AND feature LIKE 'section_%'`,
    [tenantId]
  );
  const map: Record<string, boolean> = {
    section_hero: true,
    section_services: true,
    section_team: true,
    section_gallery: true,
    section_reviews: true,
    section_about: true,
    section_contact: true,
  };
  result.rows.forEach((row) => {
    map[row.feature] = row.enabled;
  });
  return map;
}

export default async function BookingHomePage() {
  const tenant = await getTenant();
  if (!tenant) redirect("/login");

  const [servicesResult, staffResult, reviewsResult, sections] =
    await Promise.all([
      pool.query(
        `SELECT * FROM services WHERE tenant_id = $1 AND ${bookableServiceSql()} ORDER BY name`,
        [tenant.id]
      ),
      pool.query(`SELECT * FROM staff WHERE tenant_id = $1 ORDER BY name`, [
        tenant.id,
      ]),
      pool.query(
        `SELECT * FROM reviews WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 4`,
        [tenant.id]
      ),
      getSectionFlags(tenant.id),
    ]);

  const services = servicesResult.rows;
  const staffList = staffResult.rows;
  const reviews = reviewsResult.rows;
  const brand = tenant.primary_color ?? "#7C3AED";

  return (
    <div className="bg-white font-[family-name:var(--font-sans)]">
      {/* Hero */}
      {sections.section_hero && (
        <section className="bg-white py-12 sm:py-16 md:py-20 lg:py-24 lg:pb-[100px]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-10 xl:gap-[60px]">
            <div className="min-w-0">
              <div
                className="mb-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 sm:mb-6"
                style={{ background: "#F5F3FF" }}
              >
                <span className="text-xs" style={{ color: brand }}>
                  ✦
                </span>
                <span
                  className="text-xs font-medium"
                  style={{ color: brand }}
                >
                  Premium Beauty Experience
                </span>
              </div>
              <h1 className="mb-4 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-[#0f0f0f] sm:mb-5 sm:text-5xl md:text-[52px] lg:text-[56px]">
                {tenant.tagline ? (
                  tenant.tagline
                ) : (
                  <>
                    Elevate your
                    <br />
                    <span style={{ color: brand }}>natural beauty</span>
                  </>
                )}
              </h1>
              <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-gray-600 sm:mb-9 sm:text-base">
                Experience luxury treatments tailored to your unique style. Book
                your appointment seamlessly and discover the ultimate salon
                experience.
              </p>
              <div className="mb-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
                <a
                  href="/book"
                  className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium text-white no-underline sm:w-auto"
                  style={{ background: brand }}
                >
                  Book an Appointment →
                </a>

                <a
                  href="#services"
                  className="inline-flex w-full min-h-[48px] items-center justify-center rounded-full border border-gray-200 px-7 py-3.5 text-[15px] font-medium text-gray-800 no-underline sm:w-auto"
                >
                  View Services
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex shrink-0">
                  {["A", "B", "C", "D"].map((l) => (
                    <div
                      key={l}
                      className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-semibold text-white first:ml-0"
                      style={{ background: brand }}
                    >
                      {l}
                    </div>
                  ))}
                  <div
                    className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-600"
                  >
                    +2k
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="mb-0.5 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-sm text-amber-500">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 sm:text-[13px]">
                    4.9/5 from 2,000+ reviews
                  </p>
                </div>
              </div>
            </div>

            <div className="relative min-h-0 w-full">
              <div className="flex min-h-[220px] h-[min(70vw,340px)] items-center justify-center overflow-hidden rounded-2xl bg-[#f3f0ed] sm:min-h-[280px] sm:h-[360px] md:h-[400px] lg:h-[420px]">
                {tenant.hero_image_url ? (
                  <img
                    src={tenant.hero_image_url}
                    alt={tenant.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="px-4 text-center text-sm text-[#B8A898]">
                    Add a hero image in settings
                  </p>
                )}
              </div>
              {/* Next available card */}
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:inset-x-5 sm:bottom-5 sm:px-5 sm:py-4">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:text-[11px]">
                    Next Available
                  </p>
                  <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                    Today, 2:30 PM
                  </p>
                </div>

                <a
                  href="/book"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-white no-underline sm:h-11 sm:w-11"
                  style={{ background: brand }}
                >
                  →
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats bar — stacked rows on xs; 2×2 sm; 4-col md+ */}
      <div className="border-y border-gray-100 bg-white py-4 sm:py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col divide-y divide-gray-100 sm:grid sm:grid-cols-2 sm:divide-y-0 sm:gap-x-8 sm:gap-y-10 sm:text-center md:grid-cols-4 md:gap-x-0 md:gap-y-0">
            {[
              { value: "8+", label: "Years Experience" },
              { value: "2,400+", label: "Happy Clients" },
              { value: "4.9", label: "Average Rating" },
              { value: `${staffList.length}`, label: "Expert Stylists" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex min-w-0 items-center justify-between gap-4 py-4 sm:flex-col sm:justify-start sm:gap-2 sm:py-0 md:px-5 lg:px-6 ${i < 3 ? "md:border-r md:border-gray-100" : ""}`}
              >
                <p className="shrink-0 text-3xl font-bold tabular-nums tracking-tight text-gray-900 sm:mb-0 sm:text-3xl md:text-4xl">
                  {stat.value}
                </p>
                <p className="max-w-[min(100%,11rem)] text-right text-[11px] font-medium uppercase leading-snug tracking-wide text-gray-500 sm:max-w-none sm:text-center sm:text-xs md:text-[12px] md:tracking-[0.08em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      {sections.section_services && services.length > 0 && (
        <section id="services" className="bg-white py-12 sm:py-16 md:py-24 lg:py-[100px]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="mb-8 flex flex-col gap-5 sm:mb-10 md:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="min-w-0">
                <p
                  style={{
                    fontSize: 12,
                    color: "#999",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    margin: "0 0 12px",
                  }}
                >
                  Our Services
                </p>
                <h2 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-[40px] lg:leading-tight">
                  Signature Services
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-[15px]">
                  Tailored treatments designed to enhance your natural beauty
                  and provide ultimate relaxation.
                </p>
              </div>
              <a
                href="/book"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium sm:self-end"
                style={{ color: brand }}
              >
                View all services →
              </a>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Service image placeholder */}
                  <div
                    className="flex h-40 items-center justify-center sm:h-48 lg:h-[200px]"
                    style={{ background: "#f8f7f5" }}
                  >
                    <p style={{ color: "#ccc", fontSize: 13 }}>Service photo</p>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          style={{
                            fontSize: 11,
                            color: brand,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            margin: "0 0 6px",
                            fontWeight: 500,
                          }}
                        >
                          Hair Care
                        </p>
                        <h3 className="text-base font-bold leading-snug text-gray-900 sm:text-lg">
                          {service.name}
                        </h3>
                      </div>
                      <span className="shrink-0 text-base font-bold text-gray-900 sm:text-right">
                        €{service.price}
                      </span>
                    </div>
                    {service.description && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#888",
                          lineHeight: 1.6,
                          margin: "8px 0 16px",
                        }}
                      >
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] text-gray-500">
                        ⏱ {service.duration_mins} min
                      </p>

                      <a
                        href={`/book/staff?service=${service.id}`}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg font-light no-underline sm:h-9 sm:w-9"
                        style={{ borderColor: brand, color: brand }}
                      >
                        +
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {sections.section_team && staffList.length > 0 && (
        <section id="team" className="bg-[#fafafa] py-12 sm:py-16 md:py-24 lg:py-[100px]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 text-center sm:mb-12 md:mb-14 lg:mb-16">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                Our Experts
              </p>
              <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl lg:text-[40px]">
                Meet Our Team
              </h2>
            </div>
            <div
              className={`grid gap-6 sm:gap-8 md:gap-8 lg:gap-10 ${
                staffList.length === 1
                  ? "mx-auto max-w-sm grid-cols-1 justify-items-center"
                  : staffList.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
              }`}
            >
              {staffList.map((member) => (
                <div key={member.id} className="text-center">
                  <div
                    className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-semibold text-white sm:mb-5 sm:h-28 sm:w-28 sm:text-4xl md:h-[120px] md:w-[120px] md:text-[40px]"
                    style={{ background: brand }}
                  >
                    {member.avatar_url ? (
                      <Image
                        src={member.avatar_url}
                        alt={member.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      member.name.charAt(0)
                    )}
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold text-gray-900 sm:text-[17px]">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {sections.section_reviews && (
        <section id="reviews" className="bg-white py-12 sm:py-16 md:py-24 lg:py-[100px]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
            <div className="mb-10 text-center sm:mb-12 md:mb-14 lg:mb-16">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                Testimonials
              </p>
              <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl lg:text-[40px]">
                What Our Clients Say
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[20px] border border-gray-100 bg-white p-5 sm:p-6 md:p-8"
                  >
                    <div className="mb-3 flex gap-0.5 sm:mb-4">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <span key={i} className="text-base text-amber-500">
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mb-4 text-[15px] leading-relaxed text-gray-700 sm:mb-5">
                      <span className="text-gray-400">&ldquo;</span>
                      {review.comment}
                      <span className="text-gray-400">&rdquo;</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ background: brand }}
                      >
                        {review.client_name.charAt(0)}
                      </div>
                      <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
                        {review.client_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-sm text-gray-300 sm:py-16">
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {sections.section_about && tenant.about && (
        <section id="about" className="bg-[#fafafa] py-12 sm:py-16 md:py-24 lg:py-[100px]">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10 xl:gap-20">
            <div className="order-2 flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-[#f0ebe4] sm:min-h-[280px] lg:order-1 lg:min-h-[360px] lg:h-[400px]">
              <p className="text-sm text-[#B8A898]">Salon photo</p>
            </div>
            <div className="order-1 min-w-0 lg:order-2">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-gray-500">
                Our Story
              </p>
              <h2 className="mb-4 text-balance text-3xl font-bold text-gray-900 sm:mb-5 sm:text-4xl lg:text-[40px]">
                About {tenant.name}
              </h2>
              <p className="text-[15px] leading-[1.8] text-gray-600 sm:text-base">
                {tenant.about}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Contact CTA */}
      {sections.section_contact && (
        <section id="contact" className="bg-[#111] px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl lg:px-10">
            <div
              className="rounded-2xl px-5 py-10 text-center sm:px-8 sm:py-12 md:rounded-3xl md:px-12 md:py-14 lg:px-16 lg:py-16"
              style={{ background: brand }}
            >
              <h2 className="mb-3 text-balance text-2xl font-bold text-white sm:mb-4 sm:text-3xl md:text-4xl lg:text-[40px]">
                Ready for your transformation?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-[15px] leading-relaxed text-white/80 sm:mb-9 sm:text-base">
                Book your appointment today and let our expert team enhance your
                natural beauty in our luxurious, relaxing environment.
              </p>

              <a
                href="/book"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold no-underline sm:px-10"
                style={{ color: brand }}
              >
                Book Now
              </a>
            </div>
            {(tenant.address || tenant.hours) && (
              <div className="mt-8 flex flex-col items-center gap-4 text-center sm:mt-10 md:flex-row md:justify-center md:gap-10">
                {tenant.address && (
                  <p className="max-w-md text-sm text-gray-500 md:text-left">
                    📍 {tenant.address}
                  </p>
                )}
                {tenant.hours && (
                  <p className="max-w-md text-sm text-gray-500 md:text-left">
                    🕐 {tenant.hours}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#0a0a0a] pb-8 pt-12 sm:pb-10 sm:pt-14 md:pt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <div className="mb-10 grid grid-cols-1 gap-10 sm:mb-12 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 md:mb-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-12 xl:gap-16">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: brand }}
                >
                  {tenant.name.charAt(0)}
                </div>
                <span className="text-base font-semibold text-white">
                  {tenant.name}
                </span>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-gray-500">
                Your premium destination for luxury beauty treatments.
                Experience the perfect blend of expertise and relaxation.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Services</h4>
              {services.slice(0, 5).map((s) => (
                <a
                  key={s.id}
                  href={`/book/staff?service=${s.id}`}
                  className="mb-2.5 block text-sm text-gray-500 no-underline last:mb-0 hover:text-gray-400"
                >
                  {s.name}
                </a>
              ))}
            </div>

            {/* Company */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
              {[
                { label: "About Us", href: "#about" },
                { label: "Our Team", href: "#team" },
                { label: "Reviews", href: "#reviews" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="mb-2.5 block text-sm text-gray-500 no-underline last:mb-0 hover:text-gray-400"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Contact */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="mb-4 text-sm font-semibold text-white">Contact</h4>
              {tenant.address && (
                <p className="mb-2.5 text-sm text-gray-500">
                  📍 {tenant.address}
                </p>
              )}
              {tenant.hours && (
                <p className="text-sm text-gray-500">🕐 {tenant.hours}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#1a1a1a] pt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
            <p className="text-center text-[13px] text-gray-600 sm:text-left">
              © 2026 {tenant.name}. All rights reserved.
            </p>
            <p className="text-center text-[13px] text-gray-700 sm:text-right">
              Powered by SalonFlow
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
